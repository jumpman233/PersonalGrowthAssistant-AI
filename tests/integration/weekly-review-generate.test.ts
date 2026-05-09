import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { WeeklyReviewStatus } from '@prisma/client'
import { createRecord } from '../../server/services/records'
import { createCurrentWeeklyReviewGeneration } from '../../server/services/weekly-review'
import { getNaturalWeekRange } from '../../server/services/weekly-review-rules'
import { buildRecordPayload, getDefaultUser, prisma, resetDefaultUserData } from './helpers/db'

const mockGenerateWeeklyReview = vi.hoisted(() => vi.fn())

vi.mock('../../server/ai/tasks/generateWeeklyReview', () => ({
  generateWeeklyReview: mockGenerateWeeklyReview,
}))

const successResult = {
  aiSummary: 'Weekly AI summary.',
  mainProgress: 'Main progress.',
  mainEnergyCost: 'Main energy cost.',
  repeatedPatterns: ['pattern one', 'pattern two'],
  highFrequencyTags: ['focus', 'execution'],
  nextWeekAction: 'Do one focused action.',
}

const waitForReviewStatus = async (reviewId: string, status: WeeklyReviewStatus) => {
  const deadline = Date.now() + 3000

  while (Date.now() < deadline) {
    const review = await prisma.weeklyReview.findUnique({
      where: { id: reviewId },
    })

    if (review?.status === status) {
      return review
    }

    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  throw new Error(`Timed out waiting for weekly review ${reviewId} to become ${status}`)
}

const createCurrentWeekRecord = (title: string) =>
  createRecord(
    buildRecordPayload({
      title,
      content: `${title} content.`,
      tags: ['focus'],
      moodScore: 4,
      constructivenessScore: 5,
      energyCostScore: 1,
      occurredAt: new Date(2026, 4, 5, 10).toISOString(),
    }),
  )

describe('weekly review generation integration', () => {
  beforeEach(async () => {
    mockGenerateWeeklyReview.mockReset()
    await resetDefaultUserData()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('rejects generation when the current week has no records', async () => {
    await expect(createCurrentWeeklyReviewGeneration()).rejects.toMatchObject({
      statusCode: 400,
    })
    expect(mockGenerateWeeklyReview).not.toHaveBeenCalled()
  })

  it('creates a pending weekly review and stores successful AI results', async () => {
    await createCurrentWeekRecord('Weekly Review Success')
    mockGenerateWeeklyReview.mockResolvedValue(successResult)

    const createdReview = await createCurrentWeeklyReviewGeneration()

    expect(createdReview.status).toBe('PENDING')
    const storedReview = await waitForReviewStatus(createdReview.id as string, 'SUCCESS')

    expect(mockGenerateWeeklyReview).toHaveBeenCalledTimes(1)
    expect(storedReview).toMatchObject({
      status: 'SUCCESS',
      aiSummary: 'Weekly AI summary.',
      mainProgress: 'Main progress.',
      mainEnergyCost: 'Main energy cost.',
      repeatedPatterns: 'pattern one；pattern two',
      nextWeekAction: 'Do one focused action.',
      recordCount: 1,
      averageMoodScore: 4,
      averageConstructiveness: 5,
      averageEnergyCost: 1,
      errorMessage: null,
    })
    expect(JSON.parse(storedReview?.highFrequencyTags ?? '[]')).toEqual(['focus', 'execution'])
    expect(storedReview?.generatedAt).toBeInstanceOf(Date)
  })

  it('stores failed status when the AI task rejects', async () => {
    await createCurrentWeekRecord('Weekly Review Failure')
    mockGenerateWeeklyReview.mockRejectedValue(new Error('mock weekly review failed'))

    const createdReview = await createCurrentWeeklyReviewGeneration()
    const storedReview = await waitForReviewStatus(createdReview.id as string, 'FAILED')

    expect(storedReview).toMatchObject({
      status: 'FAILED',
      errorMessage: 'mock weekly review failed',
    })
  })

  it('reuses an existing non-timeout pending review', async () => {
    const user = await getDefaultUser()
    await createCurrentWeekRecord('Weekly Review Pending Reuse')
    const range = getNaturalWeekRange()
    const pendingReview = await prisma.weeklyReview.create({
      data: {
        userId: user.id,
        weekStart: range.weekStart,
        weekEnd: range.weekEnd,
        status: 'PENDING',
        title: 'Pending Review',
      },
    })

    const result = await createCurrentWeeklyReviewGeneration()

    expect(result.id).toBe(pendingReview.id)
    expect(result.status).toBe('PENDING')
    expect(mockGenerateWeeklyReview).not.toHaveBeenCalled()
    await expect(prisma.weeklyReview.count()).resolves.toBe(1)
  })

  it('regenerates a timed out pending review', async () => {
    const user = await getDefaultUser()
    await createCurrentWeekRecord('Weekly Review Timeout')
    const range = getNaturalWeekRange()
    const pendingReview = await prisma.weeklyReview.create({
      data: {
        userId: user.id,
        weekStart: range.weekStart,
        weekEnd: range.weekEnd,
        status: 'PENDING',
        title: 'Timed Out Review',
      },
    })
    await prisma.weeklyReview.update({
      where: { id: pendingReview.id },
      data: { updatedAt: new Date(Date.now() - 6 * 60_000) },
    })
    mockGenerateWeeklyReview.mockResolvedValue(successResult)

    const result = await createCurrentWeeklyReviewGeneration()
    const storedReview = await waitForReviewStatus(result.id as string, 'SUCCESS')

    expect(result.id).toBe(pendingReview.id)
    expect(mockGenerateWeeklyReview).toHaveBeenCalledTimes(1)
    expect(storedReview.status).toBe('SUCCESS')
  })
})
