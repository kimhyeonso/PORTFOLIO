import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { TextureLoader, Vector2 } from 'three'
import referenceImage from '../../../assets/image/intro/background/warp-reference.webp'
import { warpFragmentShader, warpVertexShader } from './warpShader.js'
import styles from './WarpTunnel.module.scss'

// 인트로가 진행되는 동안 미리 받아 둔다 (이 모듈은 전환 화면과 함께 인트로 중에 불러온다)
useLoader.preload(TextureLoader, referenceImage)

const DEFAULT_CENTER = { x: 0.5, y: 0.5 } // 화면 비율, 위쪽 기준 — 화면 한가운데로 빨려 들어간다

/*
 * 타임라인 (초) — uniform을 GSAP이 직접 바꾼다 (React 리렌더링 없음)
 *   0   ~ 1   STEP 01 앞 장면(흰 화면)에서 밝기가 걷히며 정적인 방사형 공간. 중심 주변만 미세하게 흐른다
 *   1   ~ 3   STEP 02 빨려 들어감: 속도 · 왜곡 · 블러가 점점 커진다
 *   3   ~ 3.5 STEP 03 최대 가속: 빛줄기 늘어남 · 밝은 영역 확장 · 중심이 밝아진다
 *   3.5 ~ 4   STEP 04 중심에서 빛이 퍼지며 화이트 플래시 → onComplete
 */
function buildTimeline(u, onComplete) {
    return gsap.timeline({ onComplete })
        .to(u.uProgress, { value: 1, duration: 4, ease: 'none' }, 0)
        // STEP 01
        .fromTo(u.uFlash, { value: 1 }, { value: 0, duration: 0.7, ease: 'power2.out' }, 0)
        .fromTo(u.uSpeed, { value: 0.12 }, { value: 0.35, duration: 1, ease: 'sine.inOut' }, 0)
        // STEP 02
        .to(u.uSpeed, { value: 3.2, duration: 2, ease: 'power2.in' }, 1)
        .to(u.uIntensity, { value: 0.6, duration: 2, ease: 'power2.in' }, 1)
        .to(u.uBlurStrength, { value: 0.6, duration: 2, ease: 'power2.in' }, 1)
        .to(u.uGlow, { value: 0.55, duration: 2, ease: 'power1.in' }, 1)
        // STEP 03
        .to(u.uSpeed, { value: 6.5, duration: 0.5, ease: 'power1.in' }, 3)
        .to(u.uIntensity, { value: 1, duration: 0.5, ease: 'power1.in' }, 3)
        .to(u.uBlurStrength, { value: 1, duration: 0.5, ease: 'power1.in' }, 3)
        .to(u.uGlow, { value: 1.1, duration: 0.5, ease: 'power1.in' }, 3)
        // STEP 04
        .to(u.uGlow, { value: 2.4, duration: 0.5, ease: 'power2.in' }, 3.5)
        .to(u.uFlash, { value: 1, duration: 0.5, ease: 'power2.in' }, 3.5)
}

function TunnelPlane({ center, onComplete }) {
    const texture = useLoader(TextureLoader, referenceImage)
    const { size } = useThree()
    const onCompleteRef = useRef(onComplete)
    useEffect(() => {
        onCompleteRef.current = onComplete
    })

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uTravel: { value: 0 },
        uSpeed: { value: 0.12 },
        uProgress: { value: 0 },
        uCenter: { value: new Vector2(center.x, 1 - center.y) },
        uResolution: { value: new Vector2(1, 1) },
        uIntensity: { value: 0 },
        uBlurStrength: { value: 0 },
        uGlow: { value: 0.2 },
        uFlash: { value: 1 },
        uTexture: { value: texture },
        uTexAspect: { value: texture.image.width / texture.image.height },
    }), [center.x, center.y, texture])

    // 매 프레임 · 크기 변경 때 바꾸는 값은 머티리얼 ref로 접근한다 (렌더에서 만든 객체를 직접 고치지 않게)
    const materialRef = useRef(null)
    useEffect(() => {
        materialRef.current.uniforms.uResolution.value.set(size.width, size.height)
    }, [size])

    // 머티리얼은 넘겨받은 uniforms를 복사해 쓰므로, GSAP도 머티리얼의 uniforms를 직접 움직인다
    useEffect(() => {
        const timeline = buildTimeline(materialRef.current.uniforms, () => onCompleteRef.current?.())
        return () => timeline.kill()
    }, [uniforms])

    // 이동 거리를 매 프레임 누적 — 속도가 바뀌어도 터널이 끊기지 않고 이어진다
    useFrame((_, delta) => {
        const dt = Math.min(delta, 0.05)
        const u = materialRef.current.uniforms
        u.uTime.value += dt
        u.uTravel.value += u.uSpeed.value * dt
    })

    return (
        <mesh frustumCulled={false}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial ref={materialRef} vertexShader={warpVertexShader} fragmentShader={warpFragmentShader} uniforms={uniforms} depthTest={false} depthWrite={false} />
        </mesh>
    )
}

/**
 * Stage04 포털 이후 화면 전체가 중심점으로 빨려 들어가는 워프 터널 (약 4초) → 화이트 플래시 → onComplete.
 * center: 중심점 { x, y } (화면 비율, 위쪽 기준) — 기본은 화면 한가운데
 */
export default function WarpTunnel({ center = DEFAULT_CENTER, onComplete, className = '' }) {
    return (
        <div className={`${styles.scope} warp-tunnel ${className}`} aria-hidden="true">
            <Canvas dpr={[1, 1.5]} gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }} frameloop="always">
                {/* 텍스처를 받는 동안은 흰 바탕(.warp-tunnel)이 보인다 */}
                <Suspense fallback={null}>
                    <TunnelPlane center={center} onComplete={onComplete} />
                </Suspense>
            </Canvas>
        </div>
    )
}
