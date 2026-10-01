import { useEffect, useRef, useState } from 'react'
import background from '../assets/image/Menu_Desgin/Profile.png'
import HallPage from '../components/common/HallPage.jsx'
import PageBar from '../components/common/PageBar.jsx'
import AboutSection from '../components/profile/AboutSection.jsx'
import ExperienceTimeline from '../components/profile/ExperienceTimeline.jsx'
import ProfileHero from '../components/profile/ProfileHero.jsx'
import SkillsSection from '../components/profile/SkillsSection.jsx'
import { profileData } from '../data/profileData.js'
import './ProfilePage.module.scss'

// 위쪽 탭 = 페이지 안 섹션 (key는 섹션 id 'profile-{key}'와 같다)
const sections = [
  { key: 'about', label: 'ABOUT' },
  { key: 'experience', label: 'EXPERIENCE' },
  { key: 'skills', label: 'SKILLS' },
]

/**
 * PROFILE 페이지. Working과 같은 틀: 홀 배경(HallPage) · 위쪽 막대(PageBar: 홈 · 섹션 탭 · 메뉴).
 * 탭은 지금 보고 있는 섹션을 표시하고, 누르면 그 섹션으로 스크롤한다.
 */
export default function ProfilePage({ onNavigate, onMenuToggle }) {
  const pageRef = useRef(null)
  const [active, setActive] = useState(sections[0].key)

  // 화면 가운데 줄을 지나는 섹션을 탭에 표시한다
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.dataset.section)
      })
    }, { rootMargin: '-50% 0px -50% 0px' })
    pageRef.current.querySelectorAll('[data-section]').forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (key) => document.getElementById(`profile-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <HallPage className="profile-page" ref={pageRef} background={background} label="Profile">
      <PageBar label="프로필 섹션" tabs={sections} active={active} onSelect={scrollTo} onExit={() => onNavigate('/')} onMenuToggle={onMenuToggle} solid />
      <ProfileHero {...profileData} />
      <AboutSection id="profile-about"><p>{profileData.introduction}</p></AboutSection>
      <ExperienceTimeline id="profile-experience" items={profileData.experiences} />
      <SkillsSection id="profile-skills" skills={profileData.skills} />
    </HallPage>
  )
}
