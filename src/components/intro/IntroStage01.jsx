import background from '../../assets/image/intro/background/Stage01-background.png'
import run from '../../assets/image/intro/character/stage01_run.png'
import jump from '../../assets/image/intro/character/stage01_jump.png'
import land from '../../assets/image/intro/character/stage01_landing.png'
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
    sprites: { run, jump, land },
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

export default function IntroStage01({ onClear, onSkip, onSelectStage }) {
    return <IntroStageGame config={config} onClear={onClear} onSkip={onSkip} onSelectStage={onSelectStage} />
}
