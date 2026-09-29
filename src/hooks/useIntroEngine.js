import { useCallback, useState } from 'react'

// 모든 스테이지는 IntroStageGame에서 직접 플레이한다. 마지막 스테이지(포털)를 지나면 메인으로 이동한다.
const stages = ['stage01', 'stage02', 'stage03', 'stage04']

export function useIntroEngine({ onNavigate }) {
  const [started, setStarted] = useState(false)
  const [phase, setPhase] = useState(stages[0])
  // 메뉴로 같은 스테이지를 다시 골라도 처음부터 재시작되도록 매 진입마다 키를 바꾼다
  const [runId, setRunId] = useState(0)

  const goToStage = useCallback((index) => {
    setStarted(true)
    setPhase(stages[index])
    setRunId((id) => id + 1)
  }, [])

  const skip = useCallback(() => {
    onNavigate('/')
  }, [onNavigate])

  const start = useCallback(() => {
    goToStage(0)
  }, [goToStage])

  const clearStage = useCallback(() => {
    const nextIndex = stages.indexOf(phase) + 1
    if (nextIndex < stages.length) goToStage(nextIndex)
    else onNavigate('/')
  }, [goToStage, onNavigate, phase])

  return { start, skip, clearStage, goToStage, started, phase, runId }
}
