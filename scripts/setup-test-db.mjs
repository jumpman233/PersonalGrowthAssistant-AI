import { spawnSync } from 'node:child_process'
import { assertTestDatabase, createTestEnv, loadTestEnv } from './utils/test-env.mjs'

loadTestEnv()
const { databaseName, databaseUrl } = assertTestDatabase()

console.log(`Preparing isolated test database: ${databaseName}`)

const quoteIdentifier = (value) => `"${value.replaceAll('"', '""')}"`

const getMaintenanceDatabaseUrl = (urlValue) => {
  const url = new URL(urlValue)
  url.pathname = '/postgres'
  url.search = ''

  return url.toString()
}

const createDatabaseResult = spawnSync(
  'pnpm',
  ['exec', 'prisma', 'db', 'execute', '--url', getMaintenanceDatabaseUrl(databaseUrl), '--stdin'],
  {
    encoding: 'utf8',
    env: createTestEnv(),
    input: `CREATE DATABASE ${quoteIdentifier(databaseName)};`,
    shell: process.platform === 'win32',
  },
)

if (createDatabaseResult.status !== 0) {
  const output = `${createDatabaseResult.stdout ?? ''}\n${createDatabaseResult.stderr ?? ''}`

  if (!output.toLowerCase().includes('already exists')) {
    console.error(output.trim())
    console.error('Failed to create the isolated test database.')
    process.exit(createDatabaseResult.status ?? 1)
  }
}

const result = spawnSync('pnpm', ['exec', 'prisma', 'db', 'push', '--force-reset', '--skip-generate'], {
  env: createTestEnv(),
  shell: process.platform === 'win32',
  stdio: 'inherit',
})

if (result.status !== 0) {
  console.error('Failed to prepare the test database.')
  process.exit(result.status ?? 1)
}
