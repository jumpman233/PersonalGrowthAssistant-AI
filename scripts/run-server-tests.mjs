import { spawnSync } from 'node:child_process'
import { assertTestDatabase, createTestEnv, loadTestEnv } from './utils/test-env.mjs'

const run = (command, args, env) => {
  const result = spawnSync(command, args, {
    env,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

loadTestEnv()
assertTestDatabase()

const env = createTestEnv()
const testTargets = process.argv.slice(2)

if (process.env.HARNESS_MODE !== 'true' && process.env.SKIP_TEST_DB_SETUP !== 'true') {
  run('node', ['scripts/setup-test-db.mjs'], env)
  run('node', ['scripts/seed-test-data.mjs'], env)
}

run(
  'pnpm',
  ['exec', 'vitest', 'run', '--no-file-parallelism', ...(testTargets.length ? testTargets : ['tests/integration'])],
  env,
)
