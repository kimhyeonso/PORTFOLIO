import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { skillIcons } from '../../data/skillIcons.js'
import { titleWidthEm } from '../design/titleWidth.js'
import useMedia from '../../hooks/useMedia.js'
import WorkPanel from './WorkPanel.jsx'
import { formatContribution, periodOf, toLinks, toolNames, workLabels } from './workInfo.js'
import styles from './WorkShowcase.module.scss'

/*
 * 무한 슬라이드: 08 뒤에 한 칸(TAIL = 1)을 더 두고 그 자리를 "다시 01"로 쓴다.
 * 원형 배치라 08 → (한 칸 더) 위치는 01과 똑같이 보이므로, 거기 도착하면 화면 변화 없이 스크롤만 진짜 01 자리로 옮긴다.
 */
const TAIL = 1
const DRAG_THRESHOLD = 6 // px, 이만큼 움직여야 드래그로 본다 (짧으면 클릭)
const DRAG_FLICK = 40 // px, 이만큼 끌면 반 칸이 안 돼도 한 칸 넘어간다
const SNAP_DELAY = 180 // ms, 스크롤이 멈추고 이만큼 지나면 가까운 프로젝트에 맞춘다
const TILT = { rx: 5, ry: -10, rz: -2 } // 정면 패널의 기본 기울기 (deg)
const SKEW_MAX = 7 // deg, 빠르게 스크롤할 때 글자 · 패널이 기우는 최대 각도
// 제목 크기 기준: Design/Frontend 카드와 같이 이 제목이 칸 너비에 맞는 크기로 모든 제목을 통일한다
const TITLE_SIZE_REFERENCE_EM = titleWidthEm('ADVERTISING BANNER')
const BACK_OPACITY = 0.26 // 정면이 아닌(옆 · 뒤) 패널의 불투명도 — 원형 윤곽만 보이게

/*
 * 3D 원형 배치: 패널들이 세로축을 중심으로 한 바퀴 둘러서 있고, 스크롤만큼 원이 돌아 다음 패널이 정면으로 온다.
 * d: 지금 보는 프로젝트와의 거리 (0 = 정면, 1 = 오른쪽 다음, -1 = 왼쪽 지난), 원을 따라 가까운 쪽으로 감는다.
 * 원의 중심을 패널 너비만큼 뒤로 물려, 정면 패널은 지금 크기 그대로 · 뒤쪽 패널은 작고 멀게 보인다.
 * 패널은 원을 따라 돌되 반쯤만 돌아서(yaw) 뒤쪽 패널도 뒤집혀 보이지 않고, 좌우로 갈수록 높이가 달라져 나선처럼 보인다.
 */
function ringPose(d, i, { count, height, panelWidth, mobile, reduced }) {
    const wrapped = ((((d + count / 2) % count) + count) % count) - count / 2
    const distance = Math.abs(wrapped)
    if (reduced) {
        // 움직임 줄이기: 원 없이 정면 패널만 옅어졌다 나타난다
        const opacity = Math.max(0, 1 - distance * 2)
        return { transform: `rotateX(${TILT.rx}deg) rotateY(${TILT.ry}deg) rotateZ(${TILT.rz}deg)`, opacity, fade: 0, distance }
    }
    const angle = (wrapped / count) * Math.PI * 2
    const radius = panelWidth * (mobile ? 1.05 : 1.25)
    const x = Math.sin(angle) * radius
    const z = (Math.cos(angle) - 1) * radius
    // 원을 위에서 비스듬히 내려다본 것처럼: 뒤로 갈수록 위로 올라가 정면 패널 위에 타원을 그린다.
    // 오른쪽은 조금 높게 · 왼쪽은 조금 낮게 (나선 느낌)
    const y = -Math.sin(angle) * height * 0.05 - (1 - Math.cos(angle)) * height * (mobile ? 0.2 : 0.28)
    const yaw = TILT.ry + (angle * 180) / Math.PI * 0.75
    // 패널마다 조금씩 다른 비틀림 (참고처럼 제각각 기울어 보이게)
    const roll = TILT.rz + ((i * 37) % 7 - 3) * 0.9 * Math.min(1, distance)
    // 정면에서 한 칸 멀어질 때까지 BACK_OPACITY로 내려가고, 더 뒤로 갈수록 조금씩 더 옅게
    const opacity = distance < 1 ? 1 - distance * (1 - BACK_OPACITY) : Math.max(0.1, BACK_OPACITY - (distance - 1) * 0.04)
    return {
        transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${yaw.toFixed(2)}deg) rotateX(${TILT.rx}deg) rotateZ(${roll.toFixed(2)}deg)`,
        opacity,
        fade: Math.min(0.45, distance * 0.4),
        distance,
    }
}

// "2024.10" → 개월 수 (기간이 없으면 그해 1월)
const monthsOf = ({ period, year }) => {
    const [y, m = 1] = (period?.start ?? String(year)).split('.').map(Number)
    return y * 12 + (m - 1)
}
const formatMonths = (months) => `${Math.floor(months / 12)}.${String((months % 12) + 1).padStart(2, '0')}`

/**
 * Working 스크롤 화면: 화면이 고정된 채 스크롤만큼 프로젝트가 한 장씩 넘어간다.
 *   가운데~오른쪽  패널들이 3D 원형으로 둘러서 있고 스크롤만큼 원이 돈다. 정면 패널만 선명하고 옆 · 뒤 패널은 옅게(원형 윤곽만)
 *                 정면 패널은 마우스 쪽으로 기운다
 *   왼쪽 위       회사 —— Works 03 / 08
 *   왼쪽 아래     제목 · 설명 · 정보 · 사용 프로그램 · 버튼 (Design/Frontend 카드처럼 줄마다 차례로 떠오른다)
 *   오른쪽        회사별 프로젝트 목록 + 타임라인(스크롤만큼 연 · 월이 굴러간다)
 * 빠르게 스크롤하면 그 속도만큼 글자와 패널이 기울었다가 돌아온다.
 * 키보드: ↓ · → 다음, ↑ · ← 이전, 1–9 바로 가기 (첫 화면에서 ↓는 첫 프로젝트로)
 * 패널 위치는 매 프레임 DOM 스타일로만 바꾸고, 보이는 프로젝트가 바뀔 때만 React가 글자를 다시 그린다.
 * ref.scrollTopOf(번호): 그 프로젝트가 보이는 스크롤 위치 (탭 · 첫 화면 패널 · 메뉴 썸네일로 이동할 때)
 */
const WorkShowcase = forwardRef(function WorkShowcase({ projects, companies, onActive, onOpen, onPreview, paused = false }, ref) {
    const mobile = useMedia('(max-width: 900px)')
    const reduced = useMedia('(prefers-reduced-motion: reduce)')
    const count = projects.length
    const sectionRef = useRef(null)
    const stageRef = useRef(null)
    const deckRef = useRef(null)
    const dateRef = useRef(null)
    const panelRefs = useRef([])
    const [active, setActive] = useState(0)
    const activeRef = useRef(0)
    const onActiveRef = useRef(onActive)
    const pausedRef = useRef(paused)
    useEffect(() => {
        onActiveRef.current = onActive
        pausedRef.current = paused
    })

    /*
     * 스크롤 ↔ 프로젝트 번호. 이 화면은 첫 화면과 같은 자리(위로 겹친 margin-top)에서 시작하고,
     * 처음 intro만큼은 첫 화면이 줌인되며 이 화면이 커지는 구간 → 그 뒤부터 한 칸(unit)씩 프로젝트
     *   start  섹션 맨 위 (= 첫 화면 맨 위)
     *   top    01이 다 커져 정면에 선 스크롤 위치
     */
    const measure = () => {
        const section = sectionRef.current
        const start = section.getBoundingClientRect().top + window.scrollY
        const intro = Math.max(0, -parseFloat(getComputedStyle(section).marginTop) - window.innerHeight)
        const top = start + intro
        const unit = (section.offsetHeight - intro - window.innerHeight) / Math.max(1, count - 1 + TAIL)
        return { start, intro, top, unit }
    }
    useImperativeHandle(ref, () => ({
        scrollTopOf: (index) => {
            const { top, unit } = measure()
            return top + index * unit
        },
    }))

    // 스크롤 위치 ↔ 원 위치(raw: 0 = 01, count = 다시 01)
    const scrollRaw = (raw, behavior) => {
        const { top, unit } = measure()
        window.scrollTo({ top: top + raw * unit, behavior })
    }
    const currentRaw = () => {
        const { top, unit } = measure()
        return Math.min(count, Math.max(0, (window.scrollY - top) / unit))
    }
    const go = (index) => scrollRaw(Math.min(count - 1, Math.max(0, index)), reduced ? 'auto' : 'smooth')
    /*
     * 원을 따라 pos(정수, 0보다 작거나 count보다 커도 된다)까지 돈다. from: 지금 보이는 위치.
     * 범위를 벗어나면 똑같이 보이는 자리(± count)로 먼저 순간 이동한 뒤 돌아서, 01 ↔ 08이 끊김 없이 이어진다
     */
    const rotate = (pos, from = currentRaw()) => {
        let start = from
        let target = pos
        if (target < 0 || start < 0) {
            start += count
            target += count
        } else if (target > count || start > count) {
            start -= count
            target -= count
        }
        if (start !== from) scrollRaw(Math.min(count, Math.max(0, start)), 'instant')
        scrollRaw(Math.min(count, Math.max(0, target)), reduced ? 'auto' : 'smooth')
    }
    // 원에서 가까운 쪽으로 그 프로젝트까지 (옆 패널 클릭: 08에서 오른쪽 01을 누르면 앞으로 돈다)
    const rotateToward = (index) => {
        const from = currentRaw()
        const wrapped = ((((index - from + count / 2) % count) + count) % count) - count / 2
        rotate(Math.round(from + wrapped), from)
    }
    // 드래그(마우스 · 터치 가로 스와이프): 끄는 동안 원이 손을 따라 돌고, 놓으면 가까운 프로젝트로
    const dragRef = useRef(null)
    const dragOffsetRef = useRef(0)
    const draggedRef = useRef(false)
    const handleDragStart = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return
        if (event.target.closest('a, .work-show-actions, .work-show-index')) return
        dragRef.current = { x: event.clientX, y: event.clientY, from: currentRaw(), id: event.pointerId, moved: false }
        draggedRef.current = false
    }
    const handleDragMove = (event) => {
        const drag = dragRef.current
        if (!drag || drag.id !== event.pointerId) return
        const dx = event.clientX - drag.x
        if (!drag.moved) {
            // 가로로 움직여야 드래그 (세로가 더 크면 페이지 스크롤로 둔다)
            if (Math.abs(dx) < DRAG_THRESHOLD || Math.abs(dx) < Math.abs(event.clientY - drag.y)) return
            drag.moved = true
            draggedRef.current = true
            stageRef.current.classList.add('is-dragging')
            event.currentTarget.setPointerCapture?.(event.pointerId)
        }
        const width = panelRefs.current[0]?.offsetWidth || window.innerWidth * 0.4
        // 왼쪽으로 끌면 다음 프로젝트 쪽으로 돈다
        dragOffsetRef.current = -dx / (width * 0.9)
    }
    const handleDragEnd = (event) => {
        const drag = dragRef.current
        if (!drag || drag.id !== event.pointerId) return
        dragRef.current = null
        if (!drag.moved) return
        stageRef.current.classList.remove('is-dragging')
        const dx = event.clientX - drag.x
        const shown = drag.from + dragOffsetRef.current
        let target = Math.round(shown)
        if (target === Math.round(drag.from) && Math.abs(dx) > DRAG_FLICK) target += dx < 0 ? 1 : -1
        dragOffsetRef.current = 0
        rotate(target, shown)
    }
    // 드래그를 끝내며 생기는 클릭이 패널을 열지 않게
    const handleClickCapture = (event) => {
        if (!draggedRef.current) return
        draggedRef.current = false
        event.preventDefault()
        event.stopPropagation()
    }

    // 매 프레임: 스크롤 위치 → 패널 · 타임라인, 스크롤 속도 → 기울기
    useEffect(() => {
        const months = projects.map(monthsOf)
        const env = { mobile, reduced }
        let frame = 0
        let snapTimer = 0
        let lastY = window.scrollY
        let lastTime = performance.now()
        let skew = 0
        let lastF = -1

        let lastIntro = -1
        // 마지막으로 멈춘 스크롤 위치 (첫 화면 ↔ 01 사이에서 어느 방향으로 스크롤하던 중인지 알기 위해)
        let settledY = window.scrollY
        const loop = (now) => {
            frame = requestAnimationFrame(loop)
            const { start, intro, top, unit } = measure()
            const y = window.scrollY

            // 첫 화면이 줌인되는 동안: 가운데에서 작게(0.3배) 나타나 꽉 차게 커진다 (다 커지기 전엔 첫 화면을 누를 수 있게)
            const grow = intro > 0 ? Math.min(1, Math.max(0, (y - start) / intro)) : 1
            if (grow !== lastIntro) {
                lastIntro = grow
                const stage = stageRef.current
                // 처음엔 작게 머물다가 후반에 꽉 차게 (ease-in-out), 첫 화면이 옅어지는 만큼 나타난다
                const eased = grow < 0.5 ? 4 * grow ** 3 : 1 - (-2 * grow + 2) ** 3 / 2
                stage.style.transform = reduced || grow >= 1 ? '' : `scale(${(0.3 + 0.7 * eased).toFixed(4)})`
                stage.style.opacity = grow >= 1 ? '' : Math.min(1, Math.max(0, (grow - 0.12) / 0.6)).toFixed(3)
                stage.style.visibility = grow <= 0 ? 'hidden' : ''
                stage.style.pointerEvents = grow >= 1 ? '' : 'none'
            }
            const dt = Math.max(1, now - lastTime)
            // 스크롤 속도(px/ms) → 기울기, 멈추면 천천히 0으로
            const velocity = (y - lastY) / dt
            lastY = y
            lastTime = now
            const targetSkew = reduced ? 0 : Math.max(-SKEW_MAX, Math.min(SKEW_MAX, velocity * 2.2))
            skew += (targetSkew - skew) * 0.12
            if (Math.abs(skew) < 0.01) skew = 0
            stageRef.current.style.setProperty('--skew', `${skew.toFixed(2)}deg`)

            // 보이는 위치 = 스크롤 위치(0 ~ count) + 드래그 중 끈 만큼. 원이라 범위를 넘어도 그대로 감긴다
            const f = Math.min(count, Math.max(0, (y - top) / unit)) + dragOffsetRef.current
            if (f === lastF) return
            lastF = f
            Object.assign(env, { count, height: window.innerHeight, panelWidth: panelRefs.current[0]?.offsetWidth ?? window.innerWidth * 0.46 })
            panelRefs.current.forEach((panel, i) => {
                if (!panel) return
                const { transform, opacity, fade, distance } = ringPose(i - f, i, env)
                panel.style.transform = transform
                panel.style.opacity = opacity.toFixed(3)
                panel.style.visibility = opacity < 0.01 ? 'hidden' : 'visible'
                panel.style.setProperty('--fade', fade.toFixed(3))
                // 정면과 바로 옆 패널만 누를 수 있다 (옆 패널을 누르면 그 프로젝트로 돈다)
                panel.style.pointerEvents = distance < 1.4 && opacity > 0.01 ? 'auto' : 'none'
            })
            // 타임라인: 이웃한 두 프로젝트의 시작 연 · 월 사이를 스크롤만큼 굴린다
            const wrap = (n) => ((n % count) + count) % count
            const i = wrap(Math.floor(f))
            const next = months[wrap(i + 1)]
            if (dateRef.current) dateRef.current.textContent = formatMonths(Math.round(months[i] + (next - months[i]) * (f - Math.floor(f))))

            const nearest = wrap(Math.round(f))
            if (nearest !== activeRef.current) {
                activeRef.current = nearest
                setActive(nearest)
                onActiveRef.current?.(nearest)
            }
        }
        // 스크롤이 멈추면 가장 가까운 프로젝트에 맞춘다 (프로젝트 사이 어중간한 곳에 멈추지 않게).
        // 08 뒤 "다시 01" 자리에 멈췄으면 똑같이 보이는 진짜 01 자리로 순간 이동해 계속 내려갈 수 있게 한다
        const snap = () => {
            if (pausedRef.current || dragRef.current) return
            const { start, intro, top, unit } = measure()
            const raw = (window.scrollY - top) / unit
            // 첫 화면 → 01로 커지는 중간에 멈췄으면 스크롤하던 방향으로 마저 간다 (내리던 중이면 01, 올리던 중이면 첫 화면)
            if (raw < -0.02) {
                const y = window.scrollY
                const grow = (y - start) / Math.max(1, intro)
                if (grow > 0.02 && grow < 0.98) {
                    settledY = y > settledY ? top : start
                    window.scrollTo({ top: settledY, behavior: reduced ? 'auto' : 'smooth' })
                } else settledY = y
                return
            }
            settledY = window.scrollY
            if (raw > count + 0.02) return
            const target = Math.round(raw)
            if (Math.abs(raw - target) >= 0.03) {
                window.scrollTo({ top: top + target * unit, behavior: reduced ? 'auto' : 'smooth' })
                return
            }
            if (target === count) window.scrollTo({ top, behavior: 'instant' })
        }
        const onScroll = () => {
            clearTimeout(snapTimer)
            snapTimer = setTimeout(snap, SNAP_DELAY)
        }
        frame = requestAnimationFrame(loop)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            cancelAnimationFrame(frame)
            clearTimeout(snapTimer)
            window.removeEventListener('scroll', onScroll)
        }
        // measure는 ref만 읽으므로 의존성에서 뺀다
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count, mobile, reduced, projects])

    // 키보드로 프로젝트 넘기기 (팝업이 열려 있거나 입력 중이면 두지 않는다)
    useEffect(() => {
        const onKeyDown = (event) => {
            if (pausedRef.current || event.altKey || event.ctrlKey || event.metaKey) return
            if (event.target.closest?.('input, textarea, select, [contenteditable="true"]')) return
            const { top } = measure()
            const before = window.scrollY < top - 2
            let target = null
            // ↓ · →: 다음 (08 다음은 다시 01) / ↑ · ←: 이전 (01에서는 첫 화면으로)
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                event.preventDefault()
                if (before) go(0)
                else rotate(Math.round(currentRaw()) + 1)
                return
            }
            if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                if (before) return
                event.preventDefault()
                if (activeRef.current === 0) window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
                else rotate(Math.round(currentRaw()) - 1)
                return
            }
            if (/^[1-9]$/.test(event.key) && Number(event.key) <= count) target = Number(event.key) - 1
            if (target == null) return
            event.preventDefault()
            go(target)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count, reduced])

    // 마우스 위치만큼 패널 묶음이 살짝 기운다
    const handlePointerMove = (event) => {
        if (reduced || event.pointerType !== 'mouse') return
        deckRef.current.style.setProperty('--mx', ((event.clientX / window.innerWidth) * 2 - 1).toFixed(3))
        deckRef.current.style.setProperty('--my', ((event.clientY / window.innerHeight) * 2 - 1).toFixed(3))
    }

    const project = projects[active]
    const company = companies.find((c) => c.key === project.category)
    const contributionText = formatContribution(project.contribution)
    const links = toLinks(project.link)
    const number = (n) => String(n).padStart(2, '0')
    // 정보 줄마다 떠오르는 순서 (위에서부터 0, 1, 2 …)
    let order = 0
    const rise = () => order++

    return (
        <section className={`${styles.scope} work-show ${reduced ? 'is-reduced' : ''}`} ref={sectionRef} style={{ '--count': count }} aria-label="프로젝트 목록">
            <div
                className="work-show-stage"
                ref={stageRef}
                onPointerDown={handleDragStart}
                onPointerMove={(event) => {
                    handlePointerMove(event)
                    handleDragMove(event)
                }}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragEnd}
                onClickCapture={handleClickCapture}
            >
                {/* 왼쪽 위: 회사 —— Works 03 / 08 */}
                <p className="work-show-crumb">
                    <span className="work-show-company" key={company?.key}>{company?.label}</span>
                    <i aria-hidden="true" />
                    <span>Works</span>
                    <span className="work-show-count">{number(active + 1)} / {number(count)}</span>
                </p>

                {/* 기울어진 패널 묶음 */}
                <div className="work-show-deck-area" aria-hidden="true">
                    <div className="work-show-deck" ref={deckRef}>
                        {projects.map((item, i) => {
                            const isActive = i === active
                            const canOpen = item.detail !== false
                            return (
                                <button
                                    className={`work-show-panel ${isActive ? 'is-active' : ''}`}
                                    type="button"
                                    tabIndex={-1}
                                    key={item.slug}
                                    ref={(el) => { panelRefs.current[i] = el }}
                                    data-cursor={isActive && canOpen ? 'OPEN' : undefined}
                                    onClick={() => (isActive ? canOpen && onOpen(item) : rotateToward(i))}
                                >
                                    <WorkPanel project={item} interactive={isActive && !reduced && !mobile} />
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/*
                  * 왼쪽 아래: 지금 프로젝트 정보. Design/Frontend 카드(.project-card-rise)와 같은 애니메이션 —
                  * 바뀔 때마다 줄마다 --i(떠오르는 순서)대로 위에서부터 차례로 아래에서 떠오른다
                  */}
                <article className="work-show-info" key={project.slug} aria-live="polite">
                    {/* Design/Frontend 카드 제목과 같은 크기 규칙: 기준 제목 크기로 통일, 더 긴 제목만 한 줄에 맞게 줄인다 */}
                    <h2 className="work-show-title work-show-rise" style={{ '--i': rise(), '--title-em': titleWidthEm(project.title), '--title-ref-em': TITLE_SIZE_REFERENCE_EM }}>{project.title}</h2>
                    {project.description && (
                        <div className="work-show-desc">
                            {project.description.split('\n').map((line) => <p className="work-show-rise" key={line} style={{ '--i': rise() }}>{line}</p>)}
                        </div>
                    )}
                    <ul className="work-show-points">
                        {[project.type, project.work && workLabels[project.work], contributionText].filter(Boolean).map((point) => (
                            <li className="work-show-rise" key={point} style={{ '--i': rise() }}>{point}</li>
                        ))}
                    </ul>
                    <p className="work-show-period work-show-rise" style={{ '--i': rise() }}>
                        <span>{periodOf(project)}</span>
                        {project.period?.duration && <span>{project.period.duration}</span>}
                    </p>
                    {project.tools?.length > 0 && (
                        <ul className="work-show-tools work-show-rise" style={{ '--i': rise() }} aria-label="사용 프로그램">
                            {project.tools.map((tool) => {
                                const name = toolNames[tool] || tool
                                return <li key={tool}>{skillIcons[tool] && <img src={skillIcons[tool]} alt="" />}{name}</li>
                            })}
                        </ul>
                    )}
                    <div className="work-show-actions work-show-rise" style={{ '--i': rise() }}>
                        {project.detail !== false && <button className="work-show-action is-primary" type="button" onClick={() => onOpen(project)}>{project.pdf ? 'PDF' : '세부정보'}</button>}
                        {project.pdfPreview && <button className="work-show-action" type="button" onClick={() => onPreview(project)}>미리보기</button>}
                        {links.map(({ label, url }) => (
                            <a className="work-show-action" key={url} href={url} target="_blank" rel="noreferrer" aria-label={`${project.title} ${label} 새 탭에서 열기`}>{label} ↗</a>
                        ))}
                    </div>
                </article>

                {/* 오른쪽: 회사별 목록 · 타임라인 */}
                <nav className="work-show-index" aria-label="프로젝트 바로가기">
                    <div className="work-show-side">
                        <div className="work-show-list">
                            {companies.map((c) => {
                                const items = projects.map((item, i) => ({ item, i })).filter(({ item }) => item.category === c.key)
                                if (!items.length) return null
                                return (
                                    <div className="work-show-group" key={c.key}>
                                        <p className="work-show-group-name">{c.label}</p>
                                        <ul>
                                            {items.map(({ item, i }) => (
                                                <li key={item.slug}>
                                                    <button className={i === active ? 'is-active' : ''} type="button" onClick={() => go(i)} aria-current={i === active ? 'true' : undefined}>
                                                        <span>{number(i + 1)}</span>{item.title}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            })}
                        </div>
                        <p className="work-show-meter" aria-hidden="true">
                            <span>TIMELINE</span>
                            <strong ref={dateRef}>{formatMonths(monthsOf(projects[0]))}</strong>
                        </p>
                    </div>
                </nav>
            </div>
        </section>
    )
})

export default WorkShowcase
