import { useEffect, useRef, useState } from 'react'
import { designProjects } from '../../data/designProjects.js'
import { frontendProjects } from '../../data/frontendProjects.js'
import { workProjects } from '../../data/workProjects.js'
import styles from './MenuOverlay.module.scss'

// 메뉴 섹션. projects가 있으면 제목 아래에 썸네일 목록을 보여주고, 썸네일은 base/project/{slug}로 간다
// (그 목록 페이지가 열리며 해당 프로젝트의 카드 보기 · Working은 그 줄을 바로 보여준다)
const sections = [
  { label: 'HOME', path: '/' },
  { label: 'PROFILE', path: '/profile' },
  { label: 'DESIGN', path: '/design', projects: designProjects, base: '/design' },
  { label: 'FRONTEND', path: '/frontend', projects: frontendProjects, base: '/frontend' },
  { label: 'WORKING', path: '/working', projects: workProjects, base: '/working' },
]

/**
 * 썸네일 한 줄. 넘치는 만큼은 양옆 ‹ › 버튼(또는 가로 스와이프)으로 한 화면씩 넘긴다.
 * 처음/끝에 닿으면 그쪽 버튼을 끄고, 한 화면에 다 들어가면 버튼을 숨긴다.
 */
function ProjectRow({ label, projects, onOpen }) {
  const listRef = useRef(null)
  const [edges, setEdges] = useState({ start: true, end: true })

  useEffect(() => {
    const list = listRef.current
    const update = () => {
      const max = list.scrollWidth - list.clientWidth
      setEdges({ start: list.scrollLeft <= 1, end: list.scrollLeft >= max - 1 })
    }
    update()
    list.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(list)
    return () => {
      list.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])

  const page = (direction) => listRef.current.scrollBy({ left: direction * listRef.current.clientWidth, behavior: 'smooth' })
  const scrollable = !(edges.start && edges.end)

  return (
    <div className="menu-overlay-row">
      <ul className="menu-overlay-grid" ref={listRef}>
        {projects.map((project) => (
          <li key={project.slug}>
            <button type="button" onClick={() => onOpen(project)}>
              <span className="menu-overlay-thumb">
                {project.thumbnail ? <img src={project.thumbnail} alt="" loading="lazy" /> : <span className="menu-overlay-thumb-empty" />}
              </span>
              <strong>{project.title}</strong>
              <em>{project.type} · {project.year}</em>
            </button>
          </li>
        ))}
      </ul>
      {scrollable && (
        <>
          <button className="menu-overlay-arrow is-prev" type="button" onClick={() => page(-1)} disabled={edges.start} aria-label={`${label} 이전 프로젝트`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button className="menu-overlay-arrow is-next" type="button" onClick={() => page(1)} disabled={edges.end} aria-label={`${label} 다음 프로젝트`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
    </div>
  )
}

/**
 * 햄버거 버튼으로 여는 전체 화면 메뉴.
 * 오른쪽 위 닫기(✕), ▽ 큰 섹션 제목(Jersey 10 글꼴)과 프로젝트 썸네일 한 줄(ProjectRow)이 이어진다.
 * Esc로 닫고, 열려 있는 동안 뒤 페이지는 스크롤되지 않는다.
 */
export default function MenuOverlay({ isOpen, onClose, onNavigate }) {
  const closeRef = useRef(null)
  // 부모가 다시 그려질 때마다 onClose가 새로 만들어져도 아래 효과가 다시 돌지 않게 ref로 들고 있는다
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!isOpen) return undefined
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
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={`${styles.scope} menu-overlay`} role="dialog" aria-modal="true" aria-label="Navigation menu">
      <button className="menu-overlay-close" type="button" ref={closeRef} onClick={onClose} aria-label="메뉴 닫기">
        <span /><span />
      </button>

      <div className="menu-overlay-body">
        {sections.map((section, index) => (
          <section className="menu-overlay-section" key={section.path} style={{ '--i': index }} aria-label={section.label}>
            <h2>
              <button type="button" onClick={() => onNavigate(section.path)}>
                <span className="menu-overlay-mark" aria-hidden="true" />
                {section.label}
              </button>
            </h2>
            {section.projects?.length > 0 && <ProjectRow label={section.label} projects={section.projects} onOpen={(project) => onNavigate(`${section.base}/project/${project.slug}`)} />}
          </section>
        ))}
      </div>
    </div>
  )
}
