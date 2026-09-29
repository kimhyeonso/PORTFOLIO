import GalleryNavigation from '../components/design/GalleryNavigation.jsx'
import GalleryProject from '../components/design/GalleryProject.jsx'
import PageTitle from '../components/common/PageTitle.jsx'
import { designProjects } from '../data/designProjects.js'

export default function DesignGalleryPage({ category = 'all', onNavigate }) {
  const normalizedCategory = category.toLowerCase()
  const projects = designProjects.filter((project) => normalizedCategory === 'all' || project.category === normalizedCategory)

  return <main><PageTitle eyebrow="DESIGN" title={category.toUpperCase()} /><GalleryNavigation categories={['ALL', 'BRANDING', 'EDITORIAL', 'CAMPAIGN']} activeCategory={category.toUpperCase()} onSelect={(value) => onNavigate(`/design/${value.toLowerCase()}`)} /><section>{projects.map((project) => <GalleryProject key={project.slug} project={project} onOpen={(slug) => onNavigate(`/design/project/${slug}`)} />)}</section></main>
}

