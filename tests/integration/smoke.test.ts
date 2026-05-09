import { afterAll, describe, expect, it } from 'vitest'
import { defaultUserEmail, getDefaultUser, prisma } from './helpers/db'

describe('integration test database', () => {
  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('uses the isolated test database and seeds the default user', async () => {
    const [databaseRow] = await prisma.$queryRaw<Array<{ current_database: string }>>`SELECT current_database()`
    const user = await getDefaultUser()

    expect(databaseRow?.current_database).toContain('test')
    expect(user.email).toBe(defaultUserEmail)
  })
})
