import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AiAnalysisStatus } from '@prisma/client'
import { createRecordAiAnalysis, getAiAnalysisById } from '../../server/services/ai-analysis'
import { createRecord } from '../../server/services/records'
import { buildRecordPayload, getDefaultUser, prisma, resetDefaultUserData } from './helpers/db'

const mockAnalyzeRecord = vi.hoisted(() => vi.fn())

vi.mock('../../server/ai/tasks/analyzeRecord', () => ({
  analyzeRecord: mockAnalyzeRecord,
}))

const waitForAnalysisStatus = async (analysisId: string, status: AiAnalysisStatus) => {
  const deadline = Date.now() + 3000

  while (Date.now() < deadline) {
    const analysis = await prisma.aiAnalysis.findUnique({
      where: { id: analysisId },
    })

    if (analysis?.status === status) {
      return analysis
    }

    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  throw new Error(`Timed out waiting for analysis ${analysisId} to become ${status}`)
}

describe('ai analysis service integration', () => {
  beforeEach(async () => {
    mockAnalyzeRecord.mockReset()
    await resetDefaultUserData()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('creates a pending analysis and stores successful AI results', async () => {
    const record = await createRecord(
      buildRecordPayload({
        title: 'AI Analysis Success',
        content: 'Record content for AI analysis.',
        tags: ['analysis'],
      }),
    )
    mockAnalyzeRecord.mockResolvedValue({
      summary: 'AI summary.',
      emotionKeywords: ['calm', 'focused'],
      behaviorPatterns: ['small-step'],
      constructivenessNote: 'Constructive progress.',
      energyCostNote: 'Low energy cost.',
      nextAction: 'Take one small action.',
    })

    const createdAnalysis = await createRecordAiAnalysis(record.id)

    expect(createdAnalysis.status).toBe('PENDING')
    const storedAnalysis = await waitForAnalysisStatus(createdAnalysis.id, 'SUCCESS')
    const response = await getAiAnalysisById(createdAnalysis.id)

    expect(mockAnalyzeRecord).toHaveBeenCalledTimes(1)
    expect(storedAnalysis).toMatchObject({
      status: 'SUCCESS',
      summary: 'AI summary.',
      constructivenessNote: 'Constructive progress.',
      energyCostNote: 'Low energy cost.',
      nextAction: 'Take one small action.',
      errorMessage: null,
    })
    expect(response).toMatchObject({
      id: createdAnalysis.id,
      status: 'SUCCESS',
      summary: 'AI summary.',
      emotionKeywords: ['calm', 'focused'],
      completedAt: expect.any(String),
      failedAt: null,
    })
  })

  it('stores failed AI results when the task rejects', async () => {
    const record = await createRecord(
      buildRecordPayload({
        title: 'AI Analysis Failed',
      }),
    )
    mockAnalyzeRecord.mockRejectedValue(new Error('mock analysis failed'))

    const createdAnalysis = await createRecordAiAnalysis(record.id)
    const storedAnalysis = await waitForAnalysisStatus(createdAnalysis.id, 'FAILED')

    expect(storedAnalysis).toMatchObject({
      status: 'FAILED',
      errorMessage: 'mock analysis failed',
    })
    expect(storedAnalysis?.failedAt).toBeInstanceOf(Date)
  })

  it('reuses an existing pending analysis before creating a new one', async () => {
    const user = await getDefaultUser()
    const record = await createRecord(
      buildRecordPayload({
        title: 'AI Analysis Pending Reuse',
      }),
    )
    const pendingAnalysis = await prisma.aiAnalysis.create({
      data: {
        userId: user.id,
        recordId: record.id,
        type: 'SINGLE_RECORD',
        status: 'PENDING',
        startedAt: new Date(),
      },
    })

    const result = await createRecordAiAnalysis(record.id)

    expect(result.id).toBe(pendingAnalysis.id)
    expect(result.status).toBe('PENDING')
    expect(mockAnalyzeRecord).not.toHaveBeenCalled()
    await expect(prisma.aiAnalysis.count()).resolves.toBe(1)
  })

  it('marks timed out pending analyses as failed when queried', async () => {
    const user = await getDefaultUser()
    const record = await createRecord(
      buildRecordPayload({
        title: 'AI Analysis Timeout',
      }),
    )
    const pendingAnalysis = await prisma.aiAnalysis.create({
      data: {
        userId: user.id,
        recordId: record.id,
        type: 'SINGLE_RECORD',
        status: 'PENDING',
        startedAt: new Date(Date.now() - 61_000),
      },
    })

    const response = await getAiAnalysisById(pendingAnalysis.id)

    expect(response).toMatchObject({
      id: pendingAnalysis.id,
      status: 'FAILED',
      errorMessage: 'AI 总结生成已超过 1 分钟，可能在热更新或进程中断时停止，已标记为失败。',
      failedAt: expect.any(String),
    })
  })
})
