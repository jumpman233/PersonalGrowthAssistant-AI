import type { AiChatCompletionResponse, AiTaskRequest } from './types'
import { logger } from '../utils/logger'

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export const callAiModel = async (request: AiTaskRequest) => {
  const config = useRuntimeConfig()
  const baseUrl = process.env.AI_BASE_URL || config.aiBaseUrl
  const apiKey = process.env.AI_API_KEY || config.aiApiKey
  const model = process.env.AI_MODEL_NAME || config.aiModelName
  const modelName = request.modelName || model
  const inputLength = request.messages.reduce((sum, message) => sum + message.content.length, 0)
  const start = Date.now()
  const log = logger.child({
    requestId: request.requestId,
    taskType: request.taskType,
    modelName,
    promptVersion: request.promptVersion,
    recordId: request.recordId,
    weeklyReviewId: request.weeklyReviewId,
    aiAnalysisId: request.aiAnalysisId,
  })

  if (!baseUrl || !apiKey || !model) {
    throw createError({
      statusCode: 500,
      statusMessage: 'AI 配置不完整。',
    })
  }

  log.info('model request started', {
    status: 'started',
    inputLength,
    temperature: request.temperature ?? 0.2,
  })

  const response = await $fetch<AiChatCompletionResponse>(`${trimTrailingSlash(baseUrl)}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      model,
      messages: request.messages,
      temperature: request.temperature ?? 0.2,
    },
  }).catch((error) => {
    log.error('model request failed', {
      status: 'failed',
      durationMs: Date.now() - start,
      errorMessage: error?.statusMessage || error?.message,
      statusCode: error?.statusCode,
    })

    throw createError({
      statusCode: 502,
      statusMessage: 'AI 服务暂时没有返回可用结果。',
    })
  })

  const content = response.choices?.[0]?.message?.content

  if (!content) {
    log.error('model request failed', {
      status: 'failed',
      durationMs: Date.now() - start,
      errorMessage: 'AI 没有返回可用内容。',
    })

    throw createError({
      statusCode: 502,
      statusMessage: 'AI 没有返回可用内容。',
    })
  }

  log.info('model request success', {
    status: 'success',
    durationMs: Date.now() - start,
    inputLength,
    outputLength: content.length,
  })

  return content
}
