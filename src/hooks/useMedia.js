import { useSyncExternalStore } from 'react'

// 미디어 쿼리가 맞는지 (화면 크기 · 움직임 줄이기 설정이 바뀌면 다시 그린다)
export default function useMedia(query) {
    return useSyncExternalStore(
        (onChange) => {
            const mq = window.matchMedia(query)
            mq.addEventListener('change', onChange)
            return () => mq.removeEventListener('change', onChange)
        },
        () => window.matchMedia(query).matches,
    )
}
