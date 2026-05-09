import { describe, expect, it } from 'vitest'
import {
  formatWeeklyReviewScore,
  getNaturalWeekRange,
  getWeeklyReviewStaleDatesForRecordChange,
  isSameNaturalWeek,
  isSameNaturalDay,
  isTimedOutPendingWeeklyReview,
  parseWeeklyReviewTags,
  shouldRegenerateWeeklyReview,
  weeklyReviewPendingTimeoutMs,
} from '../../server/services/weekly-review-rules'

describe('weekly review rules', () => {
  it('uses Monday as the natural week start and Sunday as the week end', () => {
    const range = getNaturalWeekRange(new Date(2026, 4, 6, 12))

    expect(range.weekStart.getFullYear()).toBe(2026)
    expect(range.weekStart.getMonth()).toBe(4)
    expect(range.weekStart.getDate()).toBe(4)
    expect(range.weekStart.getHours()).toBe(0)
    expect(range.weekEnd.getFullYear()).toBe(2026)
    expect(range.weekEnd.getMonth()).toBe(4)
    expect(range.weekEnd.getDate()).toBe(10)
    expect(range.weekEnd.getHours()).toBe(23)
    expect(range.weekEnd.getMinutes()).toBe(59)
    expect(range.weekEnd.getSeconds()).toBe(59)
    expect(range.weekEnd.getMilliseconds()).toBe(999)
  })

  it('keeps Monday in the same week', () => {
    const range = getNaturalWeekRange(new Date(2026, 4, 4, 9))

    expect(range.weekStart.getFullYear()).toBe(2026)
    expect(range.weekStart.getMonth()).toBe(4)
    expect(range.weekStart.getDate()).toBe(4)
    expect(range.weekStart.getHours()).toBe(0)
  })

  it('compares natural days', () => {
    expect(isSameNaturalDay(new Date(2026, 4, 4, 1), new Date(2026, 4, 4, 23))).toBe(true)
    expect(isSameNaturalDay(new Date(2026, 4, 4, 23), new Date(2026, 4, 5, 1))).toBe(false)
  })

  it('compares natural weeks', () => {
    expect(isSameNaturalWeek(new Date(2026, 4, 4), new Date(2026, 4, 10))).toBe(true)
    expect(isSameNaturalWeek(new Date(2026, 4, 10), new Date(2026, 4, 11))).toBe(false)
  })

  it('selects stale dates for record create and delete changes', () => {
    const createdAt = new Date(2026, 4, 5, 10)
    const deletedAt = new Date(2026, 4, 6, 10)

    expect(getWeeklyReviewStaleDatesForRecordChange({ nextDate: createdAt })).toEqual([createdAt])
    expect(getWeeklyReviewStaleDatesForRecordChange({ previousDate: deletedAt })).toEqual([deletedAt])
  })

  it('deduplicates stale dates when a record is edited within the same week', () => {
    const previousDate = new Date(2026, 4, 5, 10)
    const nextDate = new Date(2026, 4, 6, 10)

    expect(getWeeklyReviewStaleDatesForRecordChange({ previousDate, nextDate })).toEqual([previousDate])
  })

  it('keeps both stale dates when a record is edited across weeks', () => {
    const previousDate = new Date(2026, 4, 10, 10)
    const nextDate = new Date(2026, 4, 11, 10)

    expect(getWeeklyReviewStaleDatesForRecordChange({ previousDate, nextDate })).toEqual([
      previousDate,
      nextDate,
    ])
  })

  it('formats scores while preserving zero', () => {
    expect(formatWeeklyReviewScore(null)).toBeNull()
    expect(formatWeeklyReviewScore(0)).toBe(0)
    expect(formatWeeklyReviewScore(3.24)).toBe(3.2)
  })

  it('parses weekly review tags safely', () => {
    expect(parseWeeklyReviewTags('["focus",1,"energy"]')).toEqual(['focus', 'energy'])
    expect(parseWeeklyReviewTags('not-json')).toEqual([])
    expect(parseWeeklyReviewTags(null)).toEqual([])
  })

  it('detects timed out pending reviews', () => {
    const now = new Date(2026, 4, 5, 10, 5, 1)

    expect(
      isTimedOutPendingWeeklyReview(
        { status: 'PENDING', updatedAt: new Date(now.getTime() - weeklyReviewPendingTimeoutMs - 1) },
        now,
      ),
    ).toBe(true)
    expect(
      isTimedOutPendingWeeklyReview(
        { status: 'PENDING', updatedAt: new Date(now.getTime() - weeklyReviewPendingTimeoutMs) },
        now,
      ),
    ).toBe(false)
    expect(
      isTimedOutPendingWeeklyReview(
        { status: 'SUCCESS', updatedAt: new Date(now.getTime() - weeklyReviewPendingTimeoutMs - 1) },
        now,
      ),
    ).toBe(false)
  })

  it('decides when a weekly review should regenerate', () => {
    const now = new Date(2026, 4, 5, 10)
    const generatedAt = new Date(2026, 4, 5, 9)

    expect(shouldRegenerateWeeklyReview({ status: 'STALE', generatedAt, sourceUpdatedAt: null }, now)).toBe(true)
    expect(shouldRegenerateWeeklyReview({ status: 'FAILED', generatedAt, sourceUpdatedAt: null }, now)).toBe(true)
    expect(shouldRegenerateWeeklyReview({ status: 'SUCCESS', generatedAt: null, sourceUpdatedAt: null }, now)).toBe(true)
    expect(
      shouldRegenerateWeeklyReview(
        { status: 'SUCCESS', generatedAt: new Date(2026, 4, 4, 23), sourceUpdatedAt: null },
        now,
      ),
    ).toBe(true)
    expect(
      shouldRegenerateWeeklyReview(
        { status: 'SUCCESS', generatedAt, sourceUpdatedAt: new Date(2026, 4, 5, 9, 30) },
        now,
      ),
    ).toBe(true)
    expect(
      shouldRegenerateWeeklyReview(
        { status: 'SUCCESS', generatedAt, sourceUpdatedAt: new Date(2026, 4, 5, 8, 30) },
        now,
      ),
    ).toBe(false)
  })
})
