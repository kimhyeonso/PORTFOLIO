import { CanvasTexture, SRGBColorSpace } from 'three'

/*
 * PROFILE 3D 장면에서 쓰는 텍스처를 전부 캔버스로 그려 만든다 (이미지 파일 없음).
 * 컴포넌트에서 useMemo로 한 번만 만든다.
 */

function makeCanvas(width, height = width) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return [canvas, canvas.getContext('2d')]
}

function toTexture(canvas) {
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
    return texture
}

// 반짝이: 가운데 글로우 + 4방향으로 뻗는 별빛 (파티클 · 지팡이 별)
export function createSparkleTexture() {
    const size = 128
    const [canvas, ctx] = makeCanvas(size)
    const c = size / 2
    const glow = ctx.createRadialGradient(c, c, 0, c, c, c)
    glow.addColorStop(0, 'rgba(255,255,255,1)')
    glow.addColorStop(0.18, 'rgba(255,255,255,.55)')
    glow.addColorStop(0.5, 'rgba(255,255,255,.1)')
    glow.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, size, size)
    // 4방향 별: 가늘고 긴 마름모 두 개
    ctx.fillStyle = 'rgba(255,255,255,.95)'
    const ray = (w, h) => {
        ctx.beginPath()
        ctx.moveTo(c, c - h)
        ctx.lineTo(c + w, c)
        ctx.lineTo(c, c + h)
        ctx.lineTo(c - w, c)
        ctx.closePath()
        ctx.fill()
    }
    ray(5, c * 0.92)
    ctx.save()
    ctx.translate(c, c)
    ctx.rotate(Math.PI / 2)
    ctx.translate(-c, -c)
    ray(5, c * 0.92)
    ctx.restore()
    return toTexture(canvas)
}

// 부드러운 원형 글로우 (오브 · 바닥 가짜 반사 · 기둥 끝)
export function createGlowTexture() {
    const size = 128
    const [canvas, ctx] = makeCanvas(size)
    const c = size / 2
    const glow = ctx.createRadialGradient(c, c, 0, c, c, c)
    glow.addColorStop(0, 'rgba(255,255,255,1)')
    glow.addColorStop(0.3, 'rgba(255,255,255,.5)')
    glow.addColorStop(0.65, 'rgba(255,255,255,.12)')
    glow.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, size, size)
    return toTexture(canvas)
}

// 바닥: 가운데 아이보리 → 가장자리 투명 + 희미한 금색 격자
export function createFloorTexture() {
    const size = 1024
    const [canvas, ctx] = makeCanvas(size)
    const c = size / 2
    const base = ctx.createRadialGradient(c, c, 0, c, c, c)
    base.addColorStop(0, 'rgba(251,247,236,.98)')
    base.addColorStop(0.35, 'rgba(250,244,228,.85)')
    base.addColorStop(0.7, 'rgba(246,236,210,.35)')
    base.addColorStop(1, 'rgba(246,236,210,0)')
    ctx.fillStyle = base
    ctx.fillRect(0, 0, size, size)

    // 격자는 따로 그린 뒤 가운데가 진하고 바깥이 흐려지게 원형으로 깎는다
    const [grid, gctx] = makeCanvas(size)
    gctx.strokeStyle = 'rgba(201,162,74,.55)'
    gctx.lineWidth = 2
    const step = size / 24
    for (let x = step / 2; x < size; x += step) {
        gctx.beginPath()
        gctx.moveTo(x, 0)
        gctx.lineTo(x, size)
        gctx.stroke()
        gctx.beginPath()
        gctx.moveTo(0, x)
        gctx.lineTo(size, x)
        gctx.stroke()
    }
    gctx.globalCompositeOperation = 'destination-in'
    const mask = gctx.createRadialGradient(c, c, size * 0.08, c, c, c * 0.85)
    mask.addColorStop(0, 'rgba(0,0,0,.5)')
    mask.addColorStop(1, 'rgba(0,0,0,0)')
    gctx.fillStyle = mask
    gctx.fillRect(0, 0, size, size)
    ctx.drawImage(grid, 0, 0)
    return toTexture(canvas)
}

// 빛기둥: 아래가 진하고 위로 갈수록 투명 (세로 그라디언트)
export function createBeamTexture() {
    const [canvas, ctx] = makeCanvas(4, 256)
    const grad = ctx.createLinearGradient(0, 256, 0, 0)
    grad.addColorStop(0, 'rgba(255,255,255,.9)')
    grad.addColorStop(0.35, 'rgba(255,255,255,.35)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 4, 256)
    return toTexture(canvas)
}

/*
 * 능력치 HUD: 동심원 · 눈금 · 육각형으로 연결된 6개 노드.
 * nodeRadius는 텍스처 크기 대비 노드 반지름 비율 → 3D에서 기둥 위치 계산에 쓴다.
 */
export const HUD_NODE_RADIUS = 0.34

export function createHudTexture(count = 6) {
    const size = 1024
    const [canvas, ctx] = makeCanvas(size)
    const c = size / 2
    const gold = 'rgba(201,162,74,'
    ctx.lineCap = 'round'

    // 동심원
    ;[0.48, 0.44, 0.3, 0.16].forEach((r, i) => {
        ctx.strokeStyle = `${gold}${i === 1 ? 0.9 : 0.55})`
        ctx.lineWidth = i === 1 ? 6 : 3
        if (i === 2) ctx.setLineDash([14, 12])
        ctx.beginPath()
        ctx.arc(c, c, r * size, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
    })

    // 바깥 눈금
    for (let i = 0; i < 72; i += 1) {
        const a = (i / 72) * Math.PI * 2
        const long = i % 6 === 0
        const r1 = 0.44 * size
        const r2 = (long ? 0.405 : 0.42) * size
        ctx.strokeStyle = `${gold}${long ? 0.9 : 0.5})`
        ctx.lineWidth = long ? 5 : 3
        ctx.beginPath()
        ctx.moveTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1)
        ctx.lineTo(c + Math.cos(a) * r2, c + Math.sin(a) * r2)
        ctx.stroke()
    }

    // 육각형 + 노드
    const nodes = Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 - Math.PI / 2
        return [c + Math.cos(a) * HUD_NODE_RADIUS * size, c + Math.sin(a) * HUD_NODE_RADIUS * size]
    })
    ctx.strokeStyle = `${gold}.85)`
    ctx.lineWidth = 4
    ctx.beginPath()
    nodes.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.closePath()
    ctx.stroke()
    // 가운데에서 노드로 가는 가는 선
    ctx.strokeStyle = `${gold}.35)`
    ctx.lineWidth = 2
    nodes.forEach(([x, y]) => {
        ctx.beginPath()
        ctx.moveTo(c, c)
        ctx.lineTo(x, y)
        ctx.stroke()
    })
    // 노드: 픽셀 느낌의 네모 + 바깥 테
    nodes.forEach(([x, y]) => {
        ctx.fillStyle = 'rgba(236,212,143,1)'
        ctx.fillRect(x - 14, y - 14, 28, 28)
        ctx.strokeStyle = `${gold}1)`
        ctx.lineWidth = 4
        ctx.strokeRect(x - 22, y - 22, 44, 44)
    })
    return toTexture(canvas)
}
