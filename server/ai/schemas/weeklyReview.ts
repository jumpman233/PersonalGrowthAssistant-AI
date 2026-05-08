import type { AiMessage } from '../types'

export const weeklyReviewPromptVersion = 'weekly-review-v1'
export const weeklyReviewTaskType = 'GENERATE_WEEKLY_REVIEW'

export interface WeeklyReviewInput {
  weekStart: string
  weekEnd: string
  records: Array<{
    title: string
    content: string
    category: string
    moodScore?: number | null
    constructivenessScore?: number | null
    energyCostScore?: number | null
    tags?: string[]
    occurredAt?: string | null
  }>
}

export interface WeeklyReviewResult {
  aiSummary: string
  mainProgress: string
  mainEnergyCost: string
  repeatedPatterns: string[]
  highFrequencyTags: string[]
  nextWeekAction: string
}

export const buildWeeklyReviewMessages = (input: WeeklyReviewInput): AiMessage[] => [
  {
    role: 'system',
    content: [
      '你是 Growth Compass 的周复盘生成任务。',
      '只输出 JSON，不输出 Markdown 或解释。',
      '产品语气：平静克制、具体、不鸡血、不做心理诊断、不评价人格、不替用户做决定。',
      '任务：根据一周记录生成结构化复盘，帮助用户看清主要推进、主要消耗和重复模式。',
      '输出必须包含：aiSummary、mainProgress、mainEnergyCost、repeatedPatterns、highFrequencyTags、nextWeekAction。',
      'repeatedPatterns：给 2-5 个重复出现的行为、状态或环境模式。',
      'highFrequencyTags：优先复用输入记录里的标签。',
      'nextWeekAction：只给一个下周最小行动，不替用户做重大决定。',
      '禁止输出心理诊断、人格评价、攻击性表述、制造压力的命令式语言。',
      '输出格式必须是：{"aiSummary":"...","mainProgress":"...","mainEnergyCost":"...","repeatedPatterns":["..."],"highFrequencyTags":["..."],"nextWeekAction":"..."}',
      `taskType: ${weeklyReviewTaskType}`,
      `promptVersion: ${weeklyReviewPromptVersion}`,
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
    return JSON.parse(trimmed) as Partial<WeeklyReviewResult>
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/)

    if (!match) {
      throw createError({
        statusCode: 502,
        statusMessage: 'AI 返回内容不是可解析的 JSON。',
      })
    }

    return JSON.parse(match[0]) as Partial<WeeklyReviewResult>
  }
}

const cleanText = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()
  return trimmed || fallback
}

const cleanTextList = (value: unknown, maxCount: number) => {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => {
      if (!item || seen.has(item)) {
        return false
      }

      seen.add(item)
      return true
    })
    .slice(0, maxCount)
}

export const parseWeeklyReviewResult = (content: string): WeeklyReviewResult => {
  const parsed = parseJsonObject(content)

  return {
    aiSummary: cleanText(parsed.aiSummary, '本周记录已经整理完成，暂时没有生成完整复盘。'),
    mainProgress: cleanText(parsed.mainProgress, '暂时没有识别到明确的主要推进。'),
    mainEnergyCost: cleanText(parsed.mainEnergyCost, '暂时没有识别到明确的主要消耗。'),
    repeatedPatterns: cleanTextList(parsed.repeatedPatterns, 5),
    highFrequencyTags: cleanTextList(parsed.highFrequencyTags, 8),
    nextWeekAction: cleanText(parsed.nextWeekAction, '下周先选择一个最小动作继续推进。'),
  }
}
