import { defineConfig, devices } from '@playwright/test'
import { readFileSync } from 'node:fs'

const readEnvValue = (key: string) => {
  try {
    const line = readFileSync('.env', 'utf8')
      .split(/\r?\n/)
      .find((entry) => entry.trim().startsWith(`${key}=`))

    return line?.split('=').slice(1).join('=').trim().replace(/^"|"$/g, '')
  } catch {
    return undefined
  }
}

const withSchema = (databaseUrl: string, schemaName: string) => {
  const url = new URL(databaseUrl)
  url.searchParams.set('schema', schemaName)

  return url.toString()
}

const baseDatabaseUrl = process.env.DATABASE_URL ?? readEnvValue('DATABASE_URL')
const e2eDatabaseUrl =
  process.env.E2E_DATABASE_URL ??
  (baseDatabaseUrl ? withSchema(baseDatabaseUrl, process.env.E2E_DATABASE_SCHEMA ?? 'e2e') : '')

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
    command: 'node scripts/setup-e2e-db.mjs && pnpm dev --host 127.0.0.1 --port 3004',
    env: {
      AI_MOCK_MODE: 'true',
      DATABASE_URL: e2eDatabaseUrl,
      NUXT_IGNORE_LOCK: '1',
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: 'http://127.0.0.1:3004',
  },
})
