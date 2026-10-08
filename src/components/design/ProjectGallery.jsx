import { useEffect, useRef, useState } from 'react'
import PageBar from '../common/PageBar.jsx'
import ProjectCard from './ProjectCard.jsx'
import ProjectControlBar from './ProjectControlBar.jsx'
import ProjectModal, { previewOf } from './ProjectModal.jsx'
import ProjectRing from './ProjectRing.jsx'
import styles from './ProjectGallery.module.scss'

const WHEEL_LOCK = 650 // ms, 휠 한 번에 카드 한 장씩만 넘어가도록
const DRAG_DISTANCE = 40 // px, 이만큼 끌면 드래그로 보고 손을 뗄 때 최소 한 칸 넘어간다 (이보다 짧으면 일반 클릭)
const MAX_DRAG_STEPS = 3 // 한 번 끌어서 넘어갈 수 있는 최대 칸 수

// 카드 한 칸이 화면에서 차지하는 가로 길이(px). 끄는 거리를 칸 수로 바꿀 때 쓴다 (SCSS의 카드 너비와 맞춤)
function stepWidth(mode) {
    const mobile = window.innerWidth <= 900
    if (mode === 'ring') return window.innerWidth * (mobile ? 0.58 : 0.3)
    return window.innerWidth * (mobile ? 0.885 : 0.829)
}

/**
 * 디자인/프론트엔드 공용 갤러리. 두 가지 보기를 오른쪽 아래 버튼으로 전환한다.
 *   ring: 썸네일을 원통에 둘러 붙여 돌려 보는 보기 (기본)
 *   card: 정보가 들어간 카드를 가로로 넘겨 보는 보기
 * imageOnly: 원통 보기 카드에서 글자를 빼고 썸네일만 보여준다.
 * onExit: 넘기면 왼쪽 위에 홈으로 나가는 문 버튼을 띄운다.
 * 카드의 [세부정보](또는 카드 보기에서 아래 조작 바 제목)를 누르면 새 페이지 대신 ProjectModal 팝업(이미지만)이 열린다.
 * 탭은 해당 분류의 첫 카드로 이동하고, 현재 카드의 분류가 탭에 표시된다.
 * 이동: 탭 · 아래 조작 바 · 옆 카드 클릭 · ←/→ 키 · 마우스 휠 · 클릭 드래그 / 터치 스와이프
 * initialSlug: 메뉴 썸네일로 들어왔을 때 그 프로젝트의 카드 보기로 바로 연다 (원통 인트로 생략)
 */
export default function ProjectGallery({ projects, tabs, background, label, onMenuToggle, imageOnly = false, onExit, initialSlug }) {
    const count = projects.length
    const initialIndex = initialSlug ? projects.findIndex((project) => project.slug === initialSlug) : -1
    // 원통이 짧은 방향으로 돌도록 index 대신 끝없이 늘어나는 회전 칸 수를 기억한다
    const [position, setPosition] = useState(Math.max(0, initialIndex))
    const [mode, setMode] = useState(initialIndex >= 0 ? 'card' : 'ring')
    // 페이지에 처음 들어왔을 때만 원통이 몇 바퀴 도는 인트로 (카드 보기에서 돌아올 땐 생략)
    const [intro, setIntro] = useState(() => initialIndex < 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    // 보기를 바꾸면 인트로는 끝난 것으로 본다 (인트로 도중 전환했다 돌아와도 다시 돌지 않게)
    const changeMode = (next) => {
        setIntro(false)
        setMode(next)
    }
    const wheelLockRef = useRef(0)
    const dragRef = useRef(null)
    const draggedRef = useRef(false)
    const galleryRef = useRef(null)
    const index = ((position % count) + count) % count
    // 팝업으로 보고 있는 프로젝트 (없으면 null)
    const [detail, setDetail] = useState(null)
    // detail: false인 프로젝트는 세부정보 팝업이 없다
    const openDetail = (project) => project.detail !== false && setDetail(project)
    const activeCategory = projects[index]?.category

    const go = (target) => {
        if (!count) return
        setPosition((current) => {
            const from = ((current % count) + count) % count
            let delta = target - from
            if (delta > count / 2) delta -= count
            if (delta < -count / 2) delta += count
            return current + delta
        })
    }
    // 원통은 끝없이 돌고, 카드 보기는 처음/끝에서 멈춘다
    const step = (direction) => {
        if (!count) return
        setPosition((current) => {
            const from = ((current % count) + count) % count
            if (mode === 'card' && (from + direction < 0 || from + direction > count - 1)) return current
            return current + direction
        })
    }

    useEffect(() => {
        const onKeyDown = (event) => {
            // 팝업이 열려 있으면 뒤 갤러리는 넘기지 않는다
            if (detail) return
            if (event.key === 'ArrowRight') step(1)
            if (event.key === 'ArrowLeft') step(-1)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    })

    const handleWheel = (event) => {
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
        if (Math.abs(delta) < 10 || event.timeStamp - wheelLockRef.current < WHEEL_LOCK) return
        wheelLockRef.current = event.timeStamp
        step(delta > 0 ? 1 : -1)
    }

    // 마우스 클릭 드래그와 터치 스와이프를 포인터 이벤트 하나로 처리한다.
    // 끄는 동안에는 React를 다시 그리지 않고 CSS 변수(--drag)만 바꿔 원통/카드가 손을 바로 따라오게 하고,
    // 손을 떼면 가장 가까운 칸으로 넘긴다.
    const setDrag = (px) => galleryRef.current?.style.setProperty('--drag', px)
    const handlePointerDown = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return
        dragRef.current = { x: event.clientX, y: event.clientY, width: stepWidth(mode) }
        draggedRef.current = false
        // 원통 보기: 한 칸 너비만큼 끌면 한 칸 각도만큼 돌도록
        galleryRef.current?.style.setProperty('--drag-deg', `${360 / count / dragRef.current.width}deg`)
    }
    const handlePointerMove = (event) => {
        if (!dragRef.current) return
        const dx = event.clientX - dragRef.current.x
        if (!draggedRef.current) {
            // 가로로 조금이라도 움직이면 바로 드래그 시작 (세로 움직임이 더 크면 스크롤로 둔다)
            if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(event.clientY - dragRef.current.y)) return
            draggedRef.current = true
            galleryRef.current?.classList.add('is-dragging')
            event.currentTarget.setPointerCapture?.(event.pointerId)
        }
        setDrag(dx)
    }
    const handlePointerUp = (event) => {
        if (!dragRef.current) return
        const dx = event.clientX - dragRef.current.x
        const width = dragRef.current.width
        dragRef.current = null
        // 드래그 표시를 끄고 끈 거리를 0으로 되돌리는 것과 칸 이동을 같은 프레임에 반영해,
        // 끌던 위치에서 목표 칸까지 이어서 부드럽게 움직이게 한다
        galleryRef.current?.classList.remove('is-dragging')
        setDrag(0)
        if (!draggedRef.current || Math.abs(dx) < DRAG_DISTANCE) return
        const steps = Math.min(MAX_DRAG_STEPS, Math.max(1, Math.round(Math.abs(dx) / width)))
        for (let i = 0; i < steps; i += 1) step(dx < 0 ? 1 : -1)
    }
    // 드래그가 끝나며 발생하는 클릭이 카드를 열지 않도록 막는다
    const handleClickCapture = (event) => {
        if (!draggedRef.current) return
        draggedRef.current = false
        event.preventDefault()
        event.stopPropagation()
    }

    const selectTab = (category) => {
        const first = projects.findIndex((project) => project.category === category)
        if (first >= 0) go(first)
    }

    // 아직 프로젝트가 하나도 없을 때: 탭과 준비 중 안내만 보여준다
    if (count === 0) {
        return (
            <main className={`${styles.scope} project-gallery is-empty`} style={{ '--gallery-bg': `url(${background})` }} aria-label={label}>
                <PageBar label={`${label} 분류`} tabs={tabs} active={tabs[0]?.key} onExit={onExit} onMenuToggle={onMenuToggle} />
                <p className="project-gallery-empty">COMING SOON</p>
            </main>
        )
    }

    return (
        <>
            <main className={`${styles.scope} project-gallery is-${mode}`} ref={galleryRef} style={{ '--gallery-bg': `url(${background})` }} aria-label={label} onWheel={handleWheel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onClickCapture={handleClickCapture}>
                <PageBar label={`${label} 분류`} tabs={tabs} active={activeCategory} onSelect={selectTab} onExit={onExit} onMenuToggle={onMenuToggle} />

                <div className="project-gallery-stage" aria-live="polite" key={mode}>
                    {mode === 'ring' ? (
                        <ProjectRing projects={projects} position={position} activeIndex={index} onOpen={(target) => { go(target); changeMode('card') }} intro={intro} onIntroEnd={() => setIntro(false)} imageOnly={imageOnly} />
                    ) : (
                        <div className="project-gallery-viewport">
                            <div className="project-gallery-track" style={{ '--index': index }}>
                                {projects.map((project, cardIndex) => (
                                    <ProjectCard key={project.slug} project={project} isActive={cardIndex === index} onSelect={() => go(cardIndex)} onOpen={() => openDetail(project)} onPreview={() => setDetail(previewOf(project))} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="project-gallery-bottom">
                    {/* 두 보기 공통 조작 바. 제목을 누르면 원통 보기에선 카드 보기로, 카드 보기에선 세부정보 팝업으로 */}
                    <ProjectControlBar project={projects[index]} onPrev={() => step(-1)} onNext={() => step(1)} onOpen={() => (mode === 'ring' ? changeMode('card') : openDetail(projects[index]))} />
                    <button className="project-view-toggle" type="button" onClick={() => changeMode(mode === 'ring' ? 'card' : 'ring')} aria-label={mode === 'ring' ? '카드 보기로 전환' : '원통 보기로 전환'}>
                        {mode === 'ring' ? <span className="icon-lines" aria-hidden="true"><i /><i /><i /></span> : <span className="icon-ring" aria-hidden="true" />}
                    </button>
                </div>
            </main>
            {/* 갤러리의 휠·드래그 처리에 걸리지 않도록 main 바깥에 띄운다 */}
            {detail && <ProjectModal project={detail} onClose={() => setDetail(null)} />}
        </>
    )
}
