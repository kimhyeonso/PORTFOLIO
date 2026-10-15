import OpenAI from 'openai'
import { readFile } from 'node:fs/promises'

const guideFileUrl = new URL('../portfolio-guide-rag.text', import.meta.url)

// 안내 고양이 '대박이' 말투 규칙 (모든 답변 공통)
const CAT_TONE_RULE = `[말투 규칙]
- 당신은 김현수 포트폴리오를 안내하는 고양이 '대박이'입니다.
- 답변에서 김현수를 지칭할 때는 “집사”라고 부릅니다. 예: “김현수는…” 대신 “집사는…”이라고 답합니다.
- 모든 문장의 끝은 반드시 '냥'으로 끝냅니다. 예: '~입니다' → '~이다냥', '~있어요' → '~있다냥', '~하세요' → '~해 보라냥', '~할 수 없습니다' → '~할 수 없다냥'.
- 검색된 자료의 완성형 답변을 참고할 때도 문장 끝은 이 말투로 바꿔서 답합니다.
- 프로젝트명, 메뉴명, 기간, 도구명 같은 정보는 말투 때문에 바꾸지 않습니다.
- 친근하지만 무례하지 않게 답합니다.
- 홈페이지 안내와 무관한 사적인 질문 또는 채용 판단 요청(예: 회사가 김현수를 뽑아야 하는 이유)에는 “여기는 포트폴리오 공간이라 김현수에 대한 공개 프로필 정보와 포트폴리오 프로젝트 내용만 알려줄 수 있다냥.”이라는 취지로 짧게 답합니다.`

export class GuideRequestError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, '')
}

function searchGuide(question, guideText) {
  const normalizedQuestion = normalize(question)
  const sections = guideText.split(/(?=\[\d{2}\.\s)/)
  const commonRule = sections.find((section) => section.includes('[00. 챗봇 공통 답변 원칙]'))

  const matches = sections
    .filter((section) => !section.includes('[00. 챗봇 공통 답변 원칙]'))
    .map((section) => {
      const title = section.match(/대표\s*명칭\s*:\s*(.+)/)?.[1]
      const keywords = section.match(/관련\s*표현\s*:\s*(.+)/)?.[1]?.split(',') ?? []
      const words = [title, ...keywords].filter(Boolean).map((word) => word.trim())
      const score = words.reduce((total, word) => {
        const keyword = normalize(word)
        return keyword && normalizedQuestion.includes(keyword) ? total + keyword.length : total
      }, 0)
      return { section, score }
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ section }) => section)
    .join('\n\n')

  return [commonRule, matches].filter(Boolean).join('\n\n')
}

export async function getGuideAnswer(question, apiKey) {
  if (typeof question !== 'string' || !question.trim()) {
    throw new GuideRequestError('질문을 입력해 주세요.', 400)
  }
  if (question.length > 800) {
    throw new GuideRequestError('질문은 800자 이하로 입력해 주세요.', 400)
  }
  if (!apiKey) {
    throw new GuideRequestError('AI API 키가 설정되지 않았습니다.', 500)
  }

  const guideText = await readFile(guideFileUrl, 'utf8')
  const context = searchGuide(question, guideText)
  const openai = new OpenAI({ apiKey })
  const completion = await openai.responses.create({
    model: 'gpt-4o-mini',
    instructions: context
      ? `당신은 김현수 포트폴리오의 안내 챗봇입니다. 아래 검색된 자료만 근거로 한국어로 짧고 정확하게 답하세요. 자료에 없는 내용은 추측하지 말고, 확인할 수 없다고 답하세요.\n\n${CAT_TONE_RULE}\n\n[검색된 안내 자료]\n${context}`
      : `당신은 김현수 포트폴리오의 안내 챗봇입니다. 현재 자료에서 확인할 수 없는 질문입니다. 포트폴리오의 프로젝트, 프로필, 메뉴 이용 방법에 관한 질문을 정중하게 요청하세요.\n\n${CAT_TONE_RULE}`,
    input: question.trim(),
  })

  return completion.output_text || '답변을 생성하지 못했습니다. 다시 질문해 주세요.'
}

export function toGuideError(error) {
  if (error instanceof GuideRequestError) return { status: error.status, message: error.message }

  const status = Number.isInteger(error?.status) ? error.status : 500
  console.error('Guide chatbot request failed:', error)
  return { status, message: `AI 답변 요청에 실패했습니다. (${status})` }
}