import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import background from '../assets/image/Menu_Desgin/working.png'
import HallPage from '../components/common/HallPage.jsx'
import PageBar from '../components/common/PageBar.jsx'
import SparkleField from '../components/common/SparkleField.jsx'
import ProjectModal, { previewOf } from '../components/design/ProjectModal.jsx'
import WorkCursor from '../components/work/WorkCursor.jsx'
import WorkHero from '../components/work/WorkHero.jsx'
import WorkShowcase from '../components/work/WorkShowcase.jsx'
import { workProjects } from '../data/workProjects.js'
import './WorkingPage.module.scss'

// Working(실무) 페이지 (주소 /working, 예전 주소 /archive로 들어와도 이리로 온다)
// 회사 key는 workProjects.js의 category 값과 같아야 한다
const companies = [
  { key: 'concentrix', label: 'CONCENTRIX' },
  { key: 'ricota', label: 'RICOTA' },
]
const SHOW_TABS_AFTER = 24 // px, 이만큼 스크롤하면 위 탭이 내려온다

/**
 * 실무 프로젝트 페이지. 배경(홀 · 크림 덮개 · 반짝이)은 Design/Frontend와 같은 틀을 그대로 쓴다.
 *   첫 화면(WorkHero)     가운데 세로 WORKS 글자 앞뒤로 기울어진 프로젝트 패널이 떠 있고, 스크롤하면 그 사이로 날아 들어간다
 *   스크롤 화면(WorkShowcase) 화면이 고정된 채 스크롤만큼 프로젝트가 한 장씩 넘어간다 (패널 · 정보 · 오른쪽 목록)
 * 위 탭은 지금 보고 있는 회사를 표시하고, 누르면 그 회사의 첫 프로젝트로 스크롤한다.
 * 처음 들어왔을 땐 위 탭을 숨기고(첫 화면 WORKS 글자만), 스크롤을 시작하면 위에서 내려온다 (홈 · 메뉴 버튼은 항상).
 * 배경 반짝이는 첫 화면에서만 보이고, 첫 화면이 줌인되는 동안 옅어져 프로젝트 화면에서는 사라진다.
 * [세부정보]는 새 페이지 대신 ProjectModal 팝업으로 연다.
 * 인터랙션: 지금 패널 위 OPEN 커서(WorkCursor) · 키보드(↑↓ ←→ 1–9) · 드래그
 * initialSlug: 메뉴 썸네일(/working/project/{slug})로 들어오면 그 프로젝트 화면으로 바로 스크롤한다.
 */
export default function WorkingPage({ onNavigate, onMenuToggle, initialSlug }) {
  const showcaseRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  // 팝업으로 보고 있는 프로젝트 (없으면 null)
  const [detail, setDetail] = useState(null)
  const activeCompany = workProjects[activeIndex]?.category ?? companies[0].key
  // 맨 위에서 조금이라도 내려왔는지 → 위 탭을 보여준다
  const [scrolled, setScrolled] = useState(() => window.scrollY > SHOW_TABS_AFTER)
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SHOW_TABS_AFTER)
      // 배경 반짝이는 첫 화면에서만: 첫 화면이 줌인되는 동안 함께 옅어지고, 프로젝트 화면에서는 보이지 않는다
      const sparkles = document.querySelector('.work-page-sparkles')
      const hero = document.querySelector('.work-hero')
      if (!sparkles || !hero) return
      const travel = Math.max(1, hero.offsetHeight - window.innerHeight)
      const opacity = Math.max(0, 1 - window.scrollY / (travel * 0.7))
      sparkles.style.opacity = opacity.toFixed(3)
      sparkles.style.visibility = opacity <= 0 ? 'hidden' : ''
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToProject = (index, behavior = 'smooth') => {
    const top = showcaseRef.current?.scrollTopOf(index)
    if (top == null) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top, behavior: reduced ? 'auto' : behavior })
  }

  // 메뉴 썸네일로 들어왔으면 그 프로젝트 화면에서 시작한다 (날아가는 효과 없이 바로)
  useLayoutEffect(() => {
    const index = initialSlug ? workProjects.findIndex((project) => project.slug === initialSlug) : -1
    if (index >= 0) scrollToProject(index, 'auto')
    // 처음 들어올 때 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlug])

  const selectCompany = (key) => {
    const first = workProjects.findIndex((project) => project.category === key)
    if (first >= 0) scrollToProject(first)
  }

  return (
    <HallPage className={`work-page ${scrolled ? 'is-scrolled' : ''}`} background={background} label="Working projects">
      <PageBar label="회사별로 보기" tabs={companies} active={activeCompany} onSelect={selectCompany} onExit={() => onNavigate('/')} onMenuToggle={onMenuToggle} />
      {/* 배경 반짝이 (PROFILE 파티클과 같은 모양 · 색) — 첫 화면에서만 (스크롤하면 옅어진다) */}
      <SparkleField className="work-page-sparkles" />
      <WorkCursor />

      <WorkHero projects={workProjects} companies={companies} onPick={(index) => scrollToProject(index)} />
      <WorkShowcase
        ref={showcaseRef}
        projects={workProjects}
        companies={companies}
        paused={Boolean(detail)}
        onActive={setActiveIndex}
        onOpen={(project) => setDetail(project)}
        onPreview={(project) => setDetail(previewOf(project))}
      />

      {detail && <ProjectModal project={detail} onClose={() => setDetail(null)} />}
    </HallPage>
  )
}
