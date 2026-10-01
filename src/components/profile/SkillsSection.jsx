import SkillItem from './SkillItem.jsx'

// 기술 섹션 (흰 카드). 항목이 아직 없으면 준비 중 안내
export default function SkillsSection({ id, skills = [] }) {
  return (
    <section className="profile-section" id={id} data-section="skills">
      <h2 className="profile-label">SKILLS</h2>
      {skills.length > 0
        ? <div className="profile-skills">{skills.map((skill) => <SkillItem key={skill.name} {...skill} />)}</div>
        : <p className="profile-empty">준비 중입니다</p>}
    </section>
  )
}
