import { useEffect, useRef } from 'react'
import useMedia from '../../hooks/useMedia.js'
import WorkPanel from './WorkPanel.jsx'
import { startYearOf } from './workInfo.js'
import styles from './WorkHero.module.scss'

const PUSH_RADIUS = 260 // px, 커서가 이 안에 들어오면 글자가 밀려난다
const PUSH_MAX = 46 // px, 가장 가까울 때 밀려나는 거리

const WORD = 'WORKS'

/*
 * 패널 자리: 화면 가운데 기준 x(vw) · y(vh) · 깊이 z(px) · 회전(deg) · 너비(vw).
 * 가운데 세로 글자 앞뒤로 깊이를 섞어, 어떤 패널은 글자를 가리고 어떤 패널은 글자 뒤로 숨는다.
 */
const DESKTOP_SLOTS = [
    { x: -4, y: -31, z: -220, rx: 4, ry: 0, rz: -2, w: 34 },
    { x: 37, y: -15, z: -360, rx: 0, ry: -38, rz: 0, w: 14 },
    { x: -31, y: 9, z: 60, rx: -4, ry: 20, rz: -4, w: 21 },
    { x: 14, y: 4, z: 150, rx: 2, ry: -12, rz: 2, w: 23 },
    { x: -13, y: 41, z: 240, rx: 8, ry: 18, rz: 3, w: 22 },
    { x: 24, y: 40, z: 40, rx: -8, ry: -18, rz: -2, w: 26 },
    { x: -40, y: -30, z: -620, rx: 0, ry: 28, rz: 0, w: 18 },
    { x: 43, y: 34, z: -260, rx: 0, ry: -42, rz: 0, w: 16 },
]
// 모바일: 장면은 아래 소개 글 위쪽 칸(WorkHero.module.scss 모바일 .work-hero-stage)에만 들어가도록 작고 가깝게
const MOBILE_SLOTS = [
    { x: 0, y: -19, z: -200, rx: 4, ry: 0, rz: -2, w: 56 },
    { x: 28, y: -4, z: 120, rx: 0, ry: -24, rz: 2, w: 40 },
    { x: -28, y: 6, z: 60, rx: 0, ry: 22, rz: -3, w: 40 },
    { x: 26, y: 18, z: -120, rx: 6, ry: -26, rz: 2, w: 34 },
    { x: -30, y: -16, z: -420, rx: 0, ry: 30, rz: 0, w: 34 },
]

/**
 * Working 첫 화면: 가운데 세로로 큰 WORKS 글자, 그 앞뒤 깊이에 기울어진 프로젝트 패널들이 둥둥 떠 있다.
 * 마우스를 움직이면 장면이 살짝 기울고, WORKS 글자는 커서를 피해 밀려나며 비틀린다. 패널은 마우스 쪽으로 기운다.
 * 스크롤하면 카메라가 패널 사이로 날아 들어가며 다음(스크롤 화면)으로 이어진다.
 * 패널을 누르면 onPick(프로젝트 번호) → 그 프로젝트로 스크롤한다.
 */
export default function WorkHero({ projects, companies, onPick }) {
    const mobile = useMedia('(max-width: 900px)')
    const reduced = useMedia('(prefers-reduced-motion: reduce)')
    const rootRef = useRef(null)
    const sceneRef = useRef(null)
    const letterRefs = useRef([])
    const slots = mobile ? MOBILE_SLOTS : DESKTOP_SLOTS
    const shown = projects.slice(0, slots.length)
    const years = projects.map(startYearOf).filter(Boolean)

    // 스크롤: 첫 화면을 지나는 만큼(0 → 1) 카메라가 앞으로 날아가며 장면이 옅어진다
    useEffect(() => {
        let frame = 0
        const update = () => {
            frame = 0
            const root = rootRef.current
            if (!root) return
            const travel = root.offsetHeight - window.innerHeight
            const fly = Math.min(1, Math.max(0, window.scrollY / Math.max(1, travel)))
            root.style.setProperty('--fly', fly.toFixed(4))
        }
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update)
        }
        update()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
        }
    }, [])

    // 마우스 위치(-1 ~ 1)만큼 장면이 기울고, 가까운 글자는 커서 반대쪽으로 밀려나며 비틀린다
    const handlePointerMove = (event) => {
        if (reduced || event.pointerType !== 'mouse') return
        const scene = sceneRef.current
        scene.style.setProperty('--mx', ((event.clientX / window.innerWidth) * 2 - 1).toFixed(3))
        scene.style.setProperty('--my', ((event.clientY / window.innerHeight) * 2 - 1).toFixed(3))
        letterRefs.current.forEach((letter) => {
            if (!letter) return
            const rect = letter.parentElement.getBoundingClientRect()
            const dx = rect.left + rect.width / 2 - event.clientX
            const dy = rect.top + rect.height / 2 - event.clientY
            const distance = Math.hypot(dx, dy) || 1
            const force = Math.max(0, 1 - distance / PUSH_RADIUS) ** 2
            letter.style.setProperty('--lx', `${((dx / distance) * force * PUSH_MAX).toFixed(1)}px`)
            letter.style.setProperty('--ly', `${((dy / distance) * force * PUSH_MAX).toFixed(1)}px`)
            letter.style.setProperty('--lr', `${(-(dx / distance) * force * 28).toFixed(1)}deg`)
            letter.style.setProperty('--ls', (1 + force * 0.08).toFixed(3))
        })
    }
    const handlePointerLeave = () => {
        letterRefs.current.forEach((letter) => {
            if (!letter) return
            ;['--lx', '--ly', '--lr'].forEach((name) => letter.style.setProperty(name, '0'))
            letter.style.setProperty('--ls', '1')
        })
    }
    const pick = (project) => onPick(projects.indexOf(project))

    return (
        <section className={`${styles.scope} work-hero ${reduced ? 'is-reduced' : ''}`} ref={rootRef} aria-labelledby="work-hero-title" onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
            <div className="work-hero-sticky">
                <div className="work-hero-stage">
                    <div className="work-hero-fly">
                        <div className="work-hero-scene" ref={sceneRef}>
                            <h1 className="work-hero-word" id="work-hero-title" aria-label="Works">
                                {/* 바깥 span은 등장 애니메이션, 안쪽 span은 커서에 밀려나는 움직임 */}
                                {[...WORD].map((letter, i) => (
                                    <span className="work-hero-letter" key={i} style={{ '--i': i }} aria-hidden="true">
                                        <span ref={(el) => { letterRefs.current[i] = el }}>{letter}</span>
                                    </span>
                                ))}
                            </h1>
                            {shown.map((project, i) => {
                                const slot = slots[i]
                                return (
                                    <div
                                        className="work-hero-slot"
                                        key={project.slug}
                                        style={{ '--x': `${slot.x}vw`, '--y': `${slot.y}vh`, '--z': `${slot.z}px`, '--rx': `${slot.rx}deg`, '--ry': `${slot.ry}deg`, '--rz': `${slot.rz}deg`, '--w': `${slot.w}vw`, '--i': i }}
                                    >
                                        <div className="work-hero-enter">
                                            <div className="work-hero-float">
                                                <button className="work-hero-panel" type="button" onClick={() => pick(project)} aria-label={`${project.title} 보기`}>
                                                    <WorkPanel project={project} interactive={!reduced && !mobile} />
                                                    <span className="work-hero-label" aria-hidden="true"><em>{project.id}</em>{project.title}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* 왼쪽 아래 소개 · 가운데 아래 스크롤 안내 */}
                <div className="work-hero-caption">
                    <p className="work-hero-kicker">PROFESSIONAL WORKS</p>
                    <p className="work-hero-companies">{companies.map((company) => company.label).join(' · ')}</p>
                    <p className="work-hero-count">
                        <strong>{String(projects.length).padStart(2, '0')}</strong> projects
                        {years.length > 0 && <span>{Math.min(...years)} — {Math.max(...years)}</span>}
                    </p>
                </div>
                {/* Profile 갤러리 조작 안내(.st-gallery-hint)와 같은 모양 */}
                <p className="work-hero-scroll" aria-hidden="true">▼ SCROLL ▼</p>
            </div>
        </section>
    )
}
