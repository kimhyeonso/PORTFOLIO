import { useEffect, useRef } from 'react'
import IntroStageMenu from './IntroStageMenu.jsx'
import styles from './IntroPauseModal.module.scss'

/**
 * 스테이지 일시정지(스페이스 바 · STOP 버튼) 때 뜨는 모달.
 * ✕ · PLAY: 이어서 하기 / BACK TO START: Press Start 전 시작 화면으로 / STAGE SELECT: 스테이지 바로가기 / SKIP INTRO: 인트로를 건너뛰고 메인으로
 * 키보드: ↑ · ↓로 선택, Enter로 실행, 스페이스 바 · Esc로 닫고 이어서 하기 (스페이스 · Esc는 IntroStageGame에서)
 */
export default function IntroPauseModal({ current, onResume, onRestart, onSelectStage, onSkip }) {
    const panelRef = useRef(null)
    const playRef = useRef(null)

    // 열리면 PLAY에 포커스 — 키보드로 바로 고를 수 있게
    useEffect(() => {
        playRef.current?.focus()
    }, [])

    // ↑ · ↓: PLAY → BACK TO START → 스테이지 메뉴 → SKIP INTRO 순서로 선택을 옮긴다 (끝에서는 반대쪽 끝으로). Enter로 누른다.
    // 모달 바깥을 눌러 포커스가 빠져도 동작하도록 창 전체에서 받는다
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.code !== 'ArrowUp' && event.code !== 'ArrowDown') return
            event.preventDefault()
            const buttons = [...panelRef.current.querySelectorAll('button:not([data-skip-arrow])')]
            const index = buttons.indexOf(document.activeElement)
            const step = event.code === 'ArrowDown' ? 1 : -1
            const next = index < 0 ? (step > 0 ? 0 : buttons.length - 1) : (index + step + buttons.length) % buttons.length
            buttons[next].focus()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    return (
        <div className={`${styles.scope} sg-pause-modal`} role="dialog" aria-modal="true" aria-labelledby="sg-pause-title">
            <div className="sg-pause-panel" ref={panelRef}>
                {/* 오른쪽 위 닫기: PLAY와 같이 이어서 하기. ↑ · ↓ 선택 순서에는 넣지 않는다 (data-skip-arrow) */}
                <button className="sg-pause-close" type="button" onClick={onResume} aria-label="Close and resume" data-skip-arrow>
                    <span aria-hidden="true">✕</span>
                </button>
                <h2 id="sg-pause-title" className="sg-pause-title">PAUSE</h2>
                <div className="sg-pause-actions">
                    <button className="sg-pause-button is-primary" type="button" onClick={onResume} ref={playRef}>
                        <span aria-hidden="true">▶</span> PLAY
                    </button>
                    <button className="sg-pause-button" type="button" onClick={onRestart}>
                        BACK TO START
                    </button>
                </div>
                <p className="sg-pause-label">STAGE SELECT</p>
                <IntroStageMenu className="sg-pause-menu" current={current} onSelect={onSelectStage} />
                <button className="sg-pause-button is-skip" type="button" onClick={onSkip}>
                    SKIP INTRO <span aria-hidden="true">▶</span>
                </button>
            </div>
        </div>
    )
}
