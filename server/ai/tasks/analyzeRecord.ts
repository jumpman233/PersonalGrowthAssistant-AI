import type { RecordAiAnalysisInput, RecordAiAnalysisResult } from '../../../app/types/ai'
import { callAiModel } from '../client'
import { getDefaultUserProfile } from '../context/userProfile'
import {
  analyzeRecordPromptVersion,
  analyzeRecordTaskType,
  buildAnalyzeRecordMessages,
  parseAnalyzeRecordResult,
} from '../schemas/analyzeRecord'
import { logger } from '../../utils/logger'

interface AiTaskLogContext {
  requestId?: string
  recordId?: string
  weeklyReviewId?: string
  aiAnalysisId?: string
}

const fallbackAnalysis = (input: RecordAiAnalysisInput): RecordAiAnalysisResult => ({
  summary: `${input.title} 这条记录里，核心是把当下发生的事情写清楚，并开始区分哪些部分在推进，哪些部分只是消耗。`,
  emotionKeywords: ['观察', '推进感', '轻微消耗'],
  energyCostNote: '主要消耗可能来自需要持续处理的信息、选择或关系压力。',
  constructivenessNote: '建设感来自你已经把事件写下来，并尝试用评分和标签拆开看。',
  nextAction: '选一个最小动作，在明天继续推进 15 分钟。',
})

export const analyzeRecord = async (input: RecordAiAnalysisInput, context: AiTaskLogContext = {}): Promise<RecordAiAnalysisResult> => {
  const start = Date.now()
  const log = logger.child({
    requestId: context.requestId,
    taskType: analyzeRecordTaskType,
    promptVersion: analyzeRecordPromptVersion,
    recordId: context.recordId,
    weeklyReviewId: context.weeklyReviewId,
    aiAnalysisId: context.aiAnalysisId,
  })

  log.info('ai task started', {
    status: 'started',
    contentLength: input.content.length,
    titleLength: input.title.length,
    tagCount: input.tags?.length ?? 0,
  })

  if (process.env.AI_MOCK_MODE === 'true') {
    const result = fallbackAnalysis(input)
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
      messages: buildAnalyzeRecordMessages(input, {
        userProfile: getDefaultUserProfile(),
      }),
      temperature: 0.25,
      taskType: analyzeRecordTaskType,
      promptVersion: analyzeRecordPromptVersion,
      requestId: context.requestId,
      recordId: context.recordId,
      weeklyReviewId: context.weeklyReviewId,
      aiAnalysisId: context.aiAnalysisId,
    })
    const result = parseAnalyzeRecordResult(content)

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
