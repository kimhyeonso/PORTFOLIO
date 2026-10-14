import background from '../../assets/image/intro/background/stage02-background.png'
// 달리기 5장 · 점프 4장은 STAGE 01과 같은 356×348 캔버스에 발 위치도 같다
import run01 from '../../assets/image/intro/character/stage02_run01.png'
import run02 from '../../assets/image/intro/character/stage02_run02.png'
import run03 from '../../assets/image/intro/character/stage02_run03.png'
import run04 from '../../assets/image/intro/character/stage02_run04.png'
import run05 from '../../assets/image/intro/character/stage02_run05.png'
// 점프: STAGE 01과 같은 구성 — 02 도약 → 03 정점 → 04 하강 → 05 착지 직전 / land01 착지(웅크려 손 짚기)
// (jump01은 땅에서 웅크리는 준비 자세라 공중에서 보이면 어색해 쓰지 않는다)
import jump01 from '../../assets/image/intro/character/stage02_jump01.png'
import jump02 from '../../assets/image/intro/character/stage02_jump02.png'
import jump03 from '../../assets/image/intro/character/stage02_jump03.png'
import jump04 from '../../assets/image/intro/character/stage02_jump04.png'
import jump05 from '../../assets/image/intro/character/stage02_jump05.png'
import door from '../../assets/image/intro/item/stage02_door.png'
import { introItems } from '../../data/introItems.js'
import IntroStageGame from './IntroStageGame.jsx'

// 아이템(위치 · 크기)은 data/introItems.js에서 스테이지별로 정한다
const config = {
    number: '02',
    name: 'STUDY',
    background,
    ground: 20.4,
    // 달리기 순서는 STAGE 01의 흐름(넓은 보폭 → 넓은 보폭 → 다리 모음 → 다리 모음 → 넓은 보폭)에 맞춰 04 · 02를 바꿔 둔다
    // 착지는 STAGE 01처럼 한 장으로 LAND_TIME 동안 보여준다 (여러 장이면 장당 0.05초라 깜빡이기만 한다)
    sprites: { run: run01, runFrames: [run01, run02, run03, run04, run05], jump: jump03, jumpFrames: [jump01, jump02, jump03, jump04], land: jump05 },
    items: introItems.stage02,
    door: { src: door, distance: 365, size: 44, sink: 4.5 },
    readyTime: 0.3,
    titleCard: true,
    arriving: true,
    clearMessage: 'WEB DESIGN & DEVELOPMENT CERTIFICATE',
}

export default function IntroStage02({ onClear, onSkip, onSelectStage, onRestart, inventory, onCollect }) {
    return <IntroStageGame config={config} onClear={onClear} onSkip={onSkip} onSelectStage={onSelectStage} onRestart={onRestart} inventory={inventory} onCollect={onCollect} />
}
