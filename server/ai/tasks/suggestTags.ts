import type { SuggestTagsPayload, SuggestTagsResponse } from '../../../app/types/ai'
import { callAiModel } from '../client'
import {
  buildSuggestTagsMessages,
  parseSuggestTagsResult,
  suggestTagsPromptVersion,
  suggestTagsTaskType,
  uniqueSuggestedTags,
} from '../schemas/suggestTags'
import { logger } from '../../utils/logger'

interface AiTaskLogContext {
  requestId?: string
  recordId?: string
  weeklyReviewId?: string
  aiAnalysisId?: string
}

const fallbackTags = (input: SuggestTagsPayload): SuggestTagsResponse => {
  const text = `${input.title} ${input.content}`
  const tags = [
    ...(input.existingTags ?? []).filter((tag) => text.includes(tag)),
    text.includes('AI') || text.includes('模型') ? 'AI开发' : '',
    text.includes('项目') || text.includes('推进') ? '项目推进' : '',
    input.constructivenessScore !== undefined && input.constructivenessScore >= 4 ? '真实建设感' : '',
    input.energyCostScore !== undefined && input.energyCostScore >= 4 ? '明显内耗' : '',
    input.moodScore !== undefined && input.moodScore <= 2 ? '情绪观察' : '',
    '低压力推进',
  ]

  return {
    suggestedTags: uniqueSuggestedTags(tags, input.selectedTags),
  }
}

export const suggestTags = async (input: SuggestTagsPayload, context: AiTaskLogContext = {}): Promise<SuggestTagsResponse> => {
  const start = Date.now()
  const log = logger.child({
    requestId: context.requestId,
    taskType: suggestTagsTaskType,
    promptVersion: suggestTagsPromptVersion,
    recordId: context.recordId,
    weeklyReviewId: context.weeklyReviewId,
    aiAnalysisId: context.aiAnalysisId,
  })

  log.info('ai task started', {
    status: 'started',
    contentLength: input.content.length,
    titleLength: input.title.length,
    tagCount: input.selectedTags?.length ?? 0,
  })

  if (process.env.AI_MOCK_MODE === 'true') {
    const result = fallbackTags(input)
    log.info('ai task success', {
      status: 'success',
      durationMs: Date.now() - start,
      parseSuccess: true,
      mockMode: true,
      suggestedTagCount: result.suggestedTags.length,
    })
    return result
  }

  try {
    const content = await callAiModel({
      messages: buildSuggestTagsMessages(input),
      temperature: 0.2,
      taskType: suggestTagsTaskType,
      promptVersion: suggestTagsPromptVersion,
      requestId: context.requestId,
      recordId: context.recordId,
      weeklyReviewId: context.weeklyReviewId,
      aiAnalysisId: context.aiAnalysisId,
    })
    const result = parseSuggestTagsResult(content, input.selectedTags)

    log.info('ai task success', {
      status: 'success',
      durationMs: Date.now() - start,
      parseSuccess: true,
      suggestedTagCount: result.suggestedTags.length,
    })

    return result
  } catch (error) {
    log.error('ai task failed', {
      status: 'failed',
      durationMs: Date.now() - start,
      parseSuccess: false,
      error,
    })
    throw error
  }
}
