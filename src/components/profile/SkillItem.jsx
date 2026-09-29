export default function SkillItem({ name, level }) {
  return <div><span>{name}</span>{level && <span>{level}</span>}</div>
}

