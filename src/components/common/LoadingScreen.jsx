import { useEffect, useRef, useState } from 'react'
// 인트로 STAGE 01과 같은 달리기 5장 (같은 356×348 캔버스 · 같은 순서 · 같은 장당 시간)
import run01 from '../../assets/image/intro/character/stage01_run01.png'
import run02 from '../../assets/image/intro/character/stage01_run02.png'
import run03 from '../../assets/image/intro/character/stage01_run03.png'
import run04 from '../../assets/image/intro/character/stage01_run04.png'
import run05 from '../../assets/image/intro/character/stage01_run05.png'
import styles from './LoadingScreen.module.scss'

const RUN_FRAMES = [run01, run02, run03, run04, run05]
const MIN_TIME = 1.4 // s, 순식간에 지나가지 않도록 최소로 보여주는 시간
const EASE = 0.08 // 표시 진행률이 실제 진행률을 따라가는 비율 (프레임당)
const FADE_TIME = 500 // ms, 100% 뒤 사라지는 시간 (SCSS .is-done과 같은 값)

/**
 * 처음 접속(새로고침) 때 페이지가 준비될 때까지 덮는 로딩 화면.
 * 실제 진행률 = (불러온 이미지 + 글꼴 준비 + 페이지 load) ÷ 전체. 표시 진행률은 그 값을 부드럽게 따라가고,
 * 최소 MIN_TIME 동안은 시간에 비례해서만 차오른다. 캐릭터는 막대 가운데 위에서 제자리 달리기, 막대만 흰색으로 채워진다.
 * 매 프레임 값은 ref로 직접 바꿔 React 리렌더링이 없다. 다 차면 서서히 사라지고 onDone.
 */
export default function LoadingScreen({ onDone }) {
    const [done, setDone] = useState(false)
    const passedRef = useRef(null)
    const percentRef = useRef(null)
    const onDoneRef = useRef(onDone)
    useEffect(() => {
        onDoneRef.current = onDone
    })

    useEffect(() => {
        let fontsReady = false
        let pageLoaded = document.readyState === 'complete'
        document.fonts?.ready.then(() => { fontsReady = true })
        const onLoad = () => { pageLoaded = true }
        window.addEventListener('load', onLoad)
        // 로딩 중에는 뒤 화면(인트로의 스페이스 · Enter 시작 등)이 키 입력을 받지 않게 먼저 가로챈다
        const blockKeys = (event) => event.stopImmediatePropagation()
        window.addEventListener('keydown', blockKeys, true)

        const start = performance.now()
        let shown = 0
        let frame = 0
        let finishTimer = 0
        const tick = (now) => {
            const images = [...document.images]
            const loaded = images.filter((image) => image.complete).length + Number(fontsReady) + Number(pageLoaded)
            const actual = loaded / (images.length + 2)
            const ready = fontsReady && pageLoaded && actual >= 1
            const elapsed = (now - start) / 1000
            // 최소 시간 전에는 시간에 비례한 만큼까지만, 준비가 다 되기 전에는 99%까지만
            const goal = Math.min(ready ? 1 : Math.min(actual, 0.99), elapsed / MIN_TIME)
            shown = Math.max(shown, shown + (goal - shown) * EASE)
            if (ready && elapsed >= MIN_TIME && goal - shown < 0.004) shown = 1

            const percent = Math.round(shown * 100)
            passedRef.current.style.width = `${shown * 100}%`
            percentRef.current.textContent = `${percent}%`

            if (shown >= 1) {
                window.removeEventListener('keydown', blockKeys, true)
                setDone(true)
                finishTimer = setTimeout(() => onDoneRef.current?.(), FADE_TIME)
                return
            }
            frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        return () => {
            cancelAnimationFrame(frame)
            clearTimeout(finishTimer)
            window.removeEventListener('load', onLoad)
            window.removeEventListener('keydown', blockKeys, true)
        }
    }, [])

    return (
        <div className={`${styles.scope} loading-screen ${done ? 'is-done' : ''}`} role="status" aria-live="polite" aria-label="페이지를 불러오는 중">
            <div className="loading-track">
                <div className="loading-runner">
                    <span className="loading-run-frames" style={{ '--frames': RUN_FRAMES.length }} aria-hidden="true">
                        {RUN_FRAMES.map((src, index) => <img src={src} alt="" key={src} style={{ '--i': index }} />)}
                    </span>
                </div>
                <div className="loading-bar" aria-hidden="true">
                    <span className="loading-bar-passed" ref={passedRef} />
                </div>
            </div>
            <p className="loading-text">열심히 달려가고 있습니다... <span ref={percentRef}>0%</span></p>
        </div>
    )
}
