import background from '../../assets/image/intro/background/stage03-background.png'
import run from '../../assets/image/intro/character/stage03_run.png'
import jump from '../../assets/image/intro/character/stage03_jump.png'
import land from '../../assets/image/intro/character/stage03_landing.png'
import slack from '../../assets/image/intro/item/item_slack.png'
import notion from '../../assets/image/intro/item/item_notion.png'
import coffee from '../../assets/image/intro/item/item_caffe.png'
import door from '../../assets/image/intro/item/stage03_door.png'
import IntroStageGame from './IntroStageGame.jsx'

// distance: 캐릭터로부터의 거리(u), y: 아이템 중심의 세로 위치(%)
// size: 이미지 너비(u). 이미지마다 여백이 달라서, 실제 그림 면적이 약 13u×13u로 같아 보이도록 이미지별로 계산한 값
// 배경은 1.16배 확대 + 살짝 위로 올려 잔디선을 다른 스테이지와 비슷한 높이로 맞춘다
const config = {
    number: '03',
    name: 'COMPANY',
    background,
    bgScale: 1.16,
    bgOffset: -1.2,
    ground: 19.5,
    sprites: { run, jump, land },
    items: [
        { id: 'slack', src: slack, label: 'SLACK GET!', distance: 75, y: 37, size: 14.3 },
        { id: 'notion', src: notion, label: 'NOTION GET!', distance: 135, y: 42, size: 15.2 },
        { id: 'coffee', src: coffee, label: 'COFFEE GET!', distance: 195, y: 39, size: 13.6 },
    ],
    door: { src: door, distance: 305, size: 44, sink: 2 },
    readyTime: 0.3,
    titleCard: true,
    arriving: true,
}

export default function IntroStage03({ onClear, onSkip, onSelectStage }) {
    return <IntroStageGame config={config} onClear={onClear} onSkip={onSkip} onSelectStage={onSelectStage} />
}
