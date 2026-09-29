export default function ArchiveItem({ item, onSelect }) {
  return <button type="button" onClick={() => onSelect(item)}><strong>{item.title}</strong><span>{item.category}</span></button>
}

