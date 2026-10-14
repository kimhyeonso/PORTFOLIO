import { useEffect } from 'react'
import walk01 from '../../assets/image/intro/character/intro_walk01.png'
import walk02 from '../../assets/image/intro/character/intro_walk02.png'
import walk03 from '../../assets/image/intro/character/intro_walk03.png'
import walk04 from '../../assets/image/intro/character/intro_walk04.png'
import walk05 from '../../assets/image/intro/character/intro_walk05.png'
import ps from '../../assets/image/intro/item/intro_ps.png'
import ai from '../../assets/image/intro/item/intro_ai.png'
import ae from '../../assets/image/intro/item/intro_ae.png'
import IntroStageMenu from './IntroStageMenu.jsx'
import styles from './IntroStart.module.scss'

const walkFrames = [walk01, walk02, walk03, walk04, walk05]

export default function IntroStart({ onStart, onSkip, onSelectStage }) {
    // Press Start는 클릭뿐 아니라 스페이스 바 · Enter로도 시작한다.
    // 다른 버튼(SKIP INTRO · 스테이지 메뉴)에 포커스가 있으면 그 버튼이 눌리는 기본 동작을 그대로 둔다
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.repeat || !['Space', 'Enter', 'NumpadEnter'].includes(event.code)) return
            const button = event.target.closest?.('button')
            if (button && !button.classList.contains('intro-press-start')) return
            event.preventDefault()
            onStart()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [onStart])

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
            {/* 시작 화면은 아직 어느 스테이지도 아니라서 현재 표시(밑줄)를 하지 않는다 */}
            <IntroStageMenu className="intro-start-menu" current={-1} onSelect={onSelectStage} />
            <div className="intro-start-character" role="img" aria-label="Pixel character walking at the university">
                <span className="intro-start-walk-frames" style={{ '--frames': walkFrames.length }}>
                    {walkFrames.map((src, index) => <img src={src} alt="" key={src} style={{ '--i': index }} />)}
                </span>
            </div>
            <img className="intro-start-item intro-start-ps" src={ps} alt="Photoshop" />
            <img className="intro-start-item intro-start-ai" src={ai} alt="Illustrator" />
            <img className="intro-start-item intro-start-ae" src={ae} alt="After Effects" />
            <button className="intro-press-start" type="button" onClick={onStart}>Press Start</button>
        </section>
    )
}
