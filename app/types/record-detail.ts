import type { RecordCategory } from '@prisma/client'

export interface RecordDetailScore {
  label: string
  value: string
  icon: string
  tone: string
}

export interface RecordDetailAiSummary {
  id: string
  summary: string
  emotionKeywords: string[]
  energyCostNote: string
  constructivenessNote: string
  nextAction: string
  createdAt: string
}

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
}
