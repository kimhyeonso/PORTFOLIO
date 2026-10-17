'use no memo'
import { useFrame, useLoader } from '@react-three/fiber'
import { Component, Suspense, useEffect, useMemo, useRef } from 'react'
import { AnimationMixer, Box3, MeshStandardMaterial, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { menus, poses, STAGING } from '../../../data/profileStatus.js'
import { POSE_COUNT, POSE_HEIGHT as HEIGHT, poseOffset } from './poseTrack.js'

/*
 * 5가지 포즈 캐릭터 캐러셀. 포즈 순서 · key는 menus와 같다 (포즈 i ↔ 메뉴 i).
 * store.track(실수)이 지금 맨 앞 포즈 번호이고, track과의 거리(원형, -2.5..2.5)로 자리를 정한다.
 *   store.gallery  1 = 갤러리: 커진 받침대 위에 5개가 원형으로 서고, track만큼 받침대째 돈다 (맨 앞 = 지금 포즈)
 *                  0 = 패널: 지금 포즈 하나만 받침대 가운데에 (나머지는 옆으로 빠지며 사라진다)
 * 캐릭터 위치 · 회전 · 낙하 · 점프(store.pos/rot/drop/jump)는 모든 포즈에 같이 적용된다.
 */

// 갤러리 원형 배치 반지름 (장면 단위, WORLD_SCALE 적용 전) — 받침대 크기는 Scene의 GALLERY_PEDESTAL
export const RING_RADIUS = 3.1
// 패널에서 옆 포즈가 빠지는 간격
const SPACING = 2.7
const TAU = Math.PI * 2
// 패널(포즈를 고른 뒤 왼쪽)에서 캐릭터 크기 배율
const PANEL_SCALE = 1.3

/* ───────── 임시 마네킹 (GLB가 없을 때) ───────── */
// [x, y, z] 회전 (라디안). 어깨 · 팔꿈치 · 엉덩이. 왼쪽 = +X (캐릭터는 +Z를 바라본다)
const MANNEQUIN = {
    profile: { shL: [0, 0, 0.12], elL: [0, 0, 0], shR: [0, 0, -2.5], elR: [0, 0, -0.5], hipL: 0.04, hipR: -0.04 },
    skill: { shL: [-1.25, 0, 0.35], elL: [-0.3, 0, 0], shR: [-1.4, 0, -0.25], elR: [-0.3, 0, 0], hipL: 0.1, hipR: -0.1 },
    equipment: { shL: [0, 0, 0.75], elL: [0, 0, -1.9], shR: [0, 0, -0.75], elR: [0, 0, 1.9], hipL: 0.12, hipR: -0.12 },
    stats: { shL: [0, 0, 2.55], elL: [0, 0, 0.2], shR: [0, 0, -2.55], elR: [0, 0, -0.2], hipL: 0.2, hipR: -0.2 },
    contact: { shL: [0, 0, 0.7], elL: [0, 0, -1.9], shR: [-1.5, 0, -0.15], elR: [0, 0, 0], hipL: 0.04, hipR: -0.04 },
}

function Limb({ position, rotation, material, length = 0.46, radius = 0.075, children }) {
    return (
        <group position={position} rotation={rotation}>
            <mesh position={[0, -length / 2, 0]} material={material} castShadow>
                <capsuleGeometry args={[radius, length - radius * 2, 4, 10]} />
            </mesh>
            {children && <group position={[0, -length, 0]}>{children}</group>}
        </group>
    )
}

function Mannequin({ name }) {
    const pose = MANNEQUIN[name] ?? MANNEQUIN.profile
    const mats = useMemo(() => ({
        body: new MeshStandardMaterial({ color: '#F7F0E0', roughness: 0.6 }),
        joint: new MeshStandardMaterial({ color: '#D4AA4F', metalness: 0.4, roughness: 0.4 }),
        gem: new MeshStandardMaterial({ color: STAGING[name]?.accent ?? '#F6C964', emissive: STAGING[name]?.accent ?? '#F6C964', emissiveIntensity: 0.8 }),
    }), [name])
    useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

    return (
        <group>
            {/* 다리 */}
            <Limb position={[0.13, 1.0, 0]} rotation={[0, 0, pose.hipL]} material={mats.body} length={0.98} radius={0.09} />
            <Limb position={[-0.13, 1.0, 0]} rotation={[0, 0, pose.hipR]} material={mats.body} length={0.98} radius={0.09} />
            {/* 몸통 · 골반 · 가슴 보석 */}
            <mesh position={[0, 1.02, 0]} material={mats.joint} castShadow>
                <boxGeometry args={[0.4, 0.12, 0.22]} />
            </mesh>
            <mesh position={[0, 1.42, 0]} material={mats.body} castShadow>
                <capsuleGeometry args={[0.2, 0.42, 4, 12]} />
            </mesh>
            <mesh position={[0, 1.55, 0.19]} rotation={[0, 0, Math.PI / 4]} material={mats.gem}>
                <boxGeometry args={[0.09, 0.09, 0.04]} />
            </mesh>
            {/* 팔 (어깨 → 팔꿈치) */}
            <Limb position={[0.3, 1.74, 0]} rotation={pose.shL} material={mats.body} length={0.42}>
                <mesh material={mats.joint}><sphereGeometry args={[0.07, 10, 8]} /></mesh>
                <Limb position={[0, 0, 0]} rotation={pose.elL} material={mats.body} length={0.4} radius={0.065} />
            </Limb>
            <Limb position={[-0.3, 1.74, 0]} rotation={pose.shR} material={mats.body} length={0.42}>
                <mesh material={mats.joint}><sphereGeometry args={[0.07, 10, 8]} /></mesh>
                <Limb position={[0, 0, 0]} rotation={pose.elR} material={mats.body} length={0.4} radius={0.065} />
            </Limb>
            {/* 머리 */}
            <mesh position={[0, 1.88, 0]} material={mats.joint}>
                <cylinderGeometry args={[0.06, 0.07, 0.1, 10]} />
            </mesh>
            <mesh position={[0, 2.1, 0]} material={mats.body} castShadow>
                <sphereGeometry args={[0.2, 20, 16]} />
            </mesh>
        </group>
    )
}

/* ───────── GLB 포즈 ───────── */
// 캐릭터 밝기: 자기 텍스처 색으로 살짝 스스로 빛나게 하는 정도 (0 = 조명만)
const POSE_GLOW = 0.22

/*
 * GLB 재질을 복제하면서 밝게: AI 생성 모델(Tripo)은 metallicFactor가 비어 있어 기본값 1(금속)이 되고,
 * 반사할 환경이 없는 장면에서는 금속이 어둡게 보인다 → 금속성을 끄고, 텍스처 색으로 약하게 자체 발광시킨다
 */
function brighten(material) {
    const m = material.clone()
    if ('metalness' in m) {
        m.metalness = 0
        m.metalnessMap = null
    }
    if ('emissive' in m) {
        m.emissive.set('#ffffff')
        m.emissiveMap = m.map ?? null
        if (!m.map) m.emissive.copy(m.color)
        m.emissiveIntensity = POSE_GLOW
    }
    m.needsUpdate = true
    return m
}
// 발이 y=0, 가운데 x·z=0, 높이 HEIGHT가 되도록 맞추고, 애니메이션이 있으면 첫 클립을 재생한다
function PoseModel({ url }) {
    const gltf = useLoader(GLTFLoader, url)
    const { scene, scale, offset } = useMemo(() => {
        const root = gltf.scene.clone(true)
        root.traverse((o) => {
            if (!o.isMesh) return
            o.castShadow = true
            o.material = Array.isArray(o.material) ? o.material.map(brighten) : brighten(o.material)
        })
        const box = new Box3().setFromObject(root)
        const size = box.getSize(new Vector3())
        const center = box.getCenter(new Vector3())
        const s = size.y > 0 ? HEIGHT / size.y : 1
        return { scene: root, scale: s, offset: [-center.x * s, -box.min.y * s, -center.z * s] }
    }, [gltf])
    const mixer = useMemo(() => (gltf.animations.length ? new AnimationMixer(scene) : null), [gltf, scene])

    useEffect(() => {
        if (!mixer) return undefined
        mixer.clipAction(gltf.animations[0]).play()
        return () => mixer.stopAllAction()
    }, [mixer, gltf])
    useFrame((_, delta) => mixer?.update(delta))

    return (
        <group position={offset} scale={scale}>
            <primitive object={scene} />
        </group>
    )
}

// GLB를 못 불러오면 마네킹으로 대신한다
class ModelBoundary extends Component {
    state = { failed: false }
    static getDerivedStateFromError() {
        return { failed: true }
    }
    componentDidCatch(error) {
        console.warn('[Profile] 포즈 모델을 불러오지 못해 임시 마네킹을 보여줍니다.', error)
    }
    render() {
        return this.state.failed ? this.props.fallback : this.props.children
    }
}

/* ───────── 포즈 하나: 캐러셀 위치 · 크기 · 투명도 적용 ───────── */
// 이 포즈의 메시 재질 투명도를 alpha에 맞춘다 (클릭 영역 메시는 건너뛴다)
function applyAlpha(root, alpha) {
    const fade = alpha < 0.999
    root.traverse((o) => {
        if (!o.isMesh || o.userData.hit) return
        const list = Array.isArray(o.material) ? o.material : [o.material]
        for (const m of list) {
            if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity
            m.opacity = m.userData.baseOpacity * alpha
            const transparent = fade || m.userData.baseOpacity < 1
            if (m.transparent !== transparent) {
                m.transparent = transparent
                m.needsUpdate = true
            }
        }
    })
}

function Pose({ index, name, store, onClick, onHover, onRegister }) {
    const group = useRef(null)
    // 말풍선 위치 계산용으로 Scene에 이 포즈 그룹을 알린다
    useEffect(() => {
        onRegister(index, group.current)
        return () => onRegister(index, null)
    }, [onRegister, index])
    const lastAlpha = useRef(-1)
    const model = poses[name]?.model
    const mannequin = <Mannequin name={name} />

    useFrame(() => {
        const g = group.current
        const o = poseOffset(index, store.track)
        const d = Math.abs(o)
        const k = store.gallery
        // 패널: 가운데 하나만 · 갤러리: 모두 (뒤쪽은 조금 흐리게)
        const nearAlpha = Math.max(0, 1 - d * 2.2)
        const ringAlpha = 1 - Math.min(d, 2) * 0.12
        const alpha = nearAlpha + (ringAlpha - nearAlpha) * k
        g.visible = alpha > 0.01
        if (!g.visible) return
        // 갤러리 자리: 받침대 둘레 원 위 (o = 0이 카메라 쪽 맨 앞)
        const a = (o / POSE_COUNT) * TAU
        const rx = Math.sin(a) * RING_RADIUS * store.ringScale
        const rz = Math.cos(a) * RING_RADIUS * store.ringScale
        // 받침대 바깥쪽을 본다 → 맨 앞만 정면, 옆은 옆모습, 뒤쪽은 뒷모습 (받침대와 함께 돌면 방향도 같이 돈다)
        const rRot = a
        // 패널 자리: 받침대 가운데 (옆 포즈는 옆으로 빠진다)
        const px = store.pos.x + o * SPACING
        const pz = store.pos.z
        const pRot = -o * 0.35
        g.position.set(px + (rx - px) * k, store.drop + store.jump, pz + (rz - pz) * k)
        // 패널에서는 사용자가 드래그로 돌린 각도(store.userRot)를 더한다
        g.rotation.y = store.rot + pRot + (rRot - pRot) * k + store.userRot * (1 - k)
        // 패널: 캐릭터를 PANEL_SCALE배로 · 갤러리: 원래 크기 (뒤쪽은 조금 작게)
        const ringScale = 1 - Math.min(d, 2) * 0.05
        g.scale.setScalar(PANEL_SCALE + (ringScale - PANEL_SCALE) * k)
        if (Math.abs(alpha - lastAlpha.current) > 0.002) {
            applyAlpha(g, alpha)
            lastAlpha.current = alpha
        }
    })

    return (
        <group ref={group}>
            {model ? (
                <ModelBoundary fallback={mannequin}>
                    <Suspense fallback={mannequin}>
                        <PoseModel url={model} />
                    </Suspense>
                </ModelBoundary>
            ) : mannequin}
            {/* 클릭 영역 (보이지 않는 상자) */}
            <mesh
                position={[0, HEIGHT / 2, 0]}
                userData={{ hit: true }}
                onClick={(e) => { if (group.current.visible) onClick(e, index) }}
                onPointerOver={() => {
                    if (!group.current.visible) return
                    // 갤러리: 클릭해 열기 · 패널: 드래그로 돌리기
                    document.body.style.cursor = store.gallery > 0.5 ? 'pointer' : 'grab'
                    onHover(index, true)
                }}
                onPointerOut={() => {
                    document.body.style.cursor = ''
                    onHover(index, false)
                }}
            >
                <boxGeometry args={[1.3, HEIGHT + 0.2, 0.9]} />
                <meshBasicMaterial visible={false} />
            </mesh>
        </group>
    )
}

export default function Poses({ store, onClick, onHover, onRegister }) {
    useEffect(() => () => { document.body.style.cursor = '' }, [])
    return menus.map((menu, i) => <Pose key={menu.key} index={i} name={menu.key} store={store} onClick={onClick} onHover={onHover} onRegister={onRegister} />)
}
