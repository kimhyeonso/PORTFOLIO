export default function MenuOverlay({ isOpen, onClose, onNavigate }) {
  if (!isOpen) return null

  return (
    <div role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button type="button" onClick={onClose}>CLOSE</button>
      <nav>
        <button type="button" onClick={() => onNavigate('/')}>HOME</button>
        <button type="button" onClick={() => onNavigate('/profile')}>PROFILE</button>
        <button type="button" onClick={() => onNavigate('/design')}>DESIGN</button>
        <button type="button" onClick={() => onNavigate('/frontend')}>FRONTEND</button>
        <button type="button" onClick={() => onNavigate('/archive')}>WORKING</button>
      </nav>
    </div>
  )
}

