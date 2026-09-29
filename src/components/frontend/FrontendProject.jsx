import BrowserPreview from './BrowserPreview.jsx'
import TechTags from './TechTags.jsx'

export default function FrontendProject({ project }) {
  return <article><BrowserPreview image={project.image} title={project.title} /><h2>{project.title}</h2><p>{project.summary}</p><TechTags tags={project.tech} /></article>
}

