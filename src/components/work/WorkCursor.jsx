import { useEffect, useRef } from 'react'
import useMedia from '../../hooks/useMedia.js'
import styles from './WorkCursor.module.scss'

/**
 * Working 페이지 OPEN 커서: 지금 보는 패널(data-cursor="OPEN") 위에서만 원래 커서 대신
 * OPEN 글자가 든 원이 나타나 살짝 늦게 따라온다. 그 밖에서는 원래 커서 그대로.
 * 마우스(정밀 포인터)가 있고 움직임 줄이기 설정이 아닐 때만 켜진다.
 */
export default function WorkCursor() {
    const fine = useMedia('(hover: hover) and (pointer: fine)')
    const reduced = useMedia('(prefers-reduced-motion: reduce)')
    const enabled = fine && !reduced
    const rootRef = useRef(null)
    const ringRef = useRef(null)
    const labelRef = useRef(null)

    useEffect(() => {
        if (!enabled) return undefined
        document.documentElement.classList.add('has-work-cursor')
        const target = { x: 0, y: 0 }
        const ring = { x: 0, y: 0 }
        let shown = false
        let frame = 0

        const loop = () => {
            ring.x += (target.x - ring.x) * 0.22
            ring.y += (target.y - ring.y) * 0.22
            ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`
            frame = requestAnimationFrame(loop)
        }
        const show = (next) => {
            if (next === shown) return
            shown = next
            rootRef.current.classList.toggle('is-visible', next)
        }
        const onMove = (event) => {
            if (event.pointerType !== 'mouse') return
            target.x = event.clientX
            target.y = event.clientY
            const label = event.target.closest?.('[data-cursor]')?.dataset.cursor || ''
            // 처음 나타날 때는 늦게 따라오지 않고 그 자리에서
            if (label && !shown) Object.assign(ring, target)
            if (label) labelRef.current.textContent = label
            show(Boolean(label))
        }
        const onLeave = () => show(false)
        const onDown = () => rootRef.current?.classList.add('is-down')
        const onUp = () => rootRef.current?.classList.remove('is-down')

        frame = requestAnimationFrame(loop)
        window.addEventListener('pointermove', onMove, { passive: true })
        window.addEventListener('pointerdown', onDown)
        window.addEventListener('pointerup', onUp)
        document.documentElement.addEventListener('pointerleave', onLeave)
        return () => {
            cancelAnimationFrame(frame)
            document.documentElement.classList.remove('has-work-cursor')
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerdown', onDown)
            window.removeEventListener('pointerup', onUp)
            document.documentElement.removeEventListener('pointerleave', onLeave)
        }
    }, [enabled])

    if (!enabled) return null
    return (
        <div className={`${styles.scope} work-cursor`} ref={rootRef} aria-hidden="true">
            <span className="work-cursor-ring" ref={ringRef}><em ref={labelRef} /></span>
        </div>
    )
}
