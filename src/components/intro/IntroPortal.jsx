import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import styles from './IntroPortal.module.scss'

const RING_COUNT = 14 // 소용돌이 링 수 (많을수록 촘촘하다)
const RING_DURATION = 1.6 // s, 링 하나가 중앙의 점에서 화면 밖까지 커지는 시간
const RING_STAGGER = 0.09 // s, 링끼리 출발 시차 (이 시차가 터널 모양을 만든다)
const RING_COLORS = ['#8fd0ff', '#fff3e0', '#e8c98a'] // 하늘 · 크림 · 골드를 번갈아
const IDLE_RINGS = 3 // 질문 화면 뒤에서 천천히 도는 링 수

// 링들이 중앙에서 시차를 두고 출발해 한 바퀴 돌며 화면 밖으로 커지는 소용돌이.
// 크기·회전과 투명도를 따로 다뤄 서로 덮어쓰지 않게 하고, 안쪽에서 바깥으로 갈수록 빨라진다
function addVortex(timeline, rings, position, { duration = RING_DURATION, stagger = RING_STAGGER } = {}) {
    timeline
        .fromTo(rings, { scale: 0, rotation: 0 }, { scale: 6, rotation: 360, duration, ease: 'power1.in', stagger }, position)
        .fromTo(rings, { opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.25 }, { opacity: 0, duration: duration - 0.75, delay: 0.5 }], ease: 'none', stagger }, position)
}

/**
 * 인트로 → 메인 사이의 전환 화면.
 *  1. 인트로가 가운데로 확대·흐려지며 빨려 들고, 짙은 바다색이 차오르며 링 소용돌이가 퍼져 나온다
 *  2. "다음 STAGE는 어딜까?" 질문과 [포트폴리오 보러 가기] 버튼이 떠오른다
 *  3. 버튼을 누르면 소용돌이가 한 번 더 터지고 크림빛이 화면을 채운 뒤 onEnter(메인으로 이동) →
 *     메인 홀이 살짝 확대·흐림에서 내려앉고, 이 화면이 사라지면 onDone을 부른다
 * 메인으로 바뀐 뒤에도 끊기지 않도록 AppRoutes에서 페이지 바깥에 띄운다.
 */
export default function IntroPortal({ onEnter, onDone }) {
    // 움직임 줄이기 설정이면 소용돌이 없이 바로 질문 화면부터
    const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    const [phase, setPhase] = useState(reduced ? 'question' : 'vortex') // vortex → question → leaving
    const rootRef = useRef(null)
    const veilRef = useRef(null)
    const glowRef = useRef(null)
    const ringsRef = useRef(null)
    const idleRef = useRef(null)
    const questionRef = useRef(null)
    const buttonRef = useRef(null)
    // 부모가 다시 그려져 콜백이 바뀌어도 애니메이션을 다시 시작하지 않도록 ref로 들고 있는다
    const callbacksRef = useRef({ onEnter, onDone })
    useEffect(() => {
        callbacksRef.current = { onEnter, onDone }
    })

    // 1. 빨려 들어가는 소용돌이
    useEffect(() => {
        if (reduced) {
            gsap.set(veilRef.current, { opacity: 1 })
            return undefined
        }
        const timeline = gsap.timeline({ onComplete: () => setPhase('question') })
        timeline
            .to(document.querySelector('.intro-page'), { scale: 1.35, filter: 'blur(8px)', duration: 0.9, ease: 'power2.in' }, 0)
            .fromTo(veilRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power1.in' }, 0.15)
        addVortex(timeline, ringsRef.current.children, 0)
        return () => timeline.kill()
    }, [reduced])

    // 2. 질문 화면이 떠오르고, 뒤에서 링 몇 개가 천천히 돈다
    useEffect(() => {
        if (phase !== 'question') return undefined
        buttonRef.current?.focus({ preventScroll: true })
        if (reduced) return undefined
        const rings = idleRef.current.children
        const tweens = [
            gsap.fromTo(rings, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power1.out', stagger: 0.2 }),
            ...[...rings].map((ring, index) => gsap.to(ring, { rotation: index % 2 ? -360 : 360, duration: 24 + index * 8, ease: 'none', repeat: -1 })),
            gsap.fromTo(questionRef.current.children, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.14 }),
        ]
        return () => tweens.forEach((tween) => tween.kill())
    }, [phase, reduced])

    // 3. 포트폴리오로 이동
    const enter = () => {
        if (phase !== 'question') return
        setPhase('leaving')
        if (reduced) {
            callbacksRef.current.onEnter()
            callbacksRef.current.onDone()
            return
        }
        const timeline = gsap.timeline()
        timeline
            .to(questionRef.current.children, { opacity: 0, y: -16, duration: 0.4, ease: 'power2.in', stagger: 0.06 }, 0)
            .to(idleRef.current, { opacity: 0, duration: 0.5 }, 0)
        addVortex(timeline, ringsRef.current.children, 0.1, { duration: 1.3, stagger: 0.06 })
        timeline
            .fromTo(glowRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.in' }, 0.6)
            .add(() => callbacksRef.current.onEnter())
            .add(() => settleHall(), '+=0.06')
            .to(rootRef.current, { opacity: 0, duration: 1, ease: 'power2.out', onComplete: () => callbacksRef.current.onDone() }, '<')
    }

    return (
        <div className={`${styles.scope} intro-portal`} ref={rootRef} role="dialog" aria-modal="true" aria-labelledby="intro-portal-question">
            <div className="intro-portal-veil" ref={veilRef} />
            <div className="intro-portal-rings is-idle" ref={idleRef} aria-hidden="true">
                {Array.from({ length: IDLE_RINGS }, (_, index) => <span className="intro-portal-ring" key={index} style={{ '--ring-color': RING_COLORS[index % RING_COLORS.length], '--ring-size': `${70 + index * 32}vmin` }} />)}
            </div>
            <div className="intro-portal-rings" ref={ringsRef} aria-hidden="true">
                {Array.from({ length: RING_COUNT }, (_, index) => <span className="intro-portal-ring" key={index} style={{ '--ring-color': RING_COLORS[index % RING_COLORS.length] }} />)}
            </div>

            {phase !== 'vortex' && (
                <div className="intro-portal-question" ref={questionRef}>
                    <p className="intro-portal-label">NEXT STAGE</p>
                    <h2 id="intro-portal-question">다음 <span className="is-pixel">STAGE</span>는 어딜까?</h2>
                    <button className="intro-portal-enter" type="button" ref={buttonRef} onClick={enter}>
                        포트폴리오 보러 가기 <span aria-hidden="true">→</span>
                    </button>
                </div>
            )}

            <div className="intro-portal-glow" ref={glowRef} />
        </div>
    )
}

// 메인 홀은 살짝 확대·흐림에서 제자리로 내려앉는다 (이동 직후엔 아직 안 그려졌을 수 있어 몇 프레임 기다린다)
function settleHall(tries = 0) {
    const hall = document.querySelector('.main-hall')
    if (hall) gsap.fromTo(hall, { scale: 1.12, filter: 'blur(6px)' }, { scale: 1, filter: 'blur(0px)', duration: 1.3, ease: 'power3.out', clearProps: 'transform,filter' })
    else if (tries < 30) requestAnimationFrame(() => settleHall(tries + 1))
}
