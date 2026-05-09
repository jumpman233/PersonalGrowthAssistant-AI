import { afterAll, describe, expect, it } from 'vitest'
import { defaultUserEmail, getDefaultUser, prisma } from './helpers/db'

describe('integration test database', () => {
  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('uses the shared e2e test schema and seeds the default user', async () => {
    const [schemaRow] = await prisma.$queryRaw<Array<{ current_schema: string }>>`SELECT current_schema()`
    const user = await getDefaultUser()

    expect(schemaRow?.current_schema).toBe('e2e')
    expect(user.email).toBe(defaultUserEmail)
  })
})
