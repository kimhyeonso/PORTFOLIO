// 프로필 맨 위: 역할(작은 머리글) · 이름 · 한 줄 소개
export default function ProfileHero({ name, role, introduction }) {
  return (
    <section className="profile-hero">
      <p className="profile-label">{role}</p>
      <h1>{name}</h1>
      <p className="profile-hero-intro">{introduction}</p>
    </section>
  )
}
