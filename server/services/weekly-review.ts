import type { WeeklyReviewStatus as PrismaWeeklyReviewStatus } from '@prisma/client'
import type { WeeklyReviewApiData, WeeklyReviewStatus } from '../../app/types/weekly-review'
import { prisma } from '../utils/prisma'

const DEFAULT_USER_EMAIL = 'local@personal-growth.local'

const statusLabels: Record<WeeklyReviewStatus, string> = {
  PENDING: '正在生成',
  SUCCESS: '已生成',
  FAILED: '生成失败',
  STALE: '待更新',
}

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

const normalizeStatus = (status: PrismaWeeklyReviewStatus): WeeklyReviewStatus => status

const emptyReview = (): WeeklyReviewApiData => ({
  title: '本周复盘',
  status: 'STALE',
  statusLabel: statusLabels.STALE,
  weekRange: '暂无周复盘数据',
  generatedLabel: '先保留入口，后续接入生成逻辑',
  stats: {
    recordCount: 0,
    averageMoodScore: null,
    averageConstructiveness: null,
    averageEnergyCost: null,
  },
  highFrequencyTags: [],
  summary: '还没有可展示的周复盘。等有记录和生成结果后，这里会呈现本周的主要推进、消耗来源和下周最小行动。',
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
  nextWeekAction: '先写下一条今天真实发生的记录。',
})

export const getWeeklyReviewData = async (): Promise<WeeklyReviewApiData> => {
  const user = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  })

  if (!user) {
    return emptyReview()
  }

  const review = await prisma.weeklyReview.findFirst({
    where: { userId: user.id },
    orderBy: { weekStart: 'desc' },
  })

  if (!review) {
    return emptyReview()
  }

  const status = normalizeStatus(review.status)

  return {
    title: review.title ?? '本周复盘',
    status,
    statusLabel: statusLabels[status],
    weekRange: `${formatDate(review.weekStart)} - ${formatDate(review.weekEnd)}`,
    generatedLabel: formatDateTime(review.generatedAt),
    stats: {
      recordCount: review.recordCount,
      averageMoodScore: formatScore(review.averageMoodScore),
      averageConstructiveness: formatScore(review.averageConstructiveness),
      averageEnergyCost: formatScore(review.averageEnergyCost),
    },
    highFrequencyTags: parseTags(review.highFrequencyTags),
    summary:
      review.aiSummary ??
      '这一周的复盘内容还没有生成。第一版先展示数据库中的占位数据，后续再接入真实生成流程。',
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
    nextWeekAction: review.nextWeekAction ?? '先选一个最小行动继续推进。',
  }
}
