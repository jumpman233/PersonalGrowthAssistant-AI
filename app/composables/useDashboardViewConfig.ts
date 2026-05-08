import type { QuickRecordEntry } from '~/types/dashboard'

export const useDashboardViewConfig = () => {
  const quickRecords: QuickRecordEntry[] = [
    {
      title: '记录一次职业推进',
      copy: '写下工作与成长里真正有价值的推进。',
      icon: '▦',
      tone: 'bg-cyan-50 text-cyan-700',
      to: '/records/new?category=WORK',
    },
    {
      title: '记录一次关系互动',
      copy: '看看这次互动带来了连接、内耗，还是边界感。',
      icon: '♡',
      tone: 'bg-green-50 text-green-700',
      to: '/records/new?category=RELATIONSHIP',
    },
    {
      title: '记录一次情绪起伏',
      copy: '不急着解决，先看清情绪从哪里来。',
      icon: '☁',
      tone: 'bg-rose-50 text-rose-600',
      to: '/records/new?category=EMOTION',
    },
  ]

  return {
    quickRecords,
  }
}
