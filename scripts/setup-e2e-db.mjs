import { spawnSync } from 'node:child_process'
import { createTestEnv, loadTestEnv } from './utils/test-env.mjs'

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
const env = createTestEnv()

run('node', ['scripts/setup-test-db.mjs'], env)
run('node', ['scripts/seed-test-data.mjs'], env)
