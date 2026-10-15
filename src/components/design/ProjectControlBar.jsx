import styles from './ProjectControlBar.module.scss'

// 원통 보기 아래 조작 바: 둥근 썸네일 + 제목 + ←/→ 버튼. 제목을 누르면 상세 카드 보기로 전환
export default function ProjectControlBar({ project, onPrev, onNext, onOpen }) {
    return (
        <div className={`${styles.scope} project-control`}>
            <button className="project-control-current" type="button" onClick={onOpen} aria-label={`${project.title} 자세히 보기`}>
                {project.thumbnail ? <img src={project.thumbnail} alt="" /> : <span className="is-empty" />}
                <strong key={project.slug}>{project.title}</strong>
            </button>
            {/* 글자 화살표는 폰트마다 위아래로 떠 보여서, 상자 정가운데에 오도록 SVG로 그린다 */}
            <button className="project-control-arrow" type="button" onClick={onPrev} aria-label="이전 프로젝트"><ArrowIcon /></button>
            <button className="project-control-arrow is-next" type="button" onClick={onNext} aria-label="다음 프로젝트"><ArrowIcon /></button>
        </div>
    )
}

// ← 모양 (다음 버튼은 CSS로 좌우를 뒤집는다)
function ArrowIcon() {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M13 8H3M7 4 3 8l4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
