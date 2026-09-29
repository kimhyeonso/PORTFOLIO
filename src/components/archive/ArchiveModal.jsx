export default function ArchiveModal({ item, onClose }) {
  if (!item) return null
  return <div role="dialog" aria-modal="true" aria-label={item.title}><button type="button" onClick={onClose}>CLOSE</button><h2>{item.title}</h2><p>{item.description}</p></div>
}
