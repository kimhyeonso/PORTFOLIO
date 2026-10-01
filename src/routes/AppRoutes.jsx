import { Suspense, cloneElement, lazy, useEffect, useState } from 'react'
import MenuOverlay from '../components/common/MenuOverlay.jsx'
import WorkingPage from '../pages/WorkingPage.jsx'
import DesignPage from '../pages/DesignPage.jsx'
import FrontendPage from '../pages/FrontendPage.jsx'
import IntroPage from '../pages/IntroPage.jsx'
import MainPage from '../pages/MainPage.jsx'
import ProfilePage from '../pages/ProfilePage.jsx'

// 인트로 → 메인 전환 화면(링 소용돌이 + 다음 스테이지 질문)은 따로 불러오고, 인트로에 있는 동안 미리 받아 둔다
const loadIntroPortal = () => import('../components/intro/IntroPortal.jsx')
const IntroPortal = lazy(loadIntroPortal)

/*
 * 처음 접속(주소 /)하면 인트로부터 보여준다. 주소를 /intro로 바꿔 두고(뒤로 가기 기록은 남기지 않음),
 * 같은 탭에서 한 번 보여준 뒤에는 새로고침해도 메인이 바로 뜨도록 sessionStorage에 표시한다.
 */
const INTRO_SEEN_KEY = 'intro-seen'

// 예전 주소 /archive(…)로 들어오면 /working(…)으로 바꿔 둔다 (뒤로 가기 기록은 남기지 않음)
function redirectOldPath(pathname) {
  if (pathname !== '/archive' && !pathname.startsWith('/archive/')) return pathname
  const next = pathname.replace(/^\/archive/, '/working')
  window.history.replaceState({}, '', next)
  return next
}

function getInitialPath() {
  const pathname = redirectOldPath(window.location.pathname)
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

/*
 * 메뉴 썸네일 주소(/design · /frontend · /working + /project/{slug})는 따로 상세 페이지를 두지 않고,
 * 그 목록 페이지를 열어 해당 프로젝트 카드(Working은 그 줄)를 바로 보여준다.
 * key를 주소로 줘서, 이미 같은 목록을 보고 있다가 메뉴에서 다른 썸네일을 눌러도 처음부터 다시 연다.
 */
function getPage(pathname, onNavigate, onEnterMain) {
  const slug = pathname.split('/').at(-1)
  if (pathname === '/intro') return <IntroPage onEnterMain={onEnterMain} />
  if (pathname === '/profile') return <ProfilePage onNavigate={onNavigate} />
  if (pathname === '/design') return <DesignPage key={pathname} onNavigate={onNavigate} />
  if (pathname.startsWith('/design/project/')) return <DesignPage key={pathname} initialSlug={slug} onNavigate={onNavigate} />
  // 예전 분류별 목록 주소(/design/{분류})도 Design 갤러리로 연다
  if (pathname.startsWith('/design/')) return <DesignPage key={pathname} onNavigate={onNavigate} />
  if (pathname === '/frontend') return <FrontendPage key={pathname} onNavigate={onNavigate} />
  if (pathname.startsWith('/frontend/project/')) return <FrontendPage key={pathname} initialSlug={slug} onNavigate={onNavigate} />
  if (pathname === '/working') return <WorkingPage key={pathname} onNavigate={onNavigate} />
  if (pathname.startsWith('/working/project/')) return <WorkingPage key={pathname} initialSlug={slug} onNavigate={onNavigate} />
  return <MainPage onNavigate={onNavigate} />
}

export default function AppRoutes() {
  const [pathname, setPathname] = useState(getInitialPath)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // 인트로 → 메인 전환 화면이 떠 있는지
  const [isPortal, setIsPortal] = useState(false)

  useEffect(() => {
    const onPopState = () => setPathname(redirectOldPath(window.location.pathname))
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

  // 모든 페이지가 전체 화면 장면이라 헤더/푸터 없이 각자 메뉴 버튼(PageBar · 메인 홀)으로 메뉴를 연다
  return <><MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onNavigate={navigate} />{cloneElement(page, { onMenuToggle: () => setIsMenuOpen(true) })}{portal}</>
}

