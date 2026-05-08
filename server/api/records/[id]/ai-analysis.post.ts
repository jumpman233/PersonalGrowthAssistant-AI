import { createRecordAiAnalysis } from '../../../services/ai-analysis'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing record id',
    })
  }

  return createRecordAiAnalysis(id, { requestId: event.context.requestId })
})
