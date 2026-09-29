import { useCallback, useState } from 'react'

export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const transition = useCallback((callback) => {
    setIsTransitioning(true)
    window.setTimeout(() => {
      callback()
      setIsTransitioning(false)
    }, 180)
  }, [])

  return { isTransitioning, transition }
}

