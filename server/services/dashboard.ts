import { RecordStatus, type RecordCategory } from '@prisma/client'
import type {
  DashboardApiData,
  DashboardStat,
  RecentRecordEntry,
  WeeklyTrendEntry,
} from '../../app/types/dashboard'
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

const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

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

const makeStats = (
  recordCount: number,
  averageConstructiveness: number | null,
  averageEnergyCost: number | null,
  averageMoodScore: number | null,
): DashboardStat[] => [
  {
    label: '本周记录',
    value: recordCount.toString(),
    note: '持续记录的每一步都很重要',
    icon: '▣',
    tone: 'from-orange-100 to-rose-50 text-orange-500',
  },
  {
    label: '平均建设感',
    value: formatScore(averageConstructiveness),
    note: '分辨什么在真正建设你',
    icon: '⌁',
    tone: 'from-amber-100 to-orange-50 text-amber-600',
  },
  {
    label: '平均消耗',
    value: formatScore(averageEnergyCost),
    note: '识别消耗，保护你的能量',
    icon: '◔',
    tone: 'from-cyan-100 to-teal-50 text-cyan-600',
  },
  {
    label: '情绪稳定度',
    value: formatScore(averageMoodScore),
    note: '稳住情绪，才能走得更远',
    icon: '♡',
    tone: 'from-rose-100 to-orange-50 text-rose-500',
  },
]

const toRecentRecord = (record: {
  id: string
  title: string
  content: string
  category: RecordCategory
  constructivenessScore: number | null
  energyCostScore: number | null
  occurredAt: Date | null
  createdAt: Date
  tags: { tag: { name: string } }[]
}): RecentRecordEntry => {
  const meta = categoryMeta[record.category]

  return {
    id: record.id,
    title: record.title,
    category: meta.label,
    copy: record.content,
    score: `建设感 ${formatScore(record.constructivenessScore)} / 消耗 ${formatScore(record.energyCostScore)}`,
    time: formatDateTime(record.occurredAt ?? record.createdAt),
    tags: record.tags.map(({ tag }) => tag.name),
    icon: meta.icon,
    tone: meta.tone,
  }
}

const buildWeeklyTrend = async (userId: string, weekStart: Date, weekEnd: Date): Promise<WeeklyTrendEntry[]> => {
  const records = await prisma.journalRecord.findMany({
    where: {
      userId,
      status: RecordStatus.ACTIVE,
      occurredAt: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    select: {
      occurredAt: true,
      constructivenessScore: true,
      energyCostScore: true,
    },
  })

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(weekStart)
    current.setDate(weekStart.getDate() + index)

    const sameDayRecords = records.filter((record) => {
      const occurredAt = record.occurredAt

      return (
        occurredAt &&
        occurredAt.getFullYear() === current.getFullYear() &&
        occurredAt.getMonth() === current.getMonth() &&
        occurredAt.getDate() === current.getDate()
      )
    })

    const average = (values: number[]) => {
      if (values.length === 0) {
        return 0
      }

      return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1))
    }

    return {
      day: dayLabels[current.getDay()],
      growth: average(
        sameDayRecords
          .map((record) => record.constructivenessScore)
          .filter((value): value is number => value !== null),
      ),
      drain: average(
        sameDayRecords
          .map((record) => record.energyCostScore)
          .filter((value): value is number => value !== null),
      ),
    }
  })
}

export const getDashboardData = async (): Promise<DashboardApiData> => {
  const user = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  })

  if (!user) {
    return {
      stats: makeStats(0, null, null, null),
      records: [],
      aiInsight: {
        summary: '还没有可复盘的数据。先记录一件今天真实推进了你的事。',
        suggestion: '从一条低压力记录开始，只写下事件、感受和一个小行动。',
      },
      trend: [],
      tags: [],
    }
  }

  const latestReview = await prisma.weeklyReview.findFirst({
    where: { userId: user.id },
    orderBy: { weekStart: 'desc' },
  })

  const recentRecords = await prisma.journalRecord.findMany({
    where: {
      userId: user.id,
      status: RecordStatus.ACTIVE,
    },
    orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
    take: 3,
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  const highFrequencyTags = latestReview?.highFrequencyTags
    ? (JSON.parse(latestReview.highFrequencyTags) as string[])
    : recentRecords.flatMap((record) => record.tags.map(({ tag }) => tag.name)).slice(0, 5)

  const weekStart = latestReview?.weekStart ?? new Date()
  const weekEnd = latestReview?.weekEnd ?? new Date()

  return {
    stats: makeStats(
      latestReview?.recordCount ?? recentRecords.length,
      latestReview?.averageConstructiveness ?? null,
      latestReview?.averageEnergyCost ?? null,
      latestReview?.averageMoodScore ?? null,
    ),
    records: recentRecords.map(toRecentRecord),
    aiInsight: {
      summary: latestReview?.aiSummary ?? '本周还没有生成 AI 观察。',
      suggestion: latestReview?.nextWeekAction ?? '先记录一个明天能做的小行动。',
    },
    trend: await buildWeeklyTrend(user.id, weekStart, weekEnd),
    tags: highFrequencyTags,
  }
}
