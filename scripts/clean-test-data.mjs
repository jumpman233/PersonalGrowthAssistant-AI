import { PrismaClient } from '@prisma/client'
import { assertTestDatabase, loadTestEnv } from './utils/test-env.mjs'

loadTestEnv()
const { databaseName } = assertTestDatabase()

const prisma = new PrismaClient()

try {
  await prisma.$transaction([
    prisma.aiAnalysis.deleteMany(),
    prisma.weeklyReview.deleteMany(),
    prisma.journalRecordTag.deleteMany(),
    prisma.journalRecord.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.userPreference.deleteMany(),
    prisma.user.deleteMany(),
  ])

  console.log(`Cleaned test data from ${databaseName}`)
} finally {
  await prisma.$disconnect()
}
