import background from '../../assets/image/intro/background/Stage01-background.webp'
// 달리기 5장 · 점프 5장 모두 같은 356×348 캔버스에 발 위치도 같아 크기 보정 없이 그대로 쓴다
import run01 from '../../assets/image/intro/character/stage01_run01.png'
import run02 from '../../assets/image/intro/character/stage01_run02.png'
import run03 from '../../assets/image/intro/character/stage01_run03.png'
import run04 from '../../assets/image/intro/character/stage01_run04.png'
import run05 from '../../assets/image/intro/character/stage01_run05.png'
// 점프: 01 도약 → 02 상승 → 03 정점(다리 모음) → 04 하강 / 05 착지(웅크려 손 짚기)
import jump01 from '../../assets/image/intro/character/stage01_jump01.png'
import jump02 from '../../assets/image/intro/character/stage01_jump02.png'
import jump03 from '../../assets/image/intro/character/stage01_jump03.png'
import jump04 from '../../assets/image/intro/character/stage01_jump04.png'
import jump05 from '../../assets/image/intro/character/stage01_jump05.png'
import door from '../../assets/image/intro/item/stage01_door.webp'
import { introItems } from '../../data/introItems.js'
import IntroStageGame from './IntroStageGame.jsx'

// 아이템(위치 · 크기)은 data/introItems.js에서 스테이지별로 정한다
const config = {
    number: '01',
    name: 'UNIVERSITY',
    background,
    ground: 19.2,
    // run · jump · land 한 장짜리는 프레임이 없을 때의 대표 이미지 (미리 불러오기 · 단일 스프라이트 판별용)
    sprites: { run: run01, runFrames: [run01, run02, run03, run04, run05], jump: jump03, jumpFrames: [jump01, jump02, jump03, jump04], land: jump05 },
    items: introItems.stage01,
    door: { src: door, distance: 432, size: 44, sink: 0.6 },
    readyTime: 1,
    exclaim: true,
    hint: true,
}

export default function IntroStage01({ onClear, onSkip, onSelectStage, onRestart, inventory, onCollect }) {
    return <IntroStageGame config={config} onClear={onClear} onSkip={onSkip} onSelectStage={onSelectStage} onRestart={onRestart} inventory={inventory} onCollect={onCollect} />
}
