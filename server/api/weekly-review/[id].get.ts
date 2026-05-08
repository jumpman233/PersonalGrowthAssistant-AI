import { getWeeklyReviewById } from '../../services/weekly-review'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing weekly review id',
    })
  }

  const review = await getWeeklyReviewById(id, { requestId: event.context.requestId })

  if (!review) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Weekly review not found',
    })
  }

  return review
})
