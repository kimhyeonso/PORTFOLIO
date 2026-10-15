import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { skillIcons } from '../../data/skillIcons.js'
import { titleWidthEm } from './titleWidth.js'
import WorkBadge from './WorkBadge.jsx'
import styles from './ProjectCard.module.scss'

// 모든 카드 제목을 이 제목이 칸 너비에 꽉 차는 글자 크기로 맞춘다 (이보다 긴 제목만 더 줄어든다)
const TITLE_SIZE_REFERENCE_EM = titleWidthEm('ADVERTISING BANNER')
// 도구 아이콘이 이 개수 이상이면 두 줄로
const TOOLS_TWO_ROWS = 5

// contribution: 숫자면 "기여도 : 30%", 역할별 목록이면 "기획 : 70% | 디자인 : 100%"
function formatContribution(contribution) {
    if (contribution == null) return null
    if (typeof contribution === 'number') return `기여도 : ${contribution}%`
    return contribution.map(({ role, value }) => `${role} : ${value}%`).join(' | ')
}

// link: 문자열이면 [{ label: '홈페이지', url }], 객체면 { 버튼이름: 주소 } 를 버튼 목록으로 바꾼다. 빈 주소는 뺀다
function toLinks(link) {
    if (!link) return []
    if (typeof link === 'string') return [{ label: '홈페이지', url: link }]
    return Object.entries(link).filter(([, url]) => url).map(([label, url]) => ({ label, url }))
}

/*
 * 버튼 한 줄. 줄바꿈 없이 늘어놓고, 놓인 칸(이미지 위 오버레이 · PC 글 칸)의 너비를 넘치면
 * 그 줄만 zoom으로 넘치지 않을 만큼 줄인다 (글자 · 여백 · 테두리가 함께 작아진다)
 */
function ActionRow({ children }) {
    const rowRef = useRef(null)
    useLayoutEffect(() => {
        const row = rowRef.current
        const box = row.parentElement
        const fit = () => {
            row.style.zoom = ''
            const style = getComputedStyle(box)
            const available = box.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
            const natural = row.offsetWidth
            // 숨겨진 쪽(모바일의 PC 버튼 줄 · PC의 오버레이 버튼)은 너비가 0이라 건너뛴다
            if (available <= 0 || natural <= 0) return
            if (natural > available) row.style.zoom = String(available / natural)
        }
        fit()
        const observer = new ResizeObserver(fit)
        observer.observe(box)
        // 웹폰트가 늦게 들어오면 글자 너비가 바뀌므로 한 번 더 잰다
        document.fonts?.ready.then(fit).catch(() => {})
        return () => observer.disconnect()
    }, [])
    return <div className="project-card-action-row" ref={rowRef}>{children}</div>
}

// 체험 계정 한 줄: 이메일 · 비밀번호마다 [복사] 버튼 (누르면 잠깐 "복사됨"). PC는 한 줄, 모바일은 두 줄
function AccountLine({ account, isActive }) {
    const [copied, setCopied] = useState(null)
    const timerRef = useRef(0)
    useEffect(() => () => clearTimeout(timerRef.current), [])

    const copy = async (key, value) => {
        try {
            await navigator.clipboard.writeText(value)
        } catch {
            return // 복사를 막은 환경에서는 글자를 직접 선택해 복사한다
        }
        setCopied(key)
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setCopied(null), 1500)
    }

    const fields = [
        { key: 'email', label: '이메일', value: account.email },
        { key: 'password', label: '비밀번호', value: account.password },
    ]
    return (
        <div className="project-card-account">
            <span className="project-card-account-title">{account.label}</span>
            {fields.map(({ key, label, value }) => (
                <span className="project-card-account-field" key={key}>
                    {label} : <b>{value}</b>
                    <button type="button" onClick={() => copy(key, value)} tabIndex={isActive ? 0 : -1} aria-label={`${label} 복사`}>
                        {copied === key ? '복사됨' : '복사'}
                    </button>
                </span>
            ))}
        </div>
    )
}

/**
 * 디자인/프론트엔드 공용 프로젝트 카드 (data/designProjects.js 구조)
 * PC: 카드 전체가 썸네일, 오른쪽 위에 도구 아이콘, 한쪽(textSide) 아래에 제목·정보·설명
 * 모바일: 위 썸네일 + 오른쪽 위 도구 아이콘, 아래 제목·정보·설명
 * 썸네일에 마우스를 올리면(또는 키보드로 포커스하면) 어두워지며 [세부정보](상세 페이지) · [홈페이지](외부 링크) 버튼이 나타난다
 */
export default function ProjectCard({ project, isActive, onOpen, onPreview, onSelect }) {
    const { title, type, year, period, contribution, role, description, thumbnail, tools = [], link, work } = project
    const contributionText = formatContribution(contribution)
    const links = toLinks(link)
    // 아이콘 이미지가 있는 도구만 보여준다
    const iconTools = tools.filter((tool) => skillIcons[tool])
    // 한 줄에 놓을 아이콘 수 (없으면 한 줄 그대로)
    const toolCols = project.toolCols ?? (iconTools.length >= TOOLS_TWO_ROWS ? Math.ceil(iconTools.length / 2) : null)
    // 글자 위치: 기본은 왼쪽 (데이터에 textSide: 'right'를 주면 오른쪽)
    const side = project.textSide ?? 'left'

    // [세부정보] · 링크 버튼. 모바일은 이미지 위 오버레이, PC는 글자 아래 줄에 보인다 (안 쓰는 쪽은 CSS로 숨김)
    // PDF가 연결된 프로젝트는 [세부정보] 대신 [PDF]로 보여준다
    const mainButtons = [
        project.detail !== false && (
            <button className="project-card-action" type="button" key="detail" onClick={isActive ? onOpen : undefined} tabIndex={isActive ? 0 : -1}>
                {project.pdf ? 'PDF' : '세부정보'}
            </button>
        ),
        // 미리보기: 제안서에서 기여한 부분을 강조한 이미지 한 장을 팝업으로
        project.pdfPreview && (
            <button className="project-card-action" type="button" key="preview" onClick={isActive ? onPreview : undefined} tabIndex={isActive ? 0 : -1}>
                미리보기
            </button>
        ),
    ].filter(Boolean)
    // link(Behance·사이트 주소)가 있는 프로젝트만 새 탭으로 여는 버튼
    const linkButtons = links.map(({ label, url }) => (
        <a className="project-card-action" key={url} href={url} target="_blank" rel="noreferrer" tabIndex={isActive ? 0 : -1} aria-label={`${title} ${label} 새 탭에서 열기`}>
            {label}
        </a>
    ))
    // 링크가 2개 이상이면(예: G-FOUNDATION) [세부정보 · 미리보기] / [링크들] 두 줄, 아니면 한 줄
    const actionRows = (links.length >= 2 ? [mainButtons, linkButtons] : [[...mainButtons, ...linkButtons]]).filter((row) => row.length > 0)
    const actions = actionRows.map((row, index) => <ActionRow key={index}>{row}</ActionRow>)

    return (
        <article className={`${styles.scope} project-card is-text-${side} ${isActive ? 'is-active' : ''}`} aria-hidden={!isActive} onClick={isActive ? undefined : onSelect}>
            <div className="project-card-media">
                <WorkBadge work={work} />
                {thumbnail ? <img className="project-card-thumb" src={thumbnail} alt={`${title} 미리보기`} loading="lazy" /> : <div className="project-card-thumb is-empty" />}
                <div className="project-card-overlay">{actions}</div>
                {/* 아이콘이 TOOLS_TWO_ROWS개 이상이면 적힌 순서대로 두 줄 (한 줄 최대 --tool-cols개, 오른쪽 정렬).
                    데이터에 toolCols가 있으면 한 줄에 그 개수씩 (예: 4 → 10개가 4 · 4 · 2 세 줄) */}
                {iconTools.length > 0 && (
                    <ul className={`project-card-tools ${toolCols ? 'is-wrapped' : ''}`} aria-label="사용 도구" style={{ '--tool-cols': toolCols }}>
                        {iconTools.map((tool) => {
                            const icon = skillIcons[tool]
                            // Behance 아이콘은 link가 있으면 외부 링크로
                            if (tool === 'Behands' && links[0]) {
                                return <li key={tool}><a href={links[0].url} target="_blank" rel="noreferrer" tabIndex={isActive ? 0 : -1} aria-label={`${title} Behance에서 보기`}><img src={icon} alt="" /></a></li>
                            }
                            return <li key={tool}><img src={icon} alt={tool} title={tool} /></li>
                        })}
                    </ul>
                )}
            </div>
            {/* 글 줄마다 --i(떠오르는 순서)를 주어 앞 카드가 될 때 위에서부터 차례로 떠오르게 한다 */}
            <div className="project-card-info">
                <h2 className="project-card-rise" style={{ '--i': 0, '--title-em': titleWidthEm(title), '--title-ref-em': TITLE_SIZE_REFERENCE_EM }}>{title}</h2>
                <p className="project-card-type project-card-rise" style={{ '--i': 1 }}>{type} / {year}</p>
                <div className="project-card-meta">
                    {[
                        period && `${period.start} - ${period.end} (${period.duration})`,
                        contributionText,
                        role && `역할 : ${role}`,
                    ].filter(Boolean).map((line, index) => (
                        <p className="project-card-rise" key={line} style={{ '--i': 2 + index }}>{line}</p>
                    ))}
                    {project.account && <div className="project-card-rise" style={{ '--i': 5 }}><AccountLine account={project.account} isActive={isActive} /></div>}
                </div>
                <p className="project-card-description project-card-rise" style={{ '--i': project.account ? 6 : 5 }}>“{description}”</p>
                <div className="project-card-actions">
                    <div>{actions}</div>
                </div>
            </div>
        </article>
    )
}
