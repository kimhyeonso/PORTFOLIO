import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'

const FONT = '700 {px}px "Inter", "Noto Sans KR", sans-serif'
const FONT_PX = 200 // 글자를 그리는 캔버스 해상도 (화면에 보이는 크기와는 별개)
const LAYERS = 28 // 두께를 만드는 테두리 판 수 (많을수록 옆면이 매끈)
// 모든 제목을 이 제목이 카드 너비의 MAX_WIDTH를 채우는 글자 크기로 맞춘다 (이보다 긴 제목만 더 줄어든다)
const SIZE_REFERENCE = 'MOUNTAIN EQUIPMENT'
const MAX_WIDTH = 0.9 // 긴 제목은 카드 너비의 이 비율 안에 들어가도록 줄인다
const DEPTH = 0.24 // 두께 = 글자 크기 × DEPTH
const TILT = { x: 0.22, y: 0.35 } // rad, 마우스 위치에 따라 기우는 최대 각도

const fontOf = (px) => FONT.replace('{px}', px)

// 제목 한 줄을 캔버스에 그려 텍스처로 만든다. paint로 앞면/테두리/그림자를 다르게 칠한다
function drawTitle(title, paint) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.font = fontOf(FONT_PX)
    const textWidth = ctx.measureText(title).width
    const pad = FONT_PX * 0.3
    canvas.width = Math.ceil(textWidth + pad * 2)
    canvas.height = Math.ceil(FONT_PX * 1.6)
    ctx.font = fontOf(FONT_PX)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    paint(ctx, canvas.width / 2, canvas.height / 2)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return { texture, width: canvas.width, height: canvas.height, textWidth }
}

// 앞면: 위는 밝고 아래로 갈수록 투명해지는 유리 느낌 + 밝은 외곽선
const paintFace = (title) => (ctx, x, y) => {
    const gradient = ctx.createLinearGradient(0, y - FONT_PX * 0.6, 0, y + FONT_PX * 0.6)
    gradient.addColorStop(0, 'rgba(255, 255, 255, .95)')
    gradient.addColorStop(.5, 'rgba(242, 247, 252, .6)')
    gradient.addColorStop(1, 'rgba(226, 236, 247, .42)')
    ctx.fillStyle = gradient
    ctx.fillText(title, x, y)
    ctx.lineWidth = FONT_PX * 0.014
    ctx.strokeStyle = 'rgba(255, 255, 255, .95)'
    ctx.strokeText(title, x, y)
}
// 옆면: 글자 외곽선만 그린 판을 겹겹이 쌓아 속이 빈 유리 글자의 옆면을 만든다
const paintEdge = (title) => (ctx, x, y) => {
    ctx.lineWidth = FONT_PX * 0.024
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#fff'
    ctx.strokeText(title, x, y)
}
// 맨 뒤 그림자: 사진 위에서도 글자가 떠 보이게
const paintShadow = (title) => (ctx, x, y) => {
    ctx.filter = `blur(${FONT_PX * 0.07}px)`
    ctx.fillStyle = 'rgba(20, 32, 48, .5)'
    ctx.fillText(title, x, y)
}

// 제목 하나 = 원통 위 자리(root) > 등장·기울기(pivot) > 크기(body) > 그림자 + 옆면 판들 + 앞면
function buildTitle(title, plane, anisotropy) {
    const face = drawTitle(title, paintFace(title))
    const edge = drawTitle(title, paintEdge(title))
    const shadow = drawTitle(title, paintShadow(title))
    const root = new THREE.Group()
    root.matrixAutoUpdate = false
    root.visible = false
    const pivot = new THREE.Group()
    const body = new THREE.Group()
    root.add(pivot)
    pivot.add(body)

    const materials = []
    const addLayer = (texture, z, color, opacity) => {
        texture.anisotropy = anisotropy
        const material = new THREE.MeshBasicMaterial({ map: texture, color, transparent: true, depthWrite: false, side: THREE.DoubleSide })
        const mesh = new THREE.Mesh(plane, material)
        mesh.position.z = z
        body.add(mesh)
        materials.push({ material, opacity })
    }
    addLayer(shadow.texture, -1.25, 0xffffff, .45)
    // 뒤쪽 판은 푸르스름한 회색, 앞으로 올수록 흰색 → 옆면에 빛을 받은 듯한 명암
    const back = new THREE.Color('#8d9db0')
    const front = new THREE.Color('#ffffff')
    for (let i = 0; i < LAYERS; i += 1) {
        const t = i / (LAYERS - 1)
        addLayer(edge.texture, t - 1, back.clone().lerp(front, t), .5)
    }
    addLayer(face.texture, 0.001, 0xffffff, 1)

    return {
        root, pivot, body, materials,
        aspect: face.width / face.height,
        heightRatio: face.height / FONT_PX, // 텍스처 높이 ÷ 글자 크기
        widthRatio: face.textWidth / FONT_PX, // 글자 폭 ÷ 글자 크기
        state: { opacity: 0, lift: 0 },
        on: false,
        dispose() {
            materials.forEach(({ material }) => { material.map.dispose(); material.dispose() })
        },
    }
}

const toDOMMatrix = (el) => {
    const transform = getComputedStyle(el).transform
    return transform && transform !== 'none' ? new DOMMatrix(transform) : new DOMMatrix()
}
// CSS(아래로 +y) 행렬을 Three.js(위로 +y) 행렬로: y축을 뒤집은 좌표계로 바꾼다 (S·M·S)
function copyCssMatrix(domMatrix, target) {
    const a = domMatrix.toFloat32Array()
    for (let col = 0; col < 4; col += 1) {
        for (let row = 0; row < 4; row += 1) {
            if ((row === 1) !== (col === 1)) a[col * 4 + row] *= -1
        }
    }
    target.fromArray(a)
}

/**
 * 원통 갤러리 위에 떠 있는 3D 유리 제목 (Three.js 캔버스를 원통 위에 겹쳐 그린다).
 * 원통은 CSS 3D로 돌고 있으므로, 매 프레임 CSS의 원근(perspective)·회전 행렬을 그대로 읽어
 * 같은 카메라/위치로 맞춘다 → 넘기기·드래그·시소 움직임을 제목이 그대로 따라간다.
 * shownIndex 카드의 제목만 gsap으로 떠오르고, 마우스 위치에 따라 살짝 기운다.
 * 한글 제목도 그대로 쓰기 위해 글자 모델 대신 "글자를 그린 판"을 여러 장 겹쳐 두께를 만든다.
 */
export default function RingTitles3D({ projects, shownIndex, ringRef, kickRef, spinRef }) {
    const canvasRef = useRef(null)
    const titlesRef = useRef([])
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setClearColor(0x000000, 0)
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera()
        const plane = new THREE.PlaneGeometry(1, 1)
        const anisotropy = renderer.capabilities.getMaxAnisotropy()
        const count = projects.length
        const step = 360 / count
        const tilt = { x: 0, y: 0, targetX: 0, targetY: 0 }
        let disposed = false
        let drawn = false
        let raf = 0

        // 글꼴이 준비된 뒤에 그려야 캔버스에 기본 글꼴로 찍히지 않는다
        const text = projects.map((project) => project.title).join('') + SIZE_REFERENCE
        let sizeRatio = 0 // 글자 크기 ÷ 카드 너비
        Promise.all([
            document.fonts.load(`700 ${FONT_PX}px "Inter"`, text),
            document.fonts.load(`700 ${FONT_PX}px "Noto Sans KR"`, text),
        ]).catch(() => {}).then(() => {
            if (disposed) return
            const measure = document.createElement('canvas').getContext('2d')
            measure.font = fontOf(FONT_PX)
            sizeRatio = MAX_WIDTH / (measure.measureText(SIZE_REFERENCE).width / FONT_PX)
            titlesRef.current = projects.map((project) => {
                const title = buildTitle(project.title, plane, anisotropy)
                scene.add(title.root)
                return title
            })
            setReady(true)
        })

        const onPointerMove = (event) => {
            tilt.targetY = (event.clientX / window.innerWidth - 0.5) * 2 * TILT.y
            tilt.targetX = (event.clientY / window.innerHeight - 0.5) * 2 * TILT.x
        }
        window.addEventListener('pointermove', onPointerMove)

        const tick = () => {
            raf = requestAnimationFrame(tick)
            const titles = titlesRef.current
            const live = titles.filter((title) => title.state.opacity > 0.001)
            titles.forEach((title) => { title.root.visible = title.state.opacity > 0.001 })
            if (!live.length) {
                if (drawn) renderer.clear()
                drawn = false
                return
            }
            const ring = ringRef.current
            const face = ring?.querySelector('.project-ring-face')
            if (!ring || !face || !kickRef.current || !spinRef.current) return

            // 캔버스 크기
            const canvasRect = canvas.getBoundingClientRect()
            const size = renderer.getSize(new THREE.Vector2())
            if (Math.round(size.x) !== Math.round(canvasRect.width) || Math.round(size.y) !== Math.round(canvasRect.height)) {
                renderer.setSize(canvasRect.width, canvasRect.height, false)
            }

            // CSS 원근과 같은 카메라: 원통 가운데를 원점(px 단위)으로, 눈은 perspective-origin 위치에서 perspective만큼 앞에
            const ringRect = ring.getBoundingClientRect()
            const ringStyle = getComputedStyle(ring)
            const distance = parseFloat(ringStyle.perspective)
            const [originX, originY] = ringStyle.perspectiveOrigin.split(' ').map(parseFloat)
            const centerX = ringRect.left + ringRect.width / 2
            const centerY = ringRect.top + ringRect.height / 2
            const eyeX = ringRect.left + originX - centerX
            const eyeY = centerY - (ringRect.top + originY)
            const left = canvasRect.left - centerX
            const top = centerY - canvasRect.top
            const near = 1
            const k = near / distance
            camera.position.set(eyeX, eyeY, distance)
            camera.updateMatrixWorld()
            camera.projectionMatrix.makePerspective((left - eyeX) * k, (left + canvasRect.width - eyeX) * k, (top - eyeY) * k, (top - canvasRect.height - eyeY) * k, near, distance * 20)
            camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()

            // 원통 회전(시소 · 회전 · 드래그 포함)을 CSS에서 그대로 읽는다
            const panelWidth = face.offsetWidth
            const radius = panelWidth / (2 * Math.tan(Math.PI / count))
            const ringMatrix = toDOMMatrix(kickRef.current).multiply(toDOMMatrix(spinRef.current))
            tilt.x += (tilt.targetX - tilt.x) * 0.08
            tilt.y += (tilt.targetY - tilt.y) * 0.08

            live.forEach((title) => {
                const index = titles.indexOf(title)
                const fontSize = Math.min(panelWidth * sizeRatio, (panelWidth * MAX_WIDTH) / title.widthRatio)
                const depth = fontSize * DEPTH
                const { opacity, lift } = title.state
                // 카드 앞면보다 두께만큼 더 바깥에 띄운다
                copyCssMatrix(ringMatrix.rotate(0, index * step, 0).translate(0, 0, radius + depth * 1.6), title.root.matrix)
                title.root.matrixWorldNeedsUpdate = true
                title.body.scale.set(fontSize * title.heightRatio * title.aspect, fontSize * title.heightRatio, depth)
                // 등장: 뒤로 눕혀진 채 안쪽에서 앞으로 일어서며 떠오른다
                title.pivot.position.z = -(1 - lift) * depth * 2
                title.pivot.rotation.x = -(1 - lift) * 0.9 + tilt.x
                title.pivot.rotation.y = tilt.y
                title.materials.forEach(({ material, opacity: base }) => { material.opacity = base * opacity })
            })
            renderer.render(scene, camera)
            drawn = true
        }
        raf = requestAnimationFrame(tick)

        return () => {
            disposed = true
            cancelAnimationFrame(raf)
            window.removeEventListener('pointermove', onPointerMove)
            titlesRef.current.forEach((title) => { gsap.killTweensOf(title.state); title.dispose() })
            titlesRef.current = []
            plane.dispose()
            renderer.dispose()
        }
    }, [projects, ringRef, kickRef, spinRef])

    // 보여줄 제목이 바뀌면 이전 제목은 사라지고 새 제목이 떠오른다
    useEffect(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        titlesRef.current.forEach((title, index) => {
            const on = index === shownIndex
            if (on === title.on) return
            title.on = on
            gsap.killTweensOf(title.state)
            if (on) gsap.fromTo(title.state, { opacity: 0, lift: reduced ? 1 : 0 }, { opacity: 1, lift: 1, duration: 1, ease: 'power3.out' })
            else gsap.to(title.state, { opacity: 0, duration: 0.35, ease: 'power1.out' })
        })
    }, [shownIndex, ready])

    return <canvas className="project-ring-titles" ref={canvasRef} aria-hidden="true" />
}
