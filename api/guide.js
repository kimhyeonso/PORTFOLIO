import { getGuideAnswer, toGuideError } from '../server/guide-service.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'POST 요청만 지원합니다.' })
  }

  try {
    const answer = await getGuideAnswer(request.body?.question, process.env.OPENAI_API_KEY)
    return response.status(200).json({ answer })
  } catch (error) {
    const { status, message } = toGuideError(error)
    return response.status(status).json({ error: message })
  }
}