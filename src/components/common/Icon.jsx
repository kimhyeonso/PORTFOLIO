import menuIcon from '../../assets/icons/density_small_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg'
import homeIcon from '../../assets/icons/reply_all_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg'
import closeIcon from '../../assets/icons/close_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg'
import playIcon from '../../assets/icons/play_arrow_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg'
import styles from './Icon.module.scss'

const icons = { menu: menuIcon, home: homeIcon, close: closeIcon, play: playIcon }

/**
 * assets/icons의 SVG 아이콘. SVG를 마스크로 써서 글자색(currentColor)으로 칠하므로
 * 버튼마다 color만 바꾸면 흰색 · 검은색 · 갈색 등으로 맞출 수 있다. 크기는 width · height(기본 1em)로 조절.
 *   name  'menu' | 'home' | 'close' | 'play'
 */
export default function Icon({ name, className = '' }) {
    return <span className={`${styles.icon} ${className}`} style={{ '--icon-src': `url("${icons[name]}")` }} aria-hidden="true" />
}
