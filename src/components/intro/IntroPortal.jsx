import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import WarpTunnel from './warp/WarpTunnel.jsx'
import styles from './IntroPortal.module.scss'

const RING_COUNT = 14 // 소용돌이 링 수 (많을수록 촘촘하다)
const RING_DURATION = 1.6 // s, 링 하나가 중앙의 점에서 화면 밖까지 커지는 시간
const RING_STAGGER = 0.09 // s, 링끼리 출발 시차 (이 시차가 터널 모양을 만든다)
const RING_COLORS = ['#2f8fc2', '#73bddb', '#175c87'] // 워프 터널과 같은 블루 · 스카이블루 · 딥블루를 번갈아
const IDLE_RINGS = 3 // 질문 화면 뒤에서 천천히 도는 링 수
const QUESTION_TIME = 2.5 // s, 질문을 보여준 뒤 자동으로 메인으로 넘어가기까지

// 링들이 중앙에서 시차를 두고 출발해 한 바퀴 돌며 화면 밖으로 커지는 소용돌이.
// 크기·회전과 투명도를 따로 다뤄 서로 덮어쓰지 않게 하고, 안쪽에서 바깥으로 갈수록 빨라진다
function addVortex(timeline, rings, position, { duration = RING_DURATION, stagger = RING_STAGGER } = {}) {
    timeline
        .fromTo(rings, { scale: 0, rotation: 0 }, { scale: 6, rotation: 360, duration, ease: 'power1.in', stagger }, position)
        .fromTo(rings, { opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.25 }, { opacity: 0, duration: duration - 0.75, delay: 0.5 }], ease: 'none', stagger }, position)
}

/**
 * 인트로 → 메인 사이의 전환 화면.
 *  1. 인트로가 가운데로 확대·흐려지며 빨려 들고, 워프 터널과 같은 화이트블루 빛이 차오르며 링 소용돌이가 퍼져 나온다
 *  2. "다음 STAGE는 어딜까?" 질문이 떠오르고 QUESTION_TIME 동안 보여준다
 *  3. 자동으로 소용돌이가 한 번 더 터지고 화이트블루 빛이 화면을 채운 뒤 옅은 크림빛으로 넘어가며 onEnter(메인으로 이동) →
 *     메인 홀이 살짝 확대·흐림에서 내려앉고, 이 화면이 사라지면 onDone을 부른다
 * 메인이 나오기 전까지 오른쪽 위 SKIP INTRO로 언제든(소용돌이 · 터널 중에도) 바로 3으로 넘어갈 수 있다.
 * 메인으로 바뀐 뒤에도 끊기지 않도록 AppRoutes에서 페이지 바깥에 띄운다.
 *
 * warp: Stage04 포털을 지나 들어온 경우 true. 1의 링 소용돌이 대신 워프 터널(WarpTunnel, Three.js 셰이더)로
 * 화면 한가운데를 향해 빨려 들어가고, 화이트 플래시가 걷히며 2로 넘어간다.
 *
 * skip: 인트로의 SKIP INTRO로 들어온 경우 true. 1 · 2 없이 곧바로 3(링이 한 번 터지고 빛이 채워진 뒤 메인)으로.
 */
export default function IntroPortal({ warp: warpRequested = false, skip: skipRequested = false, onEnter, onDone }) {
    // 움직임 줄이기 설정이면 소용돌이 없이 바로 질문 화면부터
    const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    // vortex → question → leaving. 질문이 뜨기 전(소용돌이 · 터널 중)에 SKIP하면 vortex → skipping (질문 없이 바로 떠난다)
    // 인트로의 SKIP INTRO로 들어오면 처음부터 skipping
    const [phase, setPhase] = useState(() => {
        if (skipRequested) return 'skipping'
        return reduced ? 'question' : 'vortex'
    })
    // 워프 터널로 시작하는지는 처음 열릴 때 한 번만 정한다. 터널: playing → fading(흰 화면이 걷힘) → off(캔버스 내림)
    const [startsWithWarp] = useState(() => warpRequested && !reduced && !skipRequested)
    const [startsWithSkip] = useState(skipRequested)
    const [warp, setWarp] = useState(startsWithWarp ? 'playing' : 'off')
    const rootRef = useRef(null)
    const veilRef = useRef(null)
    const glowRef = useRef(null)
    const warmRef = useRef(null)
    const ringsRef = useRef(null)
    const idleRef = useRef(null)
    const questionRef = useRef(null)
    // 부모가 다시 그려져 콜백이 바뀌어도 애니메이션을 다시 시작하지 않도록 ref로 들고 있는다
    const callbacksRef = useRef({ onEnter, onDone })
    useEffect(() => {
        callbacksRef.current = { onEnter, onDone }
    })

    // 1. 빨려 들어가는 소용돌이 (워프 터널로 시작하면 터널이 끝난 뒤 바로 질문 화면이라 배경만 깔아 둔다)
    useEffect(() => {
        // SKIP INTRO로 들어오면 소용돌이 · 배경 없이 인트로 위에서 바로 3이 시작된다
        if (startsWithSkip) return undefined
        if (reduced || startsWithWarp) {
            gsap.set(veilRef.current, { opacity: 1 })
            return undefined
        }
        // 그 사이 SKIP INTRO로 이미 떠나고 있으면 질문으로 되돌리지 않는다
        const timeline = gsap.timeline({ onComplete: () => setPhase((current) => (current === 'vortex' ? 'question' : current)) })
        timeline
            .to(document.querySelector('.intro-page'), { scale: 1.35, filter: 'blur(8px)', duration: 0.9, ease: 'power2.in' }, 0)
            .fromTo(veilRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power1.in' }, 0.15)
        addVortex(timeline, ringsRef.current.children, 0)
        return () => timeline.kill()
    }, [reduced, startsWithWarp, startsWithSkip])

    // 터널의 흰 화면이 걷히고 나면(.warp-tunnel.is-done 전환 .9s) 캔버스를 내려 GPU를 놓아준다
    useEffect(() => {
        if (warp !== 'fading') return undefined
        const timer = setTimeout(() => setWarp('off'), 950)
        return () => clearTimeout(timer)
    }, [warp])

    // 2. 질문 화면이 떠오르고, 뒤에서 링 몇 개가 천천히 돈다. QUESTION_TIME 뒤 자동으로 3
    useEffect(() => {
        if (phase !== 'question') return undefined
        const timer = setTimeout(() => setPhase((current) => (current === 'question' ? 'leaving' : current)), QUESTION_TIME * 1000)
        if (reduced) return () => clearTimeout(timer)
        const rings = idleRef.current.children
        const tweens = [
            gsap.fromTo(rings, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power1.out', stagger: 0.2 }),
            ...[...rings].map((ring, index) => gsap.to(ring, { rotation: index % 2 ? -360 : 360, duration: 24 + index * 8, ease: 'none', repeat: -1 })),
            gsap.fromTo(questionRef.current.children, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.14 }),
        ]
        return () => {
            clearTimeout(timer)
            tweens.forEach((tween) => tween.kill())
        }
    }, [phase, reduced])

    // 3. 포트폴리오로 이동 (자동 또는 SKIP INTRO)
    const isLeaving = phase === 'leaving' || phase === 'skipping'
    useEffect(() => {
        if (!isLeaving) return undefined
        if (reduced) {
            callbacksRef.current.onEnter()
            callbacksRef.current.onDone()
            return undefined
        }
        const rings = ringsRef.current.children
        // 소용돌이 도중에 SKIP했으면 진행 중인 링 움직임을 멈추고 새로 터뜨린다
        gsap.killTweensOf(rings)
        const timeline = gsap.timeline()
        if (questionRef.current) timeline.to(questionRef.current.children, { opacity: 0, y: -16, duration: 0.4, ease: 'power2.in', stagger: 0.06 }, 0)
        timeline.to(idleRef.current, { opacity: 0, duration: 0.5 }, 0)
        addVortex(timeline, rings, 0.1, { duration: 1.3, stagger: 0.06 })
        timeline
            .fromTo(glowRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.in' }, 0.6)
            // 화이트블루가 다 찬 뒤 크림빛으로 옅게 넘어가 메인 홀 색으로 이어진다
            .fromTo(warmRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'sine.inOut' })
            .add(() => callbacksRef.current.onEnter())
            .add(() => settleHall(), '+=0.06')
            .to(rootRef.current, { opacity: 0, duration: 1, ease: 'power2.out', onComplete: () => callbacksRef.current.onDone() }, '<')
        return () => timeline.kill()
    }, [isLeaving, reduced])

    const skip = () => setPhase((current) => {
        if (current === 'question') return 'leaving'
        return current === 'vortex' ? 'skipping' : current
    })

    return (
        <div className={`${styles.scope} intro-portal`} ref={rootRef} role="dialog" aria-modal="true" aria-labelledby="intro-portal-question">
            <div className="intro-portal-veil" ref={veilRef} />
            {warp !== 'off' && (
                <WarpTunnel
                    className={warp === 'fading' ? 'is-done' : ''}
                    onComplete={() => {
                        setWarp('fading')
                        setPhase((current) => (current === 'vortex' ? 'question' : current))
                    }}
                />
            )}
            <div className="intro-portal-rings is-idle" ref={idleRef} aria-hidden="true">
                {Array.from({ length: IDLE_RINGS }, (_, index) => <span className="intro-portal-ring" key={index} style={{ '--ring-color': RING_COLORS[index % RING_COLORS.length], '--ring-size': `${70 + index * 32}vmin` }} />)}
            </div>
            <div className="intro-portal-rings" ref={ringsRef} aria-hidden="true">
                {Array.from({ length: RING_COUNT }, (_, index) => <span className="intro-portal-ring" key={index} style={{ '--ring-color': RING_COLORS[index % RING_COLORS.length] }} />)}
            </div>

            {(phase === 'question' || phase === 'leaving') && (
                <div className="intro-portal-question" ref={questionRef}>
                    <p className="intro-portal-label">NEXT STAGE</p>
                    <h2 id="intro-portal-question">다음 <span className="is-pixel">STAGE</span>는 어딜까?</h2>
                </div>
            )}

            <div className="intro-portal-glow" ref={glowRef} />
            <div className="intro-portal-glow is-warm" ref={warmRef} />
            {/* 메인이 나오기 전까지 오른쪽 위에 SKIP INTRO (인트로 화면의 SKIP INTRO와 같은 자리 · 모양) */}
            <button className="intro-skip intro-portal-skip" type="button" onClick={skip}>
                SKIP INTRO <span aria-hidden="true">▶</span>
            </button>
        </div>
    )
}

// 메인 홀은 살짝 확대·흐림에서 제자리로 내려앉는다 (이동 직후엔 아직 안 그려졌을 수 있어 몇 프레임 기다린다)
function settleHall(tries = 0) {
    const hall = document.querySelector('.main-hall')
    if (hall) gsap.fromTo(hall, { scale: 1.12, filter: 'blur(6px)' }, { scale: 1, filter: 'blur(0px)', duration: 1.3, ease: 'power3.out', clearProps: 'transform,filter' })
    else if (tries < 30) requestAnimationFrame(() => settleHall(tries + 1))
}
