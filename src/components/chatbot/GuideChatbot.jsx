import { useEffect, useRef, useState } from 'react'
import Icon from '../common/Icon.jsx'
import styles from './GuideChatbot.module.scss'
import launcherIcon from '../../assets/image/home/cat01.png'
import launcherHoverIcon from '../../assets/image/home/cat02.png'
import bubbleIcon from '../../assets/image/home/speak.png'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: '반갑다냥! 나는 대박이다냥.\n김현수 포트폴리오의 프로젝트와 이용 방법을 안내해 줄게냥.',
}

// 챗봇이 닫혀 있을 때 고양이가 랜덤으로 건네는 말
const TALK_MESSAGES = [
  '반갑다냥!',
  '내 이름은 대박이다냥',
  '난 김현수가 키우는 고양이다냥',
  '여긴 김현수의 포트폴리오 공간이다냥',
  '제일 마음에 드는 프로젝트가 뭐다냥?',
  '궁금한 게 있으면 물어봐라냥',
  '천천히 구경하고 가라냥',
  '프로젝트가 궁금하면 나를 눌러봐라냥',
]
const TALK_SHOW_MS = 4000
const TALK_HIDE_MS = 3500

export default function GuideChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [talk, setTalk] = useState({ text: TALK_MESSAGES[0], isVisible: false })
  const messagesRef = useRef(null)

  useEffect(() => {
    if (isOpen) return undefined

    let timer
    let lastIndex = -1
    const showTalk = () => {
      let nextIndex
      do nextIndex = Math.floor(Math.random() * TALK_MESSAGES.length)
      while (TALK_MESSAGES.length > 1 && nextIndex === lastIndex)
      lastIndex = nextIndex
      setTalk({ text: TALK_MESSAGES[nextIndex], isVisible: true })
      timer = setTimeout(hideTalk, TALK_SHOW_MS)
    }
    const hideTalk = () => {
      setTalk((previous) => ({ ...previous, isVisible: false }))
      timer = setTimeout(showTalk, TALK_HIDE_MS)
    }

    timer = setTimeout(showTalk, 800)
    return () => {
      clearTimeout(timer)
      setTalk((previous) => ({ ...previous, isVisible: false }))
    }
  }, [isOpen])

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

      <button type="button" className={`${styles.launcher} ${isOpen ? styles.isOpen : ''}`} onClick={() => setIsOpen((previous) => !previous)} aria-expanded={isOpen} aria-label={isOpen ? '가이드 챗봇 닫기' : '가이드 챗봇 열기'}>
        <img className={styles.launcherIcon} src={launcherIcon} alt="" aria-hidden="true" />
        <img className={`${styles.launcherIcon} ${styles.launcherHoverIcon}`} src={launcherHoverIcon} alt="" aria-hidden="true" />
        {!isOpen && (
          <>
            <img className={styles.launcherBubble} src={bubbleIcon} alt="" aria-hidden="true" />
            <span className={`${styles.launcherTalk} ${talk.isVisible ? styles.isTalking : ''}`} aria-hidden="true">{talk.text}</span>
          </>
        )}
      </button>
    </aside>
  )
}