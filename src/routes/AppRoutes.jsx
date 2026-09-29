import { cloneElement, useEffect, useState } from 'react'
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

const fullscreenPages = [MainPage, DesignPage, FrontendPage, ArchivePage]

function getPage(pathname, onNavigate) {
  if (pathname === '/intro') return <IntroPage onNavigate={onNavigate} />
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
  const [pathname, setPathname] = useState(window.location.pathname)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
  const page = getPage(pathname, navigate)

  if (isIntro) return page

  // 메인 홀, 디자인 갤러리는 전체 화면 장면이라 상단 헤더/푸터 없이 자체 햄버거 버튼으로 메뉴를 연다
  if (fullscreenPages.includes(page.type)) {
    return <><MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={navigate} />{cloneElement(page, { onMenuToggle: () => setIsMenuOpen(true) })}</>
  }

  return <><Header onNavigate={navigate} onMenuToggle={() => setIsMenuOpen(true)} /><MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={navigate} />{page}<Footer /></>
}

