import styles from './MenuButton.module.scss'

// 전체 화면 페이지(메인 홀, 디자인 갤러리 등) 오른쪽 위 햄버거 버튼. tone: 'light'(흰 선) | 'dark'(검은 선)
export default function MenuButton({ onClick, tone = 'light' }) {
    return (
        <button className={`${styles.scope} menu-button is-${tone}`} type="button" onClick={onClick} aria-label="메뉴 열기">
            <span /><span /><span />
        </button>
    )
}
