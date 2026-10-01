import styles from './Door.module.scss'

/**
 * 배경 이미지 속 문 위에 겹치는 클릭 영역. 위치는 스테이지(배경) 기준 %로 받는다.
 * 호버/포커스 시 문 안쪽이 빛난다. 아이콘 간판 위 벽에는 문 이름과 설명 명패가 늘 붙어 있다.
 */
// area: 지금 화면(가로/세로 배경)에 맞는 문 위치 — MainPage가 room.area · room.mobileArea 중에서 골라 준다
export default function Door({ room, area, isActive, onFocus, onBlur, onOpen }) {
    const { label, description, color, tilt, featured } = room
    const style = {
        left: `${area.left}%`, top: `${area.top}%`, width: `${area.width}%`, height: `${area.height}%`,
        '--glow': color, '--tilt-y': `${tilt.y}deg`, '--tilt-z': `${tilt.z}deg`,
    }

    return (
        <button
            className={`${styles.scope} main-door ${isActive ? 'is-active' : ''}`}
            type="button"
            style={style}
            onMouseEnter={onFocus}
            onMouseLeave={onBlur}
            onFocus={onFocus}
            onBlur={onBlur}
            onClick={onOpen}
            aria-label={`${label} 방으로 들어가기${featured ? ' (추천)' : ''}`}
        >
            <span className="main-door-sign" aria-hidden="true">
                {featured && <span className="main-door-stars">★★★</span>}
                <strong>{label}</strong>
                <span>{description}</span>
            </span>
            <span className="main-door-glow" aria-hidden="true" />
        </button>
    )
}
