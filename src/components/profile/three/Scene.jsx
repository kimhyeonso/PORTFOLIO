'use no memo'
import { Canvas, useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Color, DoubleSide, getConsoleFunction, MeshBasicMaterial, MeshStandardMaterial, setConsoleFunction, Vector3 } from 'three'
import { CAMERA, INTRO_STAGE, STAGING } from '../../../data/profileStatus.js'
import Effects, { FLOOR_Y } from './Effects.jsx'
import { createBeamTexture, createFloorTexture, createGlowTexture, createHudTexture, createSparkleTexture } from './textures.js'

/*
 * PROFILE 3D 장면: 캐릭터 · 받침대 · 바닥 · 파티클 · 메뉴별 이펙트.
 * 배경은 투명(CSS 하늘이 보인다). GSAP이 캐릭터 위치/회전, 카메라, accent 색, 파티클 burst를 모두 트윈하고
 * 매 프레임 그 값을 장면에 적용한다.
 *   tab         지금 메뉴 key (STAGING key)
 *   hoverSkill  스킬 카드 hover/focus 중인 번호 (없으면 null)
 *   mobile      ≤ 900px (회전 · 이동 축소, 패럴랙스 끔, viewOffset 해제)
 *   reduced     prefers-reduced-motion
 *   intro       처음 진입 인트로 (캐릭터를 화면 가운데에 두고, 끝나면 왼쪽으로 밀려난다)
 */

/*
 * R3F 9는 내부에서 THREE.Clock을 만들어 three r183+에서 지원 중단 경고가 뜬다 (우리 코드와 무관).
 * 그 한 줄만 거르고 나머지 three 메시지는 그대로 내보낸다.
 */
const prevConsole = getConsoleFunction()
setConsoleFunction((type, message, ...params) => {
    if (typeof message === 'string' && message.startsWith('THREE.Clock: This module has been deprecated')) return
    if (prevConsole) prevConsole(type, message, ...params)
    else console[type](message, ...params)
})

const TAU = Math.PI * 2
// 데스크톱에서 캐릭터를 왼쪽 40% 영역 가운데로 옮기는 카메라 화면 이동 비율
// (0.28 → 캐릭터 중심이 화면 왼쪽 약 22%, 왼쪽 40% 영역의 가운데에 온다)
const VIEW_OFFSET_X = 0.28
// 받침대 · 이펙트 · 파티클 · 캐릭터 자리 전체 크기 (카메라 값 STAGING은 그대로 두고 장면만 줄인다)
const WORLD_SCALE = 0.78

function createStore() {
    return {
        pos: { x: STAGING.profile.pos[0], z: STAGING.profile.pos[2] },
        drop: 2.4, // 첫 로딩: 위에서 받침대로 떨어진다
        jump: 0,
        rot: -TAU * 0.75,
        camBase: new Vector3(...CAMERA.intro),
        lookBase: new Vector3(...STAGING.profile.look),
        accent: new Color(STAGING.profile.accent),
        burst: 0,
        shock: 0,
        pointer: { x: 0, y: 0 },
        introDone: false,
        // 카메라 화면 이동 비율 (인트로 0 → 이후 VIEW_OFFSET_X)
        viewX: 0,
    }
}

/* 받침대: 팔각 2단 석재 + 금색 림 + 발광 상판 + 회전 링 + 금색 룬 블록 8개 + 바닥 + 가짜 반사 글로우 + 충격파 */
function Pedestal({ store, textures }) {
    const mats = useMemo(() => ({
        stone: new MeshStandardMaterial({ color: '#F4EAD2', roughness: 0.85, flatShading: true }),
        stoneDark: new MeshStandardMaterial({ color: '#E6D7B4', roughness: 0.9, flatShading: true }),
        gold: new MeshStandardMaterial({ color: '#D4AA4F', metalness: 0.45, roughness: 0.38, flatShading: true }),
        rune: new MeshStandardMaterial({ color: '#ECD48F', emissive: '#C9A24A', emissiveIntensity: 0.5, flatShading: true }),
        top: new MeshStandardMaterial({ color: '#FBF7EC', emissive: STAGING.profile.accent, emissiveIntensity: 0.55, roughness: 0.5, flatShading: true }),
        ring: new MeshBasicMaterial({ color: STAGING.profile.accent, transparent: true, opacity: 0.85, side: DoubleSide, depthWrite: false }),
        glow: new MeshBasicMaterial({ map: textures.glow, color: STAGING.profile.accent, transparent: true, opacity: 0.75, depthWrite: false }),
    }), [textures])
    const ring = useRef(null)
    const runes = useRef(null)
    const light = useRef(null)
    const shock = useRef(null)
    const shockMat = useRef(null)

    useFrame((_, delta) => {
        const accent = store.accent
        mats.top.emissive.copy(accent)
        mats.ring.color.copy(accent)
        mats.glow.color.copy(accent)
        shockMat.current.color.copy(accent)
        light.current.color.copy(accent)
        ring.current.rotation.z += delta * 0.35
        runes.current.rotation.y -= delta * 0.12
        // 충격파 링: 상판에서 퍼져 나간다
        const s = store.shock
        shock.current.visible = s > 0.001 && s < 0.999
        shock.current.scale.setScalar(1 + s * 1.6)
        shockMat.current.opacity = 0.9 * (1 - s)
    })

    return (
        <group>
            {/* 팔각 2단 석재 + 금색 림 */}
            <mesh position={[0, -0.47, 0]} material={mats.stoneDark} receiveShadow castShadow>
                <cylinderGeometry args={[1.72, 1.82, 0.3, 8]} />
            </mesh>
            <mesh position={[0, -0.315, 0]} material={mats.gold} receiveShadow>
                <cylinderGeometry args={[1.62, 1.72, 0.04, 8]} />
            </mesh>
            <mesh position={[0, -0.17, 0]} material={mats.stone} receiveShadow castShadow>
                <cylinderGeometry args={[1.42, 1.5, 0.26, 8]} />
            </mesh>
            <mesh position={[0, -0.03, 0]} material={mats.gold} receiveShadow>
                <cylinderGeometry args={[1.46, 1.44, 0.03, 8]} />
            </mesh>
            {/* 발광 상판 디스크 */}
            <mesh position={[0, -0.01, 0]} material={mats.top} receiveShadow>
                <cylinderGeometry args={[1.22, 1.22, 0.02, 8]} />
            </mesh>
            {/* 회전 팔각 링 */}
            <mesh ref={ring} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.ring}>
                <ringGeometry args={[1.28, 1.36, 8]} />
            </mesh>
            {/* 둘레의 금색 룬 블록 8개 */}
            <group ref={runes} position={[0, -0.2, 0]}>
                {Array.from({ length: 8 }, (_, i) => {
                    const a = (i / 8) * TAU + TAU / 16
                    return (
                        <mesh key={i} position={[Math.sin(a) * 1.64, 0, Math.cos(a) * 1.64]} rotation={[0, a, 0]} material={mats.rune} castShadow>
                            <boxGeometry args={[0.16, 0.2, 0.08]} />
                        </mesh>
                    )
                })}
            </group>
            <pointLight ref={light} position={[0, 0.7, 0.4]} intensity={4} distance={6} decay={2} />
            {/* 충격파 링 */}
            <mesh ref={shock} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
                <ringGeometry args={[1.0, 1.12, 48]} />
                <meshBasicMaterial ref={shockMat} color={STAGING.profile.accent} transparent opacity={0} side={DoubleSide} depthWrite={false} />
            </mesh>

            {/* 바닥: 반지름 11 원판 (가운데 아이보리 → 가장자리 투명 + 희미한 금색 격자) */}
            <mesh position={[0, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[11, 64]} />
                <meshStandardMaterial map={textures.floor} transparent roughness={0.25} metalness={0.05} depthWrite={false} />
            </mesh>
            {/* 받침대 아래 accent 색 글로우 (가짜 반사) */}
            <mesh position={[0, FLOOR_Y + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.glow}>
                <planeGeometry args={[6.5, 6.5]} />
            </mesh>
        </group>
    )
}

/*
 * 반짝이 파티클: 받침대 주위 원통 영역에서 천천히 위로 떠오르며 돈다.
 * 위치 · 반짝임은 셰이더에서 계산하고, burst(전환 직후 1 → 0)가 상승 속도 · 퍼짐 · 크기를 일시적으로 키운다.
 */
const PARTICLE_COLORS = ['#E8BE55', '#7CC4F2', '#F2A35E', '#FFFFFF', '#F6D27A']
const vertexShader = /* glsl */ `
    attribute float aRadius;
    attribute float aAngle;
    attribute float aHeight;
    attribute float aSpeed;
    attribute float aPhase;
    uniform float uRise;
    uniform float uSpin;
    uniform float uTime;
    uniform float uBurst;
    uniform float uSize;
    uniform float uHeight;
    uniform float uPixelRatio;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
        float h = mod(aHeight + uRise * aSpeed, uHeight);
        float a = aAngle + uSpin * (0.4 + aSpeed * 0.6);
        float r = aRadius * (1.0 + uBurst * 0.55);
        vec3 p = vec3(cos(a) * r, h - 0.6, sin(a) * r);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float twinkle = 0.55 + 0.45 * sin(uTime * (1.5 + aSpeed * 2.0) + aPhase);
        // 위아래 끝에서는 서서히 나타나고 사라진다
        float edge = smoothstep(0.0, 0.6, h) * (1.0 - smoothstep(uHeight - 1.2, uHeight, h));
        vAlpha = twinkle * edge;
        vColor = color;
        gl_PointSize = uSize * (0.6 + twinkle * 0.5) * (1.0 + uBurst * 0.9) * uPixelRatio * (10.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
    }
`
const fragmentShader = /* glsl */ `
    uniform sampler2D uMap;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
        vec4 tex = texture2D(uMap, gl_PointCoord);
        gl_FragColor = vec4(vColor * tex.rgb, tex.a * vAlpha);
        #include <colorspace_fragment>
    }
`

function SparkleGroup({ count, size, store, texture, reduced, seed }) {
    const material = useRef(null)
    const motion = useRef({ rise: 0, spin: 0 })
    const { geometryArgs, uniforms } = useMemo(() => {
        let s = seed
        const rand = () => {
            s = (s * 16807) % 2147483647
            return (s - 1) / 2147483646
        }
        const position = new Float32Array(count * 3)
        const radius = new Float32Array(count)
        const angle = new Float32Array(count)
        const height = new Float32Array(count)
        const speed = new Float32Array(count)
        const phase = new Float32Array(count)
        const color = new Float32Array(count * 3)
        const c = new Color()
        for (let i = 0; i < count; i += 1) {
            radius[i] = 0.9 + Math.pow(rand(), 0.7) * 6.2
            angle[i] = rand() * TAU
            height[i] = rand() * 6.5
            speed[i] = 0.35 + rand() * 0.9
            phase[i] = rand() * TAU
            c.set(PARTICLE_COLORS[Math.floor(rand() * PARTICLE_COLORS.length)])
            color.set([c.r, c.g, c.b], i * 3)
        }
        return {
            geometryArgs: { position, radius, angle, height, speed, phase, color },
            uniforms: {
                uMap: { value: texture },
                uRise: { value: 0 },
                uSpin: { value: 0 },
                uTime: { value: 0 },
                uBurst: { value: 0 },
                uSize: { value: size },
                uHeight: { value: 6.5 },
                uPixelRatio: { value: 1 },
            },
        }
    }, [count, size, texture, seed])

    useFrame((state, delta) => {
        const u = material.current.uniforms
        const burst = reduced ? 0 : store.burst
        const m = motion.current
        m.rise += delta * (reduced ? 0.06 : 0.28) * (1 + burst * 4)
        m.spin += delta * (reduced ? 0.02 : 0.08) * (1 + burst * 2)
        u.uRise.value = m.rise
        u.uSpin.value = m.spin
        u.uTime.value = state.clock.elapsedTime
        u.uBurst.value = burst
        u.uPixelRatio.value = state.gl.getPixelRatio()
    })

    const g = geometryArgs
    return (
        <points frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[g.position, 3]} />
                <bufferAttribute attach="attributes-aRadius" args={[g.radius, 1]} />
                <bufferAttribute attach="attributes-aAngle" args={[g.angle, 1]} />
                <bufferAttribute attach="attributes-aHeight" args={[g.height, 1]} />
                <bufferAttribute attach="attributes-aSpeed" args={[g.speed, 1]} />
                <bufferAttribute attach="attributes-aPhase" args={[g.phase, 1]} />
                <bufferAttribute attach="attributes-color" args={[g.color, 3]} />
            </bufferGeometry>
            <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} vertexColors transparent depthWrite={false} />
        </points>
    )
}

function Particles({ store, texture, reduced, mobile }) {
    return (
        <group>
            <SparkleGroup count={mobile ? 24 : 54} size={30} store={store} texture={texture} reduced={reduced} seed={7} />
            <SparkleGroup count={mobile ? 80 : 190} size={13} store={store} texture={texture} reduced={reduced} seed={31} />
        </group>
    )
}

/* 메뉴 전환 타임라인 + 카메라 리그 + 캐릭터 위치 적용 */
function World({ tab, intro, hoverSkill, mobile, reduced }) {
    const [store] = useState(createStore)
    const textures = useMemo(() => ({
        sparkle: createSparkleTexture(),
        glow: createGlowTexture(),
        floor: createFloorTexture(),
        beam: createBeamTexture(),
        hud: createHudTexture(),
    }), [])
    const character = useRef(null)

    useEffect(() => () => Object.values(textures).forEach((t) => t.dispose()), [textures])

    // 마우스 위치 (-1..1): 고개 · 카메라 패럴랙스
    useEffect(() => {
        const onMove = (e) => {
            store.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
            store.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
        }
        window.addEventListener('pointermove', onMove)
        return () => window.removeEventListener('pointermove', onMove)
    }, [store])

    // 마지막으로 적용한 viewOffset (값 · 화면 크기가 바뀐 프레임에만 다시 적용)
    const applied = useRef({ x: NaN, w: 0, h: 0 })

    // 메뉴 전환 타임라인 (이전 타임라인은 cleanup에서 kill)
    useEffect(() => {
        const st = intro ? INTRO_STAGE : STAGING[tab]
        // 데스크톱: 캔버스는 전체 화면 그대로 두고 화면만 옮겨 캐릭터를 왼쪽 40% 가운데로 (인트로는 가운데)
        const viewX = intro || mobile ? 0 : VIEW_OFFSET_X
        const scale = mobile ? 0.5 : 1
        const d = reduced ? 0.01 : 1
        const base = st.rot * scale
        const cur = store.rot
        let rotTarget
        if (st.spin && !reduced) {
            const minTravel = (mobile ? 1 : 1.25) * Math.PI
            rotTarget = base + TAU * Math.ceil((cur + minTravel - base) / TAU)
        } else {
            rotTarget = base + TAU * Math.round((cur - base) / TAU)
        }
        const cam = [st.cam[0] * scale, st.cam[1], st.cam[2] + (mobile ? 0.6 : 0)]
        const [r, g, b] = new Color(st.accent).toArray()
        const first = !store.introDone

        const tl = gsap.timeline()
        if (first) {
            // 첫 로딩: 위에서 떨어지며 돌아서 정면을 보고, 카메라가 PROFILE 위치로 미끄러져 들어온다
            tl.call(() => { store.introDone = true }, null, 0.02)
            tl.to(store, { drop: 0, duration: 1.3 * d, ease: 'bounce.out' }, 0.25 * d)
            tl.to(store, { rot: base, duration: 1.6 * d, ease: 'power2.out' }, 0.25 * d)
            tl.to(store.pos, { x: st.pos[0], z: st.pos[2], duration: 1.2 * d, ease: 'power3.inOut' }, 0)
            tl.to(store.camBase, { x: cam[0], y: cam[1], z: cam[2], duration: 2.2 * d, ease: 'power3.inOut' }, 0)
            tl.to(store.lookBase, { x: st.look[0], y: st.look[1], z: st.look[2], duration: 2.2 * d, ease: 'power3.inOut' }, 0)
            tl.to(store.accent, { r, g, b, duration: 1 * d }, 0)
            tl.to(store, { viewX, duration: 2.2 * d, ease: 'power3.inOut' }, 0)
            if (!reduced) {
                tl.fromTo(store, { burst: 1 }, { burst: 0, duration: 1.5, ease: 'power2.out' }, 0.6)
                tl.fromTo(store, { shock: 0 }, { shock: 1, duration: 1, ease: 'power2.out' }, 0.6)
            }
        } else {
            // 첫 낙하 중에 메뉴를 바꿔도 받침대로 부드럽게 내려앉는다
            tl.to(store, { drop: 0, duration: 0.5 * d, ease: 'bounce.out' }, 0)
            tl.to(store.pos, { x: st.pos[0], z: st.pos[2], duration: 1.15 * d, ease: 'power3.inOut' }, 0)
            tl.to(store, { rot: rotTarget, duration: (st.spin ? 1.4 : 1.1) * d, ease: 'power2.inOut' }, 0)
            tl.to(store.camBase, { x: cam[0], y: cam[1], z: cam[2], duration: 1.3 * d, ease: 'power3.inOut' }, 0)
            tl.to(store.lookBase, { x: st.look[0], y: st.look[1], z: st.look[2], duration: 1.3 * d, ease: 'power3.inOut' }, 0)
            tl.to(store.accent, { r, g, b, duration: 1 * d }, 0)
            tl.to(store, { viewX, duration: 1.3 * d, ease: 'power3.inOut' }, 0)
            if (!reduced) {
                // 작은 점프
                tl.fromTo(store, { jump: 0 }, { jump: 0.14, duration: 0.28, ease: 'power2.out' }, 0)
                tl.to(store, { jump: 0, duration: 0.5, ease: 'bounce.out' }, 0.28)
                tl.fromTo(store, { burst: 1 }, { burst: 0, duration: 1.5, ease: 'power2.out' }, 0)
                tl.fromTo(store, { shock: 0 }, { shock: 1, duration: 1, ease: 'power2.out' }, 0.05)
            }
        }
        return () => tl.kill()
    }, [tab, intro, mobile, reduced, store])

    // 매 프레임: 캐릭터 위치 · 회전, 카메라 = camBase + 마우스 패럴랙스 + 미세한 호흡
    useFrame((state) => {
        const t = state.clock.elapsedTime
        character.current.position.set(store.pos.x, store.drop + store.jump, store.pos.z)
        character.current.rotation.y = store.rot
        const still = mobile || reduced
        const px = still ? 0 : store.pointer.x * 0.22
        const py = still ? 0 : store.pointer.y * 0.12
        const breath = reduced ? 0 : Math.sin(t * 0.7) * 0.03
        state.camera.position.set(store.camBase.x + px, store.camBase.y + py + breath, store.camBase.z)
        state.camera.lookAt(store.lookBase)
        // viewOffset
        const vx = mobile ? 0 : store.viewX
        const { width, height } = state.size
        const a = applied.current
        if (vx !== a.x || width !== a.w || height !== a.h) {
            if (vx === 0) state.camera.clearViewOffset()
            else state.camera.setViewOffset(width, height, width * vx, 0, width, height)
            state.camera.updateProjectionMatrix()
            Object.assign(a, { x: vx, w: width, h: height })
        }
    })

    return (
        <>
            <hemisphereLight args={['#DDF0FF', '#F6E3BF', 1.7]} />
            <directionalLight
                position={[-4, 7, 5]}
                intensity={2.1}
                color="#FFF1D6"
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-left={-4}
                shadow-camera-right={4}
                shadow-camera-top={4}
                shadow-camera-bottom={-4}
                shadow-camera-near={1}
                shadow-camera-far={20}
                shadow-bias={-0.0005}
            />
            <directionalLight position={[4, 3, -5]} intensity={1.4} color="#9FD3F5" />

            <group scale={WORLD_SCALE}>
                {/*
                  * 캐릭터 자리: 직접 만든 캐릭터(메시 · GLTF 등)를 이 그룹 안에 넣으면
                  * 메뉴별 위치 · 회전 · 점프 · 첫 로딩 낙하 연출이 그대로 적용된다.
                  * 기준: 발이 y=0, +Z 방향(카메라 쪽)을 바라보고, 높이 약 2.3.
                  * 마우스 위치(-1..1)는 store.pointer로 넘겨 고개 회전 등에 쓸 수 있다.
                  */}
                <group ref={character} />
                <Pedestal store={store} textures={textures} />
                <Effects tab={tab} store={store} hoverSkill={hoverSkill} reduced={reduced} textures={textures} />
                <Particles store={store} texture={textures.sparkle} reduced={reduced} mobile={mobile} />
            </group>
        </>
    )
}

export default function Scene({ tab, intro, hoverSkill, mobile, reduced }) {
    return (
        <Canvas
            flat
            shadows="percentage"
            dpr={[1, mobile ? 1.5 : 2]}
            gl={{ alpha: true, antialias: true }}
            style={{ pointerEvents: 'none' }}
            camera={{ fov: CAMERA.fov, position: CAMERA.intro, near: 0.1, far: 80 }}
        >
            <World tab={tab} intro={intro} hoverSkill={hoverSkill} mobile={mobile} reduced={reduced} />
        </Canvas>
    )
}
