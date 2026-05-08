import type { AiAnalysisStatus } from '@prisma/client'
import type { AiAnalysisResponse, RecordAiAnalysisInput, RecordAiAnalysisResult } from '../../app/types/ai'
import { analyzeRecordPromptVersion } from '../ai/schemas/analyzeRecord'
import { analyzeRecord } from '../ai/tasks/analyzeRecord'
import { prisma } from '../utils/prisma'

const DEFAULT_USER_EMAIL = 'local@personal-growth.local'
const singleRecordType = 'SINGLE_RECORD'
const activeRecordStatus = 'ACTIVE'
const aiStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const
const pendingTimeoutMs = 60 * 1000
const pendingTimeoutMessage = 'AI 总结生成已超过 1 分钟，可能在热更新或进程中断时停止，已标记为失败。'

const getModelName = () => {
  const config = useRuntimeConfig()
  return process.env.AI_MODEL_NAME || config.aiModelName || null
}

const parseKeywords = (value: string | null | undefined) => {
  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export const toAiAnalysisResponse = (analysis: {
  id: string
  status: AiAnalysisStatus
  summary: string | null
  emotionKeywords: string | null
  energyCostNote: string | null
  constructivenessNote: string | null
  nextAction: string | null
  errorMessage: string | null
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
  failedAt: Date | null
}): AiAnalysisResponse => ({
  id: analysis.id,
  status: analysis.status,
  summary: analysis.summary ?? '',
  emotionKeywords: parseKeywords(analysis.emotionKeywords),
  energyCostNote: analysis.energyCostNote ?? '',
  constructivenessNote: analysis.constructivenessNote ?? '',
  nextAction: analysis.nextAction ?? '',
  errorMessage: analysis.errorMessage,
  createdAt: analysis.createdAt.toISOString(),
  updatedAt: analysis.updatedAt.toISOString(),
  completedAt: analysis.completedAt?.toISOString() ?? null,
  failedAt: analysis.failedAt?.toISOString() ?? null,
})

const isTimedOutPending = (analysis: {
  status: AiAnalysisStatus
  startedAt: Date | null
  createdAt: Date
  updatedAt: Date
}) => {
  const referenceAt = analysis.startedAt ?? analysis.createdAt
  return analysis.status === aiStatus.PENDING && Date.now() - referenceAt.getTime() > pendingTimeoutMs
}

const markTimedOutPendingAsFailed = async (analysisId: string) => {
  const analysis = await prisma.aiAnalysis.findUnique({
    where: {
      id: analysisId,
    },
  })

  if (!analysis || !isTimedOutPending(analysis)) {
    return
  }

  await prisma.aiAnalysis.updateMany({
    where: {
      id: analysisId,
      status: aiStatus.PENDING,
    },
    data: {
      status: aiStatus.FAILED,
      errorMessage: pendingTimeoutMessage,
      failedAt: new Date(),
    },
  })
}

const expireTimedOutPendingAnalyses = async (recordId: string, userId: string) => {
  const pendingAnalyses = await prisma.aiAnalysis.findMany({
    where: {
      userId,
      recordId,
      type: singleRecordType,
      status: aiStatus.PENDING,
    },
  })

  const timedOutIds = pendingAnalyses.filter(isTimedOutPending).map((analysis) => analysis.id)

  if (timedOutIds.length === 0) {
    return
  }

  await prisma.aiAnalysis.updateMany({
    where: {
      id: {
        in: timedOutIds,
      },
      status: aiStatus.PENDING,
    },
    data: {
      status: aiStatus.FAILED,
      errorMessage: pendingTimeoutMessage,
      failedAt: new Date(),
    },
  })
}

const toRecordAiInput = (record: {
  title: string
  content: string
  category: RecordAiAnalysisInput['category']
  moodScore: number | null
  constructivenessScore: number | null
  energyCostScore: number | null
  occurredAt: Date | null
  createdAt: Date
  tags: { tag: { name: string } }[]
}): RecordAiAnalysisInput => ({
  title: record.title,
  content: record.content,
  category: record.category,
  moodScore: record.moodScore,
  constructivenessScore: record.constructivenessScore,
  energyCostScore: record.energyCostScore,
  tags: record.tags.map(({ tag }) => tag.name),
  occurredAt: (record.occurredAt ?? record.createdAt).toISOString(),
})

const applySuccess = async (analysisId: string, result: RecordAiAnalysisResult) => {
  await prisma.aiAnalysis.updateMany({
    where: {
      id: analysisId,
      status: aiStatus.PENDING,
    },
    data: {
      status: aiStatus.SUCCESS,
      summary: result.summary,
      emotionKeywords: JSON.stringify(result.emotionKeywords),
      energyCostNote: result.energyCostNote,
      constructivenessNote: result.constructivenessNote,
      nextAction: result.nextAction,
      fullResult: JSON.stringify(result),
      completedAt: new Date(),
      failedAt: null,
      errorMessage: null,
    },
  })
}

const applyFailure = async (analysisId: string, error: unknown) => {
  const message = error instanceof Error ? error.message : 'AI 总结生成失败。'

  await prisma.aiAnalysis.updateMany({
    where: {
      id: analysisId,
      status: aiStatus.PENDING,
    },
    data: {
      status: aiStatus.FAILED,
      errorMessage: message,
      failedAt: new Date(),
    },
  })
}

const runRecordAiAnalysis = async (analysisId: string) => {
  const analysis = await prisma.aiAnalysis.findUnique({
    where: { id: analysisId },
    include: {
      record: {
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      },
    },
  })

  if (!analysis?.record) {
    await applyFailure(analysisId, new Error('记录不存在，无法生成 AI 总结。'))
    return
  }

  try {
    const result = await analyzeRecord(toRecordAiInput(analysis.record))
    await applySuccess(analysisId, result)
  } catch (error) {
    await applyFailure(analysisId, error)
  }
}

export const createRecordAiAnalysis = async (recordId: string) => {
  const user = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: '默认用户不存在，请先初始化本地数据。',
    })
  }

  const record = await prisma.journalRecord.findFirst({
    where: {
      id: recordId,
      userId: user.id,
      status: activeRecordStatus,
    },
  })

  if (!record) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Record not found',
    })
  }

  await expireTimedOutPendingAnalyses(recordId, user.id)

  const pendingAnalysis = await prisma.aiAnalysis.findFirst({
    where: {
      userId: user.id,
      recordId,
      type: singleRecordType,
      status: aiStatus.PENDING,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (pendingAnalysis) {
    return toAiAnalysisResponse(pendingAnalysis)
  }

  const analysis = await prisma.aiAnalysis.create({
    data: {
      userId: user.id,
      recordId,
      type: singleRecordType,
      status: aiStatus.PENDING,
      startedAt: new Date(),
      modelName: getModelName(),
      promptVersion: analyzeRecordPromptVersion,
    },
  })

  void runRecordAiAnalysis(analysis.id)

  return toAiAnalysisResponse(analysis)
}

export const getAiAnalysisById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  })

  if (!user) {
    return null
  }

  const analysis = await prisma.aiAnalysis.findFirst({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!analysis) {
    return null
  }

  if (isTimedOutPending(analysis)) {
    await markTimedOutPendingAsFailed(analysis.id)

    const failedAnalysis = await prisma.aiAnalysis.findUnique({
      where: { id: analysis.id },
    })

    return failedAnalysis ? toAiAnalysisResponse(failedAnalysis) : null
  }

  return toAiAnalysisResponse(analysis)
}
