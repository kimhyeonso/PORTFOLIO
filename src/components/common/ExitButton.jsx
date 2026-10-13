import Icon from './Icon.jsx'
import styles from './ExitButton.module.scss'

// 전체 화면 페이지 왼쪽 위의 홈(메인 홀)으로 나가는 버튼. tone: 'light'(흰 선) | 'dark'(검은 선) — MenuButton과 짝
export default function ExitButton({ onClick, tone = 'dark' }) {
    return (
        <button className={`${styles.scope} exit-button is-${tone}`} type="button" onClick={onClick} aria-label="홈으로 나가기">
            <Icon name="home" className="exit-button-icon" />
            <span className="exit-button-label" aria-hidden="true">HOME</span>
        </button>
    )
}
