import type { RecordCategory } from '@prisma/client'

export type RecordsTimeRange = 'latest7days' | 'thisMonth' | 'all'

export interface RecordsCategoryOption {
  label: string
  value: RecordCategory | 'ALL'
}

export interface RecordsTagOption {
  label: string
  value: string
}

export interface RecordsTimeRangeOption {
  label: string
  value: RecordsTimeRange
}

export interface RecordsScore {
  label: string
  value: string
  icon: string
  tone: string
}

export interface RecordsListItem {
  id: string
  title: string
  summary: string
  category: {
    label: string
    value: RecordCategory
    icon: string
    tone: string
  }
  occurredAt: string
  tags: string[]
  scores: {
    mood: RecordsScore
    constructiveness: RecordsScore
    energyCost: RecordsScore
  }
}

export interface RecordsSummary {
  weeklyRecordCount: number
  averageConstructiveness: number | null
  averageEnergyCost: number | null
  averageMood: number | null
}

export interface RecordsPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface RecordsApiData {
  filters: {
    tags: RecordsTagOption[]
  }
  summary: RecordsSummary
  records: RecordsListItem[]
  highFrequencyTags: string[]
  pagination: RecordsPagination
}

export interface RecordsApiQuery {
  page?: number
  pageSize?: number
  category?: RecordCategory | 'ALL'
  tag?: string
  timeRange?: RecordsTimeRange
}
