import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const defaultTestUserEmail = 'local@personal-growth.local'

const trimQuotes = (value) => value.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '')

export const parseEnvFile = (filePath) => {
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
        return [key.trim(), trimQuotes(valueParts.join('='))]
      })
      .filter(([key]) => Boolean(key)),
  )
}

export const loadEnvFile = (filePath, { override = false } = {}) => {
  const values = parseEnvFile(filePath)

  for (const [key, value] of Object.entries(values)) {
    if (override || process.env[key] === undefined) {
      process.env[key] = value
    }
  }

  return values
}

export const deriveTestDatabaseUrl = (databaseUrl) => {
  const url = new URL(databaseUrl)
  const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ''))

  if (!databaseName) {
    throw new Error('DATABASE_URL must include a database name.')
  }

  const testDatabaseName = databaseName.toLowerCase().includes('test')
    ? databaseName
    : `${databaseName}_test`

  url.pathname = `/${encodeURIComponent(testDatabaseName)}`
  url.searchParams.set('schema', 'public')

  return url.toString()
}

const isTestDatabaseUrl = (databaseUrl) => {
  try {
    return getDatabaseName(databaseUrl).toLowerCase().includes('test')
  } catch {
    return false
  }
}

export const loadTestEnv = () => {
  const root = process.cwd()
  const envTestPath = resolve(root, '.env.test')
  const envPath = resolve(root, '.env')

  const testEnv = loadEnvFile(envTestPath)
  const devEnv = parseEnvFile(envPath)

  if (process.env.TEST_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
  } else if (testEnv.DATABASE_URL) {
    process.env.DATABASE_URL = testEnv.DATABASE_URL
  } else if (process.env.DATABASE_URL && isTestDatabaseUrl(process.env.DATABASE_URL)) {
    process.env.DATABASE_URL = process.env.DATABASE_URL
  } else if (devEnv.DATABASE_URL) {
    process.env.DATABASE_URL = deriveTestDatabaseUrl(devEnv.DATABASE_URL)
  } else if (process.env.DATABASE_URL) {
    process.env.DATABASE_URL = deriveTestDatabaseUrl(process.env.DATABASE_URL)
  } else {
    if (devEnv.DATABASE_URL) {
      process.env.DATABASE_URL = deriveTestDatabaseUrl(devEnv.DATABASE_URL)
    }
  }

  process.env.NODE_ENV = 'test'
  process.env.AI_MOCK_MODE = 'true'

  return {
    databaseUrl: process.env.DATABASE_URL,
    envTestPath,
    envPath,
  }
}

const getDatabaseName = (databaseUrl) => {
  const url = new URL(databaseUrl)
  return decodeURIComponent(url.pathname.replace(/^\//, ''))
}

const sameDatabaseTarget = (leftUrl, rightUrl) => {
  if (!leftUrl || !rightUrl) {
    return false
  }

  const left = new URL(leftUrl)
  const right = new URL(rightUrl)

  return (
    left.protocol === right.protocol &&
    left.hostname === right.hostname &&
    left.port === right.port &&
    getDatabaseName(leftUrl) === getDatabaseName(rightUrl)
  )
}

export const assertTestDatabase = (databaseUrl = process.env.DATABASE_URL) => {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for test database operations.')
  }

  if (process.env.NODE_ENV !== 'test') {
    throw new Error('NODE_ENV must be "test" before touching the test database.')
  }

  if (process.env.AI_MOCK_MODE !== 'true') {
    throw new Error('AI_MOCK_MODE must be "true" during test runs.')
  }

  const databaseName = getDatabaseName(databaseUrl)

  if (!databaseName.toLowerCase().includes('test')) {
    throw new Error(`Refusing to touch non-test database "${databaseName}".`)
  }

  const devDatabaseUrl = parseEnvFile(resolve(process.cwd(), '.env')).DATABASE_URL
  if (sameDatabaseTarget(databaseUrl, devDatabaseUrl)) {
    throw new Error('Refusing to use the normal development DATABASE_URL as the test database.')
  }

  return {
    databaseName,
    databaseUrl,
  }
}

export const createTestEnv = (extra = {}) => ({
  ...process.env,
  NODE_ENV: 'test',
  AI_MOCK_MODE: 'true',
  DATABASE_URL: process.env.DATABASE_URL,
  ...extra,
})
