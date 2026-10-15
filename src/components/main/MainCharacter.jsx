import back from '../../assets/image/home/back.png'
import sideLeft from '../../assets/image/home/side-left.png'
import backLeft from '../../assets/image/home/back-left.png'
import backRight from '../../assets/image/home/back-right.png'
import sideRight from '../../assets/image/home/side-right.png'
import walkBackLeft01 from '../../assets/image/home/walk/walk-back-left-01.webp'
import walkBackLeft02 from '../../assets/image/home/walk/walk-back-left-02.webp'
import walkBackLeft03 from '../../assets/image/home/walk/walk-back-left-03.webp'
import walkBackLeft04 from '../../assets/image/home/walk/walk-back-left-04.webp'
import walkBackLeft05 from '../../assets/image/home/walk/walk-back-left-05.webp'
import walkBackRight01 from '../../assets/image/home/walk/walk-back-right-01.webp'
import walkBackRight02 from '../../assets/image/home/walk/walk-back-right-02.webp'
import walkBackRight03 from '../../assets/image/home/walk/walk-back-right-03.webp'
import walkBackRight04 from '../../assets/image/home/walk/walk-back-right-04.webp'
import walkBackRight05 from '../../assets/image/home/walk/walk-back-right-05.webp'
import styles from './MainCharacter.module.scss'

const poses = { back, 'side-left': sideLeft, 'back-left': backLeft, 'back-right': backRight, 'side-right': sideRight }
const walkFrames = {
    'back-left': [walkBackLeft01, walkBackLeft02, walkBackLeft03, walkBackLeft04, walkBackLeft05],
    'back-right': [walkBackRight01, walkBackRight02, walkBackRight03, walkBackRight04, walkBackRight05],
}

/**
 * 홀 중앙의 캐릭터. pose로 바라보는 방향을, target으로 걸어갈 문 위치(스테이지 %)를 받는다.
 * 문을 고르지 않았을 때는 정면 뒷모습(back). target이 있으면 문 앞까지 걸어가며 원근감 있게 작아진다.
 */
export default function MainCharacter({ pose = 'back', target }) {
    const style = target ? { '--x': `${target.x}%`, '--y': `${target.y}%`, '--h': `${target.h}%` } : undefined
    const frames = target && walkFrames[pose]

    return (
        <div className={`${styles.scope} main-character ${target ? 'is-walking' : ''}`} style={style} role="img" aria-label="Portfolio character">
            {frames ? (
                <span className="main-character-walk-frames" style={{ '--frames': frames.length }}>
                    {frames.map((src, index) => <img className="main-character-walk-frame" key={src} src={src} alt="" style={{ '--i': index }} />)}
                </span>
            ) : (
                Object.entries(poses).map(([name, src]) => (
                    <img className={name === pose ? 'is-active' : ''} data-pose={name} key={name} src={src} alt="" />
                ))
            )}
        </div>
    )
}
