import { PrismaClient } from '@prisma/client'
import { assertTestDatabase, defaultTestUserEmail, loadTestEnv } from './utils/test-env.mjs'

loadTestEnv()
const { databaseName } = assertTestDatabase()

const prisma = new PrismaClient()

try {
  await prisma.user.upsert({
    where: { email: defaultTestUserEmail },
    update: {
      nickname: 'Test User',
      preference: {
        upsert: {
          create: {
            aiTone: 'CALM',
            language: 'zh-CN',
            defaultReviewStyle: '低压力推进',
            weeklyReviewDay: 0,
          },
          update: {
            aiTone: 'CALM',
            language: 'zh-CN',
            defaultReviewStyle: '低压力推进',
            weeklyReviewDay: 0,
          },
        },
      },
    },
    create: {
      email: defaultTestUserEmail,
      nickname: 'Test User',
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

  console.log(`Seeded test data in ${databaseName}`)
} finally {
  await prisma.$disconnect()
}
