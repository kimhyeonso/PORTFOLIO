export default function PageTitle({ eyebrow, title, description }) {
  return (
    <header>
      {eyebrow && <p>{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  )
}

