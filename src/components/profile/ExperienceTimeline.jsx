import ExperienceItem from './ExperienceItem.jsx'

export default function ExperienceTimeline({ items = [] }) {
  return <section><h2>EXPERIENCE</h2>{items.map((item) => <ExperienceItem key={item.id || item.title} {...item} />)}</section>
}

