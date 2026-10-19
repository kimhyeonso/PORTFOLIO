/*
 * 반짝이 모양: 가운데 글로우 + 4방향으로 뻗는 별빛.
 * PROFILE 3D 파티클 텍스처(textures.js)와 Working 배경 반짝이(SparkleField)가 같이 쓴다 (three 없이 캔버스만).
 */
export function drawSparkle(ctx, size, color = '#ffffff') {
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
    const w = size * 5 / 128
    const ray = () => {
        ctx.beginPath()
        ctx.moveTo(c, c - c * 0.92)
        ctx.lineTo(c + w, c)
        ctx.lineTo(c, c + c * 0.92)
        ctx.lineTo(c - w, c)
        ctx.closePath()
        ctx.fill()
    }
    ray()
    ctx.save()
    ctx.translate(c, c)
    ctx.rotate(Math.PI / 2)
    ctx.translate(-c, -c)
    ray()
    ctx.restore()
    // 흰 모양에 색을 입힌다 (셰이더의 vColor * tex.rgb와 같은 결과)
    if (color !== '#ffffff') {
        ctx.globalCompositeOperation = 'source-in'
        ctx.fillStyle = color
        ctx.fillRect(0, 0, size, size)
        ctx.globalCompositeOperation = 'source-over'
    }
}
