import { useEffect, useRef, useState } from 'react'
import burst from '../../assets/image/intro/item/item_light.png'
import sparkle from '../../assets/image/intro/item/character_light.png'
import dust from '../../assets/image/intro/item/jump.png'
import exclamation from '../../assets/image/intro/item/exclamation.png'
import IntroPauseButton from './IntroPauseButton.jsx'
import IntroStageMenu from './IntroStageMenu.jsx'
import styles from './IntroStageGame.module.scss'

// 모든 거리 단위는 화면 높이의 1% (u). 배경이 높이 기준으로 깔리므로 지면/아이템 위치가 어떤 화면비에서도 맞는다.
const SPEED = 42 // u / s
const JUMP_TIME = 0.78 // s
const JUMP_HEIGHT = 15 // u
const LAND_TIME = 0.16 // s
const TITLE_TIME = 2.2 // s, 타이틀 카드 노출 시간
const ENTER_TIME = 1.3 // s, 문 진입 → 화면 전환
const PORTAL_ENTER_TIME = 2 // s, 포털에 빨려 들어감 → 화면 전환
const PORTAL_BITS = Array.from({ length: 12 }, (_, index) => index)
const HERO_SIZE = 27 // u
const HERO_LEFT = 0.18 // 화면 너비 비율
const HIT_OFFSET = 0.62 // 점프 스프라이트의 손 위치 (캐릭터 너비 비율)


/**
 * 횡스크롤 스테이지 공용 컴포넌트.
 * config: { number, name, background, bgScale, bgOffset, ground, sprites, items, door, readyTime, exclaim, titleCard, hint, arriving, clearMessage }
 */
export default function IntroStageGame({ config, onClear, onSkip, onSelectStage }) {
    const { number, name, background, bgScale = 1, bgOffset = 0, ground, sprites, items, door, readyTime = 1, exclaim, titleCard, hint, arriving, clearMessage } = config
    const rootRef = useRef(null)
    const bgRef = useRef(null)
    const heroRef = useRef(null)
    const doorRef = useRef(null)
    const itemRefs = useRef([])
    const pausedRef = useRef(false)
    const jumpRequestRef = useRef(false)
    const onClearRef = useRef(onClear)
    const [phase, setPhase] = useState(titleCard ? 'title' : 'ready')
    const [pose, setPose] = useState('run')
    const [paused, setPaused] = useState(false)
    const [collectedCount, setCollectedCount] = useState(0)
    const [dustKey, setDustKey] = useState(0)
    const [sparkKey, setSparkKey] = useState(0)

    useEffect(() => {
        onClearRef.current = onClear
    }, [onClear])

    // 첫 점프 때 이미지 로딩으로 캐릭터가 깜빡이지 않도록 스프라이트를 미리 불러온다
    useEffect(() => {
        Object.values(sprites).forEach((src) => {
            const image = new Image()
            image.src = src
        })
    }, [sprites])

    useEffect(() => {
        const root = rootRef.current
        const game = { time: 0, scroll: 0, walk: 0, phase: titleCard ? 'title' : 'ready', jumpTime: -1, landTime: 0, enterTime: 0, pose: 'run', collected: new Set(), unit: 0 }
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
        }

        const tick = (now) => {
            const dt = pausedRef.current ? 0 : Math.min((now - last) / 1000, 0.05)
            last = now
            const unit = root.clientHeight / 100
            const width = root.clientWidth
            if (unit !== game.unit) {
                game.unit = unit
                root.style.setProperty('--u', `${unit}px`)
            }
            const heroLeft = width * HERO_LEFT
            const heroWidth = HERO_SIZE * unit
            const hitX = heroLeft + heroWidth * HIT_OFFSET
            const doorHalf = (door.size / 2) * unit
            const doorStopX = Math.max(width - doorHalf - 8 * unit, heroLeft + heroWidth + doorHalf)
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
                const x = hitX + (item.distance - game.scroll) * unit
                node.style.transform = `translate3d(${x}px, 0, 0)`
                const distance = (x - hitX) / unit
                if (game.phase === 'run' && game.jumpTime < 0 && distance > 0 && distance <= (SPEED * JUMP_TIME) / 2) startJump()
                if ((progress > 0.3 && Math.abs(distance) < 6) || distance < -5) collect(item, node)
            })

            const doorX = hitX + (door.distance - game.scroll) * unit
            // 아이템을 모두 먹기 전에는 스크롤을 멈추지 않는다 (넓은 화면에서 문이 먼저 멈추는 것 방지)
            if (game.phase === 'run' && doorX <= doorStopX && game.collected.size === items.length) changePhase('walk')
            if (game.phase === 'walk' && game.jumpTime < 0) {
                game.walk += SPEED * dt
                const heroCenterX = heroLeft + heroWidth / 2 + game.walk * unit
                // 포털은 가장자리에 닿는 순간부터 빨려 들어가고, 문은 중앙까지 걸어간다
                if (heroCenterX >= doorX - (door.portal ? doorHalf * 0.6 : 0)) {
                    if (door.portal) {
                        // 캐릭터 중심 → 포털 중심까지의 벡터를 CSS 애니메이션에 넘긴다
                        const portalCenterY = (door.size / 2 - door.sink) * unit
                        heroRef.current.style.setProperty('--suck-x', `${doorX - heroCenterX}px`)
                        heroRef.current.style.setProperty('--suck-y', `${(HERO_SIZE / 2) * unit - portalCenterY}px`)
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
            heroRef.current.style.transform = `translate3d(${game.walk * unit}px, ${-elevation * unit}px, 0)`
            doorRef.current.style.transform = `translate3d(${doorX - doorHalf}px, 0, 0)`
            // 배경은 반복하지 않고 한 장을 스테이지 시작 → 문 앞 정지 지점까지 왼쪽 끝에서 오른쪽 끝으로 한 번 훑는다
            const bgRange = Math.max(0, bgAspect * 100 * bgScale * unit - width)
            const stopScroll = door.distance - (doorStopX - hitX) / unit
            const bgProgress = Math.min(1, Math.max(0, game.scroll / stopScroll))
            bgRef.current.style.backgroundPositionX = `${-bgRange * bgProgress}px`
            frame = requestAnimationFrame(tick)
        }

        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [background, bgScale, door, items, readyTime, titleCard])

    useEffect(() => {
        const onKeyDown = (event) => {
            if (!['Space', 'ArrowUp', 'KeyW'].includes(event.code)) return
            if (event.target.closest?.('button')) return
            event.preventDefault()
            jumpRequestRef.current = true
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    const handlePointerDown = (event) => {
        if (event.target.closest('button')) return
        jumpRequestRef.current = true
    }

    const togglePause = () => {
        pausedRef.current = !pausedRef.current
        setPaused(pausedRef.current)
    }

    const clearing = phase === 'enter' || phase === 'done'
    const rootClass = [styles.scope, 'sg', paused && 'is-paused', collectedCount > 0 && 'is-playing', clearing && 'is-clearing', arriving && 'is-arriving', door.portal && 'is-portal', config.smoothSprites && 'is-smooth'].filter(Boolean).join(' ')
    const rootStyle = { '--stage-bg': `url(${background})`, '--bg-size': bgScale * 100, '--bg-y': bgOffset, '--ground': `${ground}%`, '--door-size': door.size, '--door-sink': door.sink }

    return (
        <section className={rootClass} data-phase={phase} ref={rootRef} style={rootStyle} onPointerDown={handlePointerDown} aria-label={`Stage ${number} ${name}`}>
            <div className="sg-bg" ref={bgRef} />

            <h1 className="sg-title"><small>STAGE {number} :</small> {name}</h1>
            <button className="intro-skip" type="button" onClick={onSkip}>
                SKIP INTRO <span aria-hidden="true">▶</span>
            </button>
            <div className="sg-side">
                <IntroPauseButton paused={paused} onToggle={togglePause} />
                <IntroStageMenu className="sg-menu" current={Number(number) - 1} onSelect={onSelectStage} />
            </div>

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
                <div className="sg-hero-sprite"><img src={sprites[pose]} alt="Kim Hyeonsu game character" /></div>
            </div>

            {titleCard && (
                <p className="sg-card" aria-hidden={phase !== 'title'}>
                    <span>STAGE {number}</span>
                    <strong>{name}</strong>
                </p>
            )}
            {clearing && <p className="sg-clear">STAGE {number} CLEAR!{clearMessage && <small>{clearMessage}</small>}</p>}
            {hint && <p className="sg-hint" aria-hidden="true">SPACE / TAP : JUMP</p>}
        </section>
    )
}
