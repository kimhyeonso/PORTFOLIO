// 기술 하나: 이름 (+ 수준)
export default function SkillItem({ name, level }) {
  return (
    <div className="profile-skill">
      <span>{name}</span>
      {level && <em>{level}</em>}
    </div>
  )
}
