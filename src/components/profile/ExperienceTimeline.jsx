import ExperienceItem from './ExperienceItem.jsx'

// 경력 섹션 (흰 카드). 항목이 아직 없으면 준비 중 안내
export default function ExperienceTimeline({ id, items = [] }) {
  return (
    <section className="profile-section" id={id} data-section="experience">
      <h2 className="profile-label">EXPERIENCE</h2>
      {items.length > 0
        ? <div className="profile-timeline">{items.map((item) => <ExperienceItem key={item.id || item.title} {...item} />)}</div>
        : <p className="profile-empty">준비 중입니다</p>}
    </section>
  )
}
