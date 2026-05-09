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

const records = [
  ['整理作品集首页叙事', '把作品集首页的表达重新梳理了一遍，删掉太泛的描述，保留能体现真实项目推进的部分。页面更像一个能交付的作品，而不是临时拼出来的展示页。', 'WORK', 4, 5, 2, '2026-05-09T10:20:00+08:00', ['作品集', '表达梳理', '真实建设感']],
  ['下午被消息打断后重新聚焦', '下午被几个消息打断，状态明显变散。后来把聊天窗口关掉，重新列出一个最小任务，只做接口测试计划这一件事，节奏才慢慢回来。', 'WORK', 3, 3, 4, '2026-05-09T15:40:00+08:00', ['注意力', '信息内耗', '重新聚焦']],
  ['跑通第一批集成测试', '把 records 和 dashboard 的 service integration 跑通了。中间发现测试文件并行会互相清数据，修成串行之后稳定很多。', 'PROJECT', 4, 5, 3, '2026-05-08T21:10:00+08:00', ['测试体系', '后端接口', '问题定位']],
  ['补测试库隔离方案', '把 E2E 测试切到独立 schema，避免继续污染日常开发数据。这个隔离层补上之后，后续改代码会安心很多。', 'PROJECT', 4, 5, 2, '2026-05-08T16:30:00+08:00', ['测试库', '工程安全', '数据库']],
  ['晚上散步恢复状态', '晚饭后出去走了半小时，没有听播客，只是让脑子慢慢降噪。回来以后焦虑少了一点，也更愿意继续收尾。', 'HEALTH', 5, 3, 1, '2026-05-08T20:05:00+08:00', ['恢复节奏', '散步', '情绪稳定']],
  ['复盘一次沟通误会', '上午有一次沟通误会，第一反应是急着解释。后来先把事实、感受和猜测分开写下来，发现只是交付时间预期没对齐。', 'RELATIONSHIP', 3, 4, 3, '2026-05-07T11:15:00+08:00', ['沟通复盘', '关系边界', '自我观察']],
  ['把 AI prompt 拆成 task 文件', '把 AI 推荐标签、单条分析和周复盘的 prompt 规则从 handler 里拆出来。后面改 promptVersion 或 schema 不用再翻 API 文件。', 'PROJECT', 4, 5, 2, '2026-05-07T18:25:00+08:00', ['AI任务', '模块拆分', '可维护性']],
  ['午后状态低但没有硬撑', '午后明显犯困，之前会继续硬写代码，今天改成整理测试计划和 TODO。虽然产出没那么刺激，但没有把自己耗空。', 'LIFE', 3, 3, 2, '2026-05-07T14:10:00+08:00', ['低压力推进', '能量边界', '节奏调整']],
  ['修复 pending 状态超时兜底', '给 AI 分析和周复盘的 pending 状态补了更新时间判断。超过阈值后标记失败，避免页面一直卡在生成中。', 'PROJECT', 4, 5, 2, '2026-05-06T19:40:00+08:00', ['状态机', 'AI分析', '异常兜底']],
  ['看完一篇关于测试分层的文章', '文章里讲不要用 E2E 覆盖所有边界，后端接口更适合集成测试。这个提醒正好对应现在项目的问题。', 'STUDY', 4, 4, 1, '2026-05-06T09:30:00+08:00', ['学习', '测试分层', '工程判断']],
  ['整理 dashboard 展示逻辑', '把 dashboard 里的分数格式化、趋势聚合和高频标签抽成 pure function。页面逻辑变薄之后，测试也更好写。', 'PROJECT', 4, 5, 2, '2026-05-05T17:50:00+08:00', ['Dashboard', '纯函数', '数据聚合']],
  ['早上情绪有点急', '早上醒来想到还有很多测试没补，心里有点急。写下清单后发现事情其实能拆成小块，焦虑下降了不少。', 'EMOTION', 3, 4, 3, '2026-05-05T08:20:00+08:00', ['情绪观察', '拆任务', '焦虑管理']],
  ['周一重新排优先级', '把本周任务重新排了一遍，先保证记录 CRUD、AI 状态和周复盘这些主链路稳定，再考虑细节优化。', 'WORK', 4, 4, 2, '2026-05-04T10:00:00+08:00', ['优先级', '主链路', '计划']],
  ['修列表页删除弹窗', '给列表页删除动作补了二次确认和成功提示，也确认删除按钮不会误触进入详情页。这个交互虽小，但会明显影响安全感。', 'PROJECT', 4, 4, 2, '2026-05-04T20:15:00+08:00', ['删除确认', '交互安全', 'E2E']],
  ['和朋友聊近况', '晚上和朋友聊了最近做项目的状态，被提醒不要把所有问题都一次性解决。这个提醒挺有用。', 'SOCIAL', 5, 3, 1, '2026-05-03T21:00:00+08:00', ['朋友交流', '支持感', '阶段完成']],
  ['整理记录表单校验规则', '把 RecordForm 里的校验规则抽到单独文件，标题、内容、评分、标签和时间都能直接测。拆完之后组件少了一点压力。', 'PROJECT', 4, 5, 2, '2026-05-03T16:45:00+08:00', ['表单校验', '组件瘦身', '单测']],
  ['午后短暂低效', '午后一直在几个方向之间切换，看起来忙但推进很浅。后来只保留一个验证命令，才重新进入状态。', 'WORK', 3, 2, 4, '2026-05-02T15:20:00+08:00', ['碎片化', '低效', '重新聚焦']],
  ['补 AI 推荐标签已有标签传参', '确认 suggestTags 前端没有把已有标签传上去，补上 existingTags 后，推荐结果能避开用户已经选过的标签。', 'PROJECT', 4, 5, 2, '2026-05-02T11:40:00+08:00', ['标签推荐', 'AI接口', '前后端联动']],
  ['晚上整理本地数据库问题', '发现测试数据污染了本地库，虽然有点崩，但也暴露出测试隔离不够的问题。后面必须把测试库和正常库严格隔开。', 'EMOTION', 2, 4, 5, '2026-05-01T22:30:00+08:00', ['数据库', '事故复盘', '工程安全']],
  ['给后端日志方案做评估', '把后端日志先定成轻量 JSON logger，不接复杂平台。重点放在请求耗时、AI task、CRUD 和周复盘 stale 这些高风险路径。', 'WORK', 4, 4, 2, '2026-05-01T10:10:00+08:00', ['后端日志', '可观测性', '定位问题']],
  ['运动后脑子清醒很多', '傍晚简单跑步二十分钟，回来之后脑子明显清爽。今天最有效的恢复不是继续刷信息，而是让身体先动起来。', 'HEALTH', 5, 3, 1, '2026-04-30T19:10:00+08:00', ['运动', '恢复节奏', '身体状态']],
  ['拆解周复盘生成流程', '把周复盘从页面按钮、API、service、AI task 到 DB 状态流完整走了一遍。问题点主要在 pending、stale 和失败重试。', 'PROJECT', 4, 5, 3, '2026-04-30T14:35:00+08:00', ['周复盘', '状态流', 'AI任务']],
  ['早上读文档效率不错', '早上没有直接写代码，而是先读 Nuxt 和 Vitest 的相关文档。虽然慢一点，但后面少走了不少弯路。', 'STUDY', 4, 4, 1, '2026-04-29T09:15:00+08:00', ['读文档', 'Nuxt', '测试工具']],
  ['把大任务拆成可执行清单', '面对一堆测试任务时，先按 5.1 到 5.7 拆成顺序执行。每一步单独验证，比一次性全做更稳。', 'WORK', 4, 5, 2, '2026-04-28T13:30:00+08:00', ['任务拆解', '分步执行', '稳定推进']],
]

const currentWeekStart = new Date('2026-05-04T00:00:00+08:00')
const currentWeekEnd = new Date('2026-05-10T23:59:59.999+08:00')

const average = (items, key) => {
  const values = items.map((item) => item[key]).filter((value) => typeof value === 'number')
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
}

const highFrequencyTags = (items, take = 8) => {
  const counts = new Map()
  for (const item of items) {
    for (const tag of item.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'zh-CN'))
    .slice(0, take)
    .map(([tag]) => tag)
}

const main = async () => {
  const schema = new URL(process.env.DATABASE_URL).searchParams.get('schema') ?? 'public'
  if (schema !== 'public') {
    throw new Error(`Refusing to seed non-public schema: ${schema}`)
  }

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: { nickname: '本地开发用户' },
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

  let upsertedRecords = 0
  const currentWeekRecords = []

  for (const [
    title,
    content,
    category,
    moodScore,
    constructivenessScore,
    energyCostScore,
    occurredAtValue,
    rawTags,
  ] of records) {
    const occurredAt = new Date(occurredAtValue)
    const tags = [...new Set(rawTags)]
    const existing = await prisma.journalRecord.findFirst({ where: { userId: user.id, title } })
    const savedRecord = existing
      ? await prisma.journalRecord.update({
          where: { id: existing.id },
          data: { content, category, moodScore, constructivenessScore, energyCostScore, occurredAt, status: 'ACTIVE' },
        })
      : await prisma.journalRecord.create({
          data: { userId: user.id, title, content, category, moodScore, constructivenessScore, energyCostScore, occurredAt },
        })

    await prisma.journalRecordTag.deleteMany({ where: { recordId: savedRecord.id } })

    for (const name of tags) {
      const tag = await prisma.tag.upsert({
        where: { userId_name: { userId: user.id, name } },
        update: {},
        create: { userId: user.id, name },
      })

      await prisma.journalRecordTag.upsert({
        where: { recordId_tagId: { recordId: savedRecord.id, tagId: tag.id } },
        update: {},
        create: { recordId: savedRecord.id, tagId: tag.id },
      })
    }

    if (occurredAt >= currentWeekStart && occurredAt <= currentWeekEnd) {
      currentWeekRecords.push({ moodScore, constructivenessScore, energyCostScore, tags })
    }

    upsertedRecords += 1
  }

  await prisma.weeklyReview.upsert({
    where: { userId_weekStart_weekEnd: { userId: user.id, weekStart: currentWeekStart, weekEnd: currentWeekEnd } },
    update: {
      status: 'SUCCESS',
      title: '2026年第19周复盘',
      recordCount: currentWeekRecords.length,
      averageMoodScore: average(currentWeekRecords, 'moodScore'),
      averageConstructiveness: average(currentWeekRecords, 'constructivenessScore'),
      averageEnergyCost: average(currentWeekRecords, 'energyCostScore'),
      mainProgress: '本周主要推进集中在测试体系、AI 状态兜底、Dashboard 和周复盘的工程收口上。',
      mainEnergyCost: '主要内耗来自测试库污染、并行测试互相影响，以及多任务切换时的注意力损耗。',
      repeatedPatterns: '先拆任务再推进；遇到状态不稳时先补观测和测试；信息切换会明显抬高内耗。',
      highFrequencyTags: JSON.stringify(highFrequencyTags(currentWeekRecords)),
      nextWeekAction: '下周先把测试命令和数据库隔离再收紧一遍，确保任何测试都不会碰到正常库。',
      aiSummary: '这一周的推进很明显：你在把项目从“能跑”推进到“可维护、可验证”。真正有效的部分，是不断把模糊问题拆成可验证的小步骤。',
      generatedAt: new Date('2026-05-09T22:00:00+08:00'),
      sourceUpdatedAt: new Date('2026-05-09T21:50:00+08:00'),
      errorMessage: null,
    },
    create: {
      userId: user.id,
      weekStart: currentWeekStart,
      weekEnd: currentWeekEnd,
      status: 'SUCCESS',
      title: '2026年第19周复盘',
      recordCount: currentWeekRecords.length,
      averageMoodScore: average(currentWeekRecords, 'moodScore'),
      averageConstructiveness: average(currentWeekRecords, 'constructivenessScore'),
      averageEnergyCost: average(currentWeekRecords, 'energyCostScore'),
      mainProgress: '本周主要推进集中在测试体系、AI 状态兜底、Dashboard 和周复盘的工程收口上。',
      mainEnergyCost: '主要内耗来自测试库污染、并行测试互相影响，以及多任务切换时的注意力损耗。',
      repeatedPatterns: '先拆任务再推进；遇到状态不稳时先补观测和测试；信息切换会明显抬高内耗。',
      highFrequencyTags: JSON.stringify(highFrequencyTags(currentWeekRecords)),
      nextWeekAction: '下周先把测试命令和数据库隔离再收紧一遍，确保任何测试都不会碰到正常库。',
      aiSummary: '这一周的推进很明显：你在把项目从“能跑”推进到“可维护、可验证”。真正有效的部分，是不断把模糊问题拆成可验证的小步骤。',
      generatedAt: new Date('2026-05-09T22:00:00+08:00'),
      sourceUpdatedAt: new Date('2026-05-09T21:50:00+08:00'),
      errorMessage: null,
    },
  })

  const [activeRecordCount, tagCount, weeklyReviewCount] = await Promise.all([
    prisma.journalRecord.count({ where: { userId: user.id, status: 'ACTIVE' } }),
    prisma.tag.count({ where: { userId: user.id } }),
    prisma.weeklyReview.count({ where: { userId: user.id } }),
  ])

  console.log(JSON.stringify({ schema, upsertedRecords, activeRecordCount, tagCount, weeklyReviewCount }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
