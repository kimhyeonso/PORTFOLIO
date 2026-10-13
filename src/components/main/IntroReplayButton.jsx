import Icon from '../common/Icon.jsx'
import styles from './IntroReplayButton.module.scss'

// 메인 홀 왼쪽 위의 인트로 다시 보기 버튼 — 오른쪽 위 MenuButton과 같은 높이 · 크기로 짝을 이룬다
export default function IntroReplayButton({ onClick }) {
    return (
        <button className={`${styles.scope} intro-replay-button`} type="button" onClick={onClick} aria-label="인트로 다시 보기">
            <Icon name="play" className="intro-replay-icon" />
            <span className="intro-replay-label" aria-hidden="true">INTRO REPLAY</span>
        </button>
    )
}
