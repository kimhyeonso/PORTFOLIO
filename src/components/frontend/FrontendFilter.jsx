export default function FrontendFilter({ filters = [], activeFilter, onChange }) {
  return <nav aria-label="Project filters">{filters.map((filter) => <button type="button" key={filter} aria-pressed={filter === activeFilter} onClick={() => onChange(filter)}>{filter}</button>)}</nav>
}

