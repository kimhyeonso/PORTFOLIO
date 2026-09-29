const links = [
  ['HOME', '/'],
  ['PROFILE', '/profile'],
  ['DESIGN', '/design'],
  ['FRONTEND', '/frontend'],
  ['WORKING', '/archive'],
]

export default function Header({ onNavigate, onMenuToggle }) {
  return (
    <header>
      <button type="button" onClick={() => onNavigate('/')}>PORTFOLIO</button>
      <nav aria-label="Primary navigation">
        {links.map(([label, path]) => (
          <button type="button" key={path} onClick={() => onNavigate(path)}>{label}</button>
        ))}
      </nav>
      <button type="button" aria-label="Open menu" onClick={onMenuToggle}>MENU</button>
    </header>
  )
}

