import type { RecordAiAnalysisInput, RecordAiAnalysisResult } from '../../../app/types/ai'
import { callAiModel } from '../client'
import { buildAnalyzeRecordMessages, parseAnalyzeRecordResult } from '../schemas/analyzeRecord'

const fallbackAnalysis = (input: RecordAiAnalysisInput): RecordAiAnalysisResult => ({
  summary: `${input.title} 这条记录里，核心是把当下发生的事情写清楚，并开始区分哪些部分在推进，哪些部分只是消耗。`,
  emotionKeywords: ['观察', '推进感', '轻微消耗'],
  energyCostNote: '主要消耗可能来自需要持续处理的信息、选择或关系压力。',
  constructivenessNote: '建设感来自你已经把事件写下来，并尝试用评分和标签拆开看。',
  nextAction: '选一个最小动作，在明天继续推进 15 分钟。',
})

export const analyzeRecord = async (input: RecordAiAnalysisInput): Promise<RecordAiAnalysisResult> => {
  if (process.env.AI_MOCK_MODE === 'true') {
    return fallbackAnalysis(input)
  }

  const content = await callAiModel({
    messages: buildAnalyzeRecordMessages(input),
    temperature: 0.25,
  })

  return parseAnalyzeRecordResult(content)
}
