import background from '../assets/image/Menu_Desgin/background.png'
import ProjectGallery from '../components/design/ProjectGallery.jsx'
import { frontendProjects } from '../data/frontendProjects.js'

// 탭 key는 frontendProjects.js의 category 값과 같아야 한다
const tabs = [
  { key: 'copy-site', label: 'COPY SITE' },
  { key: 'personal', label: 'PERSONAL' },
  { key: 'team', label: 'TEAM PROJECT' },
]

export default function FrontendPage({ onNavigate, onMenuToggle }) {
  return (
    <ProjectGallery
      label="Frontend projects"
      projects={frontendProjects}
      tabs={tabs}
      background={background}
      imageOnly
      onMenuToggle={onMenuToggle}
      onExit={() => onNavigate('/')}
    />
  )
}
