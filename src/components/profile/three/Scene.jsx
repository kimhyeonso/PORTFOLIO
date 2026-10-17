'use no memo'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Color, CylinderGeometry, DoubleSide, EdgesGeometry, getConsoleFunction, LineBasicMaterial, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PMREMGenerator, setConsoleFunction, Vector3 } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { CAMERA, INTRO_STAGE, menus, STAGING } from '../../../data/profileStatus.js'
import Effects, { FLOOR_Y } from './Effects.jsx'
import { nearestTrack, POSE_HEIGHT, poseOffset, trackIndex } from './poseTrack.js'
import Poses from './Poses.jsx'
import { createBeamTexture, createFloorTexture, createGlowTexture, createHudTexture, createSparkleTexture } from './textures.js'

/*
 * PROFILE 3D 장면: 캐릭터 · 받침대 · 바닥 · 파티클 · 메뉴별 이펙트.
 * 배경은 투명(CSS 하늘이 보인다). GSAP이 캐릭터 위치/회전, 카메라, accent 색, 파티클 burst를 모두 트윈하고
 * 매 프레임 그 값을 장면에 적용한다.
 *   tab         지금 메뉴 key (STAGING key)
 *   hoverSkill  스킬 카드 hover/focus 중인 번호 (없으면 null)
 *   mobile      ≤ 900px (회전 · 이동 축소, 패럴랙스 끔, viewOffset 해제)
 *   reduced     prefers-reduced-motion
 *   intro       처음 진입 = 포즈 갤러리 (5가지 포즈를 드래그 · 휠로 넘기고, 클릭하면 onPick(key) → 패널)
 *   onControls  갤러리 조작 함수를 넘겨 준다 ({ step(n), pick(i), pickCurrent() } · 갤러리가 아니면 null, 키보드 · 버튼용)
 *   onIndex     갤러리 가운데 포즈 번호가 바뀔 때 (i)
 *   onHover     갤러리에서 포인터가 올라간 포즈 번호 (없으면 null)
 *   onSettle    갤러리 맨 앞 포즈가 가운데에 멈췄는지 (true / false, 바뀔 때만)
 *   bubble      { index, place(x, y) } 말풍선을 띄울 포즈 번호 — 매 프레임 그 캐릭터 머리 위 화면 좌표로 place를 부른다
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
// 포즈 갤러리에서 받침대를 키우는 배율 (가로 · 세로만, 높이는 그대로) — 5개 포즈가 둘레에 선다 (Poses의 RING_RADIUS)
// 테두리가 배경 바닥의 금색 원에 맞는 크기 (INTRO_STAGE 카메라와 함께 맞춘 값)
const GALLERY_PEDESTAL = 4.4
// 배경 이미지(Profile.png 1672×941) 가로세로 비율
const BG_ASPECT = 1672 / 941
// 갤러리에서 3D 장면(받침대 · 캐릭터)을 화면 위로 올리는 비율 (화면 높이 대비)
const GALLERY_RAISE = 0.09
// 패널(왼쪽 캐릭터 · 오른쪽 정보)에서 3D 장면을 화면 아래로 내리는 비율 (화면 높이 대비)
const PANEL_LOWER = 0.06
// hover 말풍선을 띄우는 범위: 맨 앞에서 이 거리(포즈 칸) 안쪽 = 앞쪽 3개
const BUBBLE_RANGE = 1.5
// 모바일 갤러리: 원형 배치 · 받침대 배율, 이 화면 비율(가로/세로)보다 좁으면 카메라를 뒤로 빼 가로에 맞춘다
const GALLERY_RING_MOBILE = 0.75
const GALLERY_FIT_ASPECT = 0.7
// 모바일 갤러리: 3D 장면을 화면 위로 올리는 비율 (아래 대화창 · 챗봇 자리를 비운다)
const GALLERY_RAISE_MOBILE = 0.06
// 말풍선 위치 계산용 임시 벡터
const HEAD = new Vector3()

// intro: 처음부터 포즈 갤러리로 시작하면 반투명 원형 받침대 · 5개 포즈 배치 상태로 바로 그린다
function createStore(intro, mobile) {
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
        // 패널에서 드래그로 돌린 캐릭터 회전 (메뉴가 바뀌면 0으로 돌아간다)
        userRot: 0,
        // 포즈 캐러셀: 가운데 포즈 번호(실수) · 갤러리 정도(1 갤러리 → 0 패널)
        track: 0,
        gallery: intro ? 1 : 0,
        // 갤러리 원형 배치 · 받침대 크기 배율 (모바일 세로 화면은 좁아서 줄인다)
        ringScale: mobile ? GALLERY_RING_MOBILE : 1,
    }
}

/*
 * 반투명 유리 재질. 배경이 CSS 이미지라 굴절(transmission)로는 비치지 않으므로,
 * 배경 색(크림 · 하늘색)으로 물들인 반투명 + 유리 반사(환경맵 · 클리어코트) + 밝은 모서리 선으로 유리처럼 보이게 한다.
 */
function glass(envMap, options) {
    return new MeshPhysicalMaterial({
        roughness: 0.1,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        ior: 1.5,
        envMap,
        envMapIntensity: 1.4,
        transparent: true,
        depthWrite: false,
        ...options,
    })
}

// 유리 원기둥 + 모서리 빛 선 (args는 cylinderGeometry와 같다)
function GlassTier({ args, position, material, edge }) {
    const key = args.join(',')
    const geometry = useMemo(() => new CylinderGeometry(...key.split(',').map(Number)), [key])
    const edges = useMemo(() => new EdgesGeometry(geometry, 20), [geometry])
    useEffect(() => () => {
        geometry.dispose()
        edges.dispose()
    }, [geometry, edges])
    return (
        <group position={position}>
            <mesh geometry={geometry} material={material} receiveShadow renderOrder={1} />
            <lineSegments geometry={edges} material={edge} renderOrder={2} />
        </group>
    )
}

/* 받침대: 팔각 2단 유리 + 금색 림 + 발광 유리 상판 + 회전 링 + 유리 룬 블록 8개 + 바닥 + 가짜 반사 글로우 + 충격파 */
function Pedestal({ store, textures }) {
    const gl = useThree((state) => state.gl)
    // 유리 반사용 환경맵 (받침대 재질에만 쓴다)
    const envMap = useMemo(() => {
        const pmrem = new PMREMGenerator(gl)
        const room = new RoomEnvironment()
        const texture = pmrem.fromScene(room, 0.04).texture
        room.dispose?.()
        pmrem.dispose()
        return texture
    }, [gl])
    const mats = useMemo(() => ({
        // 배경 하늘색 · 크림색 유리 (팔각은 면이 보이게 flatShading)
        glassSky: glass(envMap, { color: '#CFE8F6', opacity: 0.4, flatShading: true }),
        glassCream: glass(envMap, { color: '#F4E9D6', opacity: 0.5, flatShading: true }),
        glassSkyRound: glass(envMap, { color: '#B9DDF2', emissive: '#9FD3F5', emissiveIntensity: 0.12, opacity: 0.58 }),
        glassCreamRound: glass(envMap, { color: '#FBF5EA', emissive: '#FFF6E2', emissiveIntensity: 0.1, opacity: 0.72, roughness: 0.04 }),
        gold: new MeshStandardMaterial({ color: '#D4AA4F', metalness: 0.45, roughness: 0.38, flatShading: true }),
        rune: glass(envMap, { color: '#F2DA92', emissive: '#C9A24A', emissiveIntensity: 0.45, opacity: 0.75, flatShading: true }),
        top: glass(envMap, { color: '#FBF7EC', emissive: STAGING.profile.accent, emissiveIntensity: 0.35, opacity: 0.6, roughness: 0.04, flatShading: true }),
        ring: new MeshBasicMaterial({ color: STAGING.profile.accent, transparent: true, opacity: 0.85, side: DoubleSide, depthWrite: false }),
        glow: new MeshBasicMaterial({ map: textures.glow, color: STAGING.profile.accent, transparent: true, opacity: 0.75, depthWrite: false }),
        // 유리 모서리 빛 선
        edge: new LineBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.8, depthWrite: false }),
        edgeGold: new LineBasicMaterial({ color: '#EBCB76', transparent: true, opacity: 0.85, depthWrite: false }),
    }), [textures, envMap])
    useEffect(() => () => {
        Object.values(mats).forEach((m) => m.dispose())
        envMap.dispose()
    }, [mats, envMap])
    const root = useRef(null)
    const galleryBase = useRef(null)
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
        // 갤러리: 받침대가 커지고, 포즈와 함께 track만큼 돈다
        const k = store.gallery
        root.current.visible = k < 0.999
        root.current.scale.setScalar(Math.max(0.001, 1 - k))
        galleryBase.current.visible = k > 0.001
        const rs = store.ringScale
        galleryBase.current.scale.set(Math.max(0.001, k * rs), Math.max(0.001, k), Math.max(0.001, k * rs))
        galleryBase.current.rotation.y = -(store.track / menus.length) * TAU
        ring.current.rotation.z += delta * 0.35
        runes.current.rotation.y -= delta * 0.12
        // 충격파 링: 상판에서 퍼져 나간다
        const sh = store.shock
        shock.current.visible = sh > 0.001 && sh < 0.999
        shock.current.scale.setScalar(1 + sh * 1.6)
        shockMat.current.opacity = 0.9 * (1 - sh)
    })

    return (
        <group>
            {/* 갤러리: 낮은 원형 전시대. 상판 y=0은 캐릭터의 발 기준과 같다. */}
            <group ref={galleryBase} visible={false}>
                {/* 하늘색 유리 몸통 + 크림색 유리 상판 + 금빛 테두리 */}
                <GlassTier args={[GALLERY_PEDESTAL, GALLERY_PEDESTAL + 0.08, 0.4, 128]} position={[0, -0.22, 0]} material={mats.glassSkyRound} edge={mats.edge} />
                <GlassTier args={[GALLERY_PEDESTAL - 0.04, GALLERY_PEDESTAL - 0.04, 0.03, 128]} position={[0, -0.015, 0]} material={mats.glassCreamRound} edge={mats.edge} />
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} material={mats.gold}>
                    <ringGeometry args={[GALLERY_PEDESTAL - 0.06, GALLERY_PEDESTAL, 128]} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
                    <circleGeometry args={[GALLERY_PEDESTAL - 0.08, 128]} />
                    <meshBasicMaterial map={textures.floor} transparent opacity={0.22} depthWrite={false} />
                </mesh>
            </group>
            <group ref={root}>
            {/* 팔각 2단 유리 + 금색 림 */}
            <GlassTier args={[1.72, 1.82, 0.3, 8]} position={[0, -0.47, 0]} material={mats.glassSky} edge={mats.edge} />
            <mesh position={[0, -0.315, 0]} material={mats.gold} receiveShadow>
                <cylinderGeometry args={[1.62, 1.72, 0.04, 8]} />
            </mesh>
            <GlassTier args={[1.42, 1.5, 0.26, 8]} position={[0, -0.17, 0]} material={mats.glassCream} edge={mats.edge} />
            <mesh position={[0, -0.03, 0]} material={mats.gold} receiveShadow>
                <cylinderGeometry args={[1.46, 1.44, 0.03, 8]} />
            </mesh>
            {/* 발광 유리 상판 */}
            <GlassTier args={[1.22, 1.22, 0.02, 8]} position={[0, -0.01, 0]} material={mats.top} edge={mats.edgeGold} />
            {/* 회전 팔각 링 */}
            <mesh ref={ring} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.ring}>
                <ringGeometry args={[1.28, 1.36, 8]} />
            </mesh>
            {/* 둘레의 금빛 유리 룬 블록 8개 */}
            <group ref={runes} position={[0, -0.2, 0]}>
                {Array.from({ length: 8 }, (_, i) => {
                    const a = (i / 8) * TAU + TAU / 16
                    return (
                        <mesh key={i} position={[Math.sin(a) * 1.64, 0, Math.cos(a) * 1.64]} rotation={[0, a, 0]} material={mats.rune} renderOrder={1}>
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
function World({ tab, intro, hoverSkill, mobile, reduced, onControls, onPick, onIndex, onHover, onSettle, bubble }) {
    const [store] = useState(() => createStore(intro, mobile))
    const textures = useMemo(() => ({
        sparkle: createSparkleTexture(),
        glow: createGlowTexture(),
        floor: createFloorTexture(),
        beam: createBeamTexture(),
        hud: createHudTexture(),
    }), [])
    const gl = useThree((state) => state.gl)
    const trackTween = useRef(null)
    const lastIndex = useRef(-1)
    const introRef = useRef(intro)
    const apiRef = useRef(null)
    const handlers = useRef({ onPick, onIndex, onControls, onHover, onSettle, bubble })
    // 갤러리 드래그 중인지 · 마지막으로 알린 '맨 앞 포즈가 가운데에 멈춤' 상태
    const draggingRef = useRef(false)
    const settledRef = useRef(null)
    // 포인터가 올라간 포즈 · 지금 말풍선을 띄운 포즈 (앞쪽 3개일 때만 띄운다)
    const hoverRef = useRef(null)
    const shownHover = useRef(null)
    // 포즈 그룹 (말풍선 위치 계산용)
    const poseGroups = useRef([])
    const registerPose = useCallback((i, group) => { poseGroups.current[i] = group }, [])
    useEffect(() => {
        introRef.current = intro
        handlers.current = { onPick, onIndex, onControls, onHover, onSettle, bubble }
    })

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

    // 포즈 갤러리 조작: 드래그 · 휠로 track을 움직이고, 손을 떼면 움직인 방향의 포즈로 붙는다
    useEffect(() => {
        if (!intro) return undefined
        const d = reduced ? 0.01 : 1
        const goTo = (target, duration = 0.7, ease = 'power3.out') => {
            trackTween.current?.kill()
            trackTween.current = gsap.to(store, { track: target, duration: duration * d, ease })
        }
        // 움직인 방향(dir)으로 조금만 넘겨도 다음 포즈로
        const snap = (dir) => {
            const t = store.track
            goTo(dir > 0 ? Math.ceil(t - 0.2) : dir < 0 ? Math.floor(t + 0.2) : Math.round(t))
        }
        const pick = (i) => {
            goTo(nearestTrack(i, store.track))
            handlers.current.onPick?.(menus[i].key)
        }
        const api = {
            step: (n) => goTo(Math.round(store.track) + n),
            pick,
            pickCurrent: () => pick(trackIndex(store.track)),
        }
        apiRef.current = api
        handlers.current.onControls?.(api)

        const el = gl.domElement
        let drag = null
        const onDown = (e) => {
            if (e.button !== 0) return
            trackTween.current?.kill()
            drag = { x: e.clientX, track: store.track, dir: 0 }
            draggingRef.current = true
            el.style.cursor = 'grabbing'
        }
        const onMove = (e) => {
            if (!drag) return
            // 한 칸 넘기는 드래그 거리: PC는 화면 폭의 17%, 모바일(좁은 화면)은 40%
            const next = drag.track - (e.clientX - drag.x) / (window.innerWidth * (mobile ? 0.4 : 0.17))
            if (next !== store.track) drag.dir = Math.sign(next - store.track)
            store.track = next
        }
        const onUp = () => {
            if (!drag) return
            snap(Math.abs(store.track - drag.track) < 0.02 ? 0 : drag.dir)
            drag = null
            draggingRef.current = false
            el.style.cursor = ''
        }
        // 휠 · 트랙패드: 움직이는 동안 따라가다 잠시 멈추면 방향대로 붙는다
        let wheelTarget = null
        let wheelDir = 0
        let wheelTimer = 0
        const onWheel = (e) => {
            if (drag) return
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
            if (!delta) return
            const unit = e.deltaMode === 1 ? 40 : 1
            if (wheelTarget === null) wheelTarget = store.track
            wheelTarget += Math.max(-120, Math.min(120, delta * unit)) * 0.004
            wheelDir = Math.sign(delta)
            goTo(wheelTarget, 0.4, 'power2.out')
            clearTimeout(wheelTimer)
            wheelTimer = setTimeout(() => {
                wheelTarget = null
                snap(wheelDir)
            }, 160)
        }
        el.addEventListener('pointerdown', onDown)
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onUp)
        window.addEventListener('wheel', onWheel, { passive: true })
        return () => {
            clearTimeout(wheelTimer)
            el.style.cursor = ''
            el.removeEventListener('pointerdown', onDown)
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
            window.removeEventListener('pointercancel', onUp)
            window.removeEventListener('wheel', onWheel)
            apiRef.current = null
            handlers.current.onControls?.(null)
        }
    }, [intro, reduced, mobile, store, gl])

    useEffect(() => () => trackTween.current?.kill(), [])

    // 패널: 캐릭터를 좌우로 드래그하면 360° 돌린다 (놓으면 조금 더 돌다 멈춘다)
    useEffect(() => {
        if (intro) return undefined
        const el = gl.domElement
        let drag = null
        let spin = null
        const onDown = (e) => {
            if (e.button !== 0) return
            spin?.kill()
            drag = { x: e.clientX, rot: store.userRot, last: e.clientX, time: performance.now(), vel: 0 }
            el.style.cursor = 'grabbing'
        }
        const onMove = (e) => {
            if (!drag) return
            const now = performance.now()
            // 화면 가로 약 600px 드래그 = 한 바퀴
            store.userRot = drag.rot + (e.clientX - drag.x) * 0.0105
            drag.vel = ((e.clientX - drag.last) * 0.0105) / Math.max(now - drag.time, 1)
            drag.last = e.clientX
            drag.time = now
        }
        const onUp = () => {
            if (!drag) return
            if (!reduced && performance.now() - drag.time < 80) {
                spin = gsap.to(store, { userRot: store.userRot + drag.vel * 260, duration: 0.9, ease: 'power3.out' })
            }
            drag = null
            el.style.cursor = ''
        }
        el.addEventListener('pointerdown', onDown)
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onUp)
        return () => {
            spin?.kill()
            el.style.cursor = ''
            el.removeEventListener('pointerdown', onDown)
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
            window.removeEventListener('pointercancel', onUp)
        }
    }, [intro, reduced, store, gl])

    // 포즈 클릭: 드래그였으면 무시, 아니면 그 포즈를 가운데로 + 패널 열기
    const onPoseHover = (i, on) => {
        if (!introRef.current) return
        if (on) hoverRef.current = i
        else if (hoverRef.current === i) hoverRef.current = null
    }

    // 갤러리가 끝나면 hover 해제
    useEffect(() => {
        if (intro) return
        hoverRef.current = null
        shownHover.current = null
        handlers.current.onHover?.(null)
    }, [intro])

    const onPoseClick = (e, i) => {
        if (!introRef.current || e.delta > 6) return
        e.stopPropagation()
        apiRef.current?.pick(i)
    }

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
        // 드래그로 돌려 둔 각도는 가장 가까운 방향으로 0까지 되돌린다
        tl.fromTo(store, { userRot: ((((store.userRot + Math.PI) % TAU) + TAU) % TAU) - Math.PI }, { userRot: 0, duration: 0.9 * d, ease: 'power2.inOut' }, 0)
        // 갤러리: 옆 포즈가 보인다 / 패널: 메뉴에 맞는 포즈 하나만 가운데로
        tl.to(store, { gallery: intro ? 1 : 0, duration: (intro ? 1 : 0.6) * d, ease: 'power2.inOut' }, 0)
        tl.set(store, { ringScale: mobile ? GALLERY_RING_MOBILE : 1 }, 0)
        if (!intro) {
            trackTween.current?.kill()
            const index = menus.findIndex((m) => m.key === tab)
            tl.to(store, { track: nearestTrack(index, store.track), duration: 1.1 * d, ease: 'power3.inOut' }, 0)
        }
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
        // 가운데 포즈가 바뀌면 알리고, 갤러리에서는 받침대 색도 그 포즈 색으로
        const index = trackIndex(store.track)
        if (index !== lastIndex.current) {
            lastIndex.current = index
            handlers.current.onIndex?.(index)
            if (introRef.current) {
                const [r, g, b] = new Color(STAGING[menus[index].key].accent).toArray()
                gsap.to(store.accent, { r, g, b, duration: 0.6, overwrite: true })
            }
        }
        // 갤러리에서는 받침대가 배경 바닥 원에 붙어 있어야 하므로 패럴랙스 · 호흡을 끈다
        const still = mobile || reduced
        const sway = 1 - store.gallery
        const px = still ? 0 : store.pointer.x * 0.22 * sway
        const py = still ? 0 : store.pointer.y * 0.12 * sway
        const breath = reduced ? 0 : Math.sin(t * 0.7) * 0.03 * sway
        // 갤러리: 화면이 좁으면(세로 모바일) 원형 배치가 가로에 들어오도록 카메라를 look 지점에서 뒤로 뺀다
        const fit = 1 + (Math.max(1, GALLERY_FIT_ASPECT / (state.size.width / state.size.height)) - 1) * store.gallery
        const lb = store.lookBase
        state.camera.position.set(
            lb.x + (store.camBase.x + px - lb.x) * fit,
            lb.y + (store.camBase.y + py + breath - lb.y) * fit,
            lb.z + (store.camBase.z - lb.z) * fit,
        )
        state.camera.lookAt(lb)
        // 맨 앞 포즈가 가운데에 멈췄는지 (드래그 · 회전 · 첫 낙하 중이 아닐 때) — 모바일은 이때 말풍선을 띄운다
        const settled = introRef.current && !draggingRef.current && store.drop < 0.01 && Math.abs(store.track - Math.round(store.track)) < 0.01
        if (settled !== settledRef.current) {
            settledRef.current = settled
            handlers.current.onSettle?.(settled)
        }
        // hover 말풍선은 앞쪽 3개(맨 앞 · 양옆)만. 드래그로 뒤로 돌아가면 거두고, 앞으로 오면 다시 띄운다
        const h = hoverRef.current
        const front = h !== null && introRef.current && Math.abs(poseOffset(h, store.track)) < BUBBLE_RANGE ? h : null
        if (front !== shownHover.current) {
            shownHover.current = front
            handlers.current.onHover?.(front)
        }
        // 말풍선: 그 포즈 머리 위의 화면 위치 (투영은 지난 프레임 행렬 기준이라 한 프레임 늦어도 눈에 띄지 않는다)
        const b = handlers.current.bubble
        const g = b && b.index !== null ? poseGroups.current[b.index] : null
        if (g) {
            const head = g.localToWorld(HEAD.set(0, POSE_HEIGHT + 0.05, 0)).project(state.camera)
            b.place(((head.x + 1) / 2) * state.size.width, ((1 - head.y) / 2) * state.size.height)
        }
        // viewOffset
        const vx = mobile ? 0 : store.viewX
        const { width, height } = state.size
        // 배경(cover)이 화면보다 좁은 비율이면 가로에 맞춰 커지므로, 갤러리에서는 같은 배율로 확대해 바닥 원과 맞춘다
        const zoom = 1 + (Math.max(1, width / height / BG_ASPECT) - 1) * store.gallery
        // 갤러리: 받침대 · 캐릭터를 화면 위로 올리고, 패널: 왼쪽 위 글과 띄우도록 조금 내린다 (원근은 그대로, 화면만 옮긴다)
        const vy = mobile ? GALLERY_RAISE_MOBILE * store.gallery : GALLERY_RAISE * store.gallery - PANEL_LOWER * (1 - store.gallery)
        const a = applied.current
        if (vx !== a.x || vy !== a.y || width !== a.w || height !== a.h || zoom !== a.zoom) {
            if (vx === 0 && vy === 0) state.camera.clearViewOffset()
            else state.camera.setViewOffset(width, height, width * vx, height * vy, width, height)
            state.camera.zoom = zoom
            state.camera.updateProjectionMatrix()
            Object.assign(a, { x: vx, y: vy, w: width, h: height, zoom })
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
                {/* 5가지 포즈 캐릭터 (모델 경로는 profileStatus.js의 poses) */}
                <Poses store={store} onClick={onPoseClick} onHover={onPoseHover} onRegister={registerPose} />
                <Pedestal store={store} textures={textures} />
                <Effects tab={intro ? null : tab} store={store} hoverSkill={hoverSkill} reduced={reduced} textures={textures} />
                <Particles store={store} texture={textures.sparkle} reduced={reduced} mobile={mobile} />
            </group>
        </>
    )
}

export default function Scene({ tab, intro, hoverSkill, mobile, reduced, onControls, onPick, onIndex, onHover, onSettle, bubble }) {
    return (
        <Canvas
            flat
            shadows="percentage"
            dpr={[1, mobile ? 1.5 : 2]}
            // 모바일 패널에서는 3D를 숨기므로(CSS) 그리지 않는다
            frameloop={mobile && !intro ? 'never' : 'always'}
            gl={{ alpha: true, antialias: true }}
            // 갤러리: 드래그 · 휠 · 클릭 / 패널: 캐릭터 드래그 회전 (모바일은 세로 스크롤을 막지 않는다)
            style={{ pointerEvents: 'auto', touchAction: intro ? 'none' : 'pan-y' }}
            camera={{ fov: CAMERA.fov, position: CAMERA.intro, near: 0.1, far: 80 }}
        >
            <World tab={tab} intro={intro} hoverSkill={hoverSkill} mobile={mobile} reduced={reduced} onControls={onControls} onPick={onPick} onIndex={onIndex} onHover={onHover} onSettle={onSettle} bubble={bubble} />
        </Canvas>
    )
}
