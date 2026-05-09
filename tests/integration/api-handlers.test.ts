import { afterEach, describe, expect, it, vi } from 'vitest'

const mockCreateRecord = vi.hoisted(() => vi.fn())
const mockUpdateRecord = vi.hoisted(() => vi.fn())
const mockGetTagOptions = vi.hoisted(() => vi.fn())
const mockSoftDeleteRecord = vi.hoisted(() => vi.fn())
const mockSuggestTags = vi.hoisted(() => vi.fn())

vi.mock('../../server/services/records', () => ({
  createRecord: mockCreateRecord,
  updateRecord: mockUpdateRecord,
  getTagOptions: mockGetTagOptions,
}))

vi.mock('../../server/services/record-detail', () => ({
  softDeleteRecord: mockSoftDeleteRecord,
}))

vi.mock('../../server/ai/tasks/suggestTags', () => ({
  suggestTags: mockSuggestTags,
}))

let importId = 0

const mockReadBody = vi.fn()
const mockGetRouterParam = vi.fn()

const createMockError = (input: { statusCode: number; statusMessage: string }) =>
  Object.assign(new Error(input.statusMessage), input)

const setupH3Globals = () => {
  vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
  vi.stubGlobal('readBody', mockReadBody)
  vi.stubGlobal('getRouterParam', mockGetRouterParam)
  vi.stubGlobal('createError', createMockError)
}

const loadHandler = async <T>(path: string) => {
  setupH3Globals()
  const module = (await import(`${path}?case=${importId++}`)) as { default: T }

  return module.default
}

describe('api handler integration boundaries', () => {
  afterEach(() => {
    mockCreateRecord.mockReset()
    mockUpdateRecord.mockReset()
    mockGetTagOptions.mockReset()
    mockSoftDeleteRecord.mockReset()
    mockSuggestTags.mockReset()
    mockReadBody.mockReset()
    mockGetRouterParam.mockReset()
    vi.unstubAllGlobals()
  })

  it('converts POST /api/records body before calling the records service', async () => {
    const occurredAt = '2026-05-05T10:00:00.000Z'
    mockReadBody.mockResolvedValue({
      title: 123,
      content: 456,
      category: 'WORK',
      moodScore: '4',
      constructivenessScore: '5',
      energyCostScore: '1',
      tags: [' alpha ', 2, null],
      occurredAt,
    })
    mockCreateRecord.mockResolvedValue({ id: 'record-id' })

    const handler = await loadHandler<(event: { context: { requestId: string } }) => Promise<{ id: string }>>(
      '../../server/api/records.post',
    )
    const result = await handler({ context: { requestId: 'request-id' } })

    expect(result).toEqual({ id: 'record-id' })
    expect(mockCreateRecord).toHaveBeenCalledWith(
      {
        title: '123',
        content: '456',
        category: 'WORK',
        moodScore: 4,
        constructivenessScore: 5,
        energyCostScore: 1,
        tags: [' alpha ', '2', ''],
        occurredAt,
      },
      { requestId: 'request-id' },
    )
  })

  it('returns 404 from PATCH /api/records/:id when the service cannot find the record', async () => {
    mockGetRouterParam.mockReturnValue('missing-record')
    mockReadBody.mockResolvedValue({
      title: 'Updated',
      content: 'Updated content',
      category: 'WORK',
      moodScore: 3,
      constructivenessScore: 4,
      energyCostScore: 1,
      tags: [],
      occurredAt: '2026-05-05T10:00:00.000Z',
    })
    mockUpdateRecord.mockResolvedValue(null)

    const handler = await loadHandler<(event: { context: { requestId: string } }) => Promise<unknown>>(
      '../../server/api/records/[id].patch',
    )

    await expect(handler({ context: { requestId: 'request-id' } })).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Record not found',
    })
    expect(mockUpdateRecord).toHaveBeenCalledWith(
      'missing-record',
      expect.objectContaining({ title: 'Updated' }),
      { requestId: 'request-id' },
    )
  })

  it('returns ok from DELETE /api/records/:id and rejects missing ids', async () => {
    mockGetRouterParam.mockReturnValue('record-id')
    mockSoftDeleteRecord.mockResolvedValue(true)

    const handler = await loadHandler<(event: { context: { requestId: string } }) => Promise<{ ok: boolean }>>(
      '../../server/api/records/[id].delete',
    )

    await expect(handler({ context: { requestId: 'request-id' } })).resolves.toEqual({ ok: true })
    expect(mockSoftDeleteRecord).toHaveBeenCalledWith('record-id', { requestId: 'request-id' })

    mockGetRouterParam.mockReturnValue(undefined)
    await expect(handler({ context: { requestId: 'request-id' } })).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Missing record id',
    })
  })

  it('passes merged existing tags to POST /api/ai/suggest-tags', async () => {
    mockReadBody.mockResolvedValue({
      title: 'Suggest tags',
      content: 'Content for suggestions.',
      category: 'WORK',
      moodScore: '4',
      constructivenessScore: '5',
      energyCostScore: '1',
      existingTags: ['client-tag', 'db-tag'],
      selectedTags: ['selected-tag'],
    })
    mockGetTagOptions.mockResolvedValue(['db-tag', 'known-tag'])
    mockSuggestTags.mockResolvedValue({ suggestedTags: ['known-tag'] })

    const handler = await loadHandler<(event: { context: { requestId: string } }) => Promise<{ suggestedTags: string[] }>>(
      '../../server/api/ai/suggest-tags.post',
    )
    const result = await handler({ context: { requestId: 'request-id' } })

    expect(result).toEqual({ suggestedTags: ['known-tag'] })
    expect(mockGetTagOptions).toHaveBeenCalledWith({ requestId: 'request-id' })
    expect(mockSuggestTags).toHaveBeenCalledWith(
      {
        title: 'Suggest tags',
        content: 'Content for suggestions.',
        category: 'WORK',
        moodScore: 4,
        constructivenessScore: 5,
        energyCostScore: 1,
        existingTags: ['client-tag', 'db-tag', 'known-tag'],
        selectedTags: ['selected-tag'],
      },
      { requestId: 'request-id' },
    )
  })

  it('rejects empty POST /api/ai/suggest-tags requests before calling AI', async () => {
    mockReadBody.mockResolvedValue({
      title: '   ',
      content: '',
      existingTags: [],
      selectedTags: [],
    })
    mockGetTagOptions.mockResolvedValue([])

    const handler = await loadHandler<(event: { context: { requestId: string } }) => Promise<unknown>>(
      '../../server/api/ai/suggest-tags.post',
    )

    await expect(handler({ context: { requestId: 'request-id' } })).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: '先写一点内容，再让 AI 推荐标签。',
    })
    expect(mockSuggestTags).not.toHaveBeenCalled()
  })
})
