import background from '../../assets/image/intro/background/stage03-background.webp'
// 달리기 5장 · 점프 5장 모두 STAGE 01과 같은 356×348 캔버스에 발 위치도 같다
import run01 from '../../assets/image/intro/character/stage03_run01.png'
import run02 from '../../assets/image/intro/character/stage03_run02.png'
import run03 from '../../assets/image/intro/character/stage03_run03.png'
import run04 from '../../assets/image/intro/character/stage03_run04.png'
import run05 from '../../assets/image/intro/character/stage03_run05.png'
// 점프: STAGE 01과 같은 구성 — 01 도약 → 02 상승 → 03 정점 → 04 하강 / 05 착지(웅크림)
import jump01 from '../../assets/image/intro/character/stage03_jump01.png'
import jump02 from '../../assets/image/intro/character/stage03_jump02.png'
import jump03 from '../../assets/image/intro/character/stage03_jump03.png'
import jump04 from '../../assets/image/intro/character/stage03_jump04.png'
import jump05 from '../../assets/image/intro/character/stage03_jump05.png'
import door from '../../assets/image/intro/item/stage03_door.webp'
import { introItems } from '../../data/introItems.js'
import IntroStageGame from './IntroStageGame.jsx'

// 아이템(위치 · 크기)은 data/introItems.js에서 스테이지별로 정한다
// 배경은 1.16배 확대 + 살짝 위로 올려 잔디선을 다른 스테이지와 비슷한 높이로 맞춘다
const config = {
    number: '03',
    name: 'COMPANY',
    background,
    bgScale: 1.16,
    bgOffset: -1.2,
    ground: 19.5,
    // 달리기 순서는 STAGE 01의 흐름(넓은 보폭 → 넓은 보폭 → 다리 모음 → 다리 모음 → 넓은 보폭)에 맞춰 03 · 02를 바꿔 둔다
    sprites: { run: run01, runFrames: [run01, run02, run03, run04, run05], jump: jump03, jumpFrames: [jump01, jump02, jump03, jump04], land: jump05 },
    items: introItems.stage03,
    door: { src: door, distance: 320, size: 44, sink: 2 },
    readyTime: 0.3,
    titleCard: true,
    arriving: true,
}

export default function IntroStage03({ onClear, onSkip, onSelectStage, onRestart, inventory, onCollect }) {
    return <IntroStageGame config={config} onClear={onClear} onSkip={onSkip} onSelectStage={onSelectStage} onRestart={onRestart} inventory={inventory} onCollect={onCollect} />
}
