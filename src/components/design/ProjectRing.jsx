import { useEffect, useRef } from 'react'
import { titleWidthEm } from './titleWidth.js'
import WorkBadge from './WorkBadge.jsx'
import styles from './ProjectRing.module.scss'

const STRIPS = 8 // 카드 한 장을 세로 띠 몇 장으로 잘라 곡면처럼 보이게 할지 (많을수록 매끈, 대신 무거움)
const SPIN_DURATION = 750 // ms, SCSS의 회전 transition과 맞춘다
const SEESAW_ANGLE = 2.5 // deg, 넘길 때 좌우가 오르내리는 정도

// 원통에 붙는 카드 한 장의 앞면: 번호 · 제목 · 분야/연도 + 썸네일
function RingFace({ project }) {
    return (
        <div className="project-ring-face">
            <div className="project-ring-info">
                <span className="project-ring-number">{project.id}</span>
                <strong style={{ '--title-em': titleWidthEm(project.title) }}>{project.title}</strong>
                <span className="project-ring-type">{project.type} · {project.year}</span>
            </div>
            <div className="project-ring-media">
                <WorkBadge work={project.work} />
                {project.thumbnail ? <img src={project.thumbnail} alt="" draggable="false" /> : <span className="project-ring-empty" />}
            </div>
        </div>
    )
}

/**
 * 프로젝트 카드를 원통에 둘러 붙인 3D 회전 갤러리.
 * 각 카드를 STRIPS장의 세로 띠로 잘라(띠마다 같은 카드를 넣고 위치만 밀어 잘라 보이게) 조금씩 다른 각도로 붙여서
 * 평면이 아닌 둥근 원통처럼 보이게 한다.
 *
 * 넘길 때(스크롤·키·버튼)만 가운데를 축으로 좌우가 살짝 오르내렸다가 돌아온다 (Web Animations API).
 *
 * position은 끝없이 늘거나 줄어드는 정수(회전 칸 수)라서 마지막 → 처음으로 넘어갈 때도 짧은 방향으로 돈다.
 * 앞면 카드를 누르면 onOpenActive(카드 보기), 다른 카드를 누르면 그 프로젝트로 회전한다.
 * intro가 true면 처음 나타날 때 빠르게 몇 바퀴 돈 뒤 멈추고, 끝나면 onIntroEnd를 부른다.
 * (키보드/스크린리더는 아래 조작 바로 조작한다)
 */
export default function ProjectRing({ projects, position, activeIndex, onSelect, onOpenActive, intro = false, onIntroEnd }) {
    const count = projects.length
    const step = 360 / count
    const kickRef = useRef(null)
    const previousPositionRef = useRef(position)

    // 넘길 때 좌우가 부드럽게 한 번 오르내렸다가 돌아오는 시소 움직임 (튕김 없이)
    useEffect(() => {
        const direction = Math.sign(position - previousPositionRef.current)
        previousPositionRef.current = position
        if (!direction || !kickRef.current?.animate) return
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        kickRef.current.animate(
            [
                { transform: 'rotateZ(0deg)' },
                { transform: `rotateZ(${direction * -SEESAW_ANGLE}deg)`, offset: 0.45 },
                { transform: 'rotateZ(0deg)' },
            ],
            { duration: SPIN_DURATION + 400, easing: 'ease-in-out' },
        )
    }, [position])

    return (
        <div className={`${styles.scope} project-ring ${intro ? 'is-intro' : ''}`} style={{ '--count': count, '--strips': STRIPS }} aria-hidden="true">
            <div className="project-ring-kick" ref={kickRef}>
                {/* intro: 처음 들어올 때 빠르게 몇 바퀴 돌다가 01에서 멈춤. 끝나면 일반 회전(transition)으로 돌아간다 */}
                <div className="project-ring-spin" style={{ '--rotation': `${-position * step}deg` }} onAnimationEnd={(event) => event.target === event.currentTarget && onIntroEnd?.()}>
                    {projects.map((project, index) => {
                        const isActive = index === activeIndex
                        const handleClick = () => (isActive ? onOpenActive() : onSelect(index))
                        return Array.from({ length: STRIPS }, (_, strip) => (
                            <div
                                className={`project-ring-strip ${isActive ? 'is-active' : ''}`}
                                key={`${project.slug}-${strip}`}
                                style={{ '--angle': `${(index + (strip + 0.5) / STRIPS - 0.5) * step}deg`, '--s': strip }}
                                onClick={handleClick}
                            >
                                <RingFace project={project} />
                            </div>
                        ))
                    })}
                </div>
            </div>
        </div>
    )
}
