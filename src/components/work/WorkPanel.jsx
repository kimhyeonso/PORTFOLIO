import styles from './WorkPanel.module.scss'

/**
 * Working 페이지의 프로젝트 패널 한 장 (첫 화면에 떠 있는 패널 · 스크롤 화면의 큰 패널 공용).
 * 썸네일을 꽉 채우고, 안쪽에 얇은 프레임 선 · 비스듬한 빛 반사 · 라벤더-금색 테두리 빛을 얹는다.
 * interactive: 마우스 쪽으로 패널이 기울고, 반사광이 마우스를 따라간다 (CSS 변수 --px · --py, -1 ~ 1)
 */
export default function WorkPanel({ project, className = '', interactive = false }) {
    const handleMove = (event) => {
        const el = event.currentTarget
        const rect = el.getBoundingClientRect()
        el.style.setProperty('--px', (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3))
        el.style.setProperty('--py', (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3))
    }
    const handleLeave = (event) => {
        event.currentTarget.style.setProperty('--px', '0')
        event.currentTarget.style.setProperty('--py', '0')
    }
    const pointer = interactive
        ? { onPointerMove: handleMove, onPointerLeave: handleLeave }
        : {}

    return (
        <span className={`${styles.scope} work-panel ${interactive ? 'is-interactive' : ''} ${className}`} {...pointer}>
            {project.thumbnail ? <img src={project.thumbnail} alt="" loading="lazy" draggable="false" /> : <span className="work-panel-empty">{project.title}</span>}
            <span className="work-panel-sheen" aria-hidden="true" />
            {interactive && <span className="work-panel-glare" aria-hidden="true" />}
        </span>
    )
}
