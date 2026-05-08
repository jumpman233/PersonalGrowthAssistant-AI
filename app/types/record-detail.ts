import type { RecordCategory } from '@prisma/client'
import type { AiAnalysisResponse } from './ai'
import type { UpdateRecordPayload } from './record-form'

export interface RecordDetailScore {
  label: string
  value: string
  icon: string
  tone: string
}

export type RecordDetailAiSummary = AiAnalysisResponse

export interface RecordDetailData {
  id: string
  title: string
  content: string
  category: {
    label: string
    value: RecordCategory
    icon: string
    tone: string
  }
  occurredAt: string
  occurredDate: string
  occurredWeekday: string
  tags: string[]
  scores: {
    mood: RecordDetailScore
    constructiveness: RecordDetailScore
    energyCost: RecordDetailScore
  }
  aiSummary: RecordDetailAiSummary | null
  formValue: UpdateRecordPayload
}
