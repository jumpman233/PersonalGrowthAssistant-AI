import type { AiChatCompletionResponse, AiTaskRequest } from './types'

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export const callAiModel = async (request: AiTaskRequest) => {
  const config = useRuntimeConfig()
  const baseUrl = process.env.AI_BASE_URL || config.aiBaseUrl
  const apiKey = process.env.AI_API_KEY || config.aiApiKey
  const model = process.env.AI_MODEL_NAME || config.aiModelName

  if (!baseUrl || !apiKey || !model) {
    throw createError({
      statusCode: 500,
      statusMessage: 'AI 配置不完整。',
    })
  }

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
    console.error('AI model request failed', {
      statusCode: error?.statusCode,
      statusMessage: error?.statusMessage,
      data: error?.data,
    })

    throw createError({
      statusCode: 502,
      statusMessage: 'AI 服务暂时没有返回可用结果。',
    })
  })

  const content = response.choices?.[0]?.message?.content

  if (!content) {
    throw createError({
      statusCode: 502,
      statusMessage: 'AI 没有返回可用内容。',
    })
  }

  return content
}
