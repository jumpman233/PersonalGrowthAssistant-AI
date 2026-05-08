import type { SuggestTagsPayload, SuggestTagsResponse } from '../../../app/types/ai'
import type { AiMessage } from '../types'
import { parseJsonObject } from './utils'

export const suggestTagsPromptVersion = 'suggest-tags-v1'
export const suggestTagsTaskType = 'SUGGEST_TAGS'
export const maxSuggestTagCount = 5
export const maxSuggestTagLength = 20
export const maxExistingTagsForAi = 20

export const normalizeSuggestTag = (tag: string) => tag.trim().replace(/^#+/, '')

export const normalizeSuggestTags = (tags: unknown) => {
  if (!Array.isArray(tags)) {
    return []
  }

  const seen = new Set<string>()

  return tags
    .map((tag) => tag?.toString().trim() ?? '')
    .filter((tag) => {
      if (!tag || seen.has(tag)) {
        return false
      }

      seen.add(tag)
      return true
    })
}

export const uniqueSuggestedTags = (tags: string[], selectedTags: string[] = []) => {
  const selected = new Set(selectedTags.map((tag) => tag.trim()))
  const seen = new Set<string>()

  return tags
    .map(normalizeSuggestTag)
    .filter((tag) => {
      if (!tag || tag.length > maxSuggestTagLength || selected.has(tag) || seen.has(tag)) {
        return false
      }

      seen.add(tag)
      return true
    })
    .slice(0, maxSuggestTagCount)
}

export const toSuggestTagsPayload = (body: unknown, existingTags: string[]): SuggestTagsPayload => {
  const value = body as Partial<SuggestTagsPayload>
  const clientExistingTags = normalizeSuggestTags(value.existingTags)
  const mergedExistingTags = normalizeSuggestTags([...clientExistingTags, ...existingTags]).slice(0, maxExistingTagsForAi)

  return {
    title: value.title?.toString() ?? '',
    content: value.content?.toString() ?? '',
    category: value.category,
    moodScore: value.moodScore === undefined ? undefined : Number(value.moodScore),
    constructivenessScore:
      value.constructivenessScore === undefined ? undefined : Number(value.constructivenessScore),
    energyCostScore: value.energyCostScore === undefined ? undefined : Number(value.energyCostScore),
    existingTags: mergedExistingTags,
    selectedTags: normalizeSuggestTags(value.selectedTags),
  }
}

export const buildSuggestTagsMessages = (input: SuggestTagsPayload): AiMessage[] => [
  {
    role: 'system',
    content: [
      '你是 Growth Compass 的 AI 推荐标签任务。',
      '只输出 JSON，不输出 Markdown 或解释。',
      '产品语气：平静克制、具体、不鸡血、不做心理诊断、不评价人格、不贴负面标签。',
      '任务：根据记录内容推荐 3-5 个短标签。',
      '标签规则：尽量 2-6 个字；优先复用已有标签；描述事件、主题、状态或行为模式，优先描述情绪状态。',
      '禁止：心理诊断类标签、人格评价类标签、攻击性标签、制造压力的标签。',
      '输出格式必须是：{"suggestedTags":["标签1","标签2","标签3"]}',
      `taskType: ${suggestTagsTaskType}`,
      `promptVersion: ${suggestTagsPromptVersion}`,
    ].join('\n'),
  },
  {
    role: 'user',
    content: JSON.stringify({
      title: input.title,
      content: input.content,
      category: input.category,
      moodScore: input.moodScore,
      constructivenessScore: input.constructivenessScore,
      energyCostScore: input.energyCostScore,
      existingTags: input.existingTags ?? [],
      selectedTags: input.selectedTags ?? [],
    }),
  },
]

export const parseSuggestTagsResult = (content: string, selectedTags: string[] = []): SuggestTagsResponse => {
  const parsed = parseJsonObject<SuggestTagsResponse>(content)
  const tags = Array.isArray(parsed.suggestedTags)
    ? parsed.suggestedTags.filter((tag): tag is string => typeof tag === 'string')
    : []

  return {
    suggestedTags: uniqueSuggestedTags(tags, selectedTags),
  }
}
