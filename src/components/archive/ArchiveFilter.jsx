export default function ArchiveFilter({ filters = [], activeFilter, onChange }) {
  return <nav aria-label="Archive filters">{filters.map((filter) => <button type="button" key={filter} aria-pressed={filter === activeFilter} onClick={() => onChange(filter)}>{filter}</button>)}</nav>
}

