import background from '../assets/image/Menu_Desgin/background.png'
import ProjectGallery from '../components/design/ProjectGallery.jsx'
import { workProjects } from '../data/workProjects.js'

// Working(실무) 페이지. 주소는 기존 /archive를 그대로 쓴다.
// 탭 key는 workProjects.js의 category 값과 같아야 한다
const tabs = [
  { key: 'concentrix', label: 'CONCENTRIX' },
  { key: 'ricota', label: 'RICOTA' },
]

export default function ArchivePage({ onNavigate, onMenuToggle }) {
  return (
    <ProjectGallery
      label="Working projects"
      projects={workProjects}
      tabs={tabs}
      background={background}
      onOpen={(project) => onNavigate(`/archive/project/${project.slug}`)}
      onMenuToggle={onMenuToggle}
    />
  )
}
