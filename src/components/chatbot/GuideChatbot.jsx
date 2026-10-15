import { useEffect, useRef, useState } from 'react'
import Icon from '../common/Icon.jsx'
import styles from './GuideChatbot.module.scss'
import launcherIcon from '../../assets/image/home/cat01.png'
import launcherHoverIcon from '../../assets/image/home/cat02.png'
import bubbleIcon from '../../assets/image/home/speak.png'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: '반갑다냥! 나는 대박이다냥.\n여기는 집사의 포트폴리오 공간이다냥 집사 또는 프로젝트에서 궁금한 점이 있다면 물어봐라냥',
}

// 챗봇이 닫혀 있을 때 고양이가 랜덤으로 건네는 말
const TALK_MESSAGES = [
  '반갑다냥!',
  '내 이름은 대박이다냥',
  '난 김현수가 키우는 고양이다냥',
  '여긴 김현수의 포트폴리오 공간이다냥',
  '제일 마음에 드는 프로젝트가 뭐냥?',
  '궁금한 게 있으면 물어봐라냥',
  '천천히 구경하고 가라냥',
  '프로젝트가 궁금하면 나를 눌러봐라냥',
]
const TALK_SHOW_MS = 4000
const TALK_HIDE_MS = 3500
// 잠든 동안엔 말 대신 가끔 코 고는 말풍선 (평소보다 짧게 보이고 오래 쉰다)
const SNORE_TEXT = 'Zzz...'
const SNORE_SHOW_MS = 2500
const SNORE_HIDE_MS = 8000

/*
 * 고양이 모션 프레임 (home/cat-motion — 원본 PNG를 320px WebP로 줄인 것). 모든 동작은 같은 앉은 자세(01)에서 시작한다.
 *   stretch 기지개 · groom 그루밍 · yawn 하품 · joke 장난(앞발 흔들기): 닫혀 있을 때 ACTION_INTERVAL마다 하나를 무작위로, 끝까지 갔다가 되돌아온다
 *   sleep 잠들기: SLEEP_AFTER 동안 고양이를 누르지(올리지) 않으면 마지막으로 잠들고, 깨울 때까지 잠든 자세로 있다
 */
const motionFrames = Object.entries(import.meta.glob('../../assets/image/home/cat-motion/*.webp', { eager: true, import: 'default' }))
  .sort(([a], [b]) => a.localeCompare(b))
  .reduce((groups, [path, src]) => {
    const kind = path.match(/([a-z]+)\d+\.webp$/)[1]
    groups[kind] = [...(groups[kind] ?? []), src]
    return groups
  }, {})
const SIT_FRAME = motionFrames.stretch[0]
/*
 * 동작: holdAt번째 장(0부터)에서 hold ms 멈춘다.
 *   returns: 프레임에 되돌아오는 장까지 들어 있으면 true (그대로 끝까지), 아니면 멈춘 장 앞까지를 거꾸로 되돌아온다
 *   shift: 동작마다 첫 장(앉은 자세)이 놓인 가로 위치가 조금씩 달라서, 평소 자세(stretch 01)와 같은 자리에 오도록 옮기는 양 (이미지 너비 %)
 * 기지개 8장: 01 앉음 → 05 앞발을 쭉 뻗고 고개를 든 자세에서 2초 → 06~08(= 03 · 02 · 01)로 다시 앉음
 * 장난(joke) 7장: 01 앉음 → 05 고개를 갸웃하며 앞발을 높이 든 자세에서 잠깐 → 06 · 08로 다시 앉음 (07번 그림은 없다)
 */
const ACTIONS = [
  { frames: motionFrames.stretch, frameTime: 180, holdAt: 4, hold: 2000, returns: true, shift: '0%' },
  { frames: motionFrames.groom, frameTime: 120, holdAt: motionFrames.groom.length - 1, hold: 300, shift: '3.3%' },
  { frames: motionFrames.yawn, frameTime: 140, holdAt: motionFrames.yawn.length - 1, hold: 450, shift: '1.4%' },
  { frames: motionFrames.joke, frameTime: 150, holdAt: 4, hold: 800, returns: true, shift: '2.7%' },
]
const SLEEP_SHIFT = '-1.4%'
// 잠드는 11장마다 아래로 내리는 양 (이미지 높이 %). 08장부터 몸을 눕히며 그림 속 발 · 몸 아래선이 위로 올라가서,
// 앉은 자세의 발 위치(바닥)에 닿도록 그만큼 내린다 (320px 프레임에서 잰 값: 발 아래선 315 → 285 · 265 · 250 · 242)
const SLEEP_DROPS = ['0%', '0%', '0%', '0%', '0%', '0%', '0%', '9%', '15.5%', '20.5%', '23%']
const ACTION_INTERVAL = 10000 // ms, 랜덤 동작 사이 간격
const SLEEP_AFTER = 180000 // ms, 이만큼(3분) 고양이에 마우스를 올리거나 누르지 않으면 잠든다
const SLEEP_FRAME_TIME = 170 // ms, 잠드는 프레임 한 장
const WAKE_FRAME_TIME = 50 // ms, 깰 때는 잠든 프레임을 거꾸로 빠르게

export default function GuideChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [talk, setTalk] = useState({ text: TALK_MESSAGES[0], isVisible: false })
  const [isSleeping, setIsSleeping] = useState(false)
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const messagesRef = useRef(null)
  const motionRef = useRef(null)
  const lastTouchRef = useRef(0)
  const wokeRef = useRef(false)

  // 모션 프레임은 미리 받아 디코딩해 둔다 (처음 재생 때 깜빡이지 않게)
  useEffect(() => {
    const images = Object.values(motionFrames).flat().map((src) => {
      const image = new Image()
      image.src = src
      image.decode?.().catch(() => {})
      return image
    })
    return () => images.splice(0)
  }, [])

  /*
   * 고양이 모션: 프레임은 img src만 바꿔 넘긴다 (React 리렌더링 없음).
   * 닫혀 있고 깨어 있는 동안 ACTION_INTERVAL마다 랜덤 동작, SLEEP_AFTER 동안 마우스를 올리거나 누르지 않으면 잠들기(isSleeping)로 끝낸다.
   */
  useEffect(() => {
    if (isOpen || isSleeping || reduced) return undefined
    const image = motionRef.current
    let timer
    let lastAction = null
    if (!lastTouchRef.current) lastTouchRef.current = Date.now()

    // frames를 frameTime 간격으로 차례로 보여주고 done (shift만큼 옆으로 옮겨 첫 장을 평소 자세 자리에 맞춘다)
    // drops: 장마다 아래로 내리는 양 (잠들기 · 깨기에서 누운 고양이를 바닥에 붙인다)
    const play = (frames, frameTime, done, shift = '0%', drops = null) => {
      image.style.setProperty('--motion-shift', shift)
      let index = 0
      const step = () => {
        image.src = frames[index]
        image.style.setProperty('--motion-drop', drops ? drops[index] : '0%')
        index += 1
        timer = index < frames.length ? setTimeout(step, frameTime) : setTimeout(done, frameTime)
      }
      step()
    }
    // 앉은 자세로 돌아와 다음 동작을 기다린다
    const sitAndWait = () => {
      image.style.setProperty('--motion-shift', '0%')
      image.style.setProperty('--motion-drop', '0%')
      image.src = SIT_FRAME
      timer = setTimeout(next, ACTION_INTERVAL)
    }
    const next = () => {
      if (Date.now() - lastTouchRef.current >= SLEEP_AFTER) {
        play(motionFrames.sleep, SLEEP_FRAME_TIME, () => setIsSleeping(true), SLEEP_SHIFT, SLEEP_DROPS)
        return
      }
      const choices = ACTIONS.filter((action) => action !== lastAction)
      const action = choices[Math.floor(Math.random() * choices.length)]
      lastAction = action
      // holdAt 장까지 가서 멈췄다가, 되돌아오는 장(또는 지나온 장을 거꾸로)으로 앉은 자세로
      const { frames, frameTime, holdAt, hold, returns, shift } = action
      const way = frames.slice(0, holdAt + 1)
      const back = returns ? frames.slice(holdAt + 1) : frames.slice(0, holdAt).reverse()
      play(way, frameTime, () => {
        timer = setTimeout(() => play(back, frameTime, sitAndWait, shift), hold)
      }, shift)
    }

    // 막 깨어났으면 잠든 프레임을 거꾸로 빠르게 돌려 일어난 뒤 시작
    if (wokeRef.current) {
      wokeRef.current = false
      play([...motionFrames.sleep].reverse(), WAKE_FRAME_TIME, sitAndWait, SLEEP_SHIFT, [...SLEEP_DROPS].reverse())
    } else {
      sitAndWait()
    }
    return () => clearTimeout(timer)
  }, [isOpen, isSleeping, reduced])

  // 고양이를 누르거나 올리면 잠든 시간을 새로 세고, 자고 있었으면 깨운다
  const touchCat = () => {
    lastTouchRef.current = Date.now()
    if (isSleeping) {
      wokeRef.current = true
      setIsSleeping(false)
    }
  }

  // 깨어 있으면 랜덤 말풍선, 자는 동안에는 말을 걸지 않고 가끔 Zzz... 말풍선
  useEffect(() => {
    if (isOpen) return undefined

    let timer
    let lastIndex = -1
    const showMs = isSleeping ? SNORE_SHOW_MS : TALK_SHOW_MS
    const hideMs = isSleeping ? SNORE_HIDE_MS : TALK_HIDE_MS
    const showTalk = () => {
      if (isSleeping) {
        setTalk({ text: SNORE_TEXT, isVisible: true })
      } else {
        let nextIndex
        do nextIndex = Math.floor(Math.random() * TALK_MESSAGES.length)
        while (TALK_MESSAGES.length > 1 && nextIndex === lastIndex)
        lastIndex = nextIndex
        setTalk({ text: TALK_MESSAGES[nextIndex], isVisible: true })
      }
      timer = setTimeout(hideTalk, showMs)
    }
    const hideTalk = () => {
      setTalk((previous) => ({ ...previous, isVisible: false }))
      timer = setTimeout(showTalk, hideMs)
    }

    // 막 잠들었을 때는 조금 있다가 첫 Zzz
    timer = setTimeout(showTalk, isSleeping ? 2500 : 800)
    return () => {
      clearTimeout(timer)
      setTalk((previous) => ({ ...previous, isVisible: false }))
    }
  }, [isOpen, isSleeping])

  useEffect(() => {
    const messagesElement = messagesRef.current
    if (messagesElement) messagesElement.scrollTop = messagesElement.scrollHeight
  }, [messages, isLoading])

  const handleSend = async () => {
    const content = question.trim()
    if (!content || isLoading) return

    const userMessage = { role: 'user', content }
    setMessages((previous) => [...previous, userMessage])
    setQuestion('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: content }),
      })
      const data = await response.json().catch(() => ({ error: '가이드 API 응답을 읽지 못했습니다.' }))

      if (!response.ok) throw new Error(data.error || '답변 요청에 실패했습니다.')

      setMessages((previous) => [
        ...previous,
        { role: 'assistant', content: data.answer || '답변을 생성하지 못했습니다. 다시 질문해 주세요.' },
      ])
    } catch (error) {
      console.error('Guide chatbot request failed:', error)
      setMessages((previous) => [
        ...previous,
        { role: 'assistant', content: error instanceof Error ? error.message : '답변을 불러오지 못했습니다. 잠시 후 다시 질문해 주세요.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <aside className={styles.chatbot} aria-label="포트폴리오 가이드 챗봇">
      {isOpen && (
        <section className={styles.panel} aria-live="polite">
          <header className={styles.header}>
            <span className={`${styles.avatar} ${styles.headerAvatar}`} aria-hidden="true">
              <img src={launcherHoverIcon} alt="" />
            </span>
            <div className={styles.headerTitle}>
              <p>PORTFOLIO GUIDE · 대박이</p>
              <h2>무엇이 궁금하냥?</h2>
            </div>
            <button type="button" className={styles.closeButton} onClick={() => setIsOpen(false)} aria-label="가이드 챗봇 닫기"><Icon name="close" className={styles.closeIcon} /></button>
          </header>

          <div className={styles.messages} ref={messagesRef}>
            {messages.map((message, index) => (
              message.role === 'user' ? (
                <p className={styles.userMessage} key={`${message.role}-${index}`}>{message.content}</p>
              ) : (
                <div className={styles.assistantRow} key={`${message.role}-${index}`}>
                  <span className={styles.avatar} aria-hidden="true"><img src={launcherIcon} alt="" /></span>
                  <p className={styles.assistantMessage}>{message.content}</p>
                </div>
              )
            ))}
            {isLoading && (
              <div className={styles.assistantRow}>
                <span className={styles.avatar} aria-hidden="true"><img src={launcherIcon} alt="" /></span>
                <p className={`${styles.assistantMessage} ${styles.typing}`}>
                  <span className="sr-only">답변을 찾고 있다냥</span>
                  <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
                </p>
              </div>
            )}
          </div>

          <form className={styles.form} onSubmit={(event) => { event.preventDefault(); handleSend() }}>
            <label className="sr-only" htmlFor="guide-chat-question">질문 입력</label>
            <input
              id="guide-chat-question"
              type="text"
              placeholder="예: 김현수에 대해 알려줘"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              disabled={isLoading}
              maxLength={800}
            />
            <button type="submit" disabled={isLoading || !question.trim()}>{isLoading ? '...' : '물어보기'}</button>
          </form>
        </section>
      )}

      <button
        type="button"
        className={`${styles.launcher} ${isOpen ? styles.isOpen : ''}`}
        onClick={() => {
          touchCat()
          setIsOpen((previous) => !previous)
        }}
        onPointerEnter={touchCat}
        onFocus={touchCat}
        aria-expanded={isOpen}
        aria-label={isOpen ? '가이드 챗봇 닫기' : '가이드 챗봇 열기'}
      >
        {/* 평소 앉은 자세 + 랜덤 동작 · 잠들기 프레임 (src는 모션 effect가 직접 바꾼다) */}
        <img className={`${styles.launcherIcon} ${styles.launcherMotion}`} src={SIT_FRAME} ref={motionRef} alt="" aria-hidden="true" />
        <img className={`${styles.launcherIcon} ${styles.launcherHoverIcon}`} src={launcherHoverIcon} alt="" aria-hidden="true" />
        {!isOpen && (
          <>
            <img className={styles.launcherBubble} src={bubbleIcon} alt="" aria-hidden="true" />
            <span className={`${styles.launcherTalk} ${talk.isVisible ? styles.isTalking : ''} ${isSleeping ? styles.isSnoring : ''}`} aria-hidden="true">{talk.text}</span>
          </>
        )}
      </button>
    </aside>
  )
}