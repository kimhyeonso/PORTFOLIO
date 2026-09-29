export default function DesignCategoryCard({ title, description, onClick }) {
  return <button type="button" onClick={onClick}><strong>{title}</strong><span>{description}</span></button>
}

