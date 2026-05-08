import type { RecordAiAnalysisInput, RecordAiAnalysisResult } from '../../../app/types/ai'
import type { AiMessage } from '../types'

export const analyzeRecordPromptVersion = 'analyze-record-v1'
export const analyzeRecordTaskType = 'ANALYZE_RECORD'

const maxKeywordCount = 5
const maxKeywordLength = 12

export const buildAnalyzeRecordMessages = (input: RecordAiAnalysisInput): AiMessage[] => [
  {
    role: 'system',
    content: [
      '你是 Growth Compass 的单条记录 AI 总结任务。',
      '只输出 JSON，不输出 Markdown 或解释。',
      '产品语气：平静克制、具体、不鸡血、不做心理诊断、不评价人格、不替用户做决定。',
      '任务：根据单条记录生成结构化总结，帮助用户看清真实建设感和消耗来源。',
      '输出必须包含：summary、emotionKeywords、energyCostNote、constructivenessNote、nextAction。',
      'summary：用 1-2 句话概括事件，不夸大。',
      'emotionKeywords：给 2-5 个短关键词，描述状态或感受，不做诊断。',
      'energyCostNote：指出可能的消耗来源，保持温和具体。',
      'constructivenessNote：指出真实建设感来自哪里，避免空泛鼓励。',
      'nextAction：只给一个可执行的最小行动，不替用户做重大决定。',
      '禁止输出心理诊断、人格评价、攻击性表述、制造压力的命令式语言。',
      '输出格式必须是：{"summary":"...","emotionKeywords":["..."],"energyCostNote":"...","constructivenessNote":"...","nextAction":"..."}',
      `taskType: ${analyzeRecordTaskType}`,
      `promptVersion: ${analyzeRecordPromptVersion}`,
    ].join('\n'),
  },
  {
    role: 'user',
    content: JSON.stringify(input),
  },
]

const parseJsonObject = (content: string) => {
  const trimmed = content.trim()

  try {
    return JSON.parse(trimmed) as Partial<RecordAiAnalysisResult>
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/)

    if (!match) {
      throw createError({
        statusCode: 502,
        statusMessage: 'AI 返回内容不是可解析的 JSON。',
      })
    }

    return JSON.parse(match[0]) as Partial<RecordAiAnalysisResult>
  }
}

const cleanText = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()
  return trimmed || fallback
}

const cleanKeywords = (value: unknown) => {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => {
      if (!item || item.length > maxKeywordLength || seen.has(item)) {
        return false
      }

      seen.add(item)
      return true
    })
    .slice(0, maxKeywordCount)
}

export const parseAnalyzeRecordResult = (content: string): RecordAiAnalysisResult => {
  const parsed = parseJsonObject(content)

  return {
    summary: cleanText(parsed.summary, '这条记录已经被保存，暂时没有生成更完整的事件摘要。'),
    emotionKeywords: cleanKeywords(parsed.emotionKeywords),
    energyCostNote: cleanText(parsed.energyCostNote, '暂时没有识别到明确的消耗来源。'),
    constructivenessNote: cleanText(parsed.constructivenessNote, '暂时没有识别到明确的建设感来源。'),
    nextAction: cleanText(parsed.nextAction, '先补充一个明天能完成的小动作。'),
  }
}
