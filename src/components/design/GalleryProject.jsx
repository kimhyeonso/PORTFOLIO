export default function GalleryProject({ project, onOpen }) {
  return <article><button type="button" onClick={() => onOpen(project.slug)}><h2>{project.title}</h2><p>{project.summary}</p></button></article>
}

