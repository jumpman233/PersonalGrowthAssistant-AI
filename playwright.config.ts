import { defineConfig, devices } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'

const parseEnvFile = (filePath: string) => {
  if (!existsSync(filePath)) {
    return {}
  }

  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const [key, ...valueParts] = line.split('=')
        return [key.trim(), valueParts.join('=').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '')]
      })
      .filter(([key]) => Boolean(key)),
  )
}

const readEnvValue = (filePath: string, key: string) => {
  try {
    return parseEnvFile(filePath)[key]
  } catch {
    return undefined
  }
}

const deriveTestDatabaseUrl = (databaseUrl: string) => {
  const url = new URL(databaseUrl)
  const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ''))
  const testDatabaseName = databaseName.toLowerCase().includes('test')
    ? databaseName
    : `${databaseName}_test`

  url.pathname = `/${encodeURIComponent(testDatabaseName)}`
  url.searchParams.set('schema', 'public')

  return url.toString()
}

const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  readEnvValue('.env.test', 'DATABASE_URL') ??
  (() => {
    const devDatabaseUrl = readEnvValue('.env', 'DATABASE_URL')
    return devDatabaseUrl ? deriveTestDatabaseUrl(devDatabaseUrl) : ''
  })()

const webServerCommand =
  process.env.SKIP_E2E_DB_SETUP === 'true'
    ? 'pnpm dev --host 127.0.0.1 --port 3004'
    : 'node scripts/setup-e2e-db.mjs && pnpm dev --host 127.0.0.1 --port 3004'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3004',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: webServerCommand,
    env: {
      AI_MOCK_MODE: 'true',
      DATABASE_URL: testDatabaseUrl,
      NUXT_IGNORE_LOCK: '1',
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: 'http://127.0.0.1:3004',
  },
})
