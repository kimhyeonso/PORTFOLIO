import background from '../../assets/image/intro/background/stage04-background.png'
import run from '../../assets/image/intro/character/stage04_run.png'
import jump from '../../assets/image/intro/character/stage04_jump.png'
import land from '../../assets/image/intro/character/stage04_landing.png'
import git from '../../assets/image/intro/item/item_git.png'
import react from '../../assets/image/intro/item/item_react.png'
import next from '../../assets/image/intro/item/item_next.png'
import IntroStageGame from './IntroStageGame.jsx'

// distance: 캐릭터로부터의 거리(u), y: 아이템 중심의 세로 위치(%)
// size: 이미지 너비(u). 이미지마다 여백이 달라서, 실제 그림 면적이 약 13u×13u로 같아 보이도록 이미지별로 계산한 값
// 마지막 스테이지: 문 대신 포털(door.portal)에 빨려 들어가며 인트로가 끝난다.
// 캐릭터가 도트가 아닌 일러스트라 smoothSprites로 부드럽게 축소한다.
const config = {
    number: '04',
    name: 'FRONTEND',
    background,
    bgScale: 1.09,
    bgOffset: 0.7,
    ground: 19.5,
    sprites: { run, jump, land },
    smoothSprites: true,
    items: [
        { id: 'git', src: git, label: 'GITHUB GET!', distance: 75, y: 39, size: 14.4 },
        { id: 'react', src: react, label: 'REACT GET!', distance: 135, y: 44, size: 16.4 },
        { id: 'next', src: next, label: 'NEXT.JS GET!', distance: 195, y: 39, size: 16 },
    ],
    door: { portal: true, distance: 305, size: 46, sink: 0 },
    readyTime: 0.3,
    titleCard: true,
    arriving: true,
}

export default function IntroStage04({ onClear, onSkip, onSelectStage }) {
    return <IntroStageGame config={config} onClear={onClear} onSkip={onSkip} onSelectStage={onSelectStage} />
}
