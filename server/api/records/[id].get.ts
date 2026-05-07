import { getRecordDetailData } from '../../services/record-detail'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing record id',
    })
  }

  const record = await getRecordDetailData(id)

  if (!record) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Record not found',
    })
  }

  return record
})
