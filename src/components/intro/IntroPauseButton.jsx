import playIcon from '../../assets/icons/playButton01.png'
import pauseIcon from '../../assets/icons/playButton02.png'
import styles from './IntroPauseButton.module.scss'

// 재생 중에는 일시정지 아이콘, 멈춘 상태에서는 재생 아이콘을 같은 자리에 보여준다
export default function IntroPauseButton({ paused, onToggle }) {
    return (
        <button className={`${styles.scope} intro-pause`} type="button" onClick={onToggle} aria-pressed={paused} aria-label={paused ? 'Resume' : 'Pause'}>
            <img src={paused ? playIcon : pauseIcon} alt="" />
        </button>
    )
}
