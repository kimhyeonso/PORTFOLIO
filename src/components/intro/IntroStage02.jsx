import background from '../../assets/image/intro/background/stage02-background.png'
import run from '../../assets/image/intro/character/stage02_run.png'
import run01 from '../../assets/image/intro/character/stage02_run01.png'
import run02 from '../../assets/image/intro/character/stage02_run02.png'
import run03 from '../../assets/image/intro/character/stage02_run03.png'
import run04 from '../../assets/image/intro/character/stage02_run04.png'
import run05 from '../../assets/image/intro/character/stage02_run05.png'
import jump from '../../assets/image/intro/character/stage02_jump.png'
import jump01 from '../../assets/image/intro/character/stage02_jump01.png'
import jump02 from '../../assets/image/intro/character/stage02_jump02.png'
import jump03 from '../../assets/image/intro/character/stage02_jump03.png'
import jump04 from '../../assets/image/intro/character/stage02_jump04.png'
import jump05 from '../../assets/image/intro/character/stage02_jump05.png'
import land from '../../assets/image/intro/character/stage02_landing.png'
import land01 from '../../assets/image/intro/character/stage02_land01.png'
import land02 from '../../assets/image/intro/character/stage02_land02.png'
import land03 from '../../assets/image/intro/character/stage02_land03.png'
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
    sprites: {
        run,
        runFrames: [run01, run02, run03, run04, run05],
        jump,
        jumpFrames: [jump01, jump02, jump03, jump04, jump05],
        land,
        landFrames: [land01, land02, land03],
    },
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

export default function IntroStage02({ onClear, onSkip, onSelectStage, inventory, onCollect }) {
    return <IntroStageGame config={config} onClear={onClear} onSkip={onSkip} onSelectStage={onSelectStage} inventory={inventory} onCollect={onCollect} />
}
