import styles from './DoorPreview.module.scss'

// 문에 호버했을 때 캐릭터 머리 위에 뜨는 말풍선
export default function DoorPreview({ room }) {
    if (!room) return null

    return (
        <p className={`${styles.scope} main-preview`} key={room.label} aria-live="polite">
            <strong>{room.label}</strong>
            <span>{room.description}</span>
            <em>CLICK TO ENTER ▶</em>
        </p>
    )
}
