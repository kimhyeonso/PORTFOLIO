import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'
import { getGuideAnswer, toGuideError } from './server/guide-service.js'

function sendJson(response, status, body) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(body))
}

async function readJson(request) {
  let body = ''
  for await (const chunk of request) body += chunk
  try {
    return JSON.parse(body || '{}')
  } catch {
    throw new Error('invalid_json')
  }
}

function guideApiPlugin(apiKey) {
  return {
    name: 'local-guide-api',
    configureServer(server) {
      server.middlewares.use('/api/guide', async (request, response) => {
        if (request.method !== 'POST') {
          response.setHeader('Allow', 'POST')
          return sendJson(response, 405, { error: 'POST 요청만 지원합니다.' })
        }

        try {
          const body = await readJson(request)
          const answer = await getGuideAnswer(body.question, apiKey)
          return sendJson(response, 200, { answer })
        } catch (error) {
          if (error.message === 'invalid_json') return sendJson(response, 400, { error: '요청 형식이 올바르지 않습니다.' })
          const { status, message } = toGuideError(error)
          return sendJson(response, status, { error: message })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      guideApiPlugin(environment.OPENAI_API_KEY),
    ],
  }
})