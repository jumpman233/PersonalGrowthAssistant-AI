import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { getDashboardData } from '../../server/services/dashboard'
import { softDeleteRecord } from '../../server/services/record-detail'
import { createRecord } from '../../server/services/records'
import { buildRecordPayload, getDefaultUser, prisma, resetDefaultUserData } from './helpers/db'

describe('dashboard service integration', () => {
  beforeEach(async () => {
    await resetDefaultUserData()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('returns only active recent records and does not trigger AI generation', async () => {
    const active = await createRecord(
      buildRecordPayload({
        title: 'Dashboard Active',
        content: 'Visible on dashboard.',
        tags: ['focus'],
        occurredAt: new Date('2026-05-09T10:00:00.000Z').toISOString(),
      }),
    )
    const deleted = await createRecord(
      buildRecordPayload({
        title: 'Dashboard Deleted',
        content: 'Hidden from dashboard.',
        tags: ['deleted-tag'],
        occurredAt: new Date('2026-05-09T11:00:00.000Z').toISOString(),
      }),
    )
    await softDeleteRecord(deleted.id)

    const dashboard = await getDashboardData()
    const aiCount = await prisma.aiAnalysis.count()

    expect(dashboard.records.map((record) => record.id)).toEqual([active.id])
    expect(dashboard.records[0]).toMatchObject({
      title: 'Dashboard Active',
      copy: 'Visible on dashboard.',
      tags: ['focus'],
    })
    expect(dashboard.tags).toEqual(['focus'])
    expect(dashboard.stats[0]).toMatchObject({ label: '本周记录', value: '1' })
    expect(aiCount).toBe(0)
  })

  it('uses weekly review stats, tags, insight, and active records for trend data', async () => {
    const user = await getDefaultUser()
    const weekStart = new Date('2026-05-04T00:00:00.000Z')
    const weekEnd = new Date('2026-05-10T23:59:59.999Z')

    await createRecord(
      buildRecordPayload({
        title: 'Dashboard Monday',
        content: 'Monday record.',
        moodScore: 0,
        constructivenessScore: 0,
        energyCostScore: 0,
        tags: ['focus'],
        occurredAt: new Date('2026-05-04T10:00:00.000Z').toISOString(),
      }),
    )
    await createRecord(
      buildRecordPayload({
        title: 'Dashboard Monday Two',
        content: 'Second Monday record.',
        moodScore: 4,
        constructivenessScore: 4,
        energyCostScore: 2,
        tags: ['focus', 'execution'],
        occurredAt: new Date('2026-05-04T12:00:00.000Z').toISOString(),
      }),
    )
    const deleted = await createRecord(
      buildRecordPayload({
        title: 'Dashboard Deleted Trend',
        content: 'Deleted trend record.',
        moodScore: 5,
        constructivenessScore: 5,
        energyCostScore: 5,
        tags: ['deleted-trend'],
        occurredAt: new Date('2026-05-04T14:00:00.000Z').toISOString(),
      }),
    )
    await softDeleteRecord(deleted.id)

    await prisma.weeklyReview.create({
      data: {
        userId: user.id,
        weekStart,
        weekEnd,
        status: 'SUCCESS',
        title: 'Dashboard Weekly Review',
        recordCount: 2,
        averageMoodScore: 0,
        averageConstructiveness: 2,
        averageEnergyCost: 1,
        highFrequencyTags: JSON.stringify(['focus', 'execution']),
        aiSummary: 'Dashboard review summary.',
        nextWeekAction: 'Keep one focused action.',
        generatedAt: new Date('2026-05-09T10:00:00.000Z'),
        sourceUpdatedAt: new Date('2026-05-09T09:00:00.000Z'),
      },
    })

    const dashboard = await getDashboardData()

    expect(dashboard.stats.map((stat) => [stat.label, stat.value])).toEqual([
      ['本周记录', '2'],
      ['平均建设感', '2'],
      ['平均内耗', '1'],
      ['情绪稳定度', '0'],
    ])
    expect(dashboard.tags).toEqual(['focus', 'execution'])
    expect(dashboard.aiInsight).toEqual({
      summary: 'Dashboard review summary.',
      suggestion: 'Keep one focused action.',
    })
    expect(dashboard.trend).toHaveLength(7)
    expect(dashboard.trend[0]).toEqual({ day: '周一', growth: 2, drain: 1 })
  })
})
