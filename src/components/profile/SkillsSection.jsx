import SkillItem from './SkillItem.jsx'

export default function SkillsSection({ skills = [] }) {
  return <section><h2>SKILLS</h2>{skills.map((skill) => <SkillItem key={skill.name} {...skill} />)}</section>
}

