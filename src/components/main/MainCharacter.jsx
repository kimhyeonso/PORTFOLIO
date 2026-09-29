import back from '../../assets/image/home/back.png'
import sideLeft from '../../assets/image/home/side-left.png'
import backLeft from '../../assets/image/home/back-left.png'
import backRight from '../../assets/image/home/back-right.png'
import sideRight from '../../assets/image/home/side-right.png'
import styles from './MainCharacter.module.scss'

const poses = { back, 'side-left': sideLeft, 'back-left': backLeft, 'back-right': backRight, 'side-right': sideRight }

/**
 * 홀 중앙의 캐릭터. pose로 바라보는 방향을, target으로 걸어갈 문 위치(스테이지 %)를 받는다.
 * 문을 고르지 않았을 때는 정면 뒷모습(back). target이 있으면 문 앞까지 걸어가며 원근감 있게 작아진다.
 */
export default function MainCharacter({ pose = 'back', target }) {
    const style = target ? { '--x': `${target.x}%`, '--y': `${target.y}%`, '--h': `${target.h}%` } : undefined

    return (
        <div className={`${styles.scope} main-character ${target ? 'is-walking' : ''}`} style={style} role="img" aria-label="Portfolio character">
            {Object.entries(poses).map(([name, src]) => (
                <img className={name === pose ? 'is-active' : ''} data-pose={name} key={name} src={src} alt="" />
            ))}
        </div>
    )
}
