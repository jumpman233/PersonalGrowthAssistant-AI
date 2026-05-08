export type WeeklyReviewStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'STALE'

export interface WeeklyReviewStats {
  recordCount: number
  averageMoodScore: number | null
  averageConstructiveness: number | null
  averageEnergyCost: number | null
}

export interface WeeklyReviewSection {
  title: string
  content: string
}

export interface WeeklyReviewApiData {
  id: string | null
  title: string
  status: WeeklyReviewStatus
  statusLabel: string
  weekRange: string
  generatedLabel: string
  errorMessage: string | null
  stats: WeeklyReviewStats
  highFrequencyTags: string[]
  summary: string
  sections: WeeklyReviewSection[]
  nextWeekAction: string
}
