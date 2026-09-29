import character from '../../assets/image/intro/character/intro.png'
import ps from '../../assets/image/intro/item/intro_ps.png'
import ai from '../../assets/image/intro/item/intro_ai.png'
import ae from '../../assets/image/intro/item/intro_ae.png'
import IntroStageMenu from './IntroStageMenu.jsx'
import styles from './IntroStart.module.scss'

export default function IntroStart({ onStart, onSkip, onSelectStage }) {
    return (
        <section className={`${styles.scope} intro-start-screen`} aria-labelledby="intro-stage-title">
            <button className="intro-skip" type="button" onClick={onSkip}>
                SKIP INTRO <span aria-hidden="true">▶</span>
            </button>
            <div className="intro-start-copy">
                <p className="intro-stage-number">STAGE 01</p>
                <h1 id="intro-stage-title">UNIVERSITY</h1>
                <p>디자인을 사랑하는 한 학생의 이야기,<br />여기서부터 시작 되었습니다</p>
            </div>
            <IntroStageMenu className="intro-start-menu" current={0} onSelect={onSelectStage} />
            <img className="intro-start-character" src={character} alt="Pixel character standing at the university" />
            <img className="intro-start-item intro-start-ps" src={ps} alt="Photoshop" />
            <img className="intro-start-item intro-start-ai" src={ai} alt="Illustrator" />
            <img className="intro-start-item intro-start-ae" src={ae} alt="After Effects" />
            <button className="intro-press-start" type="button" onClick={onStart}>Press Start</button>
        </section>
    )
}
