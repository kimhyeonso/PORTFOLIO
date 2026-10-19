import background from '../../assets/image/intro/background/stage04-background.webp'
// 달리기 5장 · 점프 5장 모두 STAGE 01과 같은 356×348 캔버스에 발 위치도 같다
import run01 from '../../assets/image/intro/character/stage04_run01.png'
import run02 from '../../assets/image/intro/character/stage04_run02.png'
import run03 from '../../assets/image/intro/character/stage04_run03.png'
import run04 from '../../assets/image/intro/character/stage04_run04.png'
import run05 from '../../assets/image/intro/character/stage04_run05.png'
// 점프: STAGE 01과 같은 구성 — 01 도약 → 02 상승 → 03 정점 → 04 하강 / 05 착지(웅크림)
import jump01 from '../../assets/image/intro/character/stage04_jump01.png'
import jump02 from '../../assets/image/intro/character/stage04_jump02.png'
import jump03 from '../../assets/image/intro/character/stage04_jump03.png'
import jump04 from '../../assets/image/intro/character/stage04_jump04.png'
import jump05 from '../../assets/image/intro/character/stage04_jump05.png'
import { introItems } from '../../data/introItems.js'
import IntroStageGame from './IntroStageGame.jsx'

// 아이템(위치 · 크기)은 data/introItems.js에서 스테이지별로 정한다
// 마지막 스테이지: 문 대신 포털(door.portal)에 빨려 들어가며 인트로가 끝난다.
const config = {
    number: '04',
    name: 'FRONTEND',
    background,
    // 배경 위쪽을 화면 맨 위에 붙여 빈 띠가 생기지 않게 하고(bgOffset 0), 대신 조금 키워 잔디 높이는 ground에 그대로 맞춘다
    bgScale: 1.1,
    bgOffset: 0,
    // 배경(5637×1188, 가로 ÷ 세로 4.745)이 다른 스테이지(2.32)보다 두 배 넘게 길어 그대로면 빨리 지나간다.
    // 다른 스테이지와 같은 너비까지만 훑어 같은 속도로 보이게 한다 (오른쪽 나머지 부분은 보이지 않는다)
    bgPanAspect: 2.32,
    ground: 19.5,
    // 달리기 순서는 STAGE 01의 흐름(넓은 보폭 → 넓은 보폭 → 다리 모음 → 다리 모음 → 넓은 보폭)에 맞춰 03 · 02를 바꿔 둔다
    sprites: { run: run01, runFrames: [run01, run02, run03, run04, run05], jump: jump03, jumpFrames: [jump01, jump02, jump03, jump04], land: jump05 },
    items: introItems.stage04,
    // 포털은 마지막 아이템(AI TOOLS, 265) 뒤로 다른 스테이지와 같은 간격(110)
    door: { portal: true, distance: 375, size: 46, sink: 0 },
    readyTime: 0.3,
    titleCard: true,
    arriving: true,
}

export default function IntroStage04({ onClear, onSkip, onSelectStage, onRestart, inventory, onCollect }) {
    return <IntroStageGame config={config} onClear={onClear} onSkip={onSkip} onSelectStage={onSelectStage} onRestart={onRestart} inventory={inventory} onCollect={onCollect} />
}
