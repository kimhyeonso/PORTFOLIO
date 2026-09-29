import styles from './ProjectControlBar.module.scss'

// 원통 보기 아래 조작 바: 둥근 썸네일 + 제목 + ←/→. 제목을 누르면 상세 카드 보기로 전환
export default function ProjectControlBar({ project, onPrev, onNext, onOpen }) {
    return (
        <div className={`${styles.scope} project-control`}>
            <button className="project-control-current" type="button" onClick={onOpen} aria-label={`${project.title} 자세히 보기`}>
                {project.thumbnail ? <img src={project.thumbnail} alt="" /> : <span className="is-empty" />}
                <strong key={project.slug}>{project.title}</strong>
            </button>
            <button className="project-control-arrow" type="button" onClick={onPrev} aria-label="이전 프로젝트">←</button>
            <button className="project-control-arrow" type="button" onClick={onNext} aria-label="다음 프로젝트">→</button>
        </div>
    )
}
