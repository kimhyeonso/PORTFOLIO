import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import background from '../assets/image/Menu_Desgin/Profile.png'
import cornerImg from '../assets/image/profile/box01.png'
import ornamentImg from '../assets/image/profile/box02.png'
import closeIcon from '../assets/icons/close_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg'
import PageBar from '../components/common/PageBar.jsx'
import Panel from '../components/profile/Panels.jsx'
import { hero, menus, poses, ui } from '../data/profileStatus.js'
import styles from './ProfilePage.module.scss'
import './ProfilePage.keyframes.scss'

gsap.registerPlugin(Flip)

const MOBILE_QUERY = '(max-width: 900px)'
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'

// three · R3F는 이 페이지에서만 쓰므로 따로 불러온다
const Scene = lazy(() => import('../components/profile/three/Scene.jsx'))

function useMedia(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}

// 패널이 가운데로 모였을 때의 크기 (가로 · 세로 배율)
const FOLDED = { scaleX: 0.08, scaleY: 0.03 }

// 패널 퇴장 (모든 메뉴 공통): 세로로 접혀 가운데 가로선이 된 뒤 → 가로도 줄어 가운데 점으로 모인다
function leavePanel(el, onComplete) {
  const tl = gsap.timeline({ onComplete })
  tl.to(el, { scaleY: FOLDED.scaleY, duration: 0.22, ease: 'power2.in' })
  tl.to(el, { scaleX: FOLDED.scaleX, opacity: 0, duration: 0.16, ease: 'power2.in' })
  return tl
}

// 패널 진입 (모든 메뉴 공통): 가운데 점에서 가로로 먼저 열리고 → 세로로 펼쳐진다
function enterPanel(tl, el) {
  tl.fromTo(el, { ...FOLDED, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.42, ease: 'power3.out' })
  tl.to(el, { scaleY: 1, duration: 0.6, ease: 'back.out(1.5)' })
}

/*
 * 인트로 대화창 글자: 한 줄씩, 형광펜 단어는 따로 묶고 글자마다 타이핑 순서(i)를 매긴다.
 * [{ line, parts: [{ text, hl, start }] }], total = 전체 글자 수
 */
function typeSegments(lines, highlights) {
  let index = 0
  const rows = lines.map((line) => {
    const parts = []
    let rest = line
    while (rest) {
      const hits = highlights.map((word) => ({ word, at: rest.indexOf(word) })).filter((h) => h.at >= 0)
      const hit = hits.sort((a, b) => a.at - b.at)[0]
      const text = hit ? (hit.at > 0 ? rest.slice(0, hit.at) : hit.word) : rest
      const hl = Boolean(hit) && hit.at === 0
      parts.push({ text, hl, start: index })
      index += [...text].length
      rest = rest.slice(text.length)
    }
    return { line, parts }
  })
  return { rows, total: index }
}

// 인트로 대화창: RPG 대사처럼 글자가 한 자씩 찍히고, 형광펜 단어는 다 찍힌 뒤 금색 띠가 그어진다 (CSS 애니메이션)
function TypedQuote({ lines, highlights, speaker }) {
  const { rows, total } = typeSegments(lines, highlights)
  return (
    <>
      <span className="st-quote-tag" aria-hidden="true">{speaker}</span>
      {/* 화면 읽기는 문장 전체를 한 번에 */}
      <span className="st-sr-only">{lines.join(' ')}</span>
      <span className="st-quote-text" aria-hidden="true">
        {rows.map(({ line, parts }) => (
          <span className="st-hero-line" key={line}>
            {parts.map((part) => {
              const chars = [...part.text].map((ch, j) => (
                <span className="st-type" style={{ '--i': part.start + j }} key={j}>{ch}</span>
              ))
              return part.hl
                ? <mark className="st-hl" style={{ '--hl': part.start + chars.length }} key={part.start}>{chars}</mark>
                : <span key={part.start}>{chars}</span>
            })}
          </span>
        ))}
      </span>
      <span className="st-quote-next" aria-hidden="true" style={{ '--total': total }}>▼</span>
    </>
  )
}

// 금색 장식 띠 (인트로 이름 아래 · 메뉴 위)
function Ornament({ className }) {
  return <img className={className} src={ornamentImg} alt="" width="465" height="155" draggable="false" />
}

// 정보 패널 왼쪽 위 모서리 장식
function CornerFlourish() {
  return <img className="st-window-flourish" src={cornerImg} alt="" width="213" height="213" draggable="false" />
}

/**
 * PROFILE 페이지: 판타지 RPG 상태창.
 * 전체 화면 3D 장면(캐릭터 · 받침대 · 파티클) 위에 HTML 메뉴 · 정보 패널을 겹친다.
 * 상태를 둘로 나눈다: tab(3D가 즉시 반응) / shown(패널에 실제로 보이는 내용).
 * 메뉴를 누르면 tab이 바로 바뀌고 지금 패널이 퇴장 → 끝나면 그때의 최신 tab을 보여주며 진입한다.
 *
 * 처음 진입하면 인트로 = 포즈 갤러리(이름 · 인용문 가운데 정렬, 가운데에 5가지 포즈 캐릭터)를 보여준다.
 * 드래그 · 휠 · ← →로 포즈를 하나씩 넘기고, 포즈를 클릭(또는 Enter · 1–5)하면 그 메뉴로
 * 글자는 Flip으로 왼쪽 위 자리로, 캐릭터는 카메라 화면 이동으로 왼쪽으로 밀리며 오른쪽에서 메뉴 · 패널이 들어온다.
 * 패널에서 Esc 또는 POSES 버튼으로 갤러리로 돌아간다. 모바일 · 모션 감소에서는 갤러리 없이 바로 패널로 시작한다.
 */
export default function ProfilePage({ onNavigate, onMenuToggle }) {
  const mobile = useMedia(MOBILE_QUERY)
  const reduced = useMedia(REDUCED_QUERY)
  // 인트로는 데스크톱 · 모션 허용일 때만 (도중에 모바일 · 모션 감소로 바뀌면 바로 끝난 상태로 본다)
  const [introState, setIntro] = useState(() => !window.matchMedia(REDUCED_QUERY).matches)
  const intro = introState && !reduced
  const introRef = useRef(intro)
  const introAnim = useRef(null)
  // 갤러리 조작 (Scene이 채운다) · 가운데 포즈 번호
  const gallery = useRef(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const setGalleryControls = useCallback((api) => { gallery.current = api }, [])
  // 갤러리 말풍선: 마우스를 올린 포즈 (없으면 키보드로 넘길 때만 맨 앞 포즈)
  const [hoverPose, setHoverPose] = useState(null)
  const [keyFocus, setKeyFocus] = useState(false)
  // 맨 앞 포즈가 가운데에 멈췄는지 (모바일은 hover가 없어 이때 맨 앞 포즈 말풍선을 띄운다)
  const [settled, setSettled] = useState(false)
  const bubbleRef = useRef(null)
  // Scene이 매 프레임 캐릭터 머리 위 화면 좌표로 부른다
  const placeBubble = useCallback((x, y) => {
    const el = bubbleRef.current
    if (!el) return
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    el.style.visibility = 'visible'
  }, [])
  const heroRef = useRef(null)
  // 인트로가 끝난 직후 패널 진입을 늦추는 시간(초) — 메뉴 · 패널이 글자가 비킨 뒤에 들어오도록
  const revealDelay = useRef(0)
  const [tab, setTab] = useState(menus[0].key)
  // n: 같은 패널로 돌아와도 진입 애니메이션을 다시 돌리기 위한 번호
  const [shown, setShown] = useState({ key: menus[0].key, n: 0 })
  const [hoverSkill, setHoverSkill] = useState(null)
  const tabRef = useRef(tab)
  const leaving = useRef(null)
  const windowRef = useRef(null)
  const menuRef = useRef(null)

  const select = useCallback((key) => {
    if (key === tabRef.current) return
    tabRef.current = key
    setTab(key)
    setHoverSkill(null)
    // 퇴장 중에 또 누르면 새로 시작하지 않고, 퇴장이 끝날 때 최신 탭을 보여준다
    if (leaving.current) return
    const done = () => {
      leaving.current = null
      setShown((prev) => ({ key: tabRef.current, n: prev.n + 1 }))
    }
    leaving.current = reduced
      ? gsap.to(windowRef.current, { opacity: 0, duration: 0.01, onComplete: done })
      : leavePanel(windowRef.current, done)
  }, [reduced])

  useEffect(() => () => leaving.current?.kill(), [])

  // 인트로(갤러리) ↔ 현재 레이아웃: Flip으로 글자를 옮긴다. 갤러리 전용 장식는 나갈 때 먼저 지우고, 돌아올 때 나중에 띄운다
  const flipHero = useCallback((next) => {
    const hero = heroRef.current
    // 모바일: 패널에서는 머리글을 숨기므로 Flip 없이 바꾸고, 갤러리로 돌아올 때 머리글을 차례로 띄운다
    if (mobile) {
      introRef.current = next
      if (!next) revealDelay.current = 0.2
      flushSync(() => setIntro(next))
      const tl = gsap.timeline({ onComplete: () => { introAnim.current = null } })
      if (next) tl.fromTo(hero.querySelectorAll('.st-hero-ornament, .st-hero-ko, .st-hero-title, .st-gallery-hint, .st-hero-quote'), { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.06, clearProps: 'opacity,transform' }, 0.2)
      introAnim.current = tl
      return
    }
    const state = Flip.getState(hero.querySelectorAll('[data-flip-id]'), { props: 'color' })
    introRef.current = next
    if (!next) revealDelay.current = 0.55
    flushSync(() => setIntro(next))
    const tl = gsap.timeline({ onComplete: () => { introAnim.current = null } })
    tl.add(Flip.from(state, {
      targets: hero.querySelectorAll('[data-flip-id]'),
      duration: 1.3,
      ease: 'power3.inOut',
      scale: true,
      absolute: true,
      fade: true,
      props: 'color',
    }), 0)
    if (next) tl.fromTo(hero.querySelectorAll('.st-hero-ornament'), { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'opacity,transform' }, 0.9)
    introAnim.current = tl
  }, [mobile])

  const endIntro = useCallback(() => {
    if (!introRef.current || introAnim.current) return
    const hero = heroRef.current
    introAnim.current = gsap.to(hero.querySelectorAll('.st-hero-ornament'), { opacity: 0, y: -10, duration: 0.4, ease: 'power2.in', onComplete: () => flipHero(false) })
  }, [flipHero])

  // 패널 → 포즈 갤러리
  const openGallery = useCallback(() => {
    if (introRef.current || introAnim.current || reduced) return
    leaving.current?.kill()
    leaving.current = null
    setHoverSkill(null)
    // 모바일: 패널을 내려 본 상태일 수 있으니 맨 위에서 갤러리를 연다
    if (mobile) window.scrollTo(0, 0)
    flipHero(true)
  }, [flipHero, mobile, reduced])

  // 갤러리에서 포즈를 고르면: 그 메뉴 패널을 준비해 두고 레이아웃을 바꾼다 (패널이 숨어 있으니 퇴장 연출 없이)
  const pick = useCallback((key) => {
    if (!introRef.current || introAnim.current) return
    tabRef.current = key
    setTab(key)
    setShown((prev) => ({ key, n: prev.n + 1 }))
    endIntro()
  }, [endIntro])

  useEffect(() => () => introAnim.current?.kill(), [])

  useEffect(() => {
    introRef.current = intro
  }, [intro])

  // 인트로가 끝나면 메뉴 버튼 · 키 힌트가 오른쪽에서 차례로 들어온다
  useLayoutEffect(() => {
    if (intro || !revealDelay.current) return undefined
    const tween = gsap.fromTo('.status-page .st-menu-btn, .status-page .st-keyhint', { x: 48, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: 0.35, clearProps: 'transform,opacity' })
    return () => tween.kill()
  }, [intro])

  // 패널 진입 애니메이션
  useLayoutEffect(() => {
    const el = windowRef.current
    // 인트로 동안은 숨겨 두었다가, 끝나면 진입 애니메이션
    if (intro) {
      gsap.set(el, { opacity: 0 })
      return undefined
    }
    const tl = gsap.timeline({ delay: revealDelay.current })
    revealDelay.current = 0
    if (reduced) {
      tl.set(el, { scale: 1, opacity: 1 })
      return () => tl.kill()
    }
    enterPanel(tl, el)
    // 안쪽 내용은 가로로 열린 뒤 세로로 펼쳐지는 동안 차례로 떠오른다
    const reveals = el.querySelectorAll('.reveal')
    if (reveals.length) tl.fromTo(reveals, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, 0.5)
    return () => tl.kill()
  }, [shown, intro, reduced])

  // 키보드: 1–5로 메뉴 선택, ← →로 순환
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return
      const num = Number(e.key)
      // 갤러리: ← → 포즈 넘기기 · Enter 지금 포즈 열기 · 1–5 바로 열기
      if (introRef.current) {
        const g = gallery.current
        if (!g) return
        if (e.key === 'ArrowRight') g.step(1)
        else if (e.key === 'ArrowLeft') g.step(-1)
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') setKeyFocus(true)
        else if (e.key === 'Enter' && !e.target.closest?.('button, a')) g.pickCurrent()
        else if (num >= 1 && num <= menus.length) g.pick(num - 1)
        else return
        e.preventDefault()
        return
      }
      if (e.key === 'Escape') {
        if (reduced || document.querySelector('[role="dialog"], dialog[open]')) return
        openGallery()
        e.preventDefault()
        return
      }
      const index = menus.findIndex((m) => m.key === tabRef.current)
      if (num >= 1 && num <= menus.length) select(menus[num - 1].key)
      else if (e.key === 'ArrowRight') select(menus[(index + 1) % menus.length].key)
      else if (e.key === 'ArrowLeft') select(menus[(index - 1 + menus.length) % menus.length].key)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [select, openGallery, mobile, reduced])

  // 키보드로 보던 말풍선은 마우스를 움직이면 거둔다
  useEffect(() => {
    if (!keyFocus) return undefined
    const off = () => setKeyFocus(false)
    window.addEventListener('pointermove', off, { once: true })
    return () => window.removeEventListener('pointermove', off)
  }, [keyFocus])

  // 모바일 가로 스크롤 메뉴: 활성 탭을 가운데로
  useEffect(() => {
    const menu = menuRef.current
    const button = menu?.querySelector('[aria-current="true"]')
    if (!mobile || intro || !button) return
    menu.scrollTo({ left: button.offsetLeft - (menu.clientWidth - button.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' })
  }, [tab, mobile, intro, reduced])

  const shownIndex = menus.findIndex((m) => m.key === shown.key)
  // 말풍선: PC는 마우스를 올린 포즈(키보드로 넘기면 맨 앞), 모바일은 가운데에 멈춘 맨 앞 포즈
  const bubbleIndex = !intro ? null : mobile ? (settled ? galleryIndex : null) : (hoverPose ?? (keyFocus ? galleryIndex : null))
  const bubbleMenu = bubbleIndex === null ? null : menus[bubbleIndex]

  return (
    <main className={`${styles.scope} status-page ${intro ? 'is-intro' : ''} ${reduced ? 'is-reduced' : ''}`} aria-label="Profile">
      <div className="st-sky" style={{ '--st-bg': `url(${background})` }} aria-hidden="true" />

      <PageBar onExit={() => onNavigate('/')} onMenuToggle={onMenuToggle} />

      <div className="st-layout">
        {/* data-flip-id: 인트로 → 현재 레이아웃으로 Flip되는 요소 (인용문 ↔ 한 줄 카피는 같은 id로 교차 페이드) */}
        <header className="st-hero" ref={heroRef}>
          {/* 인트로: 금색 장식 아래 한글 이름 → 이후 왼쪽 위 이름(h1) 자리로 Flip */}
          <Ornament className="st-hero-ornament" />
          <p className="st-hero-ko" data-flip-id="name">{hero.nameKo}</p>
          <h1 className="st-hero-name" data-flip-id="name">{hero.nameKo}</h1>
          <p className="st-hero-title" data-flip-id="title">{hero.title}</p>
          {/* 갤러리 조작 안내 (직함 아래) */}
          {/* PC: 드래그 · 휠 / 모바일: 드래그(스와이프)만 */}
          {intro && <p className="st-gallery-hint" aria-hidden="true">{mobile ? ui.gallery.hintMobile : ui.gallery.hint}</p>}
          <p className="st-hero-copy" data-flip-id="copy">{hero.copyLines.join(' ')}</p>
          <blockquote className="st-hero-quote" data-flip-id="copy">
            <TypedQuote lines={hero.copyLines} highlights={hero.copyHighlights} speaker={hero.nameKo} />
          </blockquote>
        </header>

        {/* 데스크톱은 화면 전체에 고정, 모바일은 타이틀 아래 캐릭터 스테이지 */}
        <div className="st-stage" aria-hidden="true">
          <Suspense fallback={null}>
            <Scene tab={tab} intro={intro} hoverSkill={hoverSkill} mobile={mobile} reduced={reduced} onControls={setGalleryControls} onPick={pick} onIndex={setGalleryIndex} onHover={setHoverPose} onSettle={setSettled} bubble={{ index: bubbleIndex, place: placeBubble }} />
          </Suspense>
        </div>

        {/* 포즈 갤러리: 캐릭터에 마우스를 올리면 머리 위 말풍선 (위치는 Scene이 매 프레임 옮긴다) · 아래 조작 안내 */}
        {intro && bubbleMenu && (
          <div className="st-bubble-anchor" ref={bubbleRef} style={{ visibility: 'hidden' }} aria-hidden="true">
            <p className="st-bubble" key={bubbleMenu.key}>
              {/* 번호는 메뉴 버튼 · 1–5 키와 같은 순서 */}
              <strong><span className="st-bubble-no">{bubbleIndex + 1}</span>{bubbleMenu.label.toUpperCase()}</strong>
              <span>{poses[bubbleMenu.key].description}</span>
              <em>{mobile ? ui.gallery.pickMobile : ui.gallery.pick}</em>
            </p>
          </div>
        )}
        {intro && (
          <>
            {/* 화면 읽기: 지금 맨 앞 포즈 (← → 로 넘기고 Enter로 연다) */}
            <p className="st-sr-only" aria-live="polite">{ui.gallery.current} {galleryIndex + 1} / {menus.length} · {menus[galleryIndex].ko} · {poses[menus[galleryIndex].key].description}</p>
          </>
        )}

        <section className="st-side" aria-label={ui.windowLabel}>
          <Ornament className="st-side-ornament" />
          <nav className="st-menu" aria-label={ui.menuLabel} ref={menuRef}>
            <ul>
              {menus.map((menu, i) => (
                <li key={menu.key}>
                  <button
                    className={`st-menu-btn ${tab === menu.key ? 'is-active' : ''}`}
                    type="button"
                    aria-current={tab === menu.key ? 'true' : undefined}
                    onClick={() => select(menu.key)}
                  >
                    <span className="st-menu-key" aria-hidden="true">{i + 1}</span>
                    <span className="st-menu-en">{menu.label}</span>
                    <span className="st-menu-ko">{menu.ko}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="st-window" ref={windowRef} data-panel={shown.key}>
            <CornerFlourish />
            {/* 모바일: 오른쪽 위 X → 5개 캐릭터 갤러리로 */}
            {mobile && !reduced && (
              <button className="st-window-close" type="button" aria-label={ui.gallery.backLabel} onClick={openGallery}>
                <img src={closeIcon} alt="" width="16" height="16" draggable="false" />
              </button>
            )}
            <i className="st-corner is-tr" aria-hidden="true" />
            <i className="st-corner is-bl" aria-hidden="true" />
            <i className="st-corner is-br" aria-hidden="true" />
            <div className="st-window-bar">
              <span className="st-window-title">{ui.windowLabel} · {menus[shownIndex].label}</span>
              <span className="st-window-page">
                <span className="st-window-pips" aria-hidden="true">
                  {menus.map((menu, i) => <i key={menu.key} className={i === shownIndex ? 'is-on' : ''} />)}
                </span>
                {shownIndex + 1} / {menus.length}
              </span>
            </div>
            <div className="st-window-body" aria-live="polite">
              <Panel key={shown.n} name={shown.key} onHoverSkill={setHoverSkill} reduced={reduced} />
            </div>
          </div>

          <p className="st-keyhint">
            {!mobile && !reduced && (
              <button className="st-back" type="button" aria-label={ui.gallery.backLabel} onClick={openGallery}>
                <kbd>ESC</kbd>{ui.gallery.back}
              </button>
            )}
            {ui.keyHint.keys.map((k) => <kbd key={k}>{k}</kbd>)}
            <span>{ui.keyHint.or}</span>
            <kbd>{ui.keyHint.range}</kbd>
            <span>{ui.keyHint.label}</span>
          </p>
        </section>
      </div>
    </main>
  )
}
