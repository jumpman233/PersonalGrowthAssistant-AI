import type { RecordCategory } from '@prisma/client'
import { prisma } from '../../../server/utils/prisma'
import { getNaturalWeekRange } from '../../../server/services/weekly-review-rules'
import type { CreateRecordPayload } from '../../../app/types/record-form'

export const defaultUserEmail = 'local@personal-growth.local'

export const getDefaultUser = async () => {
  const user = await prisma.user.findUnique({
    where: { email: defaultUserEmail },
  })

  if (!user) {
    throw new Error(`Missing default test user: ${defaultUserEmail}`)
  }

  return user
}

export const resetDefaultUserData = async () => {
  const user = await getDefaultUser()

  await prisma.$transaction([
    prisma.aiAnalysis.deleteMany({ where: { userId: user.id } }),
    prisma.weeklyReview.deleteMany({ where: { userId: user.id } }),
    prisma.journalRecord.deleteMany({ where: { userId: user.id } }),
    prisma.tag.deleteMany({ where: { userId: user.id } }),
  ])

  return user
}

export const buildRecordPayload = (
  overrides: Partial<CreateRecordPayload> = {},
): CreateRecordPayload => ({
  title: overrides.title ?? `Integration Record ${Date.now()}`,
  content: overrides.content ?? 'Integration test content.',
  category: (overrides.category ?? 'WORK') as RecordCategory,
  moodScore: overrides.moodScore ?? 3,
  constructivenessScore: overrides.constructivenessScore ?? 4,
  energyCostScore: overrides.energyCostScore ?? 1,
  tags: overrides.tags ?? ['integration'],
  occurredAt: overrides.occurredAt ?? new Date('2026-05-05T10:00:00.000Z').toISOString(),
})

export const createWeeklyReviewForDate = async (
  date: Date,
  overrides: {
    status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'STALE'
    recordCount?: number
    averageMoodScore?: number | null
    averageConstructiveness?: number | null
    averageEnergyCost?: number | null
  } = {},
) => {
  const user = await getDefaultUser()
  const range = getNaturalWeekRange(date)

  return prisma.weeklyReview.create({
    data: {
      userId: user.id,
      weekStart: range.weekStart,
      weekEnd: range.weekEnd,
      status: overrides.status ?? 'SUCCESS',
      title: 'Integration Weekly Review',
      recordCount: overrides.recordCount ?? 0,
      averageMoodScore: overrides.averageMoodScore ?? null,
      averageConstructiveness: overrides.averageConstructiveness ?? null,
      averageEnergyCost: overrides.averageEnergyCost ?? null,
      generatedAt: new Date(date),
      sourceUpdatedAt: new Date(date),
    },
  })
}

export { prisma }
