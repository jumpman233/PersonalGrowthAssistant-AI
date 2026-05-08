import { AiAnalysisType, RecordStatus, type RecordCategory } from '@prisma/client'
import type { RecordDetailData } from '../../app/types/record-detail'
import { toAiAnalysisResponse } from './ai-analysis'
import { markWeeklyReviewStaleForDate } from './weekly-review'
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

const weekdayLabels = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const formatDateTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')

  return `${year}年${month}月${day}日 ${hour}:${minute}`
}

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}年${month}月${day}日`
}

const formatScore = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}

const getLatestAiSummary = (record: { id: string; userId: string }) => {
  return prisma.aiAnalysis.findFirst({
    where: {
      userId: record.userId,
      recordId: record.id,
      type: AiAnalysisType.SINGLE_RECORD,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const getRecordDetailData = async (
  id: string,
  context: ServiceLogContext = {},
): Promise<RecordDetailData | null> => {
  const start = Date.now()
  const log = logger.child({
    requestId: context.requestId,
    action: 'getRecord',
    recordId: id,
  })

  log.info('record detail started', { status: 'started' })

  const user = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  })

  if (!user) {
    log.warn('record detail returned empty', {
      status: 'success',
      durationMs: Date.now() - start,
      reason: 'missing-user',
    })
    return null
  }

  const record = await prisma.journalRecord.findFirst({
    where: {
      id,
      userId: user.id,
      status: RecordStatus.ACTIVE,
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  if (!record) {
    log.warn('record detail returned not found', {
      status: 'failed',
      userId: user.id,
      durationMs: Date.now() - start,
      reason: 'record-not-found',
    })
    return null
  }

  const aiSummary = await getLatestAiSummary(record)
  const meta = categoryMeta[record.category]
  const occurredAt = record.occurredAt ?? record.createdAt

  log.info('record detail success', {
    status: 'success',
    userId: user.id,
    recordId: record.id,
    tagCount: record.tags.length,
    durationMs: Date.now() - start,
  })

  return {
    id: record.id,
    title: record.title,
    content: record.content,
    category: {
      label: meta.label,
      value: record.category,
      icon: meta.icon,
      tone: meta.tone,
    },
    occurredAt: formatDateTime(occurredAt),
    occurredDate: formatDate(occurredAt),
    occurredWeekday: weekdayLabels[occurredAt.getDay()],
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
    aiSummary: aiSummary ? toAiAnalysisResponse(aiSummary) : null,
    formValue: {
      title: record.title,
      content: record.content,
      category: record.category,
      moodScore: record.moodScore ?? 3,
      constructivenessScore: record.constructivenessScore ?? 3,
      energyCostScore: record.energyCostScore ?? 2,
      tags: record.tags.map(({ tag }) => tag.name),
      occurredAt: occurredAt.toISOString(),
    },
  }
}

export const softDeleteRecord = async (id: string, context: ServiceLogContext = {}) => {
  const start = Date.now()
  const log = logger.child({
    requestId: context.requestId,
    action: 'deleteRecord',
    recordId: id,
  })

  log.info('record delete started', { status: 'started' })

  const user = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  })

  if (!user) {
    log.warn('record delete returned not found', {
      status: 'failed',
      durationMs: Date.now() - start,
      reason: 'missing-user',
    })
    return false
  }

  const record = await prisma.journalRecord.findFirst({
    where: {
      id,
      userId: user.id,
      status: RecordStatus.ACTIVE,
    },
  })

  if (!record) {
    log.warn('record delete returned not found', {
      status: 'failed',
      userId: user.id,
      durationMs: Date.now() - start,
      reason: 'record-not-found',
    })
    return false
  }

  const result = await prisma.journalRecord.updateMany({
    where: {
      id: record.id,
      userId: user.id,
      status: RecordStatus.ACTIVE,
    },
    data: {
      status: RecordStatus.DELETED,
    },
  })

  if (result.count > 0) {
    await markWeeklyReviewStaleForDate(user.id, record.occurredAt ?? record.createdAt, context).catch((error) => {
      log.error('record delete failed', {
        status: 'failed',
        userId: user.id,
        recordId: record.id,
        durationMs: Date.now() - start,
        error,
      })
      throw error
    })
    log.info('record delete success', {
      status: 'success',
      userId: user.id,
      recordId: record.id,
      durationMs: Date.now() - start,
    })
    return true
  }

  log.warn('record delete returned not found', {
    status: 'failed',
    userId: user.id,
    durationMs: Date.now() - start,
    reason: 'record-update-empty',
  })

  return false
}
