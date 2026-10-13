import background from '../../assets/image/intro/background/Stage01-background.png'
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
import ps from '../../assets/image/intro/item/item_ps.png'
import ai from '../../assets/image/intro/item/item_ai.png'
import xd from '../../assets/image/intro/item/item_xd.png'
import indesign from '../../assets/image/intro/item/item_id.png'
import ae from '../../assets/image/intro/item/item_ae.png'
import door from '../../assets/image/intro/item/stage01_door.png'
import IntroStageGame from './IntroStageGame.jsx'

// distance: 캐릭터로부터의 거리(u), y: 아이템 중심의 세로 위치(%)
// size: 이미지 너비(u). 이미지마다 여백이 달라서, 실제 그림 면적이 약 13u×13u로 같아 보이도록 이미지별로 계산한 값
const config = {
    number: '01',
    name: 'UNIVERSITY',
    background,
    ground: 19.2,
    // run · jump · land 한 장짜리는 프레임이 없을 때의 대표 이미지 (미리 불러오기 · 단일 스프라이트 판별용)
    sprites: { run: run01, runFrames: [run01, run02, run03, run04, run05], jump: jump03, jumpFrames: [jump01, jump02, jump03, jump04], land: jump05 },
    items: [
        { id: 'ps', src: ps, label: 'PHOTOSHOP GET!', distance: 75, y: 40, size: 20.8 },
        { id: 'ai', src: ai, label: 'ILLUSTRATOR GET!', distance: 135, y: 46, size: 14.2 },
        { id: 'xd', src: xd, label: 'XD GET!', distance: 195, y: 39, size: 16.8 },
        { id: 'id', src: indesign, label: 'INDESIGN GET!', distance: 255, y: 45, size: 14.5 },
        { id: 'ae', src: ae, label: 'AFTER EFFECTS GET!', distance: 315, y: 40, size: 17.5 },
    ],
    door: { src: door, distance: 425, size: 44, sink: 0.6 },
    readyTime: 1,
    exclaim: true,
    hint: true,
}

export default function IntroStage01({ onClear, onSkip, onSelectStage, inventory, onCollect }) {
    return <IntroStageGame config={config} onClear={onClear} onSkip={onSkip} onSelectStage={onSelectStage} inventory={inventory} onCollect={onCollect} />
}
