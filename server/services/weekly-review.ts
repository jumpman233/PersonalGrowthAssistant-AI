import type { Prisma } from '@prisma/client'
import type { WeeklyReviewApiData, WeeklyReviewStatus } from '../../app/types/weekly-review'
import { generateWeeklyReview } from '../ai/tasks/generateWeeklyReview'
import type { WeeklyReviewInput, WeeklyReviewResult } from '../ai/schemas/weeklyReview'
import { prisma } from '../utils/prisma'

const DEFAULT_USER_EMAIL = 'local@personal-growth.local'
const pendingTimeoutMs = 5 * 60 * 1000
const currentReviewTitle = '本周复盘'

const weeklyReviewStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  STALE: 'STALE',
} as const

const statusLabels: Record<WeeklyReviewStatus, string> = {
  PENDING: '正在生成',
  SUCCESS: '已生成',
  FAILED: '生成失败',
  STALE: '待更新',
}

type WeekRange = {
  weekStart: Date
  weekEnd: Date
}

type WeeklyRecord = {
  title: string
  content: string
  category: string
  moodScore: number | null
  constructivenessScore: number | null
  energyCostScore: number | null
  occurredAt: Date | null
  createdAt: Date
  updatedAt: Date
  tags: { tag: { name: string } }[]
}

const getDefaultUser = () =>
  prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  })

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

const isSameNaturalDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()

const formatScore = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return null
  }

  return Number(value.toFixed(1))
}

const formatDate = (date: Date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${month}月${day}日`
}

const formatDateTime = (date: Date | null | undefined) => {
  if (!date) {
    return '周复盘还没有生成'
  }

  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')

  return `${month}月${day}日 ${hour}:${minute} 生成`
}

const parseTags = (value: string | null) => {
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

const getRecordsWhere = (userId: string, range: WeekRange): Prisma.JournalRecordWhereInput => ({
  userId,
  status: 'ACTIVE',
  OR: [
    {
      occurredAt: {
        gte: range.weekStart,
        lte: range.weekEnd,
      },
    },
    {
      occurredAt: null,
      createdAt: {
        gte: range.weekStart,
        lte: range.weekEnd,
      },
    },
  ],
})

const getWeeklyRecords = (userId: string, range: WeekRange) =>
  prisma.journalRecord.findMany({
    where: getRecordsWhere(userId, range),
    orderBy: [{ occurredAt: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

const average = (records: WeeklyRecord[], key: 'moodScore' | 'constructivenessScore' | 'energyCostScore') => {
  const values = records.map((record) => record[key]).filter((value): value is number => typeof value === 'number')

  if (!values.length) {
    return null
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const getHighFrequencyTags = (records: WeeklyRecord[], take = 8) => {
  const counts = new Map<string, number>()

  records.forEach((record) => {
    record.tags.forEach(({ tag }) => {
      counts.set(tag.name, (counts.get(tag.name) ?? 0) + 1)
    })
  })

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'zh-CN'))
    .slice(0, take)
    .map(([tag]) => tag)
}

const getLatestRecordUpdatedAt = (records: WeeklyRecord[]) =>
  records.reduce<Date | null>((latest, record) => {
    if (!latest || record.updatedAt > latest) {
      return record.updatedAt
    }

    return latest
  }, null)

const getSnapshot = async (userId: string, range: WeekRange) => {
  const records = await getWeeklyRecords(userId, range)
  const highFrequencyTags = getHighFrequencyTags(records)

  return {
    records,
    highFrequencyTags,
    latestRecordUpdatedAt: getLatestRecordUpdatedAt(records),
    stats: {
      recordCount: records.length,
      averageMoodScore: average(records, 'moodScore'),
      averageConstructiveness: average(records, 'constructivenessScore'),
      averageEnergyCost: average(records, 'energyCostScore'),
    },
  }
}

const toAiInput = (range: WeekRange, snapshot: Awaited<ReturnType<typeof getSnapshot>>): WeeklyReviewInput => ({
  weekStart: range.weekStart.toISOString(),
  weekEnd: range.weekEnd.toISOString(),
  stats: {
    recordCount: snapshot.stats.recordCount,
    averageMoodScore: snapshot.stats.averageMoodScore,
    averageConstructiveness: snapshot.stats.averageConstructiveness,
    averageEnergyCost: snapshot.stats.averageEnergyCost,
    highFrequencyTags: snapshot.highFrequencyTags,
  },
  records: snapshot.records.map((record) => ({
    title: record.title,
    content: record.content,
    category: record.category,
    moodScore: record.moodScore,
    constructivenessScore: record.constructivenessScore,
    energyCostScore: record.energyCostScore,
    tags: record.tags.map(({ tag }) => tag.name),
    occurredAt: (record.occurredAt ?? record.createdAt).toISOString(),
  })),
})

const emptyReview = (range = getNaturalWeekRange(), snapshot?: Awaited<ReturnType<typeof getSnapshot>>): WeeklyReviewApiData => ({
  id: null,
  title: currentReviewTitle,
  status: weeklyReviewStatus.STALE,
  statusLabel: statusLabels.STALE,
  weekRange: `${formatDate(range.weekStart)} - ${formatDate(range.weekEnd)}`,
  generatedLabel: '本周还没有生成周复盘',
  errorMessage: null,
  stats: {
    recordCount: snapshot?.stats.recordCount ?? 0,
    averageMoodScore: formatScore(snapshot?.stats.averageMoodScore),
    averageConstructiveness: formatScore(snapshot?.stats.averageConstructiveness),
    averageEnergyCost: formatScore(snapshot?.stats.averageEnergyCost),
  },
  highFrequencyTags: snapshot?.highFrequencyTags ?? [],
  summary: snapshot?.stats.recordCount
    ? '本周还没有生成 AI 复盘，可以点击更新周复盘整理这一周的主要推进、消耗来源和重复模式。'
    : '本周还没有记录，先写下一条真实发生的记录，再回来做周复盘。',
  sections: [
    {
      title: '主要推进',
      content: '暂无内容。',
    },
    {
      title: '主要消耗',
      content: '暂无内容。',
    },
    {
      title: '反复出现的模式',
      content: '暂无内容。',
    },
  ],
  nextWeekAction: snapshot?.stats.recordCount ? '先生成本周复盘，再决定下一步最小行动。' : '先写下一条今天真实发生的记录。',
})

const updateTimedOutPendingReview = async <T extends { id: string; status: string; updatedAt: Date }>(review: T) => {
  if (review.status !== weeklyReviewStatus.PENDING) {
    return review
  }

  if (Date.now() - review.updatedAt.getTime() <= pendingTimeoutMs) {
    return review
  }

  return prisma.weeklyReview.update({
    where: { id: review.id },
    data: {
      status: weeklyReviewStatus.FAILED,
      errorMessage: '生成时间超过 5 分钟，已停止等待，可以重新生成。',
    },
  }) as Promise<T>
}

const shouldRegenerate = (review: {
  status: string
  generatedAt: Date | null
  sourceUpdatedAt: Date | null
}) => {
  if (review.status === weeklyReviewStatus.STALE || review.status === weeklyReviewStatus.FAILED) {
    return true
  }

  if (!review.generatedAt) {
    return true
  }

  if (!isSameNaturalDay(review.generatedAt, new Date())) {
    return true
  }

  if (review.sourceUpdatedAt && review.sourceUpdatedAt > review.generatedAt) {
    return true
  }

  return false
}

export const toWeeklyReviewApiData = (review: {
  id: string
  title: string | null
  status: WeeklyReviewStatus
  weekStart: Date
  weekEnd: Date
  recordCount: number
  averageMoodScore: number | null
  averageConstructiveness: number | null
  averageEnergyCost: number | null
  mainProgress: string | null
  mainEnergyCost: string | null
  repeatedPatterns: string | null
  highFrequencyTags: string | null
  nextWeekAction: string | null
  aiSummary: string | null
  generatedAt: Date | null
  errorMessage: string | null
}): WeeklyReviewApiData => {
  const status = review.status

  return {
    id: review.id,
    title: review.title ?? currentReviewTitle,
    status,
    statusLabel: statusLabels[status],
    weekRange: `${formatDate(review.weekStart)} - ${formatDate(review.weekEnd)}`,
    generatedLabel: formatDateTime(review.generatedAt),
    errorMessage: review.errorMessage,
    stats: {
      recordCount: review.recordCount,
      averageMoodScore: formatScore(review.averageMoodScore),
      averageConstructiveness: formatScore(review.averageConstructiveness),
      averageEnergyCost: formatScore(review.averageEnergyCost),
    },
    highFrequencyTags: parseTags(review.highFrequencyTags),
    summary:
      review.aiSummary ??
      (status === weeklyReviewStatus.PENDING
        ? '正在整理这一周的记录。'
        : '这一周的复盘内容还没有生成。'),
    sections: [
      {
        title: '主要推进',
        content: review.mainProgress ?? '这一段还没有生成。',
      },
      {
        title: '主要消耗',
        content: review.mainEnergyCost ?? '这一段还没有生成。',
      },
      {
        title: '反复出现的模式',
        content: review.repeatedPatterns ?? '这一段还没有生成。',
      },
    ],
    nextWeekAction: review.nextWeekAction ?? '先选择一个最小行动继续推进。',
  }
}

const applySuccess = async (reviewId: string, result: WeeklyReviewResult, snapshot: Awaited<ReturnType<typeof getSnapshot>>) =>
  prisma.weeklyReview.update({
    where: { id: reviewId },
    data: {
      status: weeklyReviewStatus.SUCCESS,
      aiSummary: result.aiSummary,
      mainProgress: result.mainProgress,
      mainEnergyCost: result.mainEnergyCost,
      repeatedPatterns: result.repeatedPatterns.join('；'),
      highFrequencyTags: JSON.stringify(result.highFrequencyTags.length ? result.highFrequencyTags : snapshot.highFrequencyTags),
      nextWeekAction: result.nextWeekAction,
      recordCount: snapshot.stats.recordCount,
      averageMoodScore: snapshot.stats.averageMoodScore,
      averageConstructiveness: snapshot.stats.averageConstructiveness,
      averageEnergyCost: snapshot.stats.averageEnergyCost,
      sourceUpdatedAt: snapshot.latestRecordUpdatedAt,
      generatedAt: new Date(),
      errorMessage: null,
    },
  })

const applyFailure = async (reviewId: string, error: unknown) => {
  const message = error instanceof Error ? error.message : '周复盘生成失败。'

  await prisma.weeklyReview.update({
    where: { id: reviewId },
    data: {
      status: weeklyReviewStatus.FAILED,
      errorMessage: message,
    },
  })
}

const runWeeklyReviewGeneration = async (reviewId: string) => {
  const review = await prisma.weeklyReview.findUnique({
    where: { id: reviewId },
  })

  if (!review) {
    return
  }

  try {
    const range = { weekStart: review.weekStart, weekEnd: review.weekEnd }
    const snapshot = await getSnapshot(review.userId, range)

    if (!snapshot.records.length) {
      await applyFailure(reviewId, new Error('本周还没有记录，先写一条再复盘。'))
      return
    }

    const result = await generateWeeklyReview(toAiInput(range, snapshot))
    await applySuccess(reviewId, result, snapshot)
  } catch (error) {
    await applyFailure(reviewId, error)
  }
}

export const getWeeklyReviewData = async (): Promise<WeeklyReviewApiData> => {
  const user = await getDefaultUser()
  const range = getNaturalWeekRange()

  if (!user) {
    return emptyReview(range)
  }

  const [review, snapshot] = await Promise.all([
    prisma.weeklyReview.findUnique({
      where: {
        userId_weekStart_weekEnd: {
          userId: user.id,
          weekStart: range.weekStart,
          weekEnd: range.weekEnd,
        },
      },
    }),
    getSnapshot(user.id, range),
  ])

  if (!review) {
    return emptyReview(range, snapshot)
  }

  const normalizedReview = await updateTimedOutPendingReview(review)
  const staleReview =
    normalizedReview.status === weeklyReviewStatus.SUCCESS && shouldRegenerate(normalizedReview)
      ? await prisma.weeklyReview.update({
          where: { id: normalizedReview.id },
          data: { status: weeklyReviewStatus.STALE },
        })
      : normalizedReview

  return toWeeklyReviewApiData(staleReview)
}

export const getWeeklyReviewById = async (id: string) => {
  const user = await getDefaultUser()

  if (!user) {
    return null
  }

  const review = await prisma.weeklyReview.findFirst({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!review) {
    return null
  }

  return toWeeklyReviewApiData(await updateTimedOutPendingReview(review))
}

export const createCurrentWeeklyReviewGeneration = async () => {
  const user = await getDefaultUser()
  const range = getNaturalWeekRange()

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: '默认用户不存在，请先初始化本地数据。',
    })
  }

  const snapshot = await getSnapshot(user.id, range)

  if (!snapshot.records.length) {
    throw createError({
      statusCode: 400,
      statusMessage: '本周还没有记录，先写一条再复盘。',
    })
  }

  const existingReview = await prisma.weeklyReview.findUnique({
    where: {
      userId_weekStart_weekEnd: {
        userId: user.id,
        weekStart: range.weekStart,
        weekEnd: range.weekEnd,
      },
    },
  })

  if (existingReview) {
    const normalizedReview = await updateTimedOutPendingReview(existingReview)

    if (normalizedReview.status === weeklyReviewStatus.PENDING) {
      return toWeeklyReviewApiData(normalizedReview)
    }
  }

  const review = await prisma.weeklyReview.upsert({
    where: {
      userId_weekStart_weekEnd: {
        userId: user.id,
        weekStart: range.weekStart,
        weekEnd: range.weekEnd,
      },
    },
    create: {
      userId: user.id,
      weekStart: range.weekStart,
      weekEnd: range.weekEnd,
      status: weeklyReviewStatus.PENDING,
      title: currentReviewTitle,
      recordCount: snapshot.stats.recordCount,
      averageMoodScore: snapshot.stats.averageMoodScore,
      averageConstructiveness: snapshot.stats.averageConstructiveness,
      averageEnergyCost: snapshot.stats.averageEnergyCost,
      highFrequencyTags: JSON.stringify(snapshot.highFrequencyTags),
      sourceUpdatedAt: snapshot.latestRecordUpdatedAt,
      errorMessage: null,
    },
    update: {
      status: weeklyReviewStatus.PENDING,
      title: currentReviewTitle,
      recordCount: snapshot.stats.recordCount,
      averageMoodScore: snapshot.stats.averageMoodScore,
      averageConstructiveness: snapshot.stats.averageConstructiveness,
      averageEnergyCost: snapshot.stats.averageEnergyCost,
      highFrequencyTags: JSON.stringify(snapshot.highFrequencyTags),
      sourceUpdatedAt: snapshot.latestRecordUpdatedAt,
      errorMessage: null,
    },
  })

  void runWeeklyReviewGeneration(review.id)

  return toWeeklyReviewApiData(review)
}

export const ensureCurrentWeeklyReviewGeneration = async () => {
  const user = await getDefaultUser()
  const range = getNaturalWeekRange()

  if (!user) {
    return { generated: false, reason: 'missing-user' }
  }

  const snapshot = await getSnapshot(user.id, range)

  if (!snapshot.records.length) {
    return { generated: false, reason: 'empty-week' }
  }

  const review = await prisma.weeklyReview.findUnique({
    where: {
      userId_weekStart_weekEnd: {
        userId: user.id,
        weekStart: range.weekStart,
        weekEnd: range.weekEnd,
      },
    },
  })

  if (!review || shouldRegenerate(await updateTimedOutPendingReview(review))) {
    const generatedReview = await createCurrentWeeklyReviewGeneration()
    return { generated: true, id: generatedReview.id }
  }

  return { generated: false, reason: 'fresh' }
}

export const markWeeklyReviewStaleForDate = async (userId: string, date: Date | null | undefined) => {
  if (!date) {
    return
  }

  const range = getNaturalWeekRange(date)

  await prisma.weeklyReview.updateMany({
    where: {
      userId,
      weekStart: range.weekStart,
      weekEnd: range.weekEnd,
      status: {
        in: [weeklyReviewStatus.SUCCESS, weeklyReviewStatus.FAILED],
      },
    },
    data: {
      status: weeklyReviewStatus.STALE,
      sourceUpdatedAt: new Date(),
    },
  })
}
