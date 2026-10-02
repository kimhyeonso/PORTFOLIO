'use no memo'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useMemo, useRef } from 'react'
import { DoubleSide, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { equipment, skills, stats } from '../../../data/profileStatus.js'
import { HUD_NODE_RADIUS } from './textures.js'

/*
 * 메뉴별 3D 이펙트 5종. 각자 active일 때 0..1 visibility를 GSAP(back.out)으로 올리고,
 * 비활성이 되면 0.45초에 사라진다. visibility가 0이면 visible = false로 그리지 않는다.
 * 이펙트 묶음 전체는 캐릭터 위치를 lerp로 따라간다.
 */

export const FLOOR_Y = -0.62
const TAU = Math.PI * 2

// count개의 visibility 값을 stagger 간격으로 올리고 내린다
// (값 배열이 든 ref를 돌려주고, 읽기는 useFrame 안에서만 한다)
function useVisibility(active, reduced, count = 1, stagger = 0) {
    const values = useRef(null)
    useEffect(() => {
        if (!values.current) values.current = Array.from({ length: count }, () => ({ v: 0 }))
        const tween = gsap.to(values.current, active
            ? { v: 1, duration: reduced ? 0.01 : 0.9, ease: 'back.out(1.7)', stagger: reduced ? 0 : stagger, delay: reduced ? 0 : 0.35 }
            : { v: 0, duration: reduced ? 0.01 : 0.45, ease: 'power2.in' })
        return () => tween.kill()
    }, [active, reduced, count, stagger])
    return values
}

// visibility 값 (effect가 돌기 전 첫 프레임은 0)
const visAt = (vis, i = 0) => vis.current?.[i].v ?? 0

const clamp01 = (v) => Math.min(Math.max(v, 0), 1)

/* PROFILE: 받침대에서 올라오는 accent 색 빛기둥 + 위로 올라가는 링 */
function ProfileBeam({ active, reduced, store, textures }) {
    const vis = useVisibility(active, reduced)
    const root = useRef(null)
    const beamMat = useRef(null)
    const rings = useRef([])
    const ringMats = useRef([])

    useFrame(({ clock }) => {
        const v = visAt(vis)
        root.current.visible = v > 0.002
        if (!root.current.visible) return
        const t = clock.elapsedTime
        root.current.scale.set(1, Math.max(v, 0.001), 1)
        beamMat.current.color.copy(store.accent)
        beamMat.current.opacity = 0.42 * clamp01(v)
        rings.current.forEach((ring, i) => {
            const p = (t * (reduced ? 0.1 : 0.32) + i / 3) % 1
            ring.position.y = 0.08 + p * 3.1
            ring.scale.setScalar(1.05 - p * 0.3)
            ringMats.current[i].color.copy(store.accent)
            ringMats.current[i].opacity = clamp01(v) * (1 - p) * 0.75
        })
    })

    return (
        <group ref={root} visible={false}>
            <mesh position={[0, 1.6, 0]}>
                <cylinderGeometry args={[0.95, 1.15, 3.2, 32, 1, true]} />
                <meshBasicMaterial ref={beamMat} map={textures.beam} transparent depthWrite={false} side={DoubleSide} />
            </mesh>
            {[0, 1, 2].map((i) => (
                <mesh key={i} ref={(el) => { rings.current[i] = el }} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.0, 1.07, 8]} />
                    <meshBasicMaterial ref={(el) => { ringMats.current[i] = el }} transparent depthWrite={false} side={DoubleSide} />
                </mesh>
            ))}
        </group>
    )
}

/* SKILL: 스킬 색 발광 오브 4개가 캐릭터 주위를 공전. 스킬 카드 hover 시 해당 오브가 1.7배 */
function SkillOrbs({ active, reduced, hoverSkill, textures }) {
    const vis = useVisibility(active, reduced)
    const root = useRef(null)
    const orbs = useRef([])
    const rings = useRef([])
    const hoverScale = useRef(skills.map(() => 1))
    const materials = useMemo(() => skills.map((s) => new MeshStandardMaterial({ color: s.color, emissive: s.color, emissiveIntensity: 0.9, flatShading: true })), [])
    const ringMat = useMemo(() => new MeshStandardMaterial({ color: '#D4AA4F', metalness: 0.4, roughness: 0.4, flatShading: true }), [])

    useFrame(({ clock }, delta) => {
        const v = visAt(vis)
        root.current.visible = v > 0.002
        if (!root.current.visible) return
        const t = clock.elapsedTime
        const k = 1 - Math.exp(-delta * 9)
        orbs.current.forEach((orb, i) => {
            const a = t * (reduced ? 0.12 : 0.45) + (i / skills.length) * TAU
            orb.position.set(Math.cos(a) * 1.35, 1.1 + (i % 2) * 0.5 + Math.sin(t * 1.5 + i) * 0.08, Math.sin(a) * 1.35)
            const target = hoverSkill === i ? 1.7 : 1
            hoverScale.current[i] += (target - hoverScale.current[i]) * k
            orb.scale.setScalar(Math.max(v, 0.001) * hoverScale.current[i])
            rings.current[i].rotation.x = t * 0.9 + i
            rings.current[i].rotation.y = t * 0.6
        })
    })

    return (
        <group ref={root} visible={false}>
            {skills.map((s, i) => (
                <group key={s.no} ref={(el) => { orbs.current[i] = el }}>
                    <mesh material={materials[i]} castShadow>
                        <octahedronGeometry args={[0.12, 0]} />
                    </mesh>
                    <sprite scale={[0.62, 0.62, 0.62]}>
                        <spriteMaterial map={textures.glow} color={s.color} transparent opacity={0.85} depthWrite={false} />
                    </sprite>
                    <mesh ref={(el) => { rings.current[i] = el }} material={ringMat}>
                        <torusGeometry args={[0.2, 0.014, 4, 8]} />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

/* EQUIPMENT: 금색 프레임 장비 슬롯 8개가 원형으로 천천히 회전. 짝수 슬롯에 장비 카테고리 색 보석(카테고리 수만큼 돌려 쓴다). 순차적으로 튀어나온다 */
const SLOT_COUNT = 8
function EquipSlots({ active, reduced }) {
    const vis = useVisibility(active, reduced, SLOT_COUNT, 0.07)
    const root = useRef(null)
    const ring = useRef(null)
    const slots = useRef([])
    const gems = useRef([])
    const frameMat = useMemo(() => new MeshStandardMaterial({ color: '#D4AA4F', metalness: 0.4, roughness: 0.4, flatShading: true }), [])
    const panelMat = useMemo(() => new MeshBasicMaterial({ color: '#FBF7EC', transparent: true, opacity: 0.55, side: DoubleSide, depthWrite: false }), [])
    const gemMats = useMemo(() => equipment.map((g) => new MeshStandardMaterial({ color: g.color, emissive: g.color, emissiveIntensity: 0.7, flatShading: true })), [])

    useFrame((_, delta) => {
        root.current.visible = !!vis.current?.some((s) => s.v > 0.002)
        if (!root.current.visible) return
        ring.current.rotation.y += delta * (reduced ? 0.05 : 0.22)
        slots.current.forEach((slot, i) => slot.scale.setScalar(Math.max(visAt(vis, i), 0.001)))
        gems.current.forEach((gem) => { if (gem) gem.rotation.y += delta * 1.4 })
    })

    return (
        <group ref={root} visible={false}>
            <group ref={ring} position={[0, 1.15, 0]}>
                {Array.from({ length: SLOT_COUNT }, (_, i) => {
                    const a = (i / SLOT_COUNT) * TAU
                    return (
                        <group key={i} position={[Math.sin(a) * 1.75, Math.sin(i * 1.7) * 0.12, Math.cos(a) * 1.75]} rotation={[0, a, 0]}>
                            <group ref={(el) => { slots.current[i] = el }}>
                                <mesh material={panelMat}><planeGeometry args={[0.3, 0.3]} /></mesh>
                                <mesh position={[0, 0.17, 0]} material={frameMat} castShadow><boxGeometry args={[0.38, 0.04, 0.04]} /></mesh>
                                <mesh position={[0, -0.17, 0]} material={frameMat} castShadow><boxGeometry args={[0.38, 0.04, 0.04]} /></mesh>
                                <mesh position={[0.17, 0, 0]} material={frameMat} castShadow><boxGeometry args={[0.04, 0.3, 0.04]} /></mesh>
                                <mesh position={[-0.17, 0, 0]} material={frameMat} castShadow><boxGeometry args={[0.04, 0.3, 0.04]} /></mesh>
                                {i % 2 === 0 && (
                                    <mesh ref={(el) => { gems.current[i / 2] = el }} material={gemMats[(i / 2) % gemMats.length]} position={[0, 0, 0.03]}>
                                        <octahedronGeometry args={[0.08, 0]} />
                                    </mesh>
                                )}
                            </group>
                        </group>
                    )
                })}
            </group>
        </group>
    )
}

/* STATS: 바닥에 회전하는 금색 원형 HUD + 각 노드에서 능력치 값에 비례하는 빛기둥 */
const HUD_SIZE = 6
const PILLAR_MAX = 2.4
function StatsHud({ active, reduced, textures }) {
    // [0] HUD 바닥, [1..] 기둥
    const vis = useVisibility(active, reduced, stats.length + 1, 0.08)
    const root = useRef(null)
    const spin = useRef(null)
    const hudMat = useRef(null)
    const pillars = useRef([])
    const tops = useRef([])
    const pillarMat = useMemo(() => new MeshStandardMaterial({ color: '#F2C86A', emissive: '#E3955A', emissiveIntensity: 0.55, transparent: true, opacity: 0.82, flatShading: true }), [])
    const nodes = useMemo(() => stats.map((_, i) => {
        const a = (i / stats.length) * TAU - Math.PI / 2
        const r = HUD_NODE_RADIUS * HUD_SIZE
        return [Math.cos(a) * r, Math.sin(a) * r]
    }), [])

    useFrame((_, delta) => {
        root.current.visible = !!vis.current?.some((s) => s.v > 0.002)
        if (!root.current.visible) return
        spin.current.rotation.y += delta * (reduced ? 0.03 : 0.14)
        const hv = visAt(vis)
        hudMat.current.opacity = clamp01(hv)
        spin.current.scale.setScalar(0.6 + 0.4 * Math.max(hv, 0))
        pillars.current.forEach((pillar, i) => {
            const h = Math.max((stats[i].value / 100) * PILLAR_MAX * visAt(vis, i + 1), 0.001)
            pillar.scale.y = h
            pillar.position.y = h / 2
            tops.current[i].position.y = h
            tops.current[i].material.opacity = clamp01(visAt(vis, i + 1))
        })
    })

    return (
        <group ref={root} visible={false} position={[0, FLOOR_Y + 0.015, 0]}>
            <group ref={spin}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[HUD_SIZE, HUD_SIZE]} />
                    <meshBasicMaterial ref={hudMat} map={textures.hud} transparent depthWrite={false} />
                </mesh>
                {nodes.map(([x, z], i) => (
                    <group key={stats[i].abbr} position={[x, 0, z]}>
                        <mesh ref={(el) => { pillars.current[i] = el }} material={pillarMat} castShadow>
                            <boxGeometry args={[0.14, 1, 0.14]} />
                        </mesh>
                        <sprite ref={(el) => { tops.current[i] = el }} scale={[0.55, 0.55, 0.55]}>
                            <spriteMaterial map={textures.glow} color="#F6C964" transparent depthWrite={false} />
                        </sprite>
                    </group>
                ))}
            </group>
        </group>
    )
}

/* CONTACT: 캐릭터 머리 위에 회전하는 금색 마커 (팔면체 + 점, "!" 느낌) */
function ContactMarker({ active, reduced }) {
    const vis = useVisibility(active, reduced)
    const root = useRef(null)
    const spin = useRef(null)
    const mat = useMemo(() => new MeshStandardMaterial({ color: '#F2C86A', emissive: '#D9A23A', emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.35, flatShading: true }), [])

    useFrame(({ clock }, delta) => {
        const v = visAt(vis)
        root.current.visible = v > 0.002
        if (!root.current.visible) return
        root.current.scale.setScalar(Math.max(v, 0.001))
        root.current.position.y = 2.6 + Math.sin(clock.elapsedTime * 2.2) * (reduced ? 0.02 : 0.08)
        spin.current.rotation.y += delta * (reduced ? 0.3 : 1.5)
    })

    return (
        <group ref={root} visible={false} position={[0, 2.6, 0]}>
            <group ref={spin}>
                <mesh material={mat} scale={[0.75, 1.7, 0.75]} position={[0, 0.12, 0]} castShadow>
                    <octahedronGeometry args={[0.15, 0]} />
                </mesh>
                <mesh material={mat} position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                </mesh>
            </group>
        </group>
    )
}

export default function Effects({ tab, store, hoverSkill, reduced, textures }) {
    const group = useRef(null)

    useFrame((_, delta) => {
        const k = 1 - Math.exp(-delta * 5)
        group.current.position.x += (store.pos.x - group.current.position.x) * k
        group.current.position.z += (store.pos.z - group.current.position.z) * k
    })

    return (
        <group ref={group}>
            <ProfileBeam active={tab === 'profile'} reduced={reduced} store={store} textures={textures} />
            <SkillOrbs active={tab === 'skill'} reduced={reduced} hoverSkill={hoverSkill} textures={textures} />
            <EquipSlots active={tab === 'equipment'} reduced={reduced} />
            <StatsHud active={tab === 'stats'} reduced={reduced} textures={textures} />
            <ContactMarker active={tab === 'contact'} reduced={reduced} />
        </group>
    )
}
