import styles from './Door.module.scss'

/**
 * 배경 이미지 속 문 위에 겹치는 클릭 영역. 위치는 스테이지(배경) 기준 %로 받는다.
 * 호버/포커스 시 문 안쪽이 빛난다.
 */
export default function Door({ room, isActive, onFocus, onBlur, onOpen }) {
    const { label, area, color } = room
    const style = { left: `${area.left}%`, top: `${area.top}%`, width: `${area.width}%`, height: `${area.height}%`, '--glow': color }

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
            aria-label={`${label} 방으로 들어가기`}
        >
            <span className="main-door-glow" aria-hidden="true" />
        </button>
    )
}
