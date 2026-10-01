import ExitButton from './ExitButton.jsx'
import MenuButton from './MenuButton.jsx'
import styles from './PageBar.module.scss'

/**
 * 메인 홀을 뺀 모든 페이지(Design · Frontend · Working · Profile)가 함께 쓰는 위쪽 고정 막대.
 * 왼쪽 위 홈(문) 버튼 · 가운데 탭 · 오른쪽 위 메뉴 버튼. PC는 한 줄, 모바일은 탭이 버튼 아래 줄로 내려간다.
 *   tabs      [{ key, label }]  가운데 탭 (없으면 생략)
 *   active    지금 표시할 탭 key
 *   onSelect  탭을 눌렀을 때 (key)
 *   solid     스크롤하는 페이지에서 내용이 막대 아래로 부드럽게 사라지도록 크림빛 바탕을 깐다
 * 막대 높이는 CSS 변수 --page-bar-height로 페이지 여백 · 스크롤 위치 계산에 같이 쓴다.
 */
export default function PageBar({ label, tabs = [], active, onSelect, onExit, onMenuToggle, solid = false }) {
    return (
        <div className={`${styles.scope} page-bar ${solid ? 'is-solid' : ''}`}>
            {onExit && <ExitButton onClick={onExit} tone="dark" />}
            {tabs.length > 0 && (
                <nav className="page-bar-tabs" aria-label={label}>
                    {tabs.map((tab) => (
                        <button className={tab.key === active ? 'is-active' : ''} type="button" key={tab.key} onClick={() => onSelect?.(tab.key)} aria-current={tab.key === active ? 'true' : undefined}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            )}
            <MenuButton onClick={onMenuToggle} tone="dark" />
        </div>
    )
}
