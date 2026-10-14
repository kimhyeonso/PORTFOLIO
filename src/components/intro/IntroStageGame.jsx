import { useEffect, useRef, useState } from 'react'
import burst from '../../assets/image/intro/item/item_light.png'
import sparkle from '../../assets/image/intro/item/character_light.png'
import dust from '../../assets/image/intro/item/jump.png'
import exclamation from '../../assets/image/intro/item/exclamation.png'
import { allIntroItems } from '../../data/introItems.js'
import IntroPauseButton from './IntroPauseButton.jsx'
import IntroPauseModal from './IntroPauseModal.jsx'
import styles from './IntroStageGame.module.scss'

// 화면 높이의 1% (u). 배경이 높이 기준으로 깔리므로 지면/아이템 위치가 어떤 화면비에서도 맞는다.
// 아이템 · 문 · 점프 · 속도는 월드 단위(w)로 잰다 — PC에서는 w = u, 캐릭터가 작아지는 모바일에서는 그 비율만큼 작다.
const SPEED = 42 // u / s
const JUMP_TIME = 0.78 // s
const JUMP_HEIGHT = 15 // u
const LAND_TIME = 0.16 // s
const RUN_FRAME_TIME = 0.1 // s, 달리기 프레임(runFrames) 한 장이 보이는 시간
const TITLE_TIME = 2.2 // s, 타이틀 카드 노출 시간
const ENTER_TIME = 1.3 // s, 문 진입 → 화면 전환
const PORTAL_ENTER_TIME = 2 // s, 포털에 빨려 들어감 → 화면 전환
const PORTAL_BITS = Array.from({ length: 12 }, (_, index) => index)
// 캐릭터 크기 · 왼쪽 위치는 CSS(--hero-size · --hero-left, 모바일은 따로)에서 정하고, 판정에는 그려진 크기를 읽어 쓴다
const HERO_BASE = 27 // u, PC 캐릭터 크기 (CSS --hero-size 기본값과 같다) — 월드 단위(w)의 기준
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
    const [phase, setPhase] = useState(titleCard ? 'title' : 'ready')
    const [pose, setPose] = useState('run')
    const [paused, setPaused] = useState(false)
    const [collectedCount, setCollectedCount] = useState(0)
    const [dustKey, setDustKey] = useState(0)
    const [sparkKey, setSparkKey] = useState(0)
    // 지금 자세에 여러 장 프레임(runFrames · jumpFrames · landFrames)이 있으면 차례로 넘겨 보여준다.
    // 점프 · 착지는 그 자세가 유지되는 시간(JUMP_TIME · LAND_TIME) 동안 한 번에 다 지나가도록 장당 시간을 나눈다
    const poseFrames = sprites[`${pose}Frames`]
    const poseDuration = { jump: JUMP_TIME, land: LAND_TIME }[pose]
    const poseFrameTime = poseFrames && poseDuration ? poseDuration / poseFrames.length : RUN_FRAME_TIME

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
        const game = { time: 0, scroll: 0, walk: 0, phase: titleCard ? 'title' : 'ready', jumpTime: -1, landTime: 0, enterTime: 0, pose: 'run', collected: new Set(), unit: 0, width: 0, heroLeft: 0, heroWidth: 0, world: 0 }
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
        const startJump = () => {
            game.jumpTime = 0
            game.landTime = 0
            changePose('jump')
        }
        const collect = (item, node) => {
            game.collected.add(item.id)
            node.classList.add('is-collected')
            setCollectedCount(game.collected.size)
            setSparkKey((key) => key + 1)
            onCollectRef.current?.({ id: item.id, src: item.src, name: item.label.replace(' GET!', ''), size: item.size ?? 15 })
        }

        const tick = (now) => {
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

            // 점프 (수동 입력 또는 아이템 접근 시 자동)
            if (jumpRequestRef.current) {
                jumpRequestRef.current = false
                if (game.phase === 'run' && game.jumpTime < 0) startJump()
            }
            if (game.jumpTime >= 0) {
                game.jumpTime += dt
                if (game.jumpTime >= JUMP_TIME) {
                    game.jumpTime = -1
                    game.landTime = LAND_TIME
                    changePose('land')
                    setDustKey((key) => key + 1)
                }
            } else if (game.landTime > 0) {
                game.landTime -= dt
                if (game.landTime <= 0) changePose('run')
            }
            const progress = game.jumpTime >= 0 ? game.jumpTime / JUMP_TIME : -1

            items.forEach((item, index) => {
                const node = itemRefs.current[index]
                if (!node || game.collected.has(item.id)) return
                const x = hitX + (item.distance - game.scroll) * w
                node.style.transform = `translate3d(${x}px, 0, 0)`
                const distance = (x - hitX) / w
                if (game.phase === 'run' && game.jumpTime < 0 && distance > 0 && distance <= (SPEED * JUMP_TIME) / 2) startJump()
                if ((progress > 0.3 && Math.abs(distance) < 6) || distance < -5) collect(item, node)
            })

            const doorX = hitX + (door.distance - game.scroll) * w
            // 아이템을 모두 먹기 전에는 스크롤을 멈추지 않는다 (넓은 화면에서 문이 먼저 멈추는 것 방지)
            if (game.phase === 'run' && doorX <= doorStopX && game.collected.size === items.length) changePhase('walk')
            if (game.phase === 'walk' && game.jumpTime < 0) {
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
                    onClearRef.current?.()
                    return
                }
            }

            const elevation = progress >= 0 ? 4 * JUMP_HEIGHT * progress * (1 - progress) : 0
            heroRef.current.style.transform = `translate3d(${game.walk * w}px, ${-elevation * w}px, 0)`
            doorRef.current.style.transform = `translate3d(${doorX - doorHalf}px, 0, 0)`
            // 배경은 반복하지 않고 한 장을 스테이지 시작 → 문 앞 정지 지점까지 왼쪽 끝에서 오른쪽 끝으로 한 번 훑는다
            // bgPanAspect가 있으면 배경을 그 비율(가로 ÷ 세로) 너비까지만 훑는다 — 유난히 긴 배경이 빨리 지나가지 않게
            const panAspect = bgPanAspect ? Math.min(bgAspect, bgPanAspect) : bgAspect
            const bgRange = Math.max(0, panAspect * 100 * bgScale * unit - width)
            const stopScroll = door.distance - (doorStopX - hitX) / w
            const bgProgress = Math.min(1, Math.max(0, game.scroll / stopScroll))
            bgRef.current.style.backgroundPositionX = `${-bgRange * bgProgress}px`
            frame = requestAnimationFrame(tick)
        }

        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [background, bgScale, bgPanAspect, door, items, readyTime, titleCard])

    const togglePause = () => {
        pausedRef.current = !pausedRef.current
        setPaused(pausedRef.current)
    }

    // 스페이스 바: 멈춤(일시정지 모달 열기)/재생, Esc: 모달이 떠 있으면 재생 (점프는 ↑ · W 키나 화면 탭)
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.code === 'Space') {
                // 버튼에 포커스가 있어도 그 버튼이 눌리지 않고 항상 멈춤/재생만 되도록 기본 동작을 막는다
                event.preventDefault()
                if (event.repeat) return
                pausedRef.current = !pausedRef.current
                setPaused(pausedRef.current)
                return
            }
            if (event.code === 'Escape' && pausedRef.current) {
                pausedRef.current = false
                setPaused(false)
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
    const rootClass = [styles.scope, 'sg', paused && 'is-paused', collectedCount > 0 && 'is-playing', clearing && 'is-clearing', arriving && 'is-arriving', door.portal && 'is-portal', config.smoothSprites && 'is-smooth'].filter(Boolean).join(' ')
    const rootStyle = { '--stage-bg': `url(${background})`, '--bg-size': bgScale * 100, '--bg-y': bgOffset, '--ground': `${ground}%`, '--door-size': door.size, '--door-sink': door.sink }

    return (
        <section className={rootClass} data-phase={phase} ref={rootRef} style={rootStyle} onPointerDown={handlePointerDown} aria-label={`Stage ${number} ${name}`}>
            <div className="sg-bg" ref={bgRef} />

            <h1 className="sg-title"><small>STAGE {number} :</small> {name}</h1>
            {/* 위쪽 가운데: 왼쪽 제목과 오른쪽 SKIP INTRO 사이에 재생/멈춤 (아이콘 + STOP/PLAY), 그 바로 밑에 조작 안내 */}
            <div className="sg-top-center">
                <IntroPauseButton paused={paused} onToggle={togglePause} />
                {hint && <p className="sg-hint" aria-hidden="true">TAP : JUMP / SPACE : PAUSE</p>}
            </div>
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
                <div className="sg-item" key={item.id} ref={(node) => { itemRefs.current[index] = node }} style={{ '--y': `${item.y}%`, '--size': item.size ?? 15, '--delay': `${index * -0.37}s` }}>
                    <img className="sg-item-burst" src={burst} alt="" />
                    <div className="sg-item-art"><img src={item.src} alt={item.label.replace(' GET!', '')} /></div>
                    <p className="sg-item-label">{item.label}</p>
                </div>
            ))}

            {dustKey > 0 && <img className="sg-dust" key={dustKey} src={dust} alt="" />}

            <div className={`sg-hero ${clearing ? 'is-entering' : ''}`} data-pose={pose} data-single-sprite={sprites.jump === sprites.run} ref={heroRef}>
                {exclaim && phase === 'ready' && <img className="sg-exclaim" src={exclamation} alt="" />}
                {sparkKey > 0 && <img className="sg-spark" key={sparkKey} src={sparkle} alt="" />}
                <div className={`sg-hero-sprite ${poseFrames ? 'is-pose-frames' : ''}`}>
                    {poseFrames ? (
                        <span className={`sg-pose-frames ${poseDuration ? 'is-once' : ''}`} role="img" aria-label={`Kim Hyeonsoo ${pose} character`} data-frame-count={poseFrames.length} style={{ '--frames': poseFrames.length, '--frame-time': `${poseFrameTime}s` }}>
                            {poseFrames.map((src, index) => <img src={src} alt="" key={src} style={{ '--i': index }} />)}
                        </span>
                    ) : <img src={sprites[pose]} alt="Kim Hyeonsoo game character" />}
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
                        <li key={slot.id} className={[slot.got && 'is-got', slot.kept && 'is-kept'].filter(Boolean).join(' ')} title={slot.name} style={{ '--scale': slot.size / 13 }}>
                            <img src={slot.src} alt={slot.got ? slot.name : ''} />
                        </li>
                    ))}
                </ul>
            </div>

            {paused && <IntroPauseModal current={Number(number) - 1} onResume={togglePause} onRestart={onRestart} onSelectStage={onSelectStage} onSkip={onSkip} />}
        </section>
    )
}
