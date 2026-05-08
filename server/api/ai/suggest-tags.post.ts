import type { SuggestTagsPayload } from '../../../app/types/ai'
import { maxExistingTagsForAi, toSuggestTagsPayload } from '../../ai/schemas/suggestTags'
import { suggestTags } from '../../ai/tasks/suggestTags'
import { getTagOptions } from '../../services/records'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const context = { requestId: event.context.requestId }
  const knownTags = (await getTagOptions(context)).slice(0, maxExistingTagsForAi)
  const payload: SuggestTagsPayload = toSuggestTagsPayload(body, knownTags)

  if (!payload.title.trim() && !payload.content.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: '先写一点内容，再让 AI 推荐标签。',
    })
  }

  return suggestTags(payload, context)
})
