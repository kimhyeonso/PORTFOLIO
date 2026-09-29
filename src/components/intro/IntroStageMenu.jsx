import styles from './IntroStageMenu.module.scss'

const stageNames = ['UNIVERSITY', 'STUDY', 'COMPANY', 'FRONTEND']

// 인트로 스테이지 바로가기 메뉴. 위치/글꼴은 className으로 넘긴 쪽(시작 화면, 스테이지)에서 정한다.
export default function IntroStageMenu({ className, current = 0, onSelect }) {
    return (
        <ul className={`${styles.scope} intro-stage-menu ${className}`} aria-label="Intro stages">
            {stageNames.map((name, index) => (
                <li key={name}>
                    <button className={index === current ? 'is-current' : ''} type="button" onClick={() => onSelect(index)} aria-current={index === current ? 'step' : undefined}>
                        &gt; <span>{name}</span>
                    </button>
                </li>
            ))}
        </ul>
    )
}
