import styles from './WorkProjectRow.module.scss'

// 카드에 적는 작업 형태 (workProjects의 work 값)
const workLabels = { client: '클라이언트 작업', 'in-house': '인하우스 작업', proposal: '제안 프로젝트' }
// tools 키 중 화면에 다르게 보여줄 이름
const toolNames = { Behands: 'Behance', Iweb: 'iWeb' }

// contribution: 숫자면 "기여도 30%", 역할별 목록이면 "기획 70% · 디자인 100%"
function formatContribution(contribution) {
    if (contribution == null) return null
    if (typeof contribution === 'number') return `기여도 ${contribution}%`
    return contribution.map(({ role, value }) => `${role} ${value}%`).join(' · ')
}

// link: 문자열이면 [{ label: '홈페이지', url }], 객체면 { 버튼이름: 주소 } 를 버튼 목록으로. 빈 주소는 뺀다
function toLinks(link) {
    if (!link) return []
    if (typeof link === 'string') return [{ label: '홈페이지', url: link }]
    return Object.entries(link).filter(([, url]) => url).map(([label, url]) => ({ label, url }))
}

/**
 * Working 페이지의 프로젝트 한 줄: 왼쪽 큰 이미지(호버 시 세부정보·홈페이지 버튼) · 가운데 정보 카드 · 오른쪽 설명
 * reverse면 반대로: 왼쪽에 카드와 설명, 오른쪽에 더 큰 이미지 (짝수 번째 줄)
 */
export default function WorkProjectRow({ project, onOpen, reverse = false }) {
    const { title, type, year, period, contribution, description = '', thumbnail, tools = [], link, work } = project
    const date = period ? `${period.start} - ${period.end}` : year
    const contributionText = formatContribution(contribution)
    const links = toLinks(link)

    return (
        <article className={`${styles.scope} work-row ${reverse ? 'is-reverse' : ''}`} aria-labelledby={`work-${project.slug}`}>
            <div className="work-row-media">
                {thumbnail ? <img src={thumbnail} alt={`${title} 미리보기`} loading="lazy" /> : <div className="work-row-empty" />}
                {/* 이미지에 마우스를 올리면(또는 키보드로 포커스하면) 어두워지며 버튼이 나타난다 — Design/Frontend 카드와 같은 모양 */}
                <div className="work-row-overlay">
                    {project.detail !== false && <button className="work-row-action" type="button" onClick={onOpen}>세부정보</button>}
                    {links.map(({ label, url }) => (
                        <a className="work-row-action" key={url} href={url} target="_blank" rel="noreferrer" aria-label={`${title} ${label} 새 탭에서 열기`}>{label}</a>
                    ))}
                </div>
            </div>

            <div className="work-row-card">
                <h3 id={`work-${project.slug}`}>{title}</h3>
                <p className="work-row-date">{date}</p>
                <p className="work-row-meta">
                    <span>{type}</span>
                    {work && <span>{workLabels[work]}</span>}
                    {contributionText && <span>{contributionText}</span>}
                </p>
                {tools.length > 0 && <p className="work-row-tools">{tools.map((tool) => toolNames[tool] || tool).join(' · ')}</p>}
            </div>

            <div className="work-row-detail">
                <p className="work-row-code">DETAIL</p>
                {/* 설명은 줄바꿈(\n)마다 한 문단 */}
                {description.split('\n').map((line) => <p className="work-row-text" key={line}>{line}</p>)}
            </div>
        </article>
    )
}
