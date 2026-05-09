import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { softDeleteRecord } from '../../server/services/record-detail'
import { createRecord, updateRecord } from '../../server/services/records'
import {
  buildRecordPayload,
  createWeeklyReviewForDate,
  prisma,
  resetDefaultUserData,
} from './helpers/db'

describe('weekly review stale integration', () => {
  beforeEach(async () => {
    await resetDefaultUserData()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('marks the matching weekly review stale after creating a record', async () => {
    const occurredAt = new Date(2026, 4, 5, 10)
    const review = await createWeeklyReviewForDate(occurredAt, { recordCount: 0 })

    await createRecord(
      buildRecordPayload({
        title: 'Weekly Stale Create',
        moodScore: 4,
        constructivenessScore: 5,
        energyCostScore: 1,
        occurredAt: occurredAt.toISOString(),
      }),
    )

    const updatedReview = await prisma.weeklyReview.findUnique({ where: { id: review.id } })

    expect(updatedReview).toMatchObject({
      status: 'STALE',
      recordCount: 1,
      averageMoodScore: 4,
      averageConstructiveness: 5,
      averageEnergyCost: 1,
    })
  })

  it('marks the matching weekly review stale and refreshes stats after deleting a record', async () => {
    const occurredAt = new Date(2026, 4, 5, 10)
    const created = await createRecord(
      buildRecordPayload({
        title: 'Weekly Stale Delete',
        moodScore: 4,
        constructivenessScore: 5,
        energyCostScore: 1,
        occurredAt: occurredAt.toISOString(),
      }),
    )
    const review = await createWeeklyReviewForDate(occurredAt, { recordCount: 1 })

    await softDeleteRecord(created.id)

    const updatedReview = await prisma.weeklyReview.findUnique({ where: { id: review.id } })

    expect(updatedReview).toMatchObject({
      status: 'STALE',
      recordCount: 0,
      averageMoodScore: null,
      averageConstructiveness: null,
      averageEnergyCost: null,
    })
  })

  it('marks the matching weekly review stale after editing a record in the same week', async () => {
    const occurredAt = new Date(2026, 4, 5, 10)
    const created = await createRecord(
      buildRecordPayload({
        title: 'Weekly Stale Edit',
        content: 'Before edit.',
        occurredAt: occurredAt.toISOString(),
      }),
    )
    const review = await createWeeklyReviewForDate(occurredAt, { recordCount: 1 })

    await updateRecord(
      created.id,
      buildRecordPayload({
        title: 'Weekly Stale Edit',
        content: 'After edit.',
        moodScore: 0,
        constructivenessScore: 2,
        energyCostScore: 3,
        occurredAt: occurredAt.toISOString(),
      }),
    )

    const updatedReview = await prisma.weeklyReview.findUnique({ where: { id: review.id } })

    expect(updatedReview).toMatchObject({
      status: 'STALE',
      recordCount: 1,
      averageMoodScore: 0,
      averageConstructiveness: 2,
      averageEnergyCost: 3,
    })
  })

  it('marks both old and new weekly reviews stale after moving a record across weeks', async () => {
    const oldDate = new Date(2026, 4, 10, 10)
    const newDate = new Date(2026, 4, 11, 10)
    const created = await createRecord(
      buildRecordPayload({
        title: 'Weekly Stale Cross Week',
        occurredAt: oldDate.toISOString(),
      }),
    )
    const oldReview = await createWeeklyReviewForDate(oldDate, { recordCount: 1 })
    const newReview = await createWeeklyReviewForDate(newDate, { recordCount: 0 })

    await updateRecord(
      created.id,
      buildRecordPayload({
        title: 'Weekly Stale Cross Week',
        occurredAt: newDate.toISOString(),
      }),
    )

    const [updatedOldReview, updatedNewReview] = await Promise.all([
      prisma.weeklyReview.findUnique({ where: { id: oldReview.id } }),
      prisma.weeklyReview.findUnique({ where: { id: newReview.id } }),
    ])

    expect(updatedOldReview).toMatchObject({
      status: 'STALE',
      recordCount: 0,
    })
    expect(updatedNewReview).toMatchObject({
      status: 'STALE',
      recordCount: 1,
    })
  })
})
