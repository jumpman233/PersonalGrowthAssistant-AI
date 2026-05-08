import { getAiAnalysisById } from '../../services/ai-analysis'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing analysis id',
    })
  }

  const analysis = await getAiAnalysisById(id, { requestId: event.context.requestId })

  if (!analysis) {
    throw createError({
      statusCode: 404,
      statusMessage: 'AI analysis not found',
    })
  }

  return analysis
})
