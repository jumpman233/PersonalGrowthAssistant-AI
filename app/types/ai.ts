import type { RecordCategory } from '@prisma/client'

export interface SuggestTagsPayload {
  title: string
  content: string
  category?: RecordCategory
  moodScore?: number
  constructivenessScore?: number
  energyCostScore?: number
  existingTags?: string[]
  selectedTags?: string[]
}

export interface SuggestTagsResponse {
  suggestedTags: string[]
}

export type AiAnalysisStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export interface RecordAiAnalysisInput {
  title: string
  content: string
  category: RecordCategory
  moodScore?: number | null
  constructivenessScore?: number | null
  energyCostScore?: number | null
  tags?: string[]
  occurredAt?: string | null
}

export interface RecordAiAnalysisResult {
  summary: string
  emotionKeywords: string[]
  energyCostNote: string
  constructivenessNote: string
  nextAction: string
}

export interface AiAnalysisResponse extends RecordAiAnalysisResult {
  id: string
  status: AiAnalysisStatus
  errorMessage: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
  failedAt: string | null
}
