import { callAiModel } from '../client'
import { getDefaultUserProfile } from '../context/userProfile'
import {
  buildWeeklyReviewMessages,
  parseWeeklyReviewResult,
  weeklyReviewPromptVersion,
  weeklyReviewTaskType,
  type WeeklyReviewInput,
  type WeeklyReviewResult,
} from '../schemas/weeklyReview'
import { logger } from '../../utils/logger'

interface AiTaskLogContext {
  requestId?: string
  recordId?: string
  weeklyReviewId?: string
  aiAnalysisId?: string
}

const fallbackWeeklyReview = (input: WeeklyReviewInput): WeeklyReviewResult => ({
  aiSummary: `本周一共记录了 ${input.records.length} 条事件，可以先把重点放在最常出现的推进和消耗来源上。`,
  mainProgress: '主要推进来自已经被记录下来的具体行动和复盘意识。',
  mainEnergyCost: '主要消耗可能来自需要持续处理的信息、选择或关系压力。',
  repeatedPatterns: ['持续记录', '能量观察', '小步推进'],
  highFrequencyTags: Array.from(new Set(input.records.flatMap((record) => record.tags ?? []))).slice(0, 8),
  nextWeekAction: '下周先选择一个最小动作，并在完成后记录一次真实感受。',
})

export const generateWeeklyReview = async (
  input: WeeklyReviewInput,
  context: AiTaskLogContext = {},
): Promise<WeeklyReviewResult> => {
  const start = Date.now()
  const log = logger.child({
    requestId: context.requestId,
    taskType: weeklyReviewTaskType,
    promptVersion: weeklyReviewPromptVersion,
    recordId: context.recordId,
    weeklyReviewId: context.weeklyReviewId,
    aiAnalysisId: context.aiAnalysisId,
  })

  log.info('ai task started', {
    status: 'started',
    recordCount: input.records.length,
  })

  if (process.env.AI_MOCK_MODE === 'true') {
    const result = fallbackWeeklyReview(input)
    log.info('ai task success', {
      status: 'success',
      durationMs: Date.now() - start,
      parseSuccess: true,
      mockMode: true,
    })
    return result
  }

  try {
    const content = await callAiModel({
      messages: buildWeeklyReviewMessages(input, {
        userProfile: getDefaultUserProfile(),
      }),
      temperature: 0.25,
      taskType: weeklyReviewTaskType,
      promptVersion: weeklyReviewPromptVersion,
      requestId: context.requestId,
      recordId: context.recordId,
      weeklyReviewId: context.weeklyReviewId,
      aiAnalysisId: context.aiAnalysisId,
    })
    const result = parseWeeklyReviewResult(content)

    log.info('ai task success', {
      status: 'success',
      durationMs: Date.now() - start,
      parseSuccess: true,
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
