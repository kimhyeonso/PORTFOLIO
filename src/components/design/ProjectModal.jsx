import { Suspense, useEffect, useRef } from 'react'
import { projectDetails } from '../details/index.js'
import styles from './ProjectModal.module.scss'

/**
 * 프로젝트 카드의 [세부정보]로 여는 팝업 (Design · Frontend · Working 공용). 설명 글 없이 이미지만 보여준다.
 *   components/details에 코드로 만든 상세페이지가 있으면 그것을, 없으면 데이터의 images를 썸네일 없이 바로 보여준다.
 *   상세페이지는 보통 1920px 너비로 만들어져 글씨가 작으므로 팝업을 넓게(최대 1440px) 연다.
 *   images가 아직 없는 프로젝트는 빈 팝업이 되지 않도록 썸네일을 대신 보여준다 (기본 너비).
 * 팝업 내용 넣는 법 (셋 중 하나):
 *   코드로 만든 상세페이지  components/details에 컴포넌트를 만들고 details/index.js에 slug로 등록
 *   이미지만              프로젝트 데이터의 images에 import한 상세 이미지들 (위에서부터 차례로 이어 붙는다)
 *   PDF                  프로젝트 데이터의 pdf에 import한 PDF (브라우저 PDF 뷰어로 보여주고, 새 탭 열기 링크를 단다)
 * 오른쪽 위 닫기(✕)는 내려도 따라온다. Esc · ✕ · 바깥(어두운 부분) 클릭으로 닫히고,
 * 열려 있는 동안 뒤 페이지는 스크롤되지 않는다.
 */
export default function ProjectModal({ project, onClose }) {
    const closeRef = useRef(null)
    // 부모가 다시 그려져 onClose가 새로 만들어져도 아래 효과가 다시 돌지 않게 ref로 들고 있는다
    const onCloseRef = useRef(onClose)
    useEffect(() => {
        onCloseRef.current = onClose
    })

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape') onCloseRef.current()
        }
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', onKeyDown)
        closeRef.current?.focus({ preventScroll: true })
        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [])

    const { title, thumbnail, pdf, images = [] } = project
    const Detail = projectDetails[project.slug]
    const hasDetail = Boolean(pdf || Detail) || images.length > 0

    return (
        <div className={`${styles.scope} project-modal`} onClick={(event) => event.target === event.currentTarget && onClose()}>
            <div className={`project-modal-panel ${hasDetail ? 'is-detail' : ''} ${pdf ? 'is-pdf' : ''}`} role="dialog" aria-modal="true" aria-label={`${title} 세부정보`}>
                {/* PDF 뷰어의 위쪽 도구 막대를 가리지 않도록, PDF일 때는 닫기 버튼과 링크를 따로 한 줄에 둔다 */}
                {pdf && (
                    <a className="project-modal-pdf-link" href={pdf} target="_blank" rel="noreferrer">
                        {title} 발표 자료 · 새 탭에서 열기 ↗
                    </a>
                )}
                <button className="project-modal-close" type="button" ref={closeRef} onClick={onClose} aria-label="팝업 닫기">
                    <span /><span />
                </button>
                <div className="project-modal-media">
                    {pdf ? (
                        <iframe className="project-modal-pdf" src={`${pdf}#view=FitH`} title={`${title} 발표 자료 PDF`} />
                    ) : Detail ? (
                        <Suspense fallback={<div className="project-modal-loading" />}>
                            <Detail />
                        </Suspense>
                    ) : hasDetail
                        ? images.map((image, index) => <img src={image} alt={`${title} 상세 이미지 ${index + 1}`} key={image} />)
                        : thumbnail ? <img src={thumbnail} alt={`${title} 대표 이미지`} /> : <div className="project-modal-empty" />}
                </div>
            </div>
        </div>
    )
}
