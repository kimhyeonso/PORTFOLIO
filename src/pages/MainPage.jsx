import { useEffect, useRef, useState } from 'react'
import MenuButton from '../components/common/MenuButton.jsx'
import Door from '../components/main/Door.jsx'
import DoorPreview from '../components/main/DoorPreview.jsx'
import MainCharacter from '../components/main/MainCharacter.jsx'
import styles from './MainPage.module.scss'

// area: 가로 배경(background.png, 2074×1167) 기준 문 위치(%). 위쪽 글씨 자리부터 아치 문 바닥까지 덮는다.
// mobileArea: 세로 화면 배경(background-mo.png, 941×1672) 기준 같은 문 위치(%)
// pose: 이 문을 볼 때 캐릭터 방향, target: 문 앞까지 걸어갈 위치/크기(%)
// tilt: 문 위 글씨가 둥근 벽을 따라 꺾인 각도(deg). y는 벽이 돌아간 정도, z는 글줄 기울기
// featured: true면 문 위 글씨 위에 노란 별 3개로 중요 표시
const rooms = [
  { label: 'ABOUT ME', description: '나를 소개하는 공간', path: '/profile', color: '#ffd9a0', pose: 'side-left', tilt: { y: 34, z: 3 }, area: { left: 19.5, top: 18, width: 12.8, height: 55.5 }, mobileArea: { left: 12.8, top: 37.6, width: 17, height: 27.3 } },
  { label: 'DESIGN', description: '디자인 포트폴리오', path: '/design', color: '#8fe3a0', pose: 'back-left', tilt: { y: 14, z: 1 }, area: { left: 35.8, top: 19.5, width: 12.2, height: 52.5 }, mobileArea: { left: 33.2, top: 38.5, width: 15.4, height: 26.1 } },
  { label: 'FRONTEND', description: '프론트엔드 포트폴리오', path: '/frontend', color: '#8fc4ff', pose: 'back-right', tilt: { y: -14, z: -1 }, area: { left: 51.8, top: 19.5, width: 12.4, height: 52.5 }, mobileArea: { left: 51.9, top: 38.5, width: 15.4, height: 26.1 } },
  { label: 'EXPERIENCE', description: '실무 경험 포트폴리오', path: '/working', color: '#ffc08a', pose: 'side-right', tilt: { y: -34, z: -3 }, featured: true, area: { left: 67.8, top: 18, width: 13.2, height: 55.5 }, mobileArea: { left: 70.7, top: 37.6, width: 16.7, height: 27.3 } },
]

const WALK_TIME = 1100 // ms, 문까지 걸어가는 시간 → 페이지 이동
// 세로 화면이면 모바일 배경과 mobileArea를 쓴다 (MainPage.module.scss의 미디어 쿼리와 같은 조건)
const PORTRAIT_QUERY = '(max-aspect-ratio: 1 / 1)'

function usePortrait() {
  const [portrait, setPortrait] = useState(() => window.matchMedia(PORTRAIT_QUERY).matches)
  useEffect(() => {
    const query = window.matchMedia(PORTRAIT_QUERY)
    const onChange = () => setPortrait(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return portrait
}

export default function MainPage({ onNavigate, onMenuToggle }) {
  const leaveTimeoutRef = useRef(0)
  const [hovered, setHovered] = useState(null)
  const [entering, setEntering] = useState(null)
  const activeRoom = entering || hovered
  const portrait = usePortrait()
  const areaOf = (room) => (portrait ? room.mobileArea : room.area)

  useEffect(() => () => window.clearTimeout(leaveTimeoutRef.current), [])

  const openRoom = (room) => {
    if (entering) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      onNavigate(room.path)
      return
    }
    setEntering(room)
    leaveTimeoutRef.current = window.setTimeout(() => onNavigate(room.path), WALK_TIME)
  }

  // 문 앞까지 걸어갈 위치. 키(h)는 문 높이에 비례해 줄어든다 (가로 화면 문 높이 55.5% → 22%)
  const enteringArea = entering && areaOf(entering)
  const walkTarget = entering && { x: enteringArea.left + enteringArea.width / 2, y: 100 - enteringArea.top - enteringArea.height + 1, h: enteringArea.height * 0.4 }
  const walkPose = entering && (enteringArea.left + enteringArea.width / 2 < 50 ? 'back-left' : 'back-right')

  return (
    <main className={`${styles.scope} main-hall ${entering ? 'is-leaving' : ''}`} aria-label="Portfolio main hall">
      <MenuButton onClick={onMenuToggle} />
      <div className="main-viewport">
        <div className="main-stage">
          {rooms.map((room) => (
            <Door
              key={room.path}
              room={room}
              area={areaOf(room)}
              isActive={activeRoom === room}
              onFocus={() => setHovered(room)}
              onBlur={() => setHovered((current) => (current === room ? null : current))}
              onOpen={() => openRoom(room)}
            />
          ))}
          <MainCharacter pose={walkPose || activeRoom?.pose} target={walkTarget} />
          {!entering && <DoorPreview room={hovered} />}
        </div>
      </div>
    </main>
  )
}
