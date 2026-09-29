export default function ProjectNavigation({ previous, next, onNavigate }) {
  return <nav aria-label="Project navigation">{previous && <button type="button" onClick={() => onNavigate(previous.slug)}>PREVIOUS</button>}{next && <button type="button" onClick={() => onNavigate(next.slug)}>NEXT</button>}</nav>
}

