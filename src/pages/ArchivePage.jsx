import { useEffect, useRef, useState } from 'react'
import background from '../assets/image/Menu_Desgin/background.png'
import ExitButton from '../components/common/ExitButton.jsx'
import MenuButton from '../components/common/MenuButton.jsx'
import ProjectModal from '../components/design/ProjectModal.jsx'
import WorkProjectRow from '../components/work/WorkProjectRow.jsx'
import { workProjects } from '../data/workProjects.js'
import styles from './ArchivePage.module.scss'

// Working(실무) 페이지. 주소는 기존 /archive를 그대로 쓴다.
// 회사 key는 workProjects.js의 category 값과 같아야 한다
const companies = [
  { key: 'concentrix', label: 'CONCENTRIX' },
  { key: 'ricota', label: 'RICOTA' },
]

/**
 * 실무 프로젝트를 회사별로 묶어 위아래로 스크롤하며 보는 페이지.
 * Design/Frontend 갤러리와 같은 틀: 홀 배경 · 위 가운데 회사 탭 · 왼쪽 위 홈(문) 버튼 · 오른쪽 위 메뉴 버튼.
 * 프로젝트 한 줄 = 이미지 · 정보 카드 · 설명 (WorkProjectRow), 회사 안에서 짝수 번째 줄은 좌우가 바뀐다.
 * 이미지 위 [세부정보]를 누르면 새 페이지 대신 ProjectModal 팝업(이미지만)이 열린다.
 * 탭은 지금 보고 있는 회사를 표시하고, 누르면 그 회사로 스크롤한다. 화면에 들어오는 줄은 아래에서 떠오른다.
 */
export default function ArchivePage({ onNavigate, onMenuToggle }) {
  const pageRef = useRef(null)
  const [activeCompany, setActiveCompany] = useState(companies[0].key)
  // 팝업으로 보고 있는 프로젝트 (없으면 null)
  const [detail, setDetail] = useState(null)

  // 화면에 들어온 줄에 is-visible을 붙여 떠오르게 한다 (움직임 줄이기 설정이면 처음부터 보이게)
  useEffect(() => {
    const rows = pageRef.current.querySelectorAll('.work-page-reveal')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      rows.forEach((row) => row.classList.add('is-visible'))
      return undefined
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.18 })
    rows.forEach((row) => observer.observe(row))
    return () => observer.disconnect()
  }, [])

  // 화면 가운데 줄을 지나는 회사 묶음을 탭에 표시한다
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveCompany(entry.target.dataset.company)
      })
    }, { rootMargin: '-50% 0px -50% 0px' })
    pageRef.current.querySelectorAll('.work-page-company').forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (key) => document.getElementById(`work-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <main className={`${styles.scope} work-page`} ref={pageRef} style={{ '--gallery-bg': `url(${background})` }} aria-label="Working projects">
      <div className="work-page-bar">
        <ExitButton onClick={() => onNavigate('/')} tone="dark" />
        <nav className="work-page-tabs" aria-label="회사별로 보기">
          {companies.map((company) => (
            <button className={company.key === activeCompany ? 'is-active' : ''} type="button" key={company.key} onClick={() => scrollTo(company.key)} aria-current={company.key === activeCompany ? 'true' : undefined}>
              {company.label}
            </button>
          ))}
        </nav>
        <MenuButton onClick={onMenuToggle} tone="dark" />
      </div>

      {companies.map((company) => {
        const projects = workProjects.filter((project) => project.category === company.key)
        if (!projects.length) return null
        return (
          <section className="work-page-company" id={`work-${company.key}`} data-company={company.key} key={company.key} aria-labelledby={`work-${company.key}-title`}>
            <h2 className="work-page-company-title" id={`work-${company.key}-title`}>{company.label}</h2>
            {projects.map((project, index) => (
              <div className="work-page-reveal" key={project.slug}>
                <WorkProjectRow project={project} reverse={index % 2 === 1} onOpen={() => setDetail(project)} />
              </div>
            ))}
          </section>
        )
      })}

      {detail && <ProjectModal project={detail} onClose={() => setDetail(null)} />}
    </main>
  )
}
