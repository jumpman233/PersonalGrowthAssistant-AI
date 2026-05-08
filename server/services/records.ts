import { RecordStatus, type Prisma, type RecordCategory } from '@prisma/client'
import type {
  CreateRecordPayload,
  CreateRecordResponse,
  UpdateRecordPayload,
  UpdateRecordResponse,
} from '../../app/types/record-form'
import type {
  RecordsApiData,
  RecordsApiQuery,
  RecordsListItem,
  RecordsSummary,
  RecordsTimeRange,
} from '../../app/types/records'
import { markWeeklyReviewStaleForDate } from './weekly-review'
import { logger } from '../utils/logger'
import { prisma } from '../utils/prisma'

const DEFAULT_USER_EMAIL = 'local@personal-growth.local'
const MAX_TITLE_LENGTH = 80
const MAX_CONTENT_LENGTH = 2000
const MAX_TAG_COUNT = 12
const MAX_TAG_LENGTH = 20

type ServiceLogContext = {
  requestId?: string
}

const categoryMeta: Record<RecordCategory, { label: string; icon: string; tone: string }> = {
  WORK: { label: '职业', icon: '▱', tone: 'bg-orange-50 text-orange-500' },
  RELATIONSHIP: { label: '关系', icon: '♧', tone: 'bg-green-50 text-green-600' },
  EMOTION: { label: '情绪', icon: '⌁', tone: 'bg-rose-50 text-rose-500' },
  STUDY: { label: '学习', icon: '▤', tone: 'bg-cyan-50 text-cyan-700' },
  LIFE: { label: '生活', icon: '◔', tone: 'bg-stone-50 text-stone-600' },
  PROJECT: { label: '项目', icon: '▱', tone: 'bg-orange-50 text-orange-500' },
  HEALTH: { label: '健康', icon: '♡', tone: 'bg-rose-50 text-rose-500' },
  SOCIAL: { label: '社交', icon: '♧', tone: 'bg-green-50 text-green-600' },
  OTHER: { label: '其他', icon: '▣', tone: 'bg-stone-50 text-stone-600' },
}

const categories = new Set<RecordCategory>([
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

const startOfDay = (date: Date) => {
  const current = new Date(date)
  current.setHours(0, 0, 0, 0)
  return current
}

const getTimeRangeFilter = (timeRange: RecordsTimeRange): Prisma.JournalRecordWhereInput => {
  const now = new Date()

  if (timeRange === 'all') {
    return {}
  }

  if (timeRange === 'thisMonth') {
    return {
      occurredAt: {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
      },
    }
  }

  const last7Days = startOfDay(now)
  last7Days.setDate(last7Days.getDate() - 6)

  return {
    occurredAt: {
      gte: last7Days,
    },
  }
}

const formatDateTime = (date: Date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')

  return `${month}月${day}日 ${hour}:${minute}`
}

const formatScore = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}

const toListItem = (record: {
  id: string
  title: string
  content: string
  category: RecordCategory
  moodScore: number | null
  constructivenessScore: number | null
  energyCostScore: number | null
  occurredAt: Date | null
  createdAt: Date
  tags: { tag: { name: string } }[]
}): RecordsListItem => {
  const meta = categoryMeta[record.category]

  return {
    id: record.id,
    title: record.title,
    summary: record.content,
    category: {
      label: meta.label,
      value: record.category,
      icon: meta.icon,
      tone: meta.tone,
    },
    occurredAt: formatDateTime(record.occurredAt ?? record.createdAt),
    tags: record.tags.map(({ tag }) => tag.name),
    scores: {
      mood: {
        label: '心情',
        value: formatScore(record.moodScore),
        icon: '☺',
        tone: 'bg-orange-50 text-orange-500',
      },
      constructiveness: {
        label: '建设感',
        value: formatScore(record.constructivenessScore),
        icon: '↗',
        tone: 'bg-green-50 text-green-600',
      },
      energyCost: {
        label: '内耗',
        value: formatScore(record.energyCostScore),
        icon: '◔',
        tone: 'bg-cyan-50 text-cyan-700',
      },
    },
  }
}

const getWeeklySummary = async (userId: string): Promise<RecordsSummary> => {
  const latestReview = await prisma.weeklyReview.findFirst({
    where: { userId },
    orderBy: { weekStart: 'desc' },
  })

  if (latestReview) {
    return {
      weeklyRecordCount: latestReview.recordCount,
      averageConstructiveness: latestReview.averageConstructiveness,
      averageEnergyCost: latestReview.averageEnergyCost,
      averageMood: latestReview.averageMoodScore,
    }
  }

  const aggregate = await prisma.journalRecord.aggregate({
    where: {
      userId,
      status: RecordStatus.ACTIVE,
    },
    _count: true,
    _avg: {
      moodScore: true,
      constructivenessScore: true,
      energyCostScore: true,
    },
  })

  return {
    weeklyRecordCount: aggregate._count,
    averageConstructiveness: aggregate._avg.constructivenessScore,
    averageEnergyCost: aggregate._avg.energyCostScore,
    averageMood: aggregate._avg.moodScore,
  }
}

const getHighFrequencyTags = async (userId: string) => {
  const latestReview = await prisma.weeklyReview.findFirst({
    where: { userId },
    orderBy: { weekStart: 'desc' },
  })

  if (latestReview?.highFrequencyTags) {
    return JSON.parse(latestReview.highFrequencyTags) as string[]
  }

  const tags = await prisma.tag.findMany({
    where: { userId },
    include: {
      _count: {
        select: { records: true },
      },
    },
    orderBy: {
      records: {
        _count: 'desc',
      },
    },
    take: 5,
  })

  return tags.map((tag) => tag.name)
}

const normalizeTags = (tags: string[]) => {
  const seen = new Set<string>()

  return tags
    .map((tag) => tag.trim())
    .filter((tag) => {
      if (!tag || seen.has(tag)) {
        return false
      }

      seen.add(tag)

      return true
    })
}

const requireScore = (value: number) => Number.isInteger(value) && value >= 0 && value <= 5

const validateRecordPayload = (payload: CreateRecordPayload | UpdateRecordPayload) => {
  const title = payload.title.trim()
  const content = payload.content.trim()
  const occurredAt = new Date(payload.occurredAt)

  if (!title || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: '标题和内容都需要填写。',
    })
  }

  if (title.length > MAX_TITLE_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `标题最多可以写 ${MAX_TITLE_LENGTH} 个字。`,
    })
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `内容最多可以写 ${MAX_CONTENT_LENGTH} 个字。`,
    })
  }

  if (!categories.has(payload.category)) {
    throw createError({
      statusCode: 400,
      statusMessage: '请选择有效的分类。',
    })
  }

  if (
    !requireScore(payload.moodScore) ||
    !requireScore(payload.constructivenessScore) ||
    !requireScore(payload.energyCostScore)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: '评分需要在 0 到 5 之间。',
    })
  }

  if (Number.isNaN(occurredAt.getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: '请选择有效的发生时间。',
    })
  }

  const tags = normalizeTags(payload.tags)

  if (tags.length > MAX_TAG_COUNT) {
    throw createError({
      statusCode: 400,
      statusMessage: `标签最多选择 ${MAX_TAG_COUNT} 个。`,
    })
  }

  if (tags.some((tag) => tag.length > MAX_TAG_LENGTH)) {
    throw createError({
      statusCode: 400,
      statusMessage: `单个标签最多 ${MAX_TAG_LENGTH} 个字。`,
    })
  }

  return {
    title,
    content,
    occurredAt,
    tags,
  }
}

export const getTagOptions = async (context: ServiceLogContext = {}) => {
  const start = Date.now()
  const log = logger.child({
    requestId: context.requestId,
    action: 'getTagOptions',
  })

  log.info('tag options query started', { status: 'started' })

  const user = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  })

  if (!user) {
    log.warn('tag options query returned empty', {
      status: 'success',
      durationMs: Date.now() - start,
      reason: 'missing-user',
      tagCount: 0,
    })
    return []
  }

  try {
    const tags = await prisma.tag.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
    })

    log.info('tag options query success', {
      status: 'success',
      userId: user.id,
      tagCount: tags.length,
      durationMs: Date.now() - start,
    })

    return tags.map((tag) => tag.name)
  } catch (error) {
    log.error('tag options query failed', {
      status: 'failed',
      userId: user.id,
      durationMs: Date.now() - start,
      error,
    })
    throw error
  }
}

export const createRecord = async (
  payload: CreateRecordPayload,
  context: ServiceLogContext = {},
): Promise<CreateRecordResponse> => {
  const start = Date.now()
  const log = logger.child({
    requestId: context.requestId,
    action: 'createRecord',
  })

  log.info('record create started', {
    status: 'started',
    titleLength: payload.title?.length,
    contentLength: payload.content?.length,
    tagCount: payload.tags?.length,
    category: payload.category,
    moodScore: payload.moodScore,
    constructivenessScore: payload.constructivenessScore,
    energyCostScore: payload.energyCostScore,
  })

  let parsedPayload: ReturnType<typeof validateRecordPayload>

  try {
    parsedPayload = validateRecordPayload(payload)
  } catch (error) {
    log.warn('record create failed', {
      status: 'failed',
      durationMs: Date.now() - start,
      error,
    })
    throw error
  }

  const { title, content, occurredAt, tags } = parsedPayload

  const user = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  })

  if (!user) {
    log.warn('record create failed', {
      status: 'failed',
      durationMs: Date.now() - start,
      reason: 'missing-user',
    })
    throw createError({
      statusCode: 404,
      statusMessage: '默认用户不存在，请先初始化本地数据。',
    })
  }

  const record = await prisma.$transaction(async (tx) => {
    const createdRecord = await tx.journalRecord.create({
      data: {
        userId: user.id,
        title,
        content,
        category: payload.category,
        moodScore: payload.moodScore,
        constructivenessScore: payload.constructivenessScore,
        energyCostScore: payload.energyCostScore,
        occurredAt,
      },
    })

    for (const tagName of tags) {
      const tag = await tx.tag.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name: tagName,
          },
        },
        create: {
          userId: user.id,
          name: tagName,
        },
        update: {},
      })

      await tx.journalRecordTag.create({
        data: {
          recordId: createdRecord.id,
          tagId: tag.id,
        },
      })
    }

    return createdRecord
  }).catch((error) => {
    log.error('record create failed', {
      status: 'failed',
      userId: user.id,
      durationMs: Date.now() - start,
      error,
    })
    throw error
  })

  await markWeeklyReviewStaleForDate(user.id, record.occurredAt ?? record.createdAt, context).catch((error) => {
    log.error('record create failed', {
      status: 'failed',
      userId: user.id,
      recordId: record.id,
      durationMs: Date.now() - start,
      error,
    })
    throw error
  })

  log.info('record create success', {
    status: 'success',
    userId: user.id,
    recordId: record.id,
    durationMs: Date.now() - start,
  })

  return {
    id: record.id,
  }
}

export const updateRecord = async (
  id: string,
  payload: UpdateRecordPayload,
  context: ServiceLogContext = {},
): Promise<UpdateRecordResponse | null> => {
  const start = Date.now()
  const log = logger.child({
    requestId: context.requestId,
    action: 'updateRecord',
    recordId: id,
  })

  log.info('record update started', {
    status: 'started',
    titleLength: payload.title?.length,
    contentLength: payload.content?.length,
    tagCount: payload.tags?.length,
    category: payload.category,
    moodScore: payload.moodScore,
    constructivenessScore: payload.constructivenessScore,
    energyCostScore: payload.energyCostScore,
  })

  let parsedPayload: ReturnType<typeof validateRecordPayload>

  try {
    parsedPayload = validateRecordPayload(payload)
  } catch (error) {
    log.warn('record update failed', {
      status: 'failed',
      durationMs: Date.now() - start,
      error,
    })
    throw error
  }

  const { title, content, occurredAt, tags } = parsedPayload

  const user = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  })

  if (!user) {
    log.warn('record update failed', {
      status: 'failed',
      durationMs: Date.now() - start,
      reason: 'missing-user',
    })
    throw createError({
      statusCode: 404,
      statusMessage: '默认用户不存在，请先初始化本地数据。',
    })
  }

  const record = await prisma.$transaction(async (tx) => {
    const existingRecord = await tx.journalRecord.findFirst({
      where: {
        id,
        userId: user.id,
        status: RecordStatus.ACTIVE,
      },
    })

    if (!existingRecord) {
      return null
    }

    const updatedRecord = await tx.journalRecord.update({
      where: { id: existingRecord.id },
      data: {
        title,
        content,
        category: payload.category,
        moodScore: payload.moodScore,
        constructivenessScore: payload.constructivenessScore,
        energyCostScore: payload.energyCostScore,
        occurredAt,
      },
    })

    await tx.journalRecordTag.deleteMany({
      where: { recordId: updatedRecord.id },
    })

    for (const tagName of tags) {
      const tag = await tx.tag.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name: tagName,
          },
        },
        create: {
          userId: user.id,
          name: tagName,
        },
        update: {},
      })

      await tx.journalRecordTag.create({
        data: {
          recordId: updatedRecord.id,
          tagId: tag.id,
        },
      })
    }

    return {
      id: updatedRecord.id,
      previousOccurredAt: existingRecord.occurredAt ?? existingRecord.createdAt,
      occurredAt: updatedRecord.occurredAt ?? updatedRecord.createdAt,
    }
  }).catch((error) => {
    log.error('record update failed', {
      status: 'failed',
      userId: user.id,
      durationMs: Date.now() - start,
      error,
    })
    throw error
  })

  if (!record) {
    log.warn('record update returned not found', {
      status: 'failed',
      userId: user.id,
      durationMs: Date.now() - start,
      reason: 'record-not-found',
    })
    return null
  }

  await Promise.all([
    markWeeklyReviewStaleForDate(user.id, record.previousOccurredAt, context),
    markWeeklyReviewStaleForDate(user.id, record.occurredAt, context),
  ]).catch((error) => {
    log.error('record update failed', {
      status: 'failed',
      userId: user.id,
      recordId: record.id,
      durationMs: Date.now() - start,
      error,
    })
    throw error
  })

  log.info('record update success', {
    status: 'success',
    userId: user.id,
    recordId: record.id,
    durationMs: Date.now() - start,
  })

  return { id: record.id }
}

export const getRecordsData = async (
  query: RecordsApiQuery,
  context: ServiceLogContext = {},
): Promise<RecordsApiData> => {
  const start = Date.now()
  const page = Math.max(query.page ?? 1, 1)
  const pageSize = Math.min(Math.max(query.pageSize ?? 10, 1), 50)
  const timeRange = query.timeRange ?? 'latest7days'
  const log = logger.child({
    requestId: context.requestId,
    action: 'listRecords',
  })

  log.info('records list started', {
    status: 'started',
    page,
    pageSize,
    category: query.category ?? 'ALL',
    tagSelected: Boolean(query.tag && query.tag !== 'ALL'),
    timeRange,
  })

  const user = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  })

  if (!user) {
    log.warn('records list returned empty', {
      status: 'success',
      durationMs: Date.now() - start,
      reason: 'missing-user',
      recordCount: 0,
      total: 0,
    })
    return {
      filters: { tags: [] },
      summary: {
        weeklyRecordCount: 0,
        averageConstructiveness: null,
        averageEnergyCost: null,
        averageMood: null,
      },
      records: [],
      highFrequencyTags: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    }
  }

  const where: Prisma.JournalRecordWhereInput = {
    userId: user.id,
    status: RecordStatus.ACTIVE,
    ...getTimeRangeFilter(timeRange),
  }

  if (query.category && query.category !== 'ALL') {
    where.category = query.category
  }

  if (query.tag && query.tag !== 'ALL') {
    where.tags = {
      some: {
        tag: {
          name: query.tag,
        },
      },
    }
  }

  const [records, total, tags, summary, highFrequencyTags] = await Promise.all([
    prisma.journalRecord.findMany({
      where,
      orderBy: [{ occurredAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    }),
    prisma.journalRecord.count({ where }),
    prisma.tag.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
    }),
    getWeeklySummary(user.id),
    getHighFrequencyTags(user.id),
  ]).catch((error) => {
    log.error('records list failed', {
      status: 'failed',
      userId: user.id,
      page,
      pageSize,
      durationMs: Date.now() - start,
      error,
    })
    throw error
  })

  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)

  log.info('records list success', {
    status: 'success',
    userId: user.id,
    page,
    pageSize,
    recordCount: records.length,
    total,
    totalPages,
    durationMs: Date.now() - start,
  })

  return {
    filters: {
      tags: [
        { label: '全部', value: 'ALL' },
        ...tags.map((tag) => ({
          label: tag.name,
          value: tag.name,
        })),
      ],
    },
    summary,
    records: records.map(toListItem),
    highFrequencyTags,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  }
}
