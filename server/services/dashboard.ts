import { RecordStatus, type RecordCategory } from '@prisma/client'
import type { DashboardApiData, RecentRecordEntry, WeeklyTrendEntry } from '../../app/types/dashboard'
import {
  buildWeeklyTrendFromRecords,
  calculateDashboardStats,
  calculateHighFrequencyTags,
  formatDashboardScore,
} from './dashboard-rules'
import { logger } from '../utils/logger'
import { prisma } from '../utils/prisma'

const DEFAULT_USER_EMAIL = 'local@personal-growth.local'

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

const formatDateTime = (date: Date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')

  return `${month}月${day}日 ${hour}:${minute}`
}

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
    score: `建设感 ${formatDashboardScore(record.constructivenessScore)} / 内耗 ${formatDashboardScore(record.energyCostScore)}`,
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

  return buildWeeklyTrendFromRecords(records, weekStart)
}

export const getDashboardData = async (context: ServiceLogContext = {}): Promise<DashboardApiData> => {
  const start = Date.now()
  const log = logger.child({
    requestId: context.requestId,
    action: 'getDashboardSummary',
  })

  log.info('dashboard summary started', { status: 'started' })

  const user = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  })

  if (!user) {
    log.warn('dashboard summary returned empty', {
      status: 'success',
      durationMs: Date.now() - start,
      reason: 'missing-user',
      recordCount: 0,
    })
    return {
      stats: calculateDashboardStats(0, null, null, null),
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
    : calculateHighFrequencyTags(recentRecords)

  const weekStart = latestReview?.weekStart ?? new Date()
  const weekEnd = latestReview?.weekEnd ?? new Date()
  const trend = await buildWeeklyTrend(user.id, weekStart, weekEnd)

  log.info('dashboard summary success', {
    status: 'success',
    userId: user.id,
    recordCount: latestReview?.recordCount ?? recentRecords.length,
    durationMs: Date.now() - start,
  })

  return {
    stats: calculateDashboardStats(
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
    trend,
    tags: highFrequencyTags,
  }
}
