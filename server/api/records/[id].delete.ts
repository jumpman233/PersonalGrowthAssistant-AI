import { softDeleteRecord } from '../../services/record-detail'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing record id',
    })
  }

  const deleted = await softDeleteRecord(id, { requestId: event.context.requestId })

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Record not found',
    })
  }

  return {
    ok: true,
  }
})
