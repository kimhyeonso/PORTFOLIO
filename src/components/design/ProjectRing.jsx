import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { STRIPS, ringRadius } from './ringGeometry.js'
import { titleWidthEm } from './titleWidth.js'
import WorkBadge from './WorkBadge.jsx'
import styles from './ProjectRing.module.scss'

// 3D 제목(Three.js · gsap)은 사진만 보기에서만 쓰므로 필요할 때 따로 불러온다
const RingTitles3D = lazy(() => import('./RingTitles3D.jsx'))

const SPIN_DURATION = 750 // ms, SCSS의 회전 transition과 맞춘다
const SEESAW_ANGLE = 2.5 // deg, 넘길 때 좌우가 오르내리는 정도

// 원통에 붙는 카드 한 장의 앞면: 제목 · 분야/연도 + 썸네일
// imageOnly면 썸네일만 꽉 채운다 (제목은 RingTitles3D가 3D로 띄운다)
function RingFace({ project, imageOnly }) {
    return (
        <div className={`project-ring-face ${imageOnly ? 'is-image-only' : ''}`}>
            {!imageOnly && <div className="project-ring-info">
                <strong style={{ '--title-em': titleWidthEm(project.title) }}>{project.title}</strong>
                <span className="project-ring-type">{project.type} · {project.year}</span>
            </div>}
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
 * 어느 카드를 누르든 onOpen(그 카드 번호)을 불러 해당 프로젝트의 카드 보기로 바꾼다.
 * imageOnly가 true면 카드에 글자 없이 썸네일만 꽉 차게 보여주고, 앞면 카드 호버 시 3D 유리 제목을 띄운다
 * (호버가 없는 터치 기기에선 앞면 카드 제목을 항상 띄운다).
 * intro가 true면 처음 나타날 때 빠르게 몇 바퀴 돈 뒤 멈추고, 끝나면 onIntroEnd를 부른다.
 * (키보드/스크린리더는 아래 조작 바로 조작한다)
 */
export default function ProjectRing({ projects, position, activeIndex, onOpen, intro = false, onIntroEnd, imageOnly = false }) {
    const count = projects.length
    const step = 360 / count
    const ringRef = useRef(null)
    const kickRef = useRef(null)
    const spinRef = useRef(null)
    const [hovered, setHovered] = useState(false)
    const [touch] = useState(() => window.matchMedia('(hover: none)').matches)
    const shownIndex = imageOnly && !intro && (hovered || touch) ? activeIndex : -1
    // 누른 위치가 어느 카드인지 계산한다. 3D 원통에선 클릭이 띠가 아닌 회전 레이어에 잡혀서 요소로는 알 수 없다.
    // 앞면에서 θ만큼 돌아간 카드의 화면 가로 위치 = R·sinθ · P / (P + R − R·cosθ) (P: perspective, R: 반지름)
    // → 누른 x에 맞는 θ를 이분 탐색으로 찾아 한 칸 각도로 나눈다 (오른쪽이 다음 카드)
    const handleClick = (event) => {
        const ring = event.currentTarget
        const rect = ring.getBoundingClientRect()
        const panelWidth = ring.querySelector('.project-ring-face')?.offsetWidth ?? 0
        const distance = parseFloat(getComputedStyle(ring).perspective) || Infinity
        const radius = ringRadius(panelWidth, count)
        const offsetX = event.clientX - (rect.left + rect.width / 2)
        const screenX = (theta) => (radius * Math.sin(theta) * distance) / (distance + radius - radius * Math.cos(theta))
        let low = -Math.PI / 2
        let high = Math.PI / 2
        for (let i = 0; i < 24; i += 1) {
            const mid = (low + high) / 2
            if (screenX(mid) < offsetX) low = mid
            else high = mid
        }
        const steps = Math.round((((low + high) / 2) * 180) / Math.PI / step)
        onOpen((((activeIndex + steps) % count) + count) % count)
    }

    // 3D 원통에선 마우스 아래 요소가 띠가 아닌 회전 레이어로 잡히므로, 위치로 앞면 카드 위인지 판단한다
    // (앞면 카드는 항상 원통 가로 가운데에 카드 너비만큼 놓인다)
    const handleHover = (event) => {
        if (!imageOnly) return
        const rect = event.currentTarget.getBoundingClientRect()
        const panelWidth = event.currentTarget.querySelector('.project-ring-face')?.offsetWidth ?? 0
        setHovered(Math.abs(event.clientX - (rect.left + rect.width / 2)) < panelWidth / 2)
    }
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
        <div className="project-ring-wrap">
            <div
                className={`${styles.scope} project-ring ${intro ? 'is-intro' : ''} ${imageOnly ? 'is-image-only' : ''}`}
                ref={ringRef}
                style={{ '--count': count, '--strips': STRIPS }}
                aria-hidden="true"
                onPointerMove={handleHover}
                onPointerLeave={() => setHovered(false)}
                onClick={handleClick}
            >
                <div className="project-ring-kick" ref={kickRef}>
                    {/* intro: 처음 들어올 때 빠르게 몇 바퀴 돌다가 01에서 멈춤. 끝나면 일반 회전(transition)으로 돌아간다 */}
                    <div className="project-ring-spin" ref={spinRef} style={{ '--rotation': `${-position * step}deg` }} onAnimationEnd={(event) => event.target === event.currentTarget && onIntroEnd?.()}>
                        {projects.map((project, index) => {
                            const isActive = index === activeIndex
                            return Array.from({ length: STRIPS }, (_, strip) => (
                                <div
                                    className={`project-ring-strip ${isActive ? 'is-active' : ''}`}
                                    key={`${project.slug}-${strip}`}
                                    style={{ '--angle': `${(index + (strip + 0.5) / STRIPS - 0.5) * step}deg`, '--s': strip }}
                                >
                                    <RingFace project={project} imageOnly={imageOnly} />
                                </div>
                            ))
                        })}
                    </div>
                </div>
            </div>
            {imageOnly && (
                <Suspense fallback={null}>
                    <RingTitles3D projects={projects} shownIndex={shownIndex} ringRef={ringRef} kickRef={kickRef} spinRef={spinRef} />
                </Suspense>
            )}
        </div>
    )
}
