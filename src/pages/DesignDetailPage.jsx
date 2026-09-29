import BackToLobby from '../components/common/BackToLobby.jsx'
import ProjectHero from '../components/design/ProjectHero.jsx'
import ProjectNavigation from '../components/design/ProjectNavigation.jsx'
import ProjectSection from '../components/design/ProjectSection.jsx'
import { designProjects } from '../data/designProjects.js'

// 디자인/프론트엔드 공용 상세 페이지. projects와 basePath로 어느 목록의 프로젝트인지 정한다
export default function DesignDetailPage({ slug, onNavigate, projects = designProjects, basePath = '/design' }) {
  const project = projects.find((item) => item.slug === slug)
  if (!project) return <main><h1>Project not found</h1><BackToLobby onNavigate={onNavigate} /></main>

  return <main><ProjectHero {...project} /><ProjectSection title="OVERVIEW"><p>{project.description || project.summary}</p></ProjectSection><ProjectNavigation onNavigate={(nextSlug) => onNavigate(`${basePath}/project/${nextSlug}`)} /><BackToLobby onNavigate={onNavigate} /></main>
}
