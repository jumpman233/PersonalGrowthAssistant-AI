export interface DashboardStat {
  label: string
  value: string
  note: string
  icon: string
  tone: string
}

export interface QuickRecordEntry {
  title: string
  copy: string
  icon: string
  tone: string
}

export interface RecentRecordEntry {
  title: string
  category: string
  copy: string
  score: string
  time: string
  tags: string[]
  icon: string
  tone: string
}

export interface WeeklyTrendEntry {
  day: string
  growth: number
  drain: number
}

export const useDashboardData = () => {
  const navItems = ['x', '◐', '▤', '♡', '+', '⇄', '▣', 'ⓘ', '⌑']

  const stats: DashboardStat[] = [
    {
      label: '本周记录',
      value: '6',
      note: '持续记录的每一步都很重要',
      icon: '▣',
      tone: 'from-orange-100 to-rose-50 text-orange-500',
    },
    {
      label: '平均建设感',
      value: '3.8',
      note: '分辨什么在真正建设你',
      icon: '⌁',
      tone: 'from-amber-100 to-orange-50 text-amber-600',
    },
    {
      label: '平均消耗',
      value: '2.6',
      note: '识别消耗，保护你的能量',
      icon: '◔',
      tone: 'from-cyan-100 to-teal-50 text-cyan-600',
    },
    {
      label: '情绪稳定度',
      value: '4.1',
      note: '稳住情绪，才能走得更远',
      icon: '♡',
      tone: 'from-rose-100 to-orange-50 text-rose-500',
    },
  ]

  const quickRecords: QuickRecordEntry[] = [
    {
      title: '职业复盘',
      copy: '记录工作与成长，识别真正有价值的推进。',
      icon: '▤',
      tone: 'bg-cyan-50 text-cyan-700',
    },
    {
      title: '关系复盘',
      copy: '梳理互动与感受，经营真实而健康的关系。',
      icon: '♧',
      tone: 'bg-green-50 text-green-700',
    },
    {
      title: '情绪复盘',
      copy: '觉察情绪起伏，理解自己，找回内在锚点。',
      icon: '♡',
      tone: 'bg-rose-50 text-rose-600',
    },
  ]

  const records: RecentRecordEntry[] = [
    {
      title: '用 Nuxt 自动作品项目',
      category: '职业',
      copy: '搭建项目框架与核心功能，梳理模块化方案，完成首页和导航，感受到清晰的推进感。',
      score: '建设感 4 / 消耗 2',
      time: '5月20日 10:32',
      tags: ['AI开发', '输出实效', '长期项目'],
      icon: '▱',
      tone: 'bg-orange-50 text-orange-500',
    },
    {
      title: '朋友新群聚会 AI 小工具 AI',
      category: '关系',
      copy: '分享阶段性想法和进展，收到一些反馈和建议，感觉连接和支持都在。',
      score: '建设感 3 / 消耗 2',
      time: '5月19日 21:15',
      tags: ['分享', '无压力交流', '连接'],
      icon: '♧',
      tone: 'bg-green-50 text-green-600',
    },
    {
      title: '一个人打球',
      category: '情绪',
      copy: '下班后去球场打了一个小时，出汗后情绪平稳了很多，脑子也清空了。',
      score: '建设感 4 / 消耗 3',
      time: '5月19日 19:02',
      tags: ['运动', '独处', '恢复节奏'],
      icon: '⌁',
      tone: 'bg-rose-50 text-rose-500',
    },
  ]

  const trend: WeeklyTrendEntry[] = [
    { day: '周一', growth: 3.9, drain: 2.1 },
    { day: '周二', growth: 5.0, drain: 2.4 },
    { day: '周三', growth: 3.2, drain: 1.8 },
    { day: '周四', growth: 4.2, drain: 2.0 },
    { day: '周五', growth: 5.2, drain: 3.7 },
    { day: '周六', growth: 4.1, drain: 1.5 },
    { day: '周日', growth: 2.9, drain: 1.9 },
  ]

  const tags = ['真实建设感', 'AI 开发', '掌控感', '恢复节奏', '低压力推进']

  return {
    navItems,
    stats,
    quickRecords,
    records,
    trend,
    tags,
  }
}
