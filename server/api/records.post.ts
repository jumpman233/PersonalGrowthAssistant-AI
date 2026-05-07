import type { CreateRecordPayload } from '../../app/types/record-form'
import { createRecord } from '../services/records'

const toPayload = (body: unknown): CreateRecordPayload => {
  const value = body as Partial<CreateRecordPayload>

  return {
    title: value.title?.toString() ?? '',
    content: value.content?.toString() ?? '',
    category: value.category as CreateRecordPayload['category'],
    moodScore: Number(value.moodScore),
    constructivenessScore: Number(value.constructivenessScore),
    energyCostScore: Number(value.energyCostScore),
    tags: Array.isArray(value.tags) ? value.tags.map((tag) => tag?.toString() ?? '') : [],
    occurredAt: value.occurredAt?.toString() ?? '',
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  return createRecord(toPayload(body))
})
