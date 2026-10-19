import { useEffect, useRef } from 'react'
import { drawSparkle } from './sparkle.js'

// PROFILE 3D 파티클과 같은 색 · 크기 · 개수 (큰 반짝이 + 작은 반짝이 두 무리)
const COLORS = ['#E8BE55', '#7CC4F2', '#F2A35E', '#FFFFFF', '#F6D27A']
const GROUPS = [
    { count: 54, mobileCount: 24, size: 30, seed: 7 },
    { count: 190, mobileCount: 80, size: 13, seed: 31 },
]
const SPRITE = 64
const TAU = Math.PI * 2

/**
 * 화면에 고정된 반짝이 배경 (PROFILE 3D 파티클을 three 없이 2D 캔버스로 옮긴 것).
 * 반짝이가 아래에서 천천히 떠오르며 좌우로 살짝 흔들리고, 밝기 · 크기가 깜빡이며, 위아래 끝에서 서서히 나타나고 사라진다.
 */
export default function SparkleField({ className = '' }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const mobile = window.matchMedia('(max-width: 900px)').matches

        // 색마다 반짝이 그림을 한 번만 그려 둔다
        const sprites = COLORS.map((color) => {
            const sprite = document.createElement('canvas')
            sprite.width = SPRITE
            sprite.height = SPRITE
            drawSparkle(sprite.getContext('2d'), SPRITE, color)
            return sprite
        })

        const particles = GROUPS.flatMap(({ count, mobileCount, size, seed }) => {
            let s = seed
            const rand = () => {
                s = (s * 16807) % 2147483647
                return (s - 1) / 2147483646
            }
            return Array.from({ length: mobile ? mobileCount : count }, () => ({
                size,
                x: rand(),
                height: rand(),
                speed: 0.35 + rand() * 0.9,
                phase: rand() * TAU,
                sway: 8 + rand() * 30,
                sprite: sprites[Math.floor(rand() * COLORS.length)],
            }))
        })

        let width = 0
        let height = 0
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            width = window.innerWidth
            height = window.innerHeight
            canvas.width = Math.round(width * dpr)
            canvas.height = Math.round(height * dpr)
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }
        resize()
        window.addEventListener('resize', resize)

        let frame = 0
        let rise = 0
        let spin = 0
        let last = performance.now()
        const draw = (now) => {
            const delta = Math.min((now - last) / 1000, 0.1)
            last = now
            frame = requestAnimationFrame(draw)
            // 페이지가 숨겨 둔 동안(visibility: hidden)은 그리지 않고 쉰다
            if (canvas.style.visibility === 'hidden') return
            // 3D와 같은 속도: 높이 6.5 단위를 화면 높이로 옮긴 비율
            rise += delta * (reduced ? 0.06 : 0.28) / 6.5
            spin += delta * (reduced ? 0.02 : 0.08)
            const time = now / 1000
            ctx.clearRect(0, 0, width, height)
            particles.forEach((p) => {
                const h = (p.height + rise * p.speed) % 1
                const twinkle = 0.55 + 0.45 * Math.sin(time * (1.5 + p.speed * 2) + p.phase)
                // 아래 끝에서 나타나고 위 끝에서 사라진다
                const edge = Math.min(1, h / 0.09) * Math.min(1, (1 - h) / 0.18)
                const alpha = twinkle * edge
                if (alpha <= 0.01) return
                const size = p.size * (0.6 + twinkle * 0.5)
                const x = p.x * width + Math.sin(spin * (0.4 + p.speed * 0.6) * TAU + p.phase) * p.sway
                const y = height * (1 - h)
                ctx.globalAlpha = alpha
                ctx.drawImage(p.sprite, x - size / 2, y - size / 2, size, size)
            })
            ctx.globalAlpha = 1
        }
        frame = requestAnimationFrame(draw)

        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return <canvas className={className} ref={canvasRef} aria-hidden="true" />
}
