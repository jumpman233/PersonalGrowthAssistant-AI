import type { RecordCategory } from '@prisma/client'

export interface RecordFormValue {
  title: string
  content: string
  category: RecordCategory
  moodScore: number
  constructivenessScore: number
  energyCostScore: number
  tags: string[]
  occurredAt: Date
}

export interface CreateRecordPayload {
  title: string
  content: string
  category: RecordCategory
  moodScore: number
  constructivenessScore: number
  energyCostScore: number
  tags: string[]
  occurredAt: string
}

export interface CreateRecordResponse {
  id: string
}

export type UpdateRecordPayload = CreateRecordPayload

export type UpdateRecordResponse = CreateRecordResponse
