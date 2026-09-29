import { useCallback, useState } from 'react'

// 모든 스테이지는 IntroStageGame에서 직접 플레이한다. 마지막 스테이지(포털)를 지나거나 건너뛰면
// onEnterMain(터널 전환 후 메인으로 이동)을 부른다.
const stages = ['stage01', 'stage02', 'stage03', 'stage04']

export function useIntroEngine({ onEnterMain }) {
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
    onEnterMain()
  }, [onEnterMain])

  const start = useCallback(() => {
    goToStage(0)
  }, [goToStage])

  const clearStage = useCallback(() => {
    const nextIndex = stages.indexOf(phase) + 1
    if (nextIndex < stages.length) goToStage(nextIndex)
    else onEnterMain()
  }, [goToStage, onEnterMain, phase])

  return { start, skip, clearStage, goToStage, started, phase, runId }
}
