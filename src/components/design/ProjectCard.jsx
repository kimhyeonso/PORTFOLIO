import { skillIcons } from '../../data/skillIcons.js'
import { titleWidthEm } from './titleWidth.js'
import WorkBadge from './WorkBadge.jsx'
import styles from './ProjectCard.module.scss'

// contribution: 숫자면 "기여도 : 30%", 역할별 목록이면 "기획 : 70% | 디자인 : 100%"
function formatContribution(contribution) {
    if (contribution == null) return null
    if (typeof contribution === 'number') return `기여도 : ${contribution}%`
    return contribution.map(({ role, value }) => `${role} : ${value}%`).join(' | ')
}

// link: 문자열이면 [{ label: 'LINK', url }], 객체면 { 버튼이름: 주소 } 를 버튼 목록으로 바꾼다. 빈 주소는 뺀다
function toLinks(link) {
    if (!link) return []
    if (typeof link === 'string') return [{ label: 'LINK', url: link }]
    return Object.entries(link).filter(([, url]) => url).map(([label, url]) => ({ label, url }))
}

/**
 * 디자인/프론트엔드 공용 프로젝트 카드 (data/designProjects.js 구조)
 * 왼쪽 썸네일 + 오른쪽 아래 도구 아이콘, 오른쪽 번호·제목·정보·설명·VIEW DETAIL
 */
export default function ProjectCard({ project, isActive, onOpen, onSelect }) {
    const { id, title, type, year, period, contribution, role, description, thumbnail, tools = [], link, work } = project
    const contributionText = formatContribution(contribution)
    const links = toLinks(link)

    return (
        <article className={`${styles.scope} project-card ${isActive ? 'is-active' : ''}`} aria-hidden={!isActive} onClick={isActive ? undefined : onSelect}>
            <div className="project-card-media">
                <WorkBadge work={work} />
                {thumbnail ? <img className="project-card-thumb" src={thumbnail} alt={`${title} 미리보기`} /> : <div className="project-card-thumb is-empty" />}
                {tools.length > 0 && (
                    <ul className="project-card-tools" aria-label="사용 도구">
                        {tools.map((tool) => {
                            const icon = skillIcons[tool]
                            if (!icon) return null
                            // Behance 아이콘은 link가 있으면 외부 링크로
                            if (tool === 'Behands' && links[0]) {
                                return <li key={tool}><a href={links[0].url} target="_blank" rel="noreferrer" tabIndex={isActive ? 0 : -1} aria-label={`${title} Behance에서 보기`}><img src={icon} alt="" /></a></li>
                            }
                            return <li key={tool}><img src={icon} alt={tool} title={tool} /></li>
                        })}
                    </ul>
                )}
            </div>
            <div className="project-card-info">
                <p className="project-card-number">{id}</p>
                <h2 style={{ '--title-em': titleWidthEm(title) }}>{title}</h2>
                <p className="project-card-type">{type} / {year}</p>
                <div className="project-card-meta">
                    {period && <p>{period.start} - {period.end} ({period.duration})</p>}
                    {contributionText && <p>{contributionText}</p>}
                    {role && <p>역할 : {role}</p>}
                </div>
                <p className="project-card-description">“{description}”</p>
                <div className="project-card-actions">
                    <button className="project-card-detail" type="button" onClick={isActive ? onOpen : undefined} tabIndex={isActive ? 0 : -1}>
                        VIEW DETAIL <span aria-hidden="true">→</span>
                    </button>
                    {/* link(Behance·사이트 주소)가 있는 프로젝트만 새 탭으로 여는 링크 버튼 */}
                    {links.map(({ label, url }) => (
                        <a className="project-card-detail is-link" key={url} href={url} target="_blank" rel="noreferrer" tabIndex={isActive ? 0 : -1} aria-label={`${title} ${label} 새 탭에서 열기`}>
                            {label} <span aria-hidden="true">↗</span>
                        </a>
                    ))}
                </div>
            </div>
        </article>
    )
}
