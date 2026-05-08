import type { UpdateRecordPayload } from '../../../app/types/record-form'
import { updateRecord } from '../../services/records'

const toPayload = (body: unknown): UpdateRecordPayload => {
  const value = body as Partial<UpdateRecordPayload>

  return {
    title: value.title?.toString() ?? '',
    content: value.content?.toString() ?? '',
    category: value.category as UpdateRecordPayload['category'],
    moodScore: Number(value.moodScore),
    constructivenessScore: Number(value.constructivenessScore),
    energyCostScore: Number(value.energyCostScore),
    tags: Array.isArray(value.tags) ? value.tags.map((tag) => tag?.toString() ?? '') : [],
    occurredAt: value.occurredAt?.toString() ?? '',
  }
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing record id',
    })
  }

  const body = await readBody(event)
  const record = await updateRecord(id, toPayload(body))

  if (!record) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Record not found',
    })
  }

  return record
})
