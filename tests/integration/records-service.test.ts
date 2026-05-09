import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { getRecordDetailData, softDeleteRecord } from '../../server/services/record-detail'
import { createRecord, getRecordsData, getTagOptions, updateRecord } from '../../server/services/records'
import { buildRecordPayload, getDefaultUser, prisma, resetDefaultUserData } from './helpers/db'

describe('records service integration', () => {
  beforeEach(async () => {
    await resetDefaultUserData()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('creates a record with normalized tags and tag relations', async () => {
    const user = await getDefaultUser()
    const created = await createRecord(
      buildRecordPayload({
        title: '  Integration Create  ',
        content: '  Created through service.  ',
        tags: [' alpha ', 'beta', 'alpha', ''],
      }),
    )

    const record = await prisma.journalRecord.findUnique({
      where: { id: created.id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    expect(record).toMatchObject({
      userId: user.id,
      title: 'Integration Create',
      content: 'Created through service.',
      status: 'ACTIVE',
      category: 'WORK',
      moodScore: 3,
      constructivenessScore: 4,
      energyCostScore: 1,
    })
    expect(record?.tags.map(({ tag }) => tag.name).sort()).toEqual(['alpha', 'beta'])
    await expect(getTagOptions()).resolves.toEqual(['alpha', 'beta'])
  })

  it('updates a record and replaces old tag relations', async () => {
    const created = await createRecord(
      buildRecordPayload({
        title: 'Integration Update',
        content: 'Before update.',
        tags: ['alpha', 'beta'],
      }),
    )

    await updateRecord(
      created.id,
      buildRecordPayload({
        title: 'Integration Updated',
        content: 'After update.',
        category: 'STUDY',
        moodScore: 5,
        constructivenessScore: 5,
        energyCostScore: 0,
        tags: ['beta', 'gamma'],
      }),
    )

    const detail = await getRecordDetailData(created.id)

    expect(detail).toMatchObject({
      id: created.id,
      title: 'Integration Updated',
      content: 'After update.',
      category: {
        value: 'STUDY',
      },
    })
    expect(detail?.formValue).toMatchObject({
      moodScore: 5,
      constructivenessScore: 5,
      energyCostScore: 0,
    })
    expect(detail?.tags.sort()).toEqual(['beta', 'gamma'])

    const relationTags = await prisma.journalRecordTag.findMany({
      where: { recordId: created.id },
      include: { tag: true },
    })

    expect(relationTags.map(({ tag }) => tag.name).sort()).toEqual(['beta', 'gamma'])
  })

  it('soft deletes a record and hides it from list and detail queries', async () => {
    const created = await createRecord(
      buildRecordPayload({
        title: 'Integration Delete',
        content: 'Delete me.',
        tags: ['delete-me'],
      }),
    )

    await expect(softDeleteRecord(created.id)).resolves.toBe(true)

    const deletedRecord = await prisma.journalRecord.findUnique({
      where: { id: created.id },
    })
    const list = await getRecordsData({ timeRange: 'all' })
    const detail = await getRecordDetailData(created.id)

    expect(deletedRecord?.status).toBe('DELETED')
    expect(list.records.map((record) => record.id)).not.toContain(created.id)
    expect(detail).toBeNull()
  })

  it('rejects invalid payloads before writing to the database', async () => {
    await expect(
      createRecord(
        buildRecordPayload({
          title: '',
        }),
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
    })

    await expect(prisma.journalRecord.count()).resolves.toBe(0)
  })
})
