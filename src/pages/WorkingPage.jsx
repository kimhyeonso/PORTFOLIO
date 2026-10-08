import { useEffect, useRef, useState } from 'react'
import background from '../assets/image/Menu_Desgin/working.png'
import HallPage from '../components/common/HallPage.jsx'
import PageBar from '../components/common/PageBar.jsx'
import ProjectModal, { previewOf } from '../components/design/ProjectModal.jsx'
import WorkProjectRow from '../components/work/WorkProjectRow.jsx'
import { workProjects } from '../data/workProjects.js'
import './WorkingPage.module.scss'

// Working(실무) 페이지 (주소 /working, 예전 주소 /archive로 들어와도 이리로 온다)
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
 * initialSlug: 메뉴 썸네일(/working/project/{slug})로 들어오면 그 프로젝트 줄로 바로 스크롤한다.
 */
export default function WorkingPage({ onNavigate, onMenuToggle, initialSlug }) {
  const pageRef = useRef(null)
  const [activeCompany, setActiveCompany] = useState(companies[0].key)
  // 팝업으로 보고 있는 프로젝트 (없으면 null)
  const [detail, setDetail] = useState(null)

  // 메뉴 썸네일로 들어왔으면 그 줄의 위쪽이 고정 막대 바로 아래에 오도록 (떠오르는 효과 없이 바로 보이게)
  useEffect(() => {
    const row = initialSlug && document.getElementById(`work-project-${initialSlug}`)
    if (!row) return
    row.classList.add('is-visible')
    // 떠오르기 애니메이션(transform)에 흔들리지 않게 offsetTop으로 문서 안 위치를 구해 창 스크롤만 옮긴다
    let top = 0
    for (let node = row; node; node = node.offsetParent) top += node.offsetTop
    const barHeight = document.querySelector('.page-bar').offsetHeight
    window.scrollTo({ top: Math.max(0, top - barHeight) })
  }, [initialSlug])

  // 화면에 들어온 줄에 is-visible을 붙여 아래에서 올라오게 한다 (움직임 줄이기 설정이면 처음부터 보이게)
  // 줄이 화면 아래로 다시 빠지면 is-visible을 떼어, 다시 내려 볼 때마다 올라오는 효과가 나온다
  // (위로 지나간 줄은 그대로 두어 위로 스크롤할 때 깜빡이지 않게)
  useEffect(() => {
    const rows = pageRef.current.querySelectorAll('.work-page-reveal')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      rows.forEach((row) => row.classList.add('is-visible'))
      return undefined
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible')
        else if (entry.boundingClientRect.top > 0) entry.target.classList.remove('is-visible')
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
    <HallPage className="work-page" ref={pageRef} background={background} label="Working projects">
      <PageBar label="회사별로 보기" tabs={companies} active={activeCompany} onSelect={scrollTo} onExit={() => onNavigate('/')} onMenuToggle={onMenuToggle} solid />

      {companies.map((company) => {
        const projects = workProjects.filter((project) => project.category === company.key)
        if (!projects.length) return null
        return (
          <section className="work-page-company" id={`work-${company.key}`} data-company={company.key} key={company.key} aria-labelledby={`work-${company.key}-title`}>
            <h2 className="work-page-company-title" id={`work-${company.key}-title`}>{company.label}</h2>
            {projects.map((project, index) => (
              <div className="work-page-reveal" id={`work-project-${project.slug}`} key={project.slug}>
                <WorkProjectRow project={project} reverse={index % 2 === 1} onOpen={() => setDetail(project)} onPreview={() => setDetail(previewOf(project))} />
              </div>
            ))}
          </section>
        )
      })}

      {detail && <ProjectModal project={detail} onClose={() => setDetail(null)} />}
    </HallPage>
  )
}
