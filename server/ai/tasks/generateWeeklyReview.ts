import { callAiModel } from '../client'
import { getDefaultUserProfile } from '../context/userProfile'
import {
  buildWeeklyReviewMessages,
  parseWeeklyReviewResult,
  type WeeklyReviewInput,
  type WeeklyReviewResult,
} from '../schemas/weeklyReview'

const fallbackWeeklyReview = (input: WeeklyReviewInput): WeeklyReviewResult => ({
  aiSummary: `本周一共记录了 ${input.records.length} 条事件，可以先把重点放在最常出现的推进和消耗来源上。`,
  mainProgress: '主要推进来自已经被记录下来的具体行动和复盘意识。',
  mainEnergyCost: '主要消耗可能来自需要持续处理的信息、选择或关系压力。',
  repeatedPatterns: ['持续记录', '能量观察', '小步推进'],
  highFrequencyTags: Array.from(new Set(input.records.flatMap((record) => record.tags ?? []))).slice(0, 8),
  nextWeekAction: '下周先选择一个最小动作，并在完成后记录一次真实感受。',
})

export const generateWeeklyReview = async (input: WeeklyReviewInput): Promise<WeeklyReviewResult> => {
  if (process.env.AI_MOCK_MODE === 'true') {
    return fallbackWeeklyReview(input)
  }

  const content = await callAiModel({
    messages: buildWeeklyReviewMessages(input, {
      userProfile: getDefaultUserProfile(),
    }),
    temperature: 0.25,
  })

  return parseWeeklyReviewResult(content)
}
