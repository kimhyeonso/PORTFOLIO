import styles from './ProjectThumbnails.module.scss'

// 갤러리 아래 썸네일 줄. 누르면 해당 카드로 이동한다.
export default function ProjectThumbnails({ projects, activeIndex, onSelect }) {
    return (
        <nav className={`${styles.scope} project-thumbs`} aria-label="프로젝트 목록">
            {projects.map((project, index) => (
                <button className={index === activeIndex ? 'is-active' : ''} type="button" key={project.slug} onClick={() => onSelect(index)} aria-label={`${project.id} ${project.title}`} aria-current={index === activeIndex ? 'true' : undefined}>
                    {project.thumbnail ? <img src={project.thumbnail} alt="" /> : <span className="is-empty" />}
                </button>
            ))}
        </nav>
    )
}
