import { PrismaClient } from '@prisma/client'
import { existsSync, readFileSync } from 'node:fs'

const loadEnvFile = () => {
  if (!existsSync('.env')) {
    return
  }

  const lines = readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))

  for (const line of lines) {
    const [key, ...valueParts] = line.split('=')
    const value = valueParts.join('=').replace(/^"|"$/g, '')

    if (key && value && !process.env[key]) {
      process.env[key] = value
    }
  }
}

loadEnvFile()

let prisma

const defaultUserEmail = 'local@personal-growth.local'

const records = [
  {
    title: '早上把桌面收拾清爽了',
    content:
      '早上先花十分钟把桌面上的线、杯子和便签重新归位。东西少了一点，打开电脑的时候也更容易进入状态，像是给今天留了一块干净的起点。',
    category: 'LIFE',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 1,
    occurredAt: '2026-05-20T08:30:00+08:00',
    tags: ['整理', '轻启动', '空间感'],
  },
  {
    title: '给 AI 小工具补了一段提示词',
    content:
      '午前把一个 AI 小工具的提示词改得更具体了一些，少用抽象要求，多给输入输出示例。调完以后结果稳定了不少，也更容易判断哪里需要继续改。',
    category: 'PROJECT',
    moodScore: 4,
    constructivenessScore: 5,
    energyCostScore: 2,
    occurredAt: '2026-05-20T10:40:00+08:00',
    tags: ['AI实验', '提示词', '小步优化'],
  },
  {
    title: '午饭后散步二十分钟',
    content:
      '午饭后没有立刻坐回屏幕前，而是绕着楼下走了二十分钟。没有特别的目标，只是让身体动起来，回来之后脑子明显松了一些。',
    category: 'HEALTH',
    moodScore: 5,
    constructivenessScore: 3,
    energyCostScore: 1,
    occurredAt: '2026-05-20T13:20:00+08:00',
    tags: ['散步', '恢复节奏', '身体感'],
  },
  {
    title: '把今天的待办缩成三件事',
    content:
      '原本清单上写了很多零碎项，看起来很热闹但不太容易开始。后来只保留三件今天真的要推进的事，完成感反而更清楚。',
    category: 'WORK',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 2,
    occurredAt: '2026-05-20T15:10:00+08:00',
    tags: ['待办整理', '优先级', '低压力推进'],
  },
  {
    title: '晚上试了一道新的番茄鸡蛋面',
    content:
      '晚饭做了番茄鸡蛋面，多加了一点葱花和黑胡椒。做饭的过程很短，但有一种把生活重新拿回手里的感觉，吃完也挺满足。',
    category: 'LIFE',
    moodScore: 5,
    constructivenessScore: 3,
    energyCostScore: 1,
    occurredAt: '2026-05-20T19:00:00+08:00',
    tags: ['做饭', '生活感', '小满足'],
  },
  {
    title: '给周计划加了一个缓冲格',
    content:
      '今天排周计划时，刻意留出一格空白时间，不把每天都塞满。这个小缓冲让计划看起来没那么紧，也更像真的能执行。',
    category: 'WORK',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 2,
    occurredAt: '2026-05-19T09:20:00+08:00',
    tags: ['计划', '缓冲', '节奏感'],
  },
  {
    title: '读了两页关于注意力的书',
    content:
      '睡前读了两页关于注意力的书，里面提到先减少切换，再追求效率。虽然只读了一小段，但正好提醒我明天可以少开几个窗口。',
    category: 'STUDY',
    moodScore: 4,
    constructivenessScore: 3,
    energyCostScore: 1,
    occurredAt: '2026-05-19T22:10:00+08:00',
    tags: ['阅读', '注意力', '睡前'],
  },
  {
    title: '把一个页面文案改得更柔和',
    content:
      '下午看了一个页面里的提示文案，发现有几句像是在催人。改成更平实的语气之后，页面没有变花，但读起来舒服很多。',
    category: 'PROJECT',
    moodScore: 4,
    constructivenessScore: 5,
    energyCostScore: 2,
    occurredAt: '2026-05-19T16:30:00+08:00',
    tags: ['产品文案', '温和体验', '界面优化'],
  },
  {
    title: '和朋友约了周末喝咖啡',
    content:
      '晚上和朋友简单约了周末喝咖啡，没有安排太满，只是留一个轻松见面的时间。想到周末有个小期待，心情变亮了一点。',
    category: 'SOCIAL',
    moodScore: 5,
    constructivenessScore: 3,
    energyCostScore: 1,
    occurredAt: '2026-05-18T20:40:00+08:00',
    tags: ['朋友', '周末计划', '轻社交'],
  },
  {
    title: '给 AI 标签推荐做了一次观察',
    content:
      '今天看了几次 AI 自动推荐标签的结果，发现短记录更需要上下文提示。这个观察不大，但能帮助后面继续调整输入结构。',
    category: 'PROJECT',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 2,
    occurredAt: '2026-05-18T11:15:00+08:00',
    tags: ['AI标签', '观察', '输入结构'],
  },
  {
    title: '周日把衣柜换季整理了一下',
    content:
      '把厚一点的衣服收起来，常穿的短袖放到更顺手的位置。整理完没有特别隆重的成就感，但之后每天拿衣服会轻松一点。',
    category: 'LIFE',
    moodScore: 4,
    constructivenessScore: 3,
    energyCostScore: 2,
    occurredAt: '2026-05-17T15:30:00+08:00',
    tags: ['整理', '换季', '生活维护'],
  },
  {
    title: '看了一集轻松的纪录片',
    content:
      '晚上看了一集关于城市小店的纪录片，节奏慢慢的。没有想着学什么，只是看别人认真做一件小事，也觉得挺安静。',
    category: 'LIFE',
    moodScore: 5,
    constructivenessScore: 2,
    energyCostScore: 1,
    occurredAt: '2026-05-17T21:00:00+08:00',
    tags: ['纪录片', '放松', '慢节奏'],
  },
  {
    title: '试着用 AI 起了几个菜谱名字',
    content:
      '中午把冰箱里剩下的食材列给 AI，让它帮忙想几个简单菜谱。最后没有完全照做，但得到了一点灵感，晚饭也省心了。',
    category: 'LIFE',
    moodScore: 4,
    constructivenessScore: 3,
    energyCostScore: 1,
    occurredAt: '2026-05-16T12:10:00+08:00',
    tags: ['AI日常', '做饭', '灵感'],
  },
  {
    title: '把浏览器标签页清到只剩五个',
    content:
      '下午关掉了一批已经不需要的标签页，只留下现在真的会用到的几个。屏幕一下子安静很多，也更容易看清下一步。',
    category: 'WORK',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 1,
    occurredAt: '2026-05-16T16:20:00+08:00',
    tags: ['注意力', '浏览器整理', '轻负担'],
  },
  {
    title: '记录了一次顺手的小修复',
    content:
      '发现一个按钮 hover 时颜色不太协调，顺手调了一下。改动很小，但这种小修复积累起来，会让产品慢慢变得更顺眼。',
    category: 'PROJECT',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 1,
    occurredAt: '2026-05-15T18:45:00+08:00',
    tags: ['UI细节', '小修复', '产品手感'],
  },
  {
    title: '下午喝水比平时多了一点',
    content:
      '今天给杯子放在更显眼的位置，下午自然多喝了几口水。不是大改变，但身体的干燥感少了一点，提醒自己环境设计有用。',
    category: 'HEALTH',
    moodScore: 4,
    constructivenessScore: 3,
    energyCostScore: 1,
    occurredAt: '2026-05-15T17:10:00+08:00',
    tags: ['喝水', '环境设计', '身体感'],
  },
  {
    title: '给一个想法画了很粗的草图',
    content:
      '午后没有急着写完整方案，只在纸上画了几个框和箭头。草图很粗，但把想法从脑子里拿出来以后，判断起来轻松很多。',
    category: 'PROJECT',
    moodScore: 4,
    constructivenessScore: 5,
    energyCostScore: 2,
    occurredAt: '2026-05-14T14:00:00+08:00',
    tags: ['草图', '想法整理', '低成本验证'],
  },
  {
    title: '整理了一份常用 prompt 片段',
    content:
      '把最近经常用到的 AI 指令片段放到一个小清单里，按“改写、总结、检查”分了类。以后不用每次都从零开始想。',
    category: 'STUDY',
    moodScore: 4,
    constructivenessScore: 5,
    energyCostScore: 2,
    occurredAt: '2026-05-14T19:35:00+08:00',
    tags: ['AI工具', '提示词', '知识整理'],
  },
  {
    title: '早起后先晒了十分钟太阳',
    content:
      '早上没有立刻看手机，先到窗边晒了一会儿太阳。时间很短，但整个人醒得更自然，上午的节奏也比较稳。',
    category: 'HEALTH',
    moodScore: 5,
    constructivenessScore: 3,
    energyCostScore: 1,
    occurredAt: '2026-05-13T08:05:00+08:00',
    tags: ['早晨', '晒太阳', '节奏感'],
  },
  {
    title: '把一段长说明拆成三句话',
    content:
      '看见一段说明文字有点绕，就试着拆成三句短句。意思没有变，但阅读压力小了很多，也更符合这个产品想要的气质。',
    category: 'WORK',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 1,
    occurredAt: '2026-05-13T11:50:00+08:00',
    tags: ['表达', '文案优化', '清晰度'],
  },
  {
    title: '晚饭后没有加开新任务',
    content:
      '晚饭后本来想再开一个新任务，后来决定只收尾白天没整理完的东西。没有多做，但结束感更清楚，晚上也轻松。',
    category: 'LIFE',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 1,
    occurredAt: '2026-05-12T20:30:00+08:00',
    tags: ['收尾', '边界', '低压力推进'],
  },
  {
    title: '试了一个新的键盘快捷键',
    content:
      '今天学会了一个编辑器里的小快捷键，虽然只是少点几下鼠标，但用起来挺顺。小工具熟一点，做事的阻力就少一点。',
    category: 'STUDY',
    moodScore: 4,
    constructivenessScore: 3,
    energyCostScore: 1,
    occurredAt: '2026-05-12T15:15:00+08:00',
    tags: ['快捷键', '工具熟悉', '效率小事'],
  },
  {
    title: '周一先做了一个很小的版本',
    content:
      '一个想法如果直接做完整版会有点重，于是先做了最小可看的版本。看到东西跑起来以后，再决定下一步要不要加细节。',
    category: 'PROJECT',
    moodScore: 4,
    constructivenessScore: 5,
    energyCostScore: 2,
    occurredAt: '2026-05-11T10:25:00+08:00',
    tags: ['小版本', '验证', '项目推进'],
  },
  {
    title: '把一周照片挑了几张收藏',
    content:
      '晚上翻照片时，把几张喜欢的生活片段单独收藏起来。没有发出去，只是给自己留一点可回看的轻松时刻。',
    category: 'LIFE',
    moodScore: 5,
    constructivenessScore: 2,
    energyCostScore: 1,
    occurredAt: '2026-05-11T21:40:00+08:00',
    tags: ['照片', '生活记录', '小确幸'],
  },
  {
    title: '把桌边的小植物换了位置',
    content:
      '小植物换到光线更好的地方以后，桌面看起来也顺眼一点。这个调整没有成本，但每天抬头看到会有一点好心情。',
    category: 'LIFE',
    moodScore: 5,
    constructivenessScore: 2,
    energyCostScore: 1,
    occurredAt: '2026-05-10T09:45:00+08:00',
    tags: ['植物', '空间感', '好心情'],
  },
  {
    title: '用 AI 帮忙检查了一段说明是否啰嗦',
    content:
      '把一段说明发给 AI，让它只指出哪里重复。结果不一定全采纳，但帮我更快看到可以删掉的部分，文字也轻了一点。',
    category: 'WORK',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 2,
    occurredAt: '2026-05-10T16:05:00+08:00',
    tags: ['AI辅助', '文本检查', '减负'],
  },
  {
    title: '周末做了一次简单拉伸',
    content:
      '下午跟着视频做了十五分钟拉伸，动作都不难。做完肩颈轻了一点，也提醒我不一定要运动很久才算有效。',
    category: 'HEALTH',
    moodScore: 5,
    constructivenessScore: 3,
    energyCostScore: 1,
    occurredAt: '2026-05-09T17:30:00+08:00',
    tags: ['拉伸', '身体维护', '轻运动'],
  },
  {
    title: '整理了一个“下次再看”清单',
    content:
      '把暂时不处理的链接和想法放进一个单独清单。它们没有消失，但也不继续占着今天的注意力，这个分类很有帮助。',
    category: 'WORK',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 1,
    occurredAt: '2026-05-09T11:20:00+08:00',
    tags: ['清单', '注意力', '稍后处理'],
  },
  {
    title: '给房间换了一个淡淡的香薰',
    content:
      '晚上换了一个很淡的香薰味道，没有太抢存在感。房间变得更像可以慢慢待着的地方，收尾一天时很舒服。',
    category: 'LIFE',
    moodScore: 5,
    constructivenessScore: 2,
    energyCostScore: 1,
    occurredAt: '2026-05-08T21:15:00+08:00',
    tags: ['房间', '放松', '生活感'],
  },
  {
    title: '把一个统计数字改成更好读的表达',
    content:
      '原来的统计数字有点像冷冰冰的报表，今天改成更容易理解的短句。数据本身没变，但页面读起来更接近复盘工具。',
    category: 'PROJECT',
    moodScore: 4,
    constructivenessScore: 5,
    energyCostScore: 2,
    occurredAt: '2026-05-08T14:25:00+08:00',
    tags: ['Dashboard', '数据表达', '产品体验'],
  },
  {
    title: '下午泡了一杯热茶慢慢喝',
    content:
      '下午没有再续咖啡，换成一杯热茶。节奏自然慢了一点，手边有个温热的东西，也让继续做事没那么急。',
    category: 'HEALTH',
    moodScore: 4,
    constructivenessScore: 2,
    energyCostScore: 1,
    occurredAt: '2026-05-07T16:10:00+08:00',
    tags: ['热茶', '慢下来', '下午节奏'],
  },
  {
    title: '复用了一段以前写好的组件',
    content:
      '今天没有重新造一套样式，而是把以前已经稳定的组件拿来复用。少写了一些代码，也让界面风格更统一。',
    category: 'PROJECT',
    moodScore: 4,
    constructivenessScore: 5,
    energyCostScore: 1,
    occurredAt: '2026-05-07T10:50:00+08:00',
    tags: ['组件复用', '一致性', '少做一点'],
  },
  {
    title: '睡前把明天第一步写在纸上',
    content:
      '睡前没有继续展开计划，只写下明天打开电脑后第一件要做的小事。这样早上不用重新想，从一个很小的入口开始。',
    category: 'LIFE',
    moodScore: 4,
    constructivenessScore: 4,
    energyCostScore: 1,
    occurredAt: '2026-05-06T22:20:00+08:00',
    tags: ['睡前', '明天入口', '小行动'],
  },
]

const getDatabaseName = () => {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required.')
  }

  return new URL(databaseUrl).pathname.replace(/^\//, '')
}

const assertDemoDatabase = () => {
  const databaseName = getDatabaseName()
  const allowNonDemo = process.env.DEMO_SEED_ALLOW_NON_DEMO === '1'

  if (!databaseName.toLowerCase().includes('demo') && !allowNonDemo) {
    throw new Error(
      `Refusing to seed non-demo database "${databaseName}". Use a demo database or set DEMO_SEED_ALLOW_NON_DEMO=1.`,
    )
  }

  return databaseName
}

const average = (items, key) => {
  const values = items.map((item) => item[key]).filter((value) => typeof value === 'number')

  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
}

const highFrequencyTags = (items, take = 8) => {
  const counts = new Map()

  items.forEach((item) => {
    item.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    })
  })

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'zh-CN'))
    .slice(0, take)
    .map(([tag]) => tag)
}

const main = async () => {
  const databaseName = assertDemoDatabase()
  prisma = new PrismaClient()

  await prisma.user.deleteMany({
    where: { email: defaultUserEmail },
  })

  const user = await prisma.user.create({
    data: {
      email: defaultUserEmail,
      nickname: '展示用用户',
      preference: {
        create: {
          aiTone: 'CALM',
          language: 'zh-CN',
          defaultReviewStyle: '低压力推进',
          weeklyReviewDay: 0,
          enableAiSuggestion: true,
          enableWeeklyReview: true,
        },
      },
    },
  })

  for (const record of records) {
    const savedRecord = await prisma.journalRecord.create({
      data: {
        userId: user.id,
        title: record.title,
        content: record.content,
        category: record.category,
        moodScore: record.moodScore,
        constructivenessScore: record.constructivenessScore,
        energyCostScore: record.energyCostScore,
        occurredAt: new Date(record.occurredAt),
        status: 'ACTIVE',
      },
    })

    for (const name of record.tags) {
      const tag = await prisma.tag.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name,
          },
        },
        update: {},
        create: {
          userId: user.id,
          name,
        },
      })

      await prisma.journalRecordTag.create({
        data: {
          recordId: savedRecord.id,
          tagId: tag.id,
        },
      })
    }
  }

  const currentWeekStart = new Date('2026-05-18T00:00:00+08:00')
  const currentWeekEnd = new Date('2026-05-24T23:59:59.999+08:00')
  const currentWeekRecords = records.filter((record) => {
    const occurredAt = new Date(record.occurredAt)

    return occurredAt >= currentWeekStart && occurredAt <= currentWeekEnd
  })

  await prisma.weeklyReview.create({
    data: {
      userId: user.id,
      weekStart: currentWeekStart,
      weekEnd: currentWeekEnd,
      status: 'STALE',
      title: '本周复盘',
      recordCount: currentWeekRecords.length,
      averageMoodScore: average(currentWeekRecords, 'moodScore'),
      averageConstructiveness: average(currentWeekRecords, 'constructivenessScore'),
      averageEnergyCost: average(currentWeekRecords, 'energyCostScore'),
      highFrequencyTags: JSON.stringify(highFrequencyTags(currentWeekRecords)),
      sourceUpdatedAt: new Date('2026-05-20T19:00:00+08:00'),
    },
  })

  const [recordCount, tagCount, weeklyReviewCount] = await Promise.all([
    prisma.journalRecord.count({ where: { userId: user.id, status: 'ACTIVE' } }),
    prisma.tag.count({ where: { userId: user.id } }),
    prisma.weeklyReview.count({ where: { userId: user.id } }),
  ])

  console.log(
    JSON.stringify(
      {
        databaseName,
        userEmail: user.email,
        recordCount,
        tagCount,
        weeklyReviewCount,
      },
      null,
      2,
    ),
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma?.$disconnect()
  })
