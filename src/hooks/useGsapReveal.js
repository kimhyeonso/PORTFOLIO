import { useEffect, useState } from 'react'

export function useGsapReveal(ref, options = {}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15, ...options },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, options])

  return isVisible
}

