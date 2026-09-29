import styles from './ExitButton.module.scss'

// 문 아이콘: 왼쪽 틈으로 화살표가 들어가는 문틀 + 원근감 있게 열린 문짝 + 손잡이
function ExitIcon() {
    return (
        <svg className="exit-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {/* 문틀 (화살표가 지나가도록 왼쪽 가운데를 비워 둔다) */}
            <path d="M8 7V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-3" />
            {/* 열린 문짝: 경첩(오른쪽)보다 바깥쪽(왼쪽) 모서리가 짧아 열린 것처럼 보인다 */}
            <path d="M12.5 6.2 20 3.8v16.4l-7.5-2.4z" />
            <path d="M15 11.2v1.6" />
            <g className="exit-button-arrow">
                <path d="M2.5 12H11" />
                <path d="M8.6 9.6 11 12l-2.4 2.4" />
            </g>
        </svg>
    )
}

// 전체 화면 페이지 왼쪽 위의 홈(메인 홀)으로 나가는 버튼. tone: 'light'(흰 선) | 'dark'(검은 선) — MenuButton과 짝
export default function ExitButton({ onClick, tone = 'dark' }) {
    return (
        <button className={`${styles.scope} exit-button is-${tone}`} type="button" onClick={onClick} aria-label="홈으로 나가기">
            <ExitIcon />
            <span className="exit-button-label" aria-hidden="true">HOME</span>
        </button>
    )
}
