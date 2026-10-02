import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import background from '../assets/image/Menu_Desgin/Profile.png'
import cornerImg from '../assets/image/profile/box01.png'
import ornamentImg from '../assets/image/profile/box02.png'
import PageBar from '../components/common/PageBar.jsx'
import Panel from '../components/profile/Panels.jsx'
import { hero, menus, ui } from '../data/profileStatus.js'
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

// 패널 퇴장 방향 (지금 보이는 패널 기준)
const EXIT = {
  profile: { x: -50 },
  skill: { y: 40 },
  equipment: { scaleY: 0.04 },
  stats: { y: -40 },
  contact: { y: -30 },
}

// 패널 진입: 메뉴마다 다른 방향으로 들어온다 (m: 이동 거리 배율, blur: 블러 사용 여부)
function enterPanel(tl, el, key, m, blur) {
  const b = (px) => (blur ? `blur(${px}px)` : 'blur(0px)')
  if (key === 'skill') {
    tl.fromTo(el, { x: 0, y: 70 * m, rotateX: 14, transformPerspective: 900, scale: 1, opacity: 0, filter: b(8) }, { y: 0, rotateX: 0, opacity: 1, filter: b(0), duration: 1, ease: 'power3.out' })
  } else if (key === 'equipment') {
    // 인벤토리 창처럼 가로로 먼저 열리고 세로로 펼쳐진다
    tl.fromTo(el, { x: 0, y: 0, scaleX: 0.08, scaleY: 0.03, opacity: 0, filter: b(0) }, { scaleX: 1, opacity: 1, duration: 0.42, ease: 'power3.out' })
    tl.to(el, { scaleY: 1, duration: 0.6, ease: 'back.out(1.5)' })
  } else if (key === 'stats') {
    tl.fromTo(el, { x: 0, y: -60 * m, scale: 0.96, opacity: 0, filter: b(8) }, { y: 0, scale: 1, opacity: 1, filter: b(0), duration: 0.95, ease: 'power3.out' })
  } else if (key === 'contact') {
    // 편지를 펼치듯 위에서 아래로 열린다
    tl.fromTo(el, { x: 0, y: -24 * m, scale: 1, opacity: 0, clipPath: 'inset(0% 0% 100% 0%)', filter: b(0) }, { y: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.inOut', clearProps: 'clipPath' })
  } else {
    tl.fromTo(el, { x: 70 * m, y: 0, scale: 1, opacity: 0, filter: b(10) }, { x: 0, opacity: 1, filter: b(0), duration: 0.9, ease: 'power3.out' })
  }
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
 * 처음 진입하면 인트로(이름 · 캐릭터 · 인용문 가운데 정렬)를 보여주고, 잠시 뒤(또는 클릭 · 키 · 휠)
 * 글자는 Flip으로 왼쪽 위 자리로, 캐릭터는 카메라 화면 이동으로 왼쪽으로 밀리며 오른쪽에서 메뉴 · 패널이 들어온다.
 * 모바일 · 모션 감소에서는 인트로 없이 바로 시작한다.
 */
export default function ProfilePage({ onNavigate, onMenuToggle }) {
  const mobile = useMedia(MOBILE_QUERY)
  const reduced = useMedia(REDUCED_QUERY)
  // 인트로는 데스크톱 · 모션 허용일 때만 (도중에 모바일 · 모션 감소로 바뀌면 바로 끝난 상태로 본다)
  const [introState, setIntro] = useState(() => !window.matchMedia(MOBILE_QUERY).matches && !window.matchMedia(REDUCED_QUERY).matches)
  const intro = introState && !mobile && !reduced
  const introRef = useRef(intro)
  const introAnim = useRef(null)
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
    const el = windowRef.current
    const m = mobile ? 0.5 : 1
    const exit = EXIT[el.dataset.panel]
    leaving.current = gsap.to(el, {
      x: (exit.x ?? 0) * m,
      y: (exit.y ?? 0) * m,
      scaleY: exit.scaleY ?? 1,
      opacity: 0,
      filter: mobile ? 'blur(0px)' : 'blur(8px)',
      duration: reduced ? 0.01 : 0.36,
      ease: 'power2.in',
      onComplete: () => {
        leaving.current = null
        setShown((prev) => ({ key: tabRef.current, n: prev.n + 1 }))
      },
    })
  }, [mobile, reduced])

  useEffect(() => () => leaving.current?.kill(), [])

  // 인트로 → 현재 레이아웃: 인트로 전용 글자(영문 이름 · 장식)를 먼저 지우고, 레이아웃을 바꾼 뒤 Flip으로 이어 준다
  const endIntro = useCallback(() => {
    if (!introRef.current || introAnim.current) return
    const hero = heroRef.current
    const run = () => {
      const state = Flip.getState(hero.querySelectorAll('[data-flip-id]'), { props: 'color' })
      introRef.current = false
      revealDelay.current = 0.55
      flushSync(() => setIntro(false))
      introAnim.current = gsap.timeline()
      introAnim.current.add(Flip.from(state, {
        targets: hero.querySelectorAll('[data-flip-id]'),
        duration: 1.3,
        ease: 'power3.inOut',
        scale: true,
        absolute: true,
        fade: true,
        props: 'color',
      }), 0)
    }
    introAnim.current = gsap.to(hero.querySelectorAll('.st-hero-en, .st-hero-ornament'), { opacity: 0, y: -10, duration: 0.4, ease: 'power2.in', onComplete: run })
  }, [])

  useEffect(() => () => introAnim.current?.kill(), [])

  // 인트로: 잠시 뒤 자동으로, 또는 클릭 · 키 · 휠로 바로 넘어간다
  useEffect(() => {
    introRef.current = intro
    if (!intro) return undefined
    const timer = setTimeout(endIntro, hero.introHold)
    const skip = () => endIntro()
    window.addEventListener('pointerdown', skip)
    window.addEventListener('wheel', skip, { passive: true })
    window.addEventListener('keydown', skip)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [intro, endIntro])

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
    const tl = gsap.timeline({ delay: revealDelay.current, onComplete: () => gsap.set(el, { clearProps: 'filter' }) })
    revealDelay.current = 0
    if (reduced) {
      tl.set(el, { x: 0, y: 0, scale: 1, rotateX: 0, opacity: 1, filter: 'blur(0px)' })
      return () => tl.kill()
    }
    enterPanel(tl, el, shown.key, mobile ? 0.5 : 1, !mobile)
    const reveals = el.querySelectorAll('.reveal')
    if (reveals.length) tl.fromTo(reveals, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, shown.key === 'equipment' ? 0.5 : 0.15)
    // 패널 본문은 맨 위부터
    el.querySelector('.st-window-body').scrollTop = 0
    return () => tl.kill()
  }, [shown, intro, mobile, reduced])

  // 키보드: 1–5로 메뉴 선택, ← →로 순환
  useEffect(() => {
    const onKey = (e) => {
      // 인트로 중의 키 입력은 인트로를 넘기는 데만 쓴다
      if (introRef.current) return
      if (e.altKey || e.ctrlKey || e.metaKey) return
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return
      const index = menus.findIndex((m) => m.key === tabRef.current)
      const num = Number(e.key)
      if (num >= 1 && num <= menus.length) select(menus[num - 1].key)
      else if (e.key === 'ArrowRight') select(menus[(index + 1) % menus.length].key)
      else if (e.key === 'ArrowLeft') select(menus[(index - 1 + menus.length) % menus.length].key)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [select])

  // 모바일 가로 스크롤 메뉴: 활성 탭을 가운데로
  useEffect(() => {
    const menu = menuRef.current
    const button = menu?.querySelector('[aria-current="true"]')
    if (!mobile || !button) return
    menu.scrollTo({ left: button.offsetLeft - (menu.clientWidth - button.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' })
  }, [tab, mobile, reduced])

  const shownIndex = menus.findIndex((m) => m.key === shown.key)

  return (
    <main className={`${styles.scope} status-page ${intro ? 'is-intro' : ''} ${reduced ? 'is-reduced' : ''}`} aria-label="Profile">
      <div className="st-sky" style={{ '--st-bg': `url(${background})` }} aria-hidden="true" />

      <PageBar onExit={() => onNavigate('/')} onMenuToggle={onMenuToggle} />

      <div className="st-layout">
        {/* data-flip-id: 인트로 → 현재 레이아웃으로 Flip되는 요소 (인용문 ↔ 한 줄 카피는 같은 id로 교차 페이드) */}
        <header className="st-hero" ref={heroRef}>
          {/* 인트로: 큰 영문 이름 + 그 아래 한글 이름 → 이후 한글 이름이 왼쪽 위 이름(h1) 자리로 Flip */}
          <p className="st-hero-en">{hero.name}</p>
          <p className="st-hero-ko" data-flip-id="name">{hero.nameKo}</p>
          <h1 className="st-hero-name" data-flip-id="name">{hero.nameKo}</h1>
          <Ornament className="st-hero-ornament" />
          <p className="st-hero-title" data-flip-id="title">{hero.title}</p>
          <p className="st-hero-copy" data-flip-id="copy">{hero.copyLines.join(' ')}</p>
          <blockquote className="st-hero-quote" data-flip-id="copy">
            <span className="st-hero-mark is-open" aria-hidden="true">“</span>
            {hero.copyLines.map((line) => <span className="st-hero-line" key={line}>{line}</span>)}
            <span className="st-hero-mark is-close" aria-hidden="true">”</span>
          </blockquote>
        </header>

        {/* 데스크톱은 화면 전체에 고정, 모바일은 타이틀 아래 캐릭터 스테이지 */}
        <div className="st-stage" aria-hidden="true">
          <Suspense fallback={null}>
            <Scene tab={tab} intro={intro} hoverSkill={hoverSkill} mobile={mobile} reduced={reduced} />
          </Suspense>
        </div>

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
