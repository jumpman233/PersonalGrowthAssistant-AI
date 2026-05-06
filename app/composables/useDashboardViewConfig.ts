import type { QuickRecordEntry } from '~/types/dashboard'

export const useDashboardViewConfig = () => {
  const navItems = ['x', '◐', '▤', '♡', '+', '⇄', '▣', 'ⓘ', '⌑']

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

  return {
    navItems,
    quickRecords,
  }
}
