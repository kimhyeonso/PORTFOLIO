import AboutSection from '../components/profile/AboutSection.jsx'
import ExperienceTimeline from '../components/profile/ExperienceTimeline.jsx'
import ProfileHero from '../components/profile/ProfileHero.jsx'
import SkillsSection from '../components/profile/SkillsSection.jsx'
import { profileData } from '../data/profileData.js'

export default function ProfilePage() {
  return (
    <main>
      <ProfileHero {...profileData} />
      <AboutSection><p>{profileData.introduction}</p></AboutSection>
      <ExperienceTimeline items={profileData.experiences} />
      <SkillsSection skills={profileData.skills} />
    </main>
  )
}

