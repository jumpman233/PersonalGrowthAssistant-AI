import type { RecordCategory } from '@prisma/client'
import type { RecordsApiQuery, RecordsTimeRange } from '../../app/types/records'
import { getRecordsData } from '../services/records'

const categories = new Set<RecordCategory | 'ALL'>([
  'ALL',
  'WORK',
  'RELATIONSHIP',
  'EMOTION',
  'STUDY',
  'LIFE',
  'PROJECT',
  'HEALTH',
  'SOCIAL',
  'OTHER',
])

const timeRanges = new Set<RecordsTimeRange>(['latest7days', 'thisMonth', 'all'])

const toSingleQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value[0]?.toString()
  }

  return value?.toString()
}

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Number(toSingleQueryValue(query.page))
  const pageSize = Number(toSingleQueryValue(query.pageSize))
  const category = toSingleQueryValue(query.category)
  const tag = toSingleQueryValue(query.tag)
  const timeRange = toSingleQueryValue(query.timeRange)

  const recordsQuery: RecordsApiQuery = {
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 10,
    category: category && categories.has(category as RecordCategory | 'ALL') ? (category as RecordCategory | 'ALL') : 'ALL',
    tag,
    timeRange: timeRange && timeRanges.has(timeRange as RecordsTimeRange) ? (timeRange as RecordsTimeRange) : 'latest7days',
  }

  return getRecordsData(recordsQuery)
})
