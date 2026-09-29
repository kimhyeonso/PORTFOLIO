import background from '../assets/image/Menu_Desgin/background.png'
import ProjectGallery from '../components/design/ProjectGallery.jsx'
import { designProjects } from '../data/designProjects.js'

// 탭 key는 designProjects.js의 category 값과 같아야 한다
const tabs = [
  { key: 'web-ui', label: 'WEB/UI' },
  { key: 'editorial', label: 'EDITORIAL' },
  { key: 'proposal', label: 'PROPOSAL' },
]

export default function DesignPage({ onNavigate, onMenuToggle }) {
  return (
    <ProjectGallery
      label="Design projects"
      projects={designProjects}
      tabs={tabs}
      background={background}
      onOpen={(project) => onNavigate(`/design/project/${project.slug}`)}
      onMenuToggle={onMenuToggle}
    />
  )
}
