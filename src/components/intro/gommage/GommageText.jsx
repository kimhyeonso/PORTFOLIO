import { useEffect, useRef, useState } from 'react'
import GommageExperience from './gommageExperience.js'
import styles from './GommageText.module.scss'

/**
 * HTML 제목(targetRef) 자리에 같은 문장을 MSDF 글자로 그리고, dissolve가 true가 되면
 * noise로 2.5초 동안 지우며 픽셀 · 빛 입자 · 먼지가 위로 떠오른다 (WebGPU, 안 되면 WebGL2).
 * 준비되면 onReady → 부모가 HTML 글자를 투명하게 바꾼다 (화면 읽기용 글자는 그대로).
 * 초기화에 실패하면 onReady를 부르지 않으므로 HTML 글자가 그대로 보인다.
 */
export default function GommageText({ targetRef, dissolve, onReady, onComplete, bloom = true }) {
  const canvasRef = useRef(null)
  const experienceRef = useRef(null)
  const [ready, setReady] = useState(false)
  const callbacksRef = useRef({ onReady, onComplete })
  useEffect(() => {
    callbacksRef.current = { onReady, onComplete }
  })

  useEffect(() => {
    const experience = new GommageExperience()
    experienceRef.current = experience
    experience.initialize(canvasRef.current, { target: targetRef, bloom })
      .then((ok) => {
        if (!ok) return
        setReady(true)
        callbacksRef.current.onReady?.()
      })
      .catch((error) => console.warn('[GommageText] WebGPU 초기화 실패, HTML 글자를 그대로 둡니다.', error))
    return () => {
      experience.dispose()
      experienceRef.current = null
    }
  }, [targetRef, bloom])

  useEffect(() => {
    if (!dissolve || !ready) return
    experienceRef.current?.trigger(() => callbacksRef.current.onComplete?.())
  }, [dissolve, ready])

  return <canvas className={`${styles.scope} intro-gommage`} ref={canvasRef} aria-hidden="true" />
}
