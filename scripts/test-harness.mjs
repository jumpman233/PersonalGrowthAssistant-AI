import { spawnSync } from 'node:child_process'
import { assertTestDatabase, createTestEnv, loadTestEnv } from './utils/test-env.mjs'

const validTargets = new Set(['all', 'unit', 'server', 'e2e'])
const target = process.argv[2] ?? 'all'

if (!validTargets.has(target)) {
  console.error(`Unknown harness target "${target}". Use one of: all, unit, server, e2e.`)
  process.exit(1)
}

const run = (command, args, env) => {
  const result = spawnSync(command, args, {
    env,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`)
  }
}

const runStage = (name, command, args, env) => {
  console.log(`\n[harness] ${name}`)
  run(command, args, env)
}

const needsDatabase = target !== 'unit'
let shouldClean = false
let exitCode = 0

loadTestEnv()
const env = createTestEnv({
  HARNESS_MODE: 'true',
  SKIP_TEST_DB_SETUP: 'true',
  SKIP_E2E_DB_SETUP: 'true',
})

try {
  if (needsDatabase) {
    const { databaseName } = assertTestDatabase()
    console.log(`[harness] using isolated test database: ${databaseName}`)
    runStage('setup test database', 'node', ['scripts/setup-test-db.mjs'], env)
    shouldClean = true
    runStage('seed test data', 'node', ['scripts/seed-test-data.mjs'], env)
  }

  if (target === 'all' || target === 'unit') {
    runStage('unit tests', 'pnpm', ['test:unit'], env)
  }

  if (target === 'all' || target === 'server') {
    runStage('server tests', 'pnpm', ['test:server'], env)
  }

  if (target === 'all' || target === 'e2e') {
    runStage('e2e tests', 'pnpm', ['test:e2e'], env)
  }
} catch (error) {
  exitCode = 1
  console.error(error instanceof Error ? error.message : error)
} finally {
  if (shouldClean) {
    try {
      runStage('clean test data', 'node', ['scripts/clean-test-data.mjs'], env)
    } catch (error) {
      exitCode = 1
      console.error(error instanceof Error ? error.message : error)
    }
  }
}

process.exit(exitCode)
