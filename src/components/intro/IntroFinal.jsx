import styles from './IntroFinal.module.scss'

export default function IntroFinal({ finalReady, onComplete }) {
    if (!finalReady) return null

    return <button className={`${styles.scope} intro-enter`} type="button" onClick={onComplete}>ENTER PORTFOLIO</button>
}
