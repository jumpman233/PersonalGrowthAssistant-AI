import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'

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

const prisma = new PrismaClient()

const userEmail = 'local@personal-growth.local'
const weekStart = new Date('2025-05-19T00:00:00+08:00')
const weekEnd = new Date('2025-05-25T23:59:59+08:00')

const records = [
  {
    title: '用 Nuxt 自动作品项目',
    content: '搭建项目框架与核心功能，梳理模块化方案，完成首页和导航，感受到清晰的推进感。',
    category: 'WORK',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 2,
    occurredAt: new Date('2025-05-20T10:32:00+08:00'),
    tags: ['AI开发', '输出实效', '长期项目'],
  },
  {
    title: '朋友新群聚会 AI 小工具 AI',
    content: '分享阶段性想法和进展，收到一些反馈和建议，感觉连接和支持都在。',
    category: 'RELATIONSHIP',
    moodScore: 4,
    constructivenessScore: 3,
    energyCostScore: 2,
    occurredAt: new Date('2025-05-19T21:15:00+08:00'),
    tags: ['分享', '无压力交流', '连接'],
  },
  {
    title: '一个人打球',
    content: '下班后去球场打了一个小时，出汗后情绪平稳了很多，脑子也清空了。',
    category: 'EMOTION',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 3,
    occurredAt: new Date('2025-05-19T19:02:00+08:00'),
    tags: ['运动', '独处', '恢复节奏'],
  },
  {
    title: '梳理下一阶段求职节奏',
    content: '把简历、作品集和投递节奏重新拆了一遍，发现真正需要推进的是两个可展示项目。',
    category: 'WORK',
    moodScore: 4,
    constructivenessScore: 5,
    energyCostScore: 2,
    occurredAt: new Date('2025-05-21T16:40:00+08:00'),
    tags: ['职业重启', '掌控感', '长期项目'],
  },
  {
    title: '晚上处理太多碎片消息',
    content: '原本想继续写项目，但一直在切换聊天和资讯，最后明显变累，产出也变浅了。',
    category: 'LIFE',
    moodScore: 3,
    constructivenessScore: 2,
    energyCostScore: 4,
    occurredAt: new Date('2025-05-22T22:10:00+08:00'),
    tags: ['信息消耗', '碎片化', '低压力推进'],
  },
  {
    title: '完成首页组件拆分',
    content: '把 dashboard 拆成更小的组件，页面只负责组合，后面移动端适配会更稳。',
    category: 'PROJECT',
    moodScore: 5,
    constructivenessScore: 5,
    energyCostScore: 3,
    occurredAt: new Date('2025-05-23T18:20:00+08:00'),
    tags: ['AI开发', '掌控感', '输出实效'],
  },
]

const main = async () => {
  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      nickname: '本地开发用户',
    },
    create: {
      email: userEmail,
      nickname: '本地开发用户',
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

  for (const record of records) {
    const existingRecord = await prisma.journalRecord.findFirst({
      where: {
        userId: user.id,
        title: record.title,
      },
    })

    const savedRecord = existingRecord
      ? await prisma.journalRecord.update({
          where: { id: existingRecord.id },
          data: {
            content: record.content,
            category: record.category,
            moodScore: record.moodScore,
            constructivenessScore: record.constructivenessScore,
            energyCostScore: record.energyCostScore,
            occurredAt: record.occurredAt,
            status: 'ACTIVE',
          },
        })
      : await prisma.journalRecord.create({
          data: {
            userId: user.id,
            title: record.title,
            content: record.content,
            category: record.category,
            moodScore: record.moodScore,
            constructivenessScore: record.constructivenessScore,
            energyCostScore: record.energyCostScore,
            occurredAt: record.occurredAt,
          },
        })

    for (const tagName of record.tags) {
      const tag = await prisma.tag.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name: tagName,
          },
        },
        update: {},
        create: {
          userId: user.id,
          name: tagName,
        },
      })

      await prisma.journalRecordTag.upsert({
        where: {
          recordId_tagId: {
            recordId: savedRecord.id,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          recordId: savedRecord.id,
          tagId: tag.id,
        },
      })
    }
  }

  await prisma.weeklyReview.upsert({
    where: {
      userId_weekStart_weekEnd: {
        userId: user.id,
        weekStart,
        weekEnd,
      },
    },
    update: {
      title: '2025年第21周复盘',
      recordCount: 6,
      averageMoodScore: 4.1,
      averageConstructiveness: 3.8,
      averageEnergyCost: 2.6,
      mainProgress: '项目搭建、首页组件拆分和职业重启节奏都有实质推进。',
      mainEnergyCost: '主要消耗来自信息切换、碎片消息和晚上注意力被分散。',
      repeatedPatterns: '当任务被拆成明确的小块时，推进感更强；当输入过多时，消耗会上升。',
      highFrequencyTags: JSON.stringify(['真实建设感', 'AI 开发', '掌控感', '恢复节奏', '低压力推进']),
      nextWeekAction: '为重要项目设定一个「单点突破」目标，聚焦最能产生复利的那一件事。',
      aiSummary:
        '你本周在「职业推进」上投入稳定，且能兼顾关系连接与自我恢复，整体节奏较为平衡。消耗主要来自信息处理与多线程切换，建议为深度工作预留更不被打扰的时间段。',
    },
    create: {
      userId: user.id,
      weekStart,
      weekEnd,
      title: '2025年第21周复盘',
      recordCount: 6,
      averageMoodScore: 4.1,
      averageConstructiveness: 3.8,
      averageEnergyCost: 2.6,
      mainProgress: '项目搭建、首页组件拆分和职业重启节奏都有实质推进。',
      mainEnergyCost: '主要消耗来自信息切换、碎片消息和晚上注意力被分散。',
      repeatedPatterns: '当任务被拆成明确的小块时，推进感更强；当输入过多时，消耗会上升。',
      highFrequencyTags: JSON.stringify(['真实建设感', 'AI 开发', '掌控感', '恢复节奏', '低压力推进']),
      nextWeekAction: '为重要项目设定一个「单点突破」目标，聚焦最能产生复利的那一件事。',
      aiSummary:
        '你本周在「职业推进」上投入稳定，且能兼顾关系连接与自我恢复，整体节奏较为平衡。消耗主要来自信息处理与多线程切换，建议为深度工作预留更不被打扰的时间段。',
    },
  })

  await prisma.aiAnalysis.create({
    data: {
      userId: user.id,
      type: 'WEEKLY_REVIEW',
      summary: '本周推进稳定，项目和职业重启方向都在形成更清晰的节奏。',
      behaviorPatterns: '低压力推进、碎片化消耗、明确小块任务带来掌控感',
      constructivenessNote: '建设感主要来自可展示项目、组件拆分和清晰的下一步。',
      energyCostNote: '消耗主要来自消息切换、资讯输入和夜间注意力分散。',
      nextAction: '下周只选一个项目突破点，先完成最能展示价值的一块。',
      modelName: 'seed-data',
      promptVersion: 'seed-v1',
    },
  })

  console.log('Seeded dashboard data for local@personal-growth.local')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
