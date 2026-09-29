import background from '../../assets/image/intro/background/stage02-background.png'
import run from '../../assets/image/intro/character/stage02_run.png'
import jump from '../../assets/image/intro/character/stage02_jump.png'
import land from '../../assets/image/intro/character/stage02_landing.png'
import pr from '../../assets/image/intro/item/item_pr.png'
import c4d from '../../assets/image/intro/item/item_c4d.png'
import figma from '../../assets/image/intro/item/item_figma.png'
import code from '../../assets/image/intro/item/item_coding.png'
import door from '../../assets/image/intro/item/stage02_door.png'
import IntroStageGame from './IntroStageGame.jsx'

// distance: 캐릭터로부터의 거리(u), y: 아이템 중심의 세로 위치(%)
// size: 이미지 너비(u). 이미지마다 여백이 달라서, 실제 그림 면적이 약 13u×13u로 같아 보이도록 이미지별로 계산한 값
const config = {
    number: '02',
    name: 'STUDY',
    background,
    ground: 20.4,
    sprites: { run, jump, land },
    items: [
        { id: 'pr', src: pr, label: 'PREMIERE PRO GET!', distance: 75, y: 38, size: 14.3 },
        { id: 'c4d', src: c4d, label: 'CINEMA 4D GET!', distance: 135, y: 47, size: 16.6 },
        { id: 'figma', src: figma, label: 'FIGMA GET!', distance: 195, y: 37, size: 16.2 },
        { id: 'code', src: code, label: 'HTML · CSS · JS GET!', distance: 255, y: 40, size: 14.8 },
    ],
    door: { src: door, distance: 365, size: 44, sink: 4.5 },
    readyTime: 0.3,
    titleCard: true,
    arriving: true,
    clearMessage: 'WEB DESIGN & DEVELOPMENT CERTIFICATE',
}

export default function IntroStage02({ onClear, onSkip, onSelectStage }) {
    return <IntroStageGame config={config} onClear={onClear} onSkip={onSkip} onSelectStage={onSelectStage} />
}
