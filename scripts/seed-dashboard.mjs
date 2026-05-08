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
const reviewGeneratedAt = new Date('2025-05-25T21:30:00+08:00')

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
  {
    title: '整理记录列表页设计',
    content: '把列表页的信息层级重新看了一遍，确认它应该像记录流，而不是后台管理表格。',
    category: 'PROJECT',
    moodScore: 4,
    constructivenessScore: 5,
    energyCostScore: 2,
    occurredAt: new Date('2025-05-24T11:00:00+08:00'),
    tags: ['产品设计', '记录流', '低压力推进'],
  },
  {
    title: '午后复盘一次沟通误会',
    content: '没有急着解释，而是先把自己的感受和对方可能的处境分开看，情绪慢慢落下来了。',
    category: 'RELATIONSHIP',
    moodScore: 4,
    constructivenessScore: 3,
    energyCostScore: 2,
    occurredAt: new Date('2025-05-24T15:25:00+08:00'),
    tags: ['关系复盘', '自我观察', '恢复节奏'],
  },
  {
    title: '读完一篇关于注意力的文章',
    content: '里面提到减少切换成本，比增加意志力更重要。这个提醒对现在的项目推进很有用。',
    category: 'STUDY',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 1,
    occurredAt: new Date('2025-05-25T09:45:00+08:00'),
    tags: ['学习', '注意力', '掌控感'],
  },
  {
    title: '周末慢走恢复精力',
    content: '没有安排太多任务，只是出去走了一圈。回来之后脑子更安静，也更愿意继续写代码。',
    category: 'HEALTH',
    moodScore: 5,
    constructivenessScore: 3,
    energyCostScore: 1,
    occurredAt: new Date('2025-05-25T17:10:00+08:00'),
    tags: ['运动', '恢复节奏', '低压力推进'],
  },
  {
    title: '拆解 Prisma 数据流',
    content: '把假数据从前端迁到服务端，再接到 PostgreSQL，系统边界变得清楚很多。',
    category: 'PROJECT',
    moodScore: 4,
    constructivenessScore: 5,
    energyCostScore: 3,
    occurredAt: new Date('2025-05-26T10:30:00+08:00'),
    tags: ['数据链路', 'AI开发', '掌控感'],
  },
  {
    title: '避免深夜继续硬撑',
    content: '晚上状态明显下滑时，没有继续硬推进，而是记录下卡点后直接收尾休息。',
    category: 'LIFE',
    moodScore: 3,
    constructivenessScore: 3,
    energyCostScore: 2,
    occurredAt: new Date('2025-05-26T22:40:00+08:00'),
    tags: ['恢复节奏', '自我观察', '低压力推进'],
  },
  {
    title: '补充 README 启动流程',
    content: '把第一次安装、数据库启动、seed 和开发命令整理进文档，未来重新启动项目会少很多摩擦。',
    category: 'WORK',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 2,
    occurredAt: new Date('2025-05-27T14:05:00+08:00'),
    tags: ['文档整理', '输出实效', '掌控感'],
  },
  {
    title: '短暂社交后及时抽离',
    content: '和朋友聊了一会儿近况，感觉被支持，但也在能量下降前主动结束。',
    category: 'SOCIAL',
    moodScore: 4,
    constructivenessScore: 3,
    energyCostScore: 2,
    occurredAt: new Date('2025-05-27T20:15:00+08:00'),
    tags: ['社交', '连接', '能量边界'],
  },
  {
    title: '明确列表页分页策略',
    content: '确认使用自动加载更多，而不是传统分页。这个交互更符合记录流的产品气质。',
    category: 'PROJECT',
    moodScore: 4,
    constructivenessScore: 5,
    energyCostScore: 2,
    occurredAt: new Date('2025-05-28T11:20:00+08:00'),
    tags: ['产品设计', '记录流', 'AI开发'],
  },
  {
    title: '下午被通知打断后重新进入',
    content: '中间被消息打断两次，后来关掉无关窗口，花十分钟重新找回任务上下文。',
    category: 'WORK',
    moodScore: 3,
    constructivenessScore: 3,
    energyCostScore: 4,
    occurredAt: new Date('2025-05-28T16:55:00+08:00'),
    tags: ['信息消耗', '注意力', '恢复节奏'],
  },
  {
    title: '记录一次轻微焦虑',
    content: '早上醒来有点急，但写下来之后发现焦虑来自任务边界不清，而不是事情真的太多。',
    category: 'EMOTION',
    moodScore: 3,
    constructivenessScore: 4,
    energyCostScore: 3,
    occurredAt: new Date('2025-05-29T08:50:00+08:00'),
    tags: ['情绪观察', '自我观察', '掌控感'],
  },
  {
    title: '学习 IntersectionObserver',
    content: '理解了 sentinel 进入视口时触发加载的机制，感觉比监听滚动事件更干净。',
    category: 'STUDY',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 2,
    occurredAt: new Date('2025-05-29T19:35:00+08:00'),
    tags: ['学习', '前端交互', 'AI开发'],
  },
  {
    title: '整理下周最小行动',
    content: '没有给自己排满计划，只选了一个最值得推进的项目切口，准备明天先做第一步。',
    category: 'PROJECT',
    moodScore: 5,
    constructivenessScore: 5,
    energyCostScore: 1,
    occurredAt: new Date('2025-05-30T18:45:00+08:00'),
    tags: ['单点突破', '长期项目', '低压力推进'],
  },
  {
    title: '睡前复盘今日能量',
    content: '发现上午最适合深度工作，晚上更适合整理和收尾，不适合再做复杂决策。',
    category: 'HEALTH',
    moodScore: 4,
    constructivenessScore: 3,
    energyCostScore: 1,
    occurredAt: new Date('2025-05-30T22:15:00+08:00'),
    tags: ['睡眠', '能量边界', '恢复节奏'],
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
      status: 'SUCCESS',
      title: '2025年第21周复盘',
      recordCount: records.length,
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
      generatedAt: reviewGeneratedAt,
      sourceUpdatedAt: reviewGeneratedAt,
      errorMessage: null,
    },
    create: {
      userId: user.id,
      weekStart,
      weekEnd,
      status: 'SUCCESS',
      title: '2025年第21周复盘',
      recordCount: records.length,
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
      generatedAt: reviewGeneratedAt,
      sourceUpdatedAt: reviewGeneratedAt,
      errorMessage: null,
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
