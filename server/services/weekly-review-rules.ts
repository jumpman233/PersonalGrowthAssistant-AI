import type { WeeklyReviewStatus } from '../../app/types/weekly-review'

export const weeklyReviewPendingTimeoutMs = 5 * 60 * 1000

type WeekRange = {
  weekStart: Date
  weekEnd: Date
}

export const getNaturalWeekRange = (date = new Date()): WeekRange => {
  const weekStart = new Date(date)
  const dayOffset = (weekStart.getDay() + 6) % 7
  weekStart.setDate(weekStart.getDate() - dayOffset)
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)
  weekEnd.setMilliseconds(-1)

  return { weekStart, weekEnd }
}

export const isSameNaturalDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()

export const formatWeeklyReviewScore = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return null
  }

  return Number(value.toFixed(1))
}

export const parseWeeklyReviewTags = (value: string | null) => {
  if (!value) {
    return []
  }

  try {
    const tags = JSON.parse(value)

    return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : []
  } catch {
    return []
  }
}

export const isTimedOutPendingWeeklyReview = (
  review: {
    status: string
    updatedAt: Date
  },
  now = new Date(),
  timeoutMs = weeklyReviewPendingTimeoutMs,
) => review.status === 'PENDING' && now.getTime() - review.updatedAt.getTime() > timeoutMs

export const shouldRegenerateWeeklyReview = (
  review: {
    status: WeeklyReviewStatus | string
    generatedAt: Date | null
    sourceUpdatedAt: Date | null
  },
  now = new Date(),
) => {
  if (review.status === 'STALE' || review.status === 'FAILED') {
    return true
  }

  if (!review.generatedAt) {
    return true
  }

  if (!isSameNaturalDay(review.generatedAt, now)) {
    return true
  }

  if (review.sourceUpdatedAt && review.sourceUpdatedAt > review.generatedAt) {
    return true
  }

  return false
}
