export default function GalleryNavigation({ categories = [], activeCategory, onSelect }) {
  return <nav aria-label="Design categories">{categories.map((category) => <button type="button" key={category} aria-pressed={category === activeCategory} onClick={() => onSelect(category)}>{category}</button>)}</nav>
}

