import { PrismaClient } from '@prisma/client'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const defaultSchema = 'e2e'
const userEmail = 'local@personal-growth.local'

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
    // Let the explicit validation below report missing DATABASE_URL.
  }
}

const withSchema = (databaseUrl, schemaName) => {
  const url = new URL(databaseUrl)
  url.searchParams.set('schema', schemaName)

  return url.toString()
}

loadEnvFile()

process.env.DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  (process.env.DATABASE_URL
    ? withSchema(process.env.DATABASE_URL, process.env.E2E_DATABASE_SCHEMA ?? defaultSchema)
    : undefined)

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required to set up the E2E database.')
  process.exit(1)
}

const pushResult = spawnSync('pnpm', ['exec', 'prisma', 'db', 'push', '--force-reset', '--skip-generate'], {
  env: process.env,
  shell: process.platform === 'win32',
  stdio: 'inherit',
})

if (pushResult.status !== 0) {
  process.exit(pushResult.status ?? 1)
}

const prisma = new PrismaClient()

try {
  await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      nickname: 'E2E 测试用户',
    },
    create: {
      email: userEmail,
      nickname: 'E2E 测试用户',
      preference: {
        create: {
          aiTone: 'CALM',
          language: 'zh-CN',
          defaultReviewStyle: '低压力推进',
          weeklyReviewDay: 0,
        },
      },
    },
  })

  console.log(`Prepared E2E database schema for ${userEmail}`)
} finally {
  await prisma.$disconnect()
}
