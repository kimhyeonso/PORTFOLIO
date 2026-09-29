import ArchiveItem from './ArchiveItem.jsx'

export default function ArchiveGrid({ items = [], onSelect }) {
  return <section>{items.map((item) => <ArchiveItem key={item.id || item.title} item={item} onSelect={onSelect} />)}</section>
}

