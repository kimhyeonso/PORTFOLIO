// 경력 한 줄: 기간 · 이름 · 설명
export default function ExperienceItem({ period, title, description }) {
  return (
    <article className="profile-experience">
      <p className="profile-experience-period">{period}</p>
      <h3>{title}</h3>
      {description && <p className="profile-text">{description}</p>}
    </article>
  )
}
