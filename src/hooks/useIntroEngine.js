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

  // SKIP INTRO: 전환 화면의 질문 없이 바로 메인으로 ({ skip: true })
  const skip = useCallback(() => {
    onEnterMain({ skip: true })
  }, [onEnterMain])

  const start = useCallback(() => {
    goToStage(0)
  }, [goToStage])

  // Press Start 누르기 전의 시작 화면으로 돌아간다 (일시정지 모달의 BACK TO START)
  const restart = useCallback(() => {
    setStarted(false)
    setPhase(stages[0])
  }, [])

  // 마지막 스테이지를 지나면 그 스테이지가 넘긴 정보(포털을 지났으면 { warp: true } → 워프 터널로 시작)를 전환 화면에 넘긴다
  const clearStage = useCallback((info) => {
    const nextIndex = stages.indexOf(phase) + 1
    if (nextIndex < stages.length) goToStage(nextIndex)
    else onEnterMain(info)
  }, [goToStage, onEnterMain, phase])

  return { start, restart, skip, clearStage, goToStage, started, phase, runId }
}
