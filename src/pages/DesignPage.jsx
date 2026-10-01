import background from '../assets/image/Menu_Desgin/desgin.png'
import ProjectGallery from '../components/design/ProjectGallery.jsx'
import { designProjects } from '../data/designProjects.js'

// 탭 key는 designProjects.js의 category 값과 같아야 한다
const tabs = [
  { key: 'web-ui', label: 'WEB/UI' },
  { key: 'editorial', label: 'EDITORIAL' },
]

// initialSlug: 메뉴 썸네일(/design/project/{slug})로 들어오면 그 프로젝트 카드로 바로 연다
export default function DesignPage({ onNavigate, onMenuToggle, initialSlug }) {
  return (
    <ProjectGallery
      initialSlug={initialSlug}
      label="Design projects"
      projects={designProjects}
      tabs={tabs}
      background={background}
      imageOnly
      onMenuToggle={onMenuToggle}
      onExit={() => onNavigate('/')}
    />
  )
}
