import { forwardRef } from 'react'
import styles from './HallPage.module.scss'

/**
 * 위아래로 스크롤하는 페이지(Working · Profile)의 공용 틀.
 * 홀 배경(background)을 화면에 고정하고 크림빛을 옅게 덮은 뒤, 위쪽 고정 막대(PageBar) 높이만큼 비우고 내용을 놓는다.
 * Design/Frontend 갤러리(ProjectGallery)와 같은 배경 · 덮개 값을 쓴다.
 */
const HallPage = forwardRef(function HallPage({ background, label, className = '', children }, ref) {
    return (
        <main className={`${styles.scope} hall-page ${className}`} ref={ref} style={{ '--hall-bg': `url(${background})` }} aria-label={label}>
            {children}
        </main>
    )
})

export default HallPage
