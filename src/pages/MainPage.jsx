import { useEffect, useRef, useState } from 'react'
import MenuButton from '../components/common/MenuButton.jsx'
import Door from '../components/main/Door.jsx'
import DoorPreview from '../components/main/DoorPreview.jsx'
import MainCharacter from '../components/main/MainCharacter.jsx'
import styles from './MainPage.module.scss'

// area: 배경 이미지(2074×1167) 기준 문 위치(%). 위쪽 라벨부터 아치 문 바닥까지 덮는다.
// pose: 이 문을 볼 때 캐릭터 방향, target: 문 앞까지 걸어갈 위치/크기(%)
const rooms = [
  { label: 'ABOUT ME', description: '나를 소개하는 공간', path: '/profile', color: '#ffd9a0', pose: 'side-left', area: { left: 19.5, top: 18, width: 12.8, height: 55.5 } },
  { label: 'DESIGN', description: '디자인 포트폴리오', path: '/design', color: '#8fe3a0', pose: 'back-left', area: { left: 35.8, top: 19.5, width: 12.2, height: 52.5 } },
  { label: 'FRONTEND', description: '프론트엔드 포트폴리오', path: '/frontend', color: '#8fc4ff', pose: 'back-right', area: { left: 51.8, top: 19.5, width: 12.4, height: 52.5 } },
  { label: 'EXPERIENCE', description: '실무 경험 포트폴리오', path: '/archive', color: '#ffc08a', pose: 'side-right', area: { left: 67.8, top: 18, width: 13.2, height: 55.5 } },
]

const WALK_TIME = 1100 // ms, 문까지 걸어가는 시간 → 페이지 이동

export default function MainPage({ onNavigate, onMenuToggle }) {
  const viewportRef = useRef(null)
  const leaveTimeoutRef = useRef(0)
  const [hovered, setHovered] = useState(null)
  const [entering, setEntering] = useState(null)
  const activeRoom = entering || hovered

  // 세로 화면에서는 가로 스크롤로 문을 둘러보게 하고, 처음엔 가운데를 보여준다
  useEffect(() => {
    const viewport = viewportRef.current
    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2
    return () => window.clearTimeout(leaveTimeoutRef.current)
  }, [])

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

  const walkTarget = entering && { x: entering.area.left + entering.area.width / 2, y: 100 - entering.area.top - entering.area.height + 1, h: 22 }
  const walkPose = entering && (entering.area.left + entering.area.width / 2 < 50 ? 'back-left' : 'back-right')

  return (
    <main className={`${styles.scope} main-hall ${entering ? 'is-leaving' : ''}`} aria-label="Portfolio main hall">
      <MenuButton onClick={onMenuToggle} />
      <div className="main-viewport" ref={viewportRef}>
        <div className="main-stage">
          {rooms.map((room) => (
            <Door
              key={room.path}
              room={room}
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
