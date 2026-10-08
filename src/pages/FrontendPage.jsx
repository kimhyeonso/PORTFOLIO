import background from '../assets/image/Menu_Desgin/frontend.png'
import ProjectGallery from '../components/design/ProjectGallery.jsx'
import { frontendProjects } from '../data/frontendProjects.js'

// 탭 key는 frontendProjects.js의 category 값과 같아야 한다
const tabs = [
  { key: 'copy-site', label: 'COPY SITE' },
  { key: 'personal', label: 'INDIVIDUAL' },
  { key: 'team', label: 'TEAM PROJECT' },
]

// initialSlug: 메뉴 썸네일(/frontend/project/{slug})로 들어오면 그 프로젝트 카드로 바로 연다
export default function FrontendPage({ onNavigate, onMenuToggle, initialSlug }) {
  return (
    <ProjectGallery
      initialSlug={initialSlug}
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
