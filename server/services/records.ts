import { RecordStatus, type Prisma, type RecordCategory } from '@prisma/client'
import type {
  RecordsApiData,
  RecordsApiQuery,
  RecordsListItem,
  RecordsSummary,
  RecordsTimeRange,
} from '../../app/types/records'
import { prisma } from '../utils/prisma'

const DEFAULT_USER_EMAIL = 'local@personal-growth.local'

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
        label: '消耗',
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

export const getRecordsData = async (query: RecordsApiQuery): Promise<RecordsApiData> => {
  const page = Math.max(query.page ?? 1, 1)
  const pageSize = Math.min(Math.max(query.pageSize ?? 10, 1), 50)
  const timeRange = query.timeRange ?? 'latest7days'
  const user = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  })

  if (!user) {
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
  ])

  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)

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
