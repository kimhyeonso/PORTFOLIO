import { Suspense, cloneElement, lazy, useEffect, useState } from 'react'
import Footer from '../components/common/Footer.jsx'
import Header from '../components/common/Header.jsx'
import MenuOverlay from '../components/common/MenuOverlay.jsx'
import ArchivePage from '../pages/ArchivePage.jsx'
import DesignDetailPage from '../pages/DesignDetailPage.jsx'
import DesignGalleryPage from '../pages/DesignGalleryPage.jsx'
import DesignPage from '../pages/DesignPage.jsx'
import FrontendPage from '../pages/FrontendPage.jsx'
import IntroPage from '../pages/IntroPage.jsx'
import MainPage from '../pages/MainPage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'
import { frontendProjects } from '../data/frontendProjects.js'
import { workProjects } from '../data/workProjects.js'

// 인트로 → 메인 전환 화면(링 소용돌이 + 다음 스테이지 질문)은 따로 불러오고, 인트로에 있는 동안 미리 받아 둔다
const loadIntroPortal = () => import('../components/intro/IntroPortal.jsx')
const IntroPortal = lazy(loadIntroPortal)

const fullscreenPages = [MainPage, DesignPage, FrontendPage, ArchivePage]

/*
 * 처음 접속(주소 /)하면 인트로부터 보여준다. 주소를 /intro로 바꿔 두고(뒤로 가기 기록은 남기지 않음),
 * 같은 탭에서 한 번 보여준 뒤에는 새로고침해도 메인이 바로 뜨도록 sessionStorage에 표시한다.
 */
const INTRO_SEEN_KEY = 'intro-seen'

function getInitialPath() {
  const { pathname } = window.location
  if (pathname !== '/') return pathname
  try {
    if (sessionStorage.getItem(INTRO_SEEN_KEY)) return pathname
    sessionStorage.setItem(INTRO_SEEN_KEY, '1')
  } catch {
    // 저장소를 못 쓰는 환경(시크릿 모드 등)에서는 매번 인트로부터
  }
  window.history.replaceState({}, '', '/intro')
  return '/intro'
}

function getPage(pathname, onNavigate, onEnterMain) {
  if (pathname === '/intro') return <IntroPage onEnterMain={onEnterMain} />
  if (pathname === '/profile') return <ProfilePage />
  if (pathname === '/design') return <DesignPage onNavigate={onNavigate} />
  if (pathname.startsWith('/design/project/')) return <DesignDetailPage slug={pathname.split('/').at(-1)} onNavigate={onNavigate} />
  if (pathname.startsWith('/design/')) return <DesignGalleryPage category={pathname.split('/').at(-1)} onNavigate={onNavigate} />
  if (pathname === '/frontend') return <FrontendPage onNavigate={onNavigate} />
  if (pathname.startsWith('/frontend/project/')) return <DesignDetailPage slug={pathname.split('/').at(-1)} projects={frontendProjects} basePath="/frontend" onNavigate={onNavigate} />
  if (pathname === '/archive') return <ArchivePage onNavigate={onNavigate} />
  if (pathname.startsWith('/archive/project/')) return <DesignDetailPage slug={pathname.split('/').at(-1)} projects={workProjects} basePath="/archive" onNavigate={onNavigate} />
  return <MainPage onNavigate={onNavigate} />
}

export default function AppRoutes() {
  const [pathname, setPathname] = useState(getInitialPath)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // 인트로 → 메인 전환 화면이 떠 있는지
  const [isPortal, setIsPortal] = useState(false)

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (to) => {
    window.history.pushState({}, '', to)
    setPathname(to)
    setIsMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isIntro = pathname === '/intro'

  useEffect(() => {
    if (isIntro) loadIntroPortal()
  }, [isIntro])

  const page = getPage(pathname, navigate, () => setIsPortal(true))
  // 전환 화면은 페이지 바깥에 띄워서, 중간에 메인으로 바뀌어도 끊기지 않고 사라지며 메인을 드러낸다
  // (화면 구성이 달라져도 같은 key라 다시 마운트되지 않는다)
  const portal = isPortal && (
    <Suspense key="intro-portal" fallback={null}>
      <IntroPortal onEnter={() => navigate('/')} onDone={() => setIsPortal(false)} />
    </Suspense>
  )

  if (isIntro) return <>{page}{portal}</>

  // 메인 홀, 디자인 갤러리는 전체 화면 장면이라 상단 헤더/푸터 없이 자체 햄버거 버튼으로 메뉴를 연다
  if (fullscreenPages.includes(page.type)) {
    return <><MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={navigate} />{cloneElement(page, { onMenuToggle: () => setIsMenuOpen(true) })}{portal}</>
  }

  return <><Header onNavigate={navigate} onMenuToggle={() => setIsMenuOpen(true)} /><MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={navigate} />{page}<Footer />{portal}</>
}

