import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import burst from '../../assets/image/intro/item/item_light.png'
import sparkle from '../../assets/image/intro/item/character_light.png'
import dust from '../../assets/image/intro/item/jump.png'
import exclamation from '../../assets/image/intro/item/exclamation.png'
import { allIntroItems, toInventoryItem } from '../../data/introItems.js'
import IntroPauseButton from './IntroPauseButton.jsx'
import IntroPauseModal from './IntroPauseModal.jsx'
import styles from './IntroStageGame.module.scss'

// 화면 높이의 1% (u). 배경이 높이 기준으로 깔리므로 지면/아이템 위치가 어떤 화면비에서도 맞는다.
// 아이템 · 문 · 점프 · 속도는 월드 단위(w)로 잰다 — PC에서는 w = u, 캐릭터가 작아지는 모바일에서는 그 비율만큼 작다.
const SPEED = 42 // w / s
const JUMP_TIME = 0.78 // s, 한 번 점프의 체공 시간
const JUMP_HEIGHT = 15 // w, 한 번 점프 높이 (이중 점프는 공중에서 같은 힘으로 한 번 더 → 꼭대기에서 하면 약 30)
const GRAVITY = (8 * JUMP_HEIGHT) / JUMP_TIME ** 2 // w / s² — 위 두 값에서 나온다
const JUMP_SPEED = (4 * JUMP_HEIGHT) / JUMP_TIME // w / s
const LAND_TIME = 0.16 // s
/*
 * 아이템 높이(잔디선 → 아이템 중심, w) 단계 — 높을수록 어렵다
 *   ~ RUN_ITEM_MAX     달리면서 먹는다 (점프 없음)
 *   ~ SINGLE_ITEM_MAX  한 번 점프 (낮은 것은 꼭대기 전에, 높은 것은 꼭대기에서)
 *   그 위              이중 점프 (꼭대기에서 한 번 더)
 * 캐릭터는 발(y)부터 HERO_REACH 위(머리 · 손 끝)까지 아이템에 닿으면 먹는다. 닿지 않고 지나가면 놓친다(회색으로 남는다)
 */
const RUN_ITEM_MAX = 22
const SINGLE_ITEM_MAX = 42
const HERO_REACH = 25 // w
const RUN_FRAME_TIME = 0.1 // s, 달리기 프레임(runFrames) 한 장이 보이는 시간
const TITLE_TIME = 2.2 // s, 타이틀 카드 노출 시간
const HINT_LINGER = 2000 // ms, 첫 아이템을 먹은 뒤에도 조작 안내를 더 보여주는 시간
const ENTER_TIME = 1.3 // s, 문 진입 → 화면 전환
const PORTAL_ENTER_TIME = 2 // s, 포털에 빨려 들어감 → 화면 전환
const PORTAL_BITS = Array.from({ length: 12 }, (_, index) => index)
// 캐릭터 크기 · 왼쪽 위치는 CSS(--hero-size · --hero-left, 모바일은 따로)에서 정하고, 판정에는 그려진 크기를 읽어 쓴다
const HERO_BASE = 27 // u, PC 캐릭터 크기 (CSS --hero-size 기본값과 같다) — 월드 단위(w)의 기준
// 멈춤/재생: 게임 루프(pausedRef)와 인벤토리로 날아가는 아이템(flightsRef)을 함께 멈춘다
function applyPause(next, pausedRef, flightsRef, setPaused) {
    pausedRef.current = next
    setPaused(next)
    flightsRef.current.forEach((flight) => (next ? flight.timeline.pause() : flight.timeline.resume()))
}
const HIT_OFFSET = 0.62 // 점프 스프라이트의 손 위치 (캐릭터 너비 비율)


/**
 * 횡스크롤 스테이지 공용 컴포넌트.
 * config: { number, name, background, bgScale, bgOffset, bgPanAspect, ground, sprites, items, door, readyTime, exclaim, titleCard, hint, arriving, clearMessage }
 * inventory: 지금까지(이전 스테이지 포함) 먹은 아이템 [{ id, src, name, size }] → 왼쪽 아래 인벤토리(전체 아이템 칸)에서 이 아이템들만 색으로 채운다
 * onCollect: 아이템을 먹을 때 (item)
 * onRestart: 일시정지 모달의 BACK TO START — Press Start 전 시작 화면으로
 */
export default function IntroStageGame({ config, onClear, onSkip, onSelectStage, onRestart, inventory = [], onCollect }) {
    const { number, name, background, bgScale = 1, bgOffset = 0, bgPanAspect, ground, sprites, items, door, readyTime = 1, exclaim, titleCard, hint, arriving, clearMessage } = config
    const rootRef = useRef(null)
    const bgRef = useRef(null)
    const heroRef = useRef(null)
    const doorRef = useRef(null)
    const itemRefs = useRef([])
    const pausedRef = useRef(false)
    const jumpRequestRef = useRef(false)
    const onClearRef = useRef(onClear)
    const onCollectRef = useRef(onCollect)
    // 인벤토리로 날아가는 중인 아이템들 { timeline, land } — 일시정지 때 같이 멈추고, 스테이지를 떠나면 바로 칸에 넣는다
    const flightsRef = useRef(new Set())
    const [phase, setPhase] = useState(titleCard ? 'title' : 'ready')
    const [pose, setPose] = useState('run')
    const [paused, setPaused] = useState(false)
    const [collectedCount, setCollectedCount] = useState(0)
    // 조작 안내는 첫 아이템을 먹고도 HINT_LINGER 동안 더 보여준 뒤 사라진다
    const [hintDone, setHintDone] = useState(false)
    const [dustKey, setDustKey] = useState(0)
    const [sparkKey, setSparkKey] = useState(0)
    // 이번 점프가 땅에 닿기까지 걸리는 시간 — 점프 프레임을 그 동안 한 번에 다 넘긴다 (이중 점프는 다시 처음부터)
    const [jumpDuration, setJumpDuration] = useState(JUMP_TIME)
    // 지금 자세에 여러 장 프레임(runFrames · jumpFrames · landFrames)이 있으면 차례로 넘겨 보여준다.
    // 점프 · 착지는 그 자세가 유지되는 시간(jumpDuration · LAND_TIME) 동안 한 번에 다 지나가도록 장당 시간을 나눈다
    // jump2(이중 점프)는 점프와 같은 그림을 쓰되, 자세 이름이 달라 프레임이 처음부터 다시 넘어간다
    const spritePose = pose === 'jump2' ? 'jump' : pose
    const poseFrames = sprites[`${spritePose}Frames`]
    const poseDuration = { jump: jumpDuration, jump2: jumpDuration, land: LAND_TIME }[pose]
    const poseFrameTime = poseFrames && poseDuration ? poseDuration / poseFrames.length : RUN_FRAME_TIME

    const hasCollected = collectedCount > 0
    useEffect(() => {
        if (!hint || !hasCollected) return undefined
        const timer = setTimeout(() => setHintDone(true), HINT_LINGER)
        return () => clearTimeout(timer)
    }, [hint, hasCollected])

    useEffect(() => {
        onClearRef.current = onClear
        onCollectRef.current = onCollect
    }, [onClear, onCollect])

    // 자세가 바뀔 때(점프 → 착지 등) 새로 붙는 이미지가 로딩 · 디코딩 중이라 캐릭터가 잠깐 사라지지 않도록
    // 스프라이트를 미리 불러와 디코딩까지 해 두고, 스테이지에 있는 동안 참조를 잡아 둔다
    useEffect(() => {
        const images = Object.values(sprites).flat().map((src) => {
            const image = new Image()
            image.src = src
            image.decode?.().catch(() => {})
            return image
        })
        return () => images.splice(0)
    }, [sprites])

    useEffect(() => {
        const root = rootRef.current
        // y · vy: 캐릭터 발 높이(w)와 세로 속도, air: 공중, doubled: 이번 체공에 이중 점프를 썼는지
        // passed: 먹었거나 놓쳐서 지나간 아이템 (모두 지나가야 문이 열린다)
        const game = { time: 0, scroll: 0, walk: 0, phase: titleCard ? 'title' : 'ready', y: 0, vy: 0, air: false, doubled: false, landTime: 0, enterTime: 0, pose: 'run', collected: new Set(), passed: new Set(), unit: 0, width: 0, heroLeft: 0, heroWidth: 0, world: 0 }
        const readyEnd = (titleCard ? TITLE_TIME : 0) + readyTime
        let last = performance.now()
        let frame = 0
        // 배경 이미지 가로/세로 비율. 로드 전에는 0이라 배경이 움직이지 않는다.
        let bgAspect = 0
        const bgImage = new Image()
        bgImage.onload = () => {
            bgAspect = bgImage.naturalWidth / bgImage.naturalHeight
        }
        bgImage.src = background

        const changePhase = (next) => {
            game.phase = next
            setPhase(next)
        }
        const changePose = (next) => {
            if (game.pose === next) return
            game.pose = next
            setPose(next)
        }
        // 점프 (공중에서 다시 부르면 이중 점프). 땅에 닿기까지의 시간을 계산해 점프 프레임 길이로 넘긴다
        const startJump = (isDouble = false) => {
            game.vy = JUMP_SPEED
            game.air = true
            game.doubled = isDouble
            game.landTime = 0
            setJumpDuration((game.vy + Math.sqrt(game.vy ** 2 + 2 * GRAVITY * game.y)) / GRAVITY)
            changePose(isDouble ? 'jump2' : 'jump')
        }
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        /*
         * 먹은 아이템 그림을 인벤토리의 제 칸(회색 자리)까지 날려 보낸다: 살짝 튀어 오른 뒤 곡선을 그리며 작아져 칸에 내려앉고,
         * 도착하면 onCollect(칸이 색으로 채워지며 튄다). 제자리 그림은 .is-collected로 숨긴다
         */
        const flyToInventory = (item, node) => {
            const land = () => onCollectRef.current?.(toInventoryItem(item))
            const art = node.querySelector('.sg-item-art img')
            const slot = root.querySelector(`.sg-inventory li[data-id="${item.id}"] img`)
            if (reducedMotion || !art || !slot) {
                land()
                return
            }
            const rootRect = root.getBoundingClientRect()
            const from = art.getBoundingClientRect()
            const to = slot.getBoundingClientRect()
            const clone = document.createElement('img')
            clone.className = 'sg-fly'
            clone.src = art.src
            clone.alt = ''
            Object.assign(clone.style, { left: `${from.left - rootRect.left}px`, top: `${from.top - rootRect.top}px`, width: `${from.width}px` })
            root.appendChild(clone)

            const dx = to.left + to.width / 2 - (from.left + from.width / 2)
            const dy = to.top + to.height / 2 - (from.top + from.height / 2)
            const flight = { land }
            flight.timeline = gsap.timeline({
                paused: pausedRef.current,
                onComplete: () => {
                    clone.remove()
                    flightsRef.current.delete(flight)
                    land()
                },
            })
                .to(clone, { scale: 1.25, rotation: -8, duration: 0.18, ease: 'back.out(3)' })
                // 가로는 고르게, 세로는 살짝 떠올랐다가 떨어지게(back.in) 나눠 움직여 곡선을 그린다
                .to(clone, { x: dx, duration: 0.7, ease: 'power1.inOut' }, 0.18)
                .to(clone, { y: dy, duration: 0.7, ease: 'back.in(1.6)' }, 0.18)
                .to(clone, { scale: to.width / from.width, rotation: 0, duration: 0.7, ease: 'power2.in' }, 0.18)
            flight.clone = clone
            flightsRef.current.add(flight)
        }
        const collect = (item, node) => {
            game.collected.add(item.id)
            // 그림이 지금 떠 있는 위치에서 출발하도록 숨기기 전에 잰다
            flyToInventory(item, node)
            node.classList.add('is-collected')
            setCollectedCount(game.collected.size)
            setSparkKey((key) => key + 1)
        }

        const tick = (now) => {
            // 스테이지가 사라지는 중이면(ref가 먼저 비워지고 정리 함수는 조금 늦게 불린다) 그대로 멈춘다
            if (!heroRef.current) return
            const dt = pausedRef.current ? 0 : Math.min((now - last) / 1000, 0.05)
            last = now
            const unit = root.clientHeight / 100
            const width = root.clientWidth
            if (unit !== game.unit || width !== game.width) {
                game.unit = unit
                game.width = width
                root.style.setProperty('--u', `${unit}px`)
                // 화면 크기가 바뀔 때만 캐릭터의 실제 위치 · 크기를 다시 읽는다 (transform은 offset 값에 영향이 없다)
                game.heroLeft = heroRef.current.offsetLeft
                game.heroWidth = heroRef.current.offsetWidth
                // 월드 단위(w): 캐릭터가 PC 크기(HERO_BASE u)보다 작게 그려지는 화면(모바일)에서는 그 비율만큼 줄인다.
                // 아이템 · 문 · 점프 · 속도를 w로 재서, 작은 캐릭터에도 PC와 같은 비율 · 같은 타이밍으로 보이게 한다
                const scale = Math.min(1, game.heroWidth / (HERO_BASE * unit))
                game.world = unit * scale
                root.style.setProperty('--w', `${game.world}px`)
                root.style.setProperty('--world-scale', scale)
            }
            const { heroLeft, heroWidth, world: w } = game
            const hitX = heroLeft + heroWidth * HIT_OFFSET
            const doorHalf = (door.size / 2) * w
            const doorStopX = Math.max(width - doorHalf - 8 * w, heroLeft + heroWidth + doorHalf)
            game.time += dt

            if (game.phase === 'title' && game.time >= TITLE_TIME) changePhase('ready')
            if (game.phase === 'ready' && game.time >= readyEnd) changePhase('run')
            if (game.phase === 'run') game.scroll += SPEED * dt

            // 직접 점프 (탭 · ↑ · W): 땅에서는 점프, 공중에서 한 번 더 누르면 이중 점프
            if (jumpRequestRef.current) {
                jumpRequestRef.current = false
                if (game.phase === 'run') {
                    if (!game.air) startJump()
                    else if (!game.doubled) startJump(true)
                }
            }
            // 중력 · 착지
            if (game.air) {
                game.vy -= GRAVITY * dt
                game.y += game.vy * dt
                if (game.y <= 0) {
                    Object.assign(game, { y: 0, vy: 0, air: false, doubled: false, landTime: LAND_TIME })
                    changePose('land')
                    setDustKey((key) => key + 1)
                }
            } else if (game.landTime > 0) {
                game.landTime -= dt
                if (game.landTime <= 0) changePose('run')
            }

            // 아이템: 캐릭터(발 ~ HERO_REACH)와 겹치면 먹고, 닿지 않고 지나가면 놓친다. 아직 남은 첫 아이템이 자동 점프의 목표
            let target = null
            items.forEach((item, index) => {
                const node = itemRefs.current[index]
                if (!node) return
                const x = hitX + (item.distance - game.scroll) * w
                // 먹은 아이템은 그 자리(반짝임 · 문구)에 두고, 놓친 아이템은 그대로 흘러간다
                if (!game.collected.has(item.id)) node.style.transform = `translate3d(${x}px, 0, 0)`
                if (game.passed.has(item.id)) return
                const distance = (x - hitX) / w
                const height = 100 - item.y - ground
                const half = (item.size ?? 15) * (item.scale ?? 1) * 0.32
                if (Math.abs(distance) < half + 4 && height - half < game.y + HERO_REACH && height + half > game.y) {
                    game.passed.add(item.id)
                    collect(item, node)
                } else if (distance < -(half + 6)) {
                    game.passed.add(item.id)
                    node.classList.add('is-missed')
                } else if (!target && distance > 0) {
                    target = { distance, height }
                }
            })
            // 자동 플레이: 목표 높이에 맞춰 달리기 / 점프(꼭대기가 아이템 위치에 오게) / 이중 점프(꼭대기에서 한 번 더)
            if (target && game.phase === 'run') {
                if (!game.air && target.height > RUN_ITEM_MAX) {
                    const lead = target.height > SINGLE_ITEM_MAX ? SPEED * JUMP_TIME : (SPEED * JUMP_TIME) / 2
                    if (target.distance <= lead) startJump()
                } else if (game.air && !game.doubled && target.height > SINGLE_ITEM_MAX && game.vy <= 0) {
                    startJump(true)
                }
            }

            // 배경은 반복하지 않고 한 장을 스테이지 시작 → 문 앞 정지 지점까지 왼쪽 끝에서 오른쪽 끝으로 한 번 훑는다
            // bgPanAspect가 있으면 배경을 그 비율(가로 ÷ 세로) 너비까지만 훑는다 — 유난히 긴 배경이 빨리 지나가지 않게
            const panAspect = bgPanAspect ? Math.min(bgAspect, bgPanAspect) : bgAspect
            const bgRange = Math.max(0, panAspect * 100 * bgScale * unit - width)
            const stopScroll = door.distance - (doorStopX - hitX) / w
            const bgProgress = Math.min(1, Math.max(0, game.scroll / stopScroll))
            // 문은 배경(땅)에 붙여 배경과 같은 속도로 다가와, 배경이 멈추는 순간 정지 지점(doorStopX)에 함께 선다.
            // 캐릭터 속도로 움직이면 천천히 훑는 배경 위에서 문만 미끄러져 보인다 (배경을 아직 못 읽었으면 캐릭터 속도로)
            const doorX = bgRange > 0 ? doorStopX + bgRange * (1 - bgProgress) : hitX + (door.distance - game.scroll) * w
            // 아이템을 모두 지나가기 전에는 스크롤을 멈추지 않는다 (넓은 화면에서 문이 먼저 멈추는 것 방지)
            if (game.phase === 'run' && game.scroll >= stopScroll && game.passed.size === items.length) changePhase('walk')
            if (game.phase === 'walk' && !game.air) {
                game.walk += SPEED * dt
                const heroCenterX = heroLeft + heroWidth / 2 + game.walk * w
                // 포털은 가장자리에 닿는 순간부터 빨려 들어가고, 문은 중앙까지 걸어간다
                if (heroCenterX >= doorX - (door.portal ? doorHalf * 0.6 : 0)) {
                    if (door.portal) {
                        // 캐릭터 중심 → 포털 중심까지의 벡터를 CSS 애니메이션에 넘긴다
                        const portalCenterY = (door.size / 2 - door.sink) * w
                        heroRef.current.style.setProperty('--suck-x', `${doorX - heroCenterX}px`)
                        heroRef.current.style.setProperty('--suck-y', `${heroWidth / 2 - portalCenterY}px`)
                    }
                    changePhase('enter')
                }
            }
            if (game.phase === 'enter') {
                game.enterTime += dt
                if (game.enterTime >= (door.portal ? PORTAL_ENTER_TIME : ENTER_TIME)) {
                    changePhase('done')
                    // 포털을 지나 끝나면 다음 전환 화면을 워프 터널로 시작한다
                    onClearRef.current?.(door.portal ? { warp: true } : undefined)
                    return
                }
            }

            heroRef.current.style.transform = `translate3d(${game.walk * w}px, ${-game.y * w}px, 0)`
            doorRef.current.style.transform = `translate3d(${doorX - doorHalf}px, 0, 0)`
            bgRef.current.style.backgroundPositionX = `${-bgRange * bgProgress}px`
            frame = requestAnimationFrame(tick)
        }

        frame = requestAnimationFrame(tick)
        const flights = flightsRef.current
        return () => {
            cancelAnimationFrame(frame)
            // 스테이지를 떠나면 날아가던 그림만 치운다. 칸에 넣지는 않는다 — 메뉴로 다른 스테이지를 고르면 IntroPage가
            // 인벤토리를 그 스테이지 기준으로 맞추기 때문 (클리어해서 넘어갈 때는 문에 들어가기 전에 이미 다 도착해 있다)
            flights.forEach((flight) => {
                flight.timeline.kill()
                flight.clone.remove()
            })
            flights.clear()
        }
    }, [background, bgScale, bgPanAspect, door, ground, items, readyTime, titleCard])

    const togglePause = () => applyPause(!pausedRef.current, pausedRef, flightsRef, setPaused)

    // 스페이스 바: 멈춤(일시정지 모달 열기)/재생, Esc: 모달이 떠 있으면 재생 (점프는 ↑ · W 키나 화면 탭)
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.code === 'Space') {
                // 버튼에 포커스가 있어도 그 버튼이 눌리지 않고 항상 멈춤/재생만 되도록 기본 동작을 막는다
                event.preventDefault()
                if (event.repeat) return
                applyPause(!pausedRef.current, pausedRef, flightsRef, setPaused)
                return
            }
            if (event.code === 'Escape' && pausedRef.current) {
                applyPause(false, pausedRef, flightsRef, setPaused)
                return
            }
            // 일시정지 중에는 점프하지 않는다
            if (pausedRef.current || !['ArrowUp', 'KeyW'].includes(event.code)) return
            if (event.target.closest?.('button')) return
            event.preventDefault()
            jumpRequestRef.current = true
        }
        // 버튼은 스페이스를 뗄 때 눌리므로 keyup도 막는다
        const onKeyUp = (event) => {
            if (event.code === 'Space') event.preventDefault()
        }
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [])

    const handlePointerDown = (event) => {
        // 버튼 · 일시정지 모달을 누른 것은 점프가 아니다
        if (pausedRef.current || event.target.closest('button')) return
        jumpRequestRef.current = true
    }

    // 인벤토리 칸: 인트로 전체 아이템이 처음부터 흐린 회색으로 자리만 보이고, 먹을 때마다 원래 색으로 채워진다
    // (이전 스테이지에서 먹은 것은 kept — 스테이지가 바뀔 때 다시 튀지 않게)
    const stageItemIds = new Set(items.map((item) => item.id))
    const gotIds = new Set(inventory.map((item) => item.id))
    const inventorySlots = allIntroItems.map((item) => ({
        id: item.id,
        src: item.src,
        name: item.label.replace(' GET!', ''),
        size: item.size ?? 15,
        got: gotIds.has(item.id),
        kept: gotIds.has(item.id) && !stageItemIds.has(item.id),
    }))

    const clearing = phase === 'enter' || phase === 'done'
    const rootClass = [styles.scope, 'sg', paused && 'is-paused', hintDone && 'is-hint-done', clearing && 'is-clearing', arriving && 'is-arriving', door.portal && 'is-portal', config.smoothSprites && 'is-smooth'].filter(Boolean).join(' ')
    const rootStyle = { '--stage-bg': `url(${background})`, '--bg-size': bgScale * 100, '--bg-y': bgOffset, '--ground': `${ground}%`, '--door-size': door.size, '--door-sink': door.sink }

    return (
        <section className={rootClass} data-phase={phase} ref={rootRef} style={rootStyle} onPointerDown={handlePointerDown} aria-label={`Stage ${number} ${name}`}>
            <div className="sg-bg" ref={bgRef} />

            <h1 className="sg-title"><small>STAGE {number} :</small> {name}</h1>
            {/* 위쪽 가운데: 왼쪽 제목과 오른쪽 SKIP INTRO 사이에 재생/멈춤 (아이콘 + STOP/PLAY) */}
            <div className="sg-top-center">
                <IntroPauseButton paused={paused} onToggle={togglePause} />
            </div>
            {/* 조작 안내: 캐릭터 머리 위 (모바일에서는 숨김) */}
            {hint && <p className="sg-hint" aria-hidden="true">TAP : JUMP (x2 DOUBLE) / SPACE : PAUSE</p>}
            <button className="intro-skip" type="button" onClick={onSkip}>
                SKIP INTRO <span aria-hidden="true">▶</span>
            </button>

            <div className={`sg-door ${phase === 'walk' || clearing ? 'is-open' : ''}`} ref={doorRef}>
                {door.portal ? (
                    <div className="sg-portal" role="img" aria-label="Portal">
                        <span className="sg-portal-glow" />
                        <span className="sg-portal-swirl" />
                        <span className="sg-portal-swirl is-reverse" />
                        <span className="sg-portal-ring" />
                        <span className="sg-portal-core" />
                        {PORTAL_BITS.map((bit) => <i className="sg-portal-bit" key={bit} style={{ '--a': `${bit * 30}deg`, '--d': `${bit * -0.1}s` }} />)}
                    </div>
                ) : (
                    <img src={door.src} alt="Stage exit" />
                )}
            </div>

            {items.map((item, index) => (
                <div className="sg-item" key={item.id} ref={(node) => { itemRefs.current[index] = node }} style={{ '--y': `${item.y}%`, '--size': item.size ?? 15, '--item-scale': item.scale ?? 1, '--delay': `${index * -0.37}s` }}>
                    <img className="sg-item-burst" src={burst} alt="" />
                    <div className="sg-item-art"><img src={item.src} alt={item.label.replace(' GET!', '')} /></div>
                    <p className="sg-item-label">{item.label}</p>
                </div>
            ))}

            {dustKey > 0 && <img className="sg-dust" key={dustKey} src={dust} alt="" />}

            <div className={`sg-hero ${clearing ? 'is-entering' : ''}`} data-pose={spritePose} data-single-sprite={sprites.jump === sprites.run} ref={heroRef}>
                {exclaim && phase === 'ready' && <img className="sg-exclaim" src={exclamation} alt="" />}
                {sparkKey > 0 && <img className="sg-spark" key={sparkKey} src={sparkle} alt="" />}
                <div className={`sg-hero-sprite ${poseFrames ? 'is-pose-frames' : ''}`}>
                    {poseFrames ? (
                        <span className={`sg-pose-frames ${poseDuration ? 'is-once' : ''}`} role="img" aria-label={`Kim Hyeonsoo ${pose} character`} data-frame-count={poseFrames.length} style={{ '--frames': poseFrames.length, '--frame-time': `${poseFrameTime}s` }}>
                            {/* 자세 이름까지 key에 넣어, 이중 점프(jump → jump2)에서 같은 그림이라도 처음 장부터 다시 넘긴다 */}
                            {poseFrames.map((src, index) => <img src={src} alt="" key={`${pose}-${src}`} style={{ '--i': index }} />)}
                        </span>
                    ) : <img src={sprites[spritePose]} alt="Kim Hyeonsoo game character" />}
                </div>
            </div>

            {titleCard && (
                <p className="sg-card" aria-hidden={phase !== 'title'}>
                    <span>STAGE {number}</span>
                    <strong>{name}</strong>
                </p>
            )}
            {clearing && <p className="sg-clear">STAGE {number} CLEAR!{clearMessage && <small>{clearMessage}</small>}</p>}

            <div className="sg-inventory" aria-label="먹은 프로그램">
                <p className="sg-inventory-title">ITEMS <span>{inventorySlots.filter((slot) => slot.got).length} / {inventorySlots.length}</span></p>
                <ul>
                    {inventorySlots.map((slot) => (
                        <li key={slot.id} data-id={slot.id} className={[slot.got && 'is-got', slot.kept && 'is-kept'].filter(Boolean).join(' ')} title={slot.name} style={{ '--scale': slot.size / 13 }}>
                            <img src={slot.src} alt={slot.got ? slot.name : ''} />
                        </li>
                    ))}
                </ul>
            </div>

            {paused && <IntroPauseModal current={Number(number) - 1} onResume={togglePause} onRestart={onRestart} onSelectStage={onSelectStage} onSkip={onSkip} />}
        </section>
    )
}
