// 소개 섹션 (흰 카드). id는 위쪽 탭이 스크롤해 갈 자리
export default function AboutSection({ id, children }) {
  return (
    <section className="profile-section" id={id} data-section="about">
      <h2 className="profile-label">ABOUT</h2>
      <div className="profile-text">{children}</div>
    </section>
  )
}
