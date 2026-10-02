import gsap from 'gsap'
import { useLayoutEffect, useRef, useState } from 'react'
import photo from '../../assets/image/profile/photo.png'
import { contact, equipment, hero, profile, skills, stats, ui } from '../../data/profileStatus.js'
import { skillIcons } from '../../data/skillIcons.js'

/*
 * PROFILE 상태창 안쪽 패널 5종 (글은 전부 profileStatus.js에서 온다).
 * 패널 창 틀 · 진입/퇴장 애니메이션은 ProfilePage가 맡고, 여기서는 내용과 패널 안 인터랙션만 그린다.
 * .reveal 요소는 진입 때 0.06초 간격으로 차례로 올라온다.
 */

// 'YYYY-MM-DD' → 'YYYY년 M월 D일(만 N세)' (만 나이는 오늘 기준)
function formatBirth(birth) {
    const [y, m, d] = birth.split('-').map(Number)
    const today = new Date()
    const hadBirthday = today.getMonth() + 1 > m || (today.getMonth() + 1 === m && today.getDate() >= d)
    const age = today.getFullYear() - y - (hadBirthday ? 0 : 1)
    return `${y}년 ${m}월 ${d}일(만${age}세)`
}

/*
 * 한 줄: { label, value } → 항목(흐리게) · 값(진하게)
 *        'A · B' 문자열 → A(진하게) + B(금빛 태그, 기간 · 연도 등)
 */
function ProfileLine({ line }) {
    if (typeof line !== 'string') {
        return (
            <li>
                <span className="st-line-key">{line.label}</span>
                <span className="st-line-main">{line.birth ? formatBirth(line.birth) : line.value}</span>
            </li>
        )
    }
    const [main, ...rest] = line.split(' · ')
    return (
        <li>
            <span className="st-line-main">{main}</span>
            {rest.length > 0 && <span className="st-line-tag">{rest.join(' · ')}</span>}
        </li>
    )
}

function ProfileLabel({ en, ko }) {
    return <dt><span className="st-row-en">{en}</span><span className="st-row-ko">{ko}</span></dt>
}

// 라벨 | 줄 목록 행들 (+ 전직 목표 행) — PROFILE · CONTACT가 같이 쓴다
function StatusRows({ rows, goal }) {
    return (
        <dl className="st-rows">
            {rows.map((row) => (
                <div className={`st-row reveal ${row.dense ? 'is-dense' : ''}`} key={row.key}>
                    <ProfileLabel en={row.key} ko={row.ko} />
                    <dd>
                        <ul className="st-row-lines">
                            {row.lines.map((line, i) => <ProfileLine key={line.label ?? line ?? i} line={line} />)}
                        </ul>
                    </dd>
                </div>
            ))}
            {goal && (
                <div className="st-row reveal">
                    <ProfileLabel en={goal.key} ko={goal.ko} />
                    <dd className="st-goal">
                        <span className="st-goal-from">{goal.from}</span>
                        <span className="st-goal-arrow" aria-hidden="true" />
                        <span className="st-goal-to">{goal.to}</span>
                    </dd>
                </div>
            )}
        </dl>
    )
}

// 실물 사진 카드(왼쪽) + 정보 행(오른쪽). 왼쪽 무대의 캐릭터와 짝을 이루는 '실제 나'
function ProfilePanel() {
    return (
        <div className="st-profile">
            <figure className="st-photo reveal">
                <div className="st-photo-frame">
                    <img src={photo} alt={ui.photoAlt} draggable="false" />
                </div>
                <figcaption className="st-photo-name">
                    <span className="st-photo-ko">{hero.nameKo}</span>
                    <span className="st-photo-en">{hero.name}</span>
                </figcaption>
            </figure>
            <StatusRows rows={profile.rows} goal={profile.goal} />
        </div>
    )
}

function ContactPanel() {
    return <StatusRows rows={contact.rows} />
}

// onHoverSkill(번호 | null): 같은 색 3D 오브를 키운다
function SkillPanel({ onHoverSkill }) {
    return (
        <ul className="st-skills">
            {skills.map((skill, i) => (
                <li
                    className="st-skill reveal"
                    key={skill.no}
                    style={{ '--c': skill.color }}
                    tabIndex={0}
                    onMouseEnter={() => onHoverSkill(i)}
                    onMouseLeave={() => onHoverSkill(null)}
                    onFocus={() => onHoverSkill(i)}
                    onBlur={() => onHoverSkill(null)}
                >
                    <div className="st-skill-head">
                        <i className="st-orb" aria-hidden="true" />
                        <span className="st-skill-no">{skill.no}</span>
                        <h3 className="st-skill-title">{skill.title}</h3>
                    </div>
                    <ul className="st-chips">
                        {skill.tools.map((tool) => <li key={tool}>{tool}</li>)}
                    </ul>
                    <p className="st-skill-uses">{skill.uses}</p>
                </li>
            ))}
        </ul>
    )
}

// 장비 아이콘: program_skill 이미지가 있으면 이미지, 없으면 tag 글자(팔각)
function GearIcon({ item }) {
    const src = skillIcons[item.name]
    if (src) return <img className="st-gear-icon" src={src} alt="" draggable="false" />
    return <span className="st-tag" aria-hidden="true">{item.tag}</span>
}

/*
 * 장비: 카테고리(디자인 · 영상 · 개발 · AI)를 한 페이지씩 보여주고 < > 버튼으로 넘긴다 (끝에서는 처음으로).
 * 장비 한 줄 = 육각 배지(아이콘) + 이름 + 숙련도만큼 차오르는 유리 막대. 넘기면 그 카테고리의 첫 장비가 선택된다.
 */
function EquipmentPanel({ reduced }) {
    const [page, setPage] = useState(0)
    const [selected, setSelected] = useState(0)
    const dir = useRef(0)
    const listRef = useRef(null)
    const gear = equipment[page]
    const item = gear.items[selected]

    const go = (step) => {
        dir.current = step
        setPage((p) => (p + step + equipment.length) % equipment.length)
        setSelected(0)
    }

    // 막대가 왼쪽에서 차오른다 (처음 열 때는 패널 진입 뒤, 넘길 때는 누른 방향에서 줄이 들어오며)
    useLayoutEffect(() => {
        if (reduced) return undefined
        const rows = listRef.current.children
        const fills = listRef.current.querySelectorAll('.st-gear-fill')
        const tl = gsap.timeline({ delay: dir.current ? 0 : 0.45 })
        if (dir.current) tl.fromTo(rows, { x: dir.current * 36, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.06 }, 0)
        tl.fromTo(fills, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, dir.current ? 0.1 : 0)
        return () => tl.kill()
    }, [page, reduced])

    // < [카테고리 이름 · 장비 막대 3개 · EQUIPPED · 페이지 표시] > — 버튼이 양옆에서 묶음 전체를 감싼다
    return (
        <div className="st-equip" style={{ '--c': gear.color }} role="group" aria-label={ui.equipNav.label}>
            <button className="st-equip-arrow is-prev" type="button" aria-label={ui.equipNav.prev} onClick={() => go(-1)} />

            <div className="st-equip-body">
                <h3 className="st-gear-label reveal" aria-live="polite">
                    <span className="st-gear-en">{gear.en}</span>
                    <span className="st-gear-ko">{gear.ko}</span>
                </h3>

                <ul className="st-gear-list reveal" ref={listRef}>
                    {gear.items.map((it, ii) => (
                        <li key={it.tag}>
                            <button
                                className={`st-gear-item ${selected === ii ? 'is-selected' : ''}`}
                                style={it.color ? { '--c': it.color } : undefined}
                                type="button"
                                aria-pressed={selected === ii}
                                aria-label={`${it.name} ${ui.levelLabel} ${it.level}`}
                                // mouseenter 대신 pointermove: 넘길 때 미끄러져 들어온 줄이 멈춘 포인터 아래를 지나가도 선택되지 않게
                                onPointerMove={() => setSelected(ii)}
                                onFocus={() => setSelected(ii)}
                                onClick={() => setSelected(ii)}
                            >
                                {/* 배지 오른쪽에 막대, 배지 아래에 이름 */}
                                <span className="st-gear-badge" aria-hidden="true"><GearIcon item={it} /></span>
                                <span className="st-gear-track" aria-hidden="true">
                                    <span className="st-gear-fill" style={{ '--lv': it.level / 100 }} />
                                </span>
                                <span className="st-gear-name" aria-hidden="true">{it.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="st-equipped reveal" style={item.color ? { '--c': item.color } : undefined} aria-live="polite">
                    <span className="st-equipped-label">{ui.equippedLabel}</span>
                    <GearIcon item={item} />
                    <strong className="st-equipped-name">{item.name}</strong>
                    <span className="st-equipped-lv">{ui.levelLabel} {item.level}</span>
                    <span className="st-equipped-gear">{gear.en} · {gear.ko}</span>
                </div>

                <span className="st-equip-page reveal">
                    <span className="st-equip-pips" aria-hidden="true">
                        {equipment.map((g, i) => <i key={g.en} className={i === page ? 'is-on' : ''} />)}
                    </span>
                    {page + 1} / {equipment.length}
                </span>
            </div>

            <button className="st-equip-arrow is-next" type="button" aria-label={ui.equipNav.next} onClick={() => go(1)} />
        </div>
    )
}

// 막대가 아래에서 차오르고(0.08초 간격) 숫자가 올라간다. 막대를 고르면 아래 대화창에 설명
function StatsPanel({ reduced }) {
    const [selected, setSelected] = useState(0)
    const root = useRef(null)
    const numbers = useRef([])
    const stat = stats[selected]

    useLayoutEffect(() => {
        const fills = root.current.querySelectorAll('.st-bar-fill')
        if (reduced) {
            gsap.set(fills, { scaleY: 1 })
            numbers.current.forEach((el, i) => { el.textContent = stats[i].value })
            return undefined
        }
        const counters = stats.map(() => ({ v: 0 }))
        const tl = gsap.timeline({ delay: 0.35 })
        tl.fromTo(fills, { scaleY: 0 }, { scaleY: 1, duration: 1.1, ease: 'power3.out', stagger: 0.08 }, 0)
        tl.to(counters, {
            v: (i) => stats[i].value,
            duration: 1.1,
            ease: 'power3.out',
            stagger: 0.08,
            onUpdate: () => counters.forEach((c, i) => { numbers.current[i].textContent = Math.round(c.v) }),
        }, 0)
        return () => tl.kill()
    }, [reduced])

    return (
        <div className="st-stats" ref={root}>
            <ul className="st-bars">
                {stats.map((s, i) => (
                    <li key={s.abbr} className="reveal">
                        <button
                            className={`st-bar ${selected === i ? 'is-selected' : ''}`}
                            type="button"
                            aria-pressed={selected === i}
                            aria-label={`${s.en} ${s.ko} ${s.value}`}
                            onMouseEnter={() => setSelected(i)}
                            onFocus={() => setSelected(i)}
                            onClick={() => setSelected(i)}
                        >
                            <span className="st-bar-value" ref={(el) => { numbers.current[i] = el }} aria-hidden="true">0</span>
                            <span className="st-bar-track" aria-hidden="true">
                                <span className="st-bar-fill" style={{ height: `${s.value}%` }} />
                            </span>
                            <span className="st-bar-abbr" aria-hidden="true">{s.abbr}</span>
                            <span className="st-bar-ko" aria-hidden="true">{s.ko}</span>
                        </button>
                    </li>
                ))}
            </ul>
            <div className="st-dialog reveal" aria-live="polite">
                <p className="st-dialog-name">{stat.abbr} · {stat.en} <span>{stat.ko} {stat.value}</span></p>
                <p className="st-dialog-text">{stat.note}</p>
                <span className="st-dialog-cursor" aria-hidden="true">▼</span>
            </div>
        </div>
    )
}


export default function Panel({ name, onHoverSkill, reduced }) {
    if (name === 'skill') return <SkillPanel onHoverSkill={onHoverSkill} />
    if (name === 'equipment') return <EquipmentPanel reduced={reduced} />
    if (name === 'stats') return <StatsPanel reduced={reduced} />
    if (name === 'contact') return <ContactPanel />
    return <ProfilePanel />
}
