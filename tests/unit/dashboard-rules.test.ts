import { describe, expect, it } from 'vitest'
import {
  buildWeeklyTrendFromRecords,
  calculateAverageDashboardScore,
  calculateDashboardStats,
  calculateHighFrequencyTags,
  formatDashboardScore,
} from '../../server/services/dashboard-rules'

describe('dashboard rules', () => {
  it('formats dashboard scores for display', () => {
    expect(formatDashboardScore(null)).toBe('-')
    expect(formatDashboardScore(undefined)).toBe('-')
    expect(formatDashboardScore(3)).toBe('3')
    expect(formatDashboardScore(3.25)).toBe('3.3')
  })

  it('calculates averages while keeping zero as a valid score', () => {
    expect(calculateAverageDashboardScore([null, undefined])).toBeNull()
    expect(calculateAverageDashboardScore([0, 2, null, 5])).toBe(2.3)
  })

  it('builds dashboard stats with formatted values', () => {
    const stats = calculateDashboardStats(4, 3.25, null, 5)

    expect(stats).toHaveLength(4)
    expect(stats[0]).toMatchObject({ label: '本周记录', value: '4' })
    expect(stats[1]).toMatchObject({ label: '平均建设感', value: '3.3' })
    expect(stats[2]).toMatchObject({ label: '平均内耗', value: '-' })
    expect(stats[3]).toMatchObject({ label: '情绪稳定度', value: '5' })
  })

  it('sorts high frequency tags by count then name', () => {
    const tags = calculateHighFrequencyTags(
      [
        { tags: [{ tag: { name: '复盘' } }, { tag: { name: '执行' } }] },
        { tags: [{ tag: { name: '复盘' } }, { tag: { name: '沟通' } }] },
        { tags: [{ tag: { name: '沟通' } }, { tag: { name: '计划' } }] },
      ],
      3,
    )

    expect(tags).toEqual(['复盘', '沟通', '计划'])
  })

  it('builds a seven-day weekly trend from records', () => {
    const weekStart = new Date(2026, 4, 4, 0, 0, 0)
    const trend = buildWeeklyTrendFromRecords(
      [
        {
          occurredAt: new Date(2026, 4, 4, 8, 0, 0),
          constructivenessScore: 4,
          energyCostScore: 2,
        },
        {
          occurredAt: new Date(2026, 4, 4, 12, 0, 0),
          constructivenessScore: 2,
          energyCostScore: 0,
        },
        {
          occurredAt: new Date(2026, 4, 6, 9, 0, 0),
          constructivenessScore: null,
          energyCostScore: 5,
        },
        {
          occurredAt: null,
          constructivenessScore: 5,
          energyCostScore: 5,
        },
      ],
      weekStart,
    )

    expect(trend).toHaveLength(7)
    expect(trend[0]).toEqual({ day: '周一', growth: 3, drain: 1 })
    expect(trend[1]).toEqual({ day: '周二', growth: 0, drain: 0 })
    expect(trend[2]).toEqual({ day: '周三', growth: 0, drain: 5 })
  })
})
