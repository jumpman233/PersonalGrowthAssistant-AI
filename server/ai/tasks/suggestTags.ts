import type { SuggestTagsPayload, SuggestTagsResponse } from '../../../app/types/ai'
import { callAiModel } from '../client'
import { buildSuggestTagsMessages, parseSuggestTagsResult, uniqueSuggestedTags } from '../schemas/suggestTags'

const fallbackTags = (input: SuggestTagsPayload): SuggestTagsResponse => {
  const text = `${input.title} ${input.content}`
  const tags = [
    ...(input.existingTags ?? []).filter((tag) => text.includes(tag)),
    text.includes('AI') || text.includes('模型') ? 'AI开发' : '',
    text.includes('项目') || text.includes('推进') ? '项目推进' : '',
    input.constructivenessScore !== undefined && input.constructivenessScore >= 4 ? '真实建设感' : '',
    input.energyCostScore !== undefined && input.energyCostScore >= 4 ? '明显消耗' : '',
    input.moodScore !== undefined && input.moodScore <= 2 ? '情绪观察' : '',
    '低压力推进',
  ]

  return {
    suggestedTags: uniqueSuggestedTags(tags, input.selectedTags),
  }
}

export const suggestTags = async (input: SuggestTagsPayload): Promise<SuggestTagsResponse> => {
  if (process.env.AI_MOCK_MODE === 'true') {
    return fallbackTags(input)
  }

  const content = await callAiModel({
    messages: buildSuggestTagsMessages(input),
    temperature: 0.2,
  })

  return parseSuggestTagsResult(content, input.selectedTags)
}
