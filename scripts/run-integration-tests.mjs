import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const defaultSchema = 'e2e'

const loadEnvFile = () => {
  try {
    const env = readFileSync('.env', 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))

    for (const line of env) {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=').replace(/^"|"$/g, '')

      if (key && value && !process.env[key]) {
        process.env[key] = value
      }
    }
  } catch {
    // The setup script will report missing DATABASE_URL with a clearer error.
  }
}

const withSchema = (databaseUrl, schemaName) => {
  const url = new URL(databaseUrl)
  url.searchParams.set('schema', schemaName)

  return url.toString()
}

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

loadEnvFile()

const databaseUrl =
  process.env.E2E_DATABASE_URL ??
  (process.env.DATABASE_URL
    ? withSchema(process.env.DATABASE_URL, process.env.E2E_DATABASE_SCHEMA ?? defaultSchema)
    : undefined)

const env = {
  ...process.env,
  AI_MOCK_MODE: 'true',
  DATABASE_URL: databaseUrl ?? '',
  E2E_DATABASE_URL: databaseUrl ?? '',
}

const testTargets = process.argv.slice(2)

run('node', ['scripts/setup-e2e-db.mjs'], env)
run('pnpm', [
  'exec',
  'vitest',
  'run',
  '--no-file-parallelism',
  ...(testTargets.length ? testTargets : ['tests/integration']),
], env)
