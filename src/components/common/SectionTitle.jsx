export default function SectionTitle({ index, title, description }) {
  return (
    <header>
      {index && <p>{index}</p>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </header>
  )
}

