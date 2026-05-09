import type { DashboardStat, WeeklyTrendEntry } from '../../app/types/dashboard'

export type DashboardScore = number | null | undefined

export type DashboardTrendRecord = {
  occurredAt: Date | null
  constructivenessScore: DashboardScore
  energyCostScore: DashboardScore
}

export type DashboardTaggedRecord = {
  tags: {
    tag: {
      name: string
    }
  }[]
}

const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export const formatDashboardScore = (value: DashboardScore) => {
  if (value === null || value === undefined) {
    return '-'
  }

  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}

export const calculateAverageDashboardScore = (values: DashboardScore[]) => {
  const validValues = values.filter((value): value is number => typeof value === 'number')

  if (validValues.length === 0) {
    return null
  }

  return Number((validValues.reduce((sum, value) => sum + value, 0) / validValues.length).toFixed(1))
}

export const calculateDashboardStats = (
  recordCount: number,
  averageConstructiveness: DashboardScore,
  averageEnergyCost: DashboardScore,
  averageMoodScore: DashboardScore,
): DashboardStat[] => [
  {
    label: '本周记录',
    value: recordCount.toString(),
    note: '持续记录的每一步都很重要',
    icon: '▣',
    tone: 'from-orange-100 to-rose-50 text-orange-500',
  },
  {
    label: '平均建设感',
    value: formatDashboardScore(averageConstructiveness),
    note: '分辨什么在真正建设你',
    icon: '♡',
    tone: 'from-amber-100 to-orange-50 text-amber-600',
  },
  {
    label: '平均内耗',
    value: formatDashboardScore(averageEnergyCost),
    note: '识别内耗，保护你的能量',
    icon: '◆',
    tone: 'from-cyan-100 to-teal-50 text-cyan-600',
  },
  {
    label: '情绪稳定度',
    value: formatDashboardScore(averageMoodScore),
    note: '稳住情绪，才能走得更远',
    icon: '♥',
    tone: 'from-rose-100 to-orange-50 text-rose-500',
  },
]

export const calculateHighFrequencyTags = (records: DashboardTaggedRecord[], limit = 5) => {
  const tagCounts = records.reduce((counts, record) => {
    record.tags.forEach(({ tag }) => {
      counts.set(tag.name, (counts.get(tag.name) ?? 0) + 1)
    })

    return counts
  }, new Map<string, number>())

  return Array.from(tagCounts.entries())
    .sort(([leftTag, leftCount], [rightTag, rightCount]) => {
      if (rightCount !== leftCount) {
        return rightCount - leftCount
      }

      return leftTag.localeCompare(rightTag, 'zh-CN')
    })
    .slice(0, limit)
    .map(([tag]) => tag)
}

export const buildWeeklyTrendFromRecords = (
  records: DashboardTrendRecord[],
  weekStart: Date,
): WeeklyTrendEntry[] =>
  Array.from({ length: 7 }, (_, index) => {
    const current = new Date(weekStart)
    current.setDate(weekStart.getDate() + index)

    const sameDayRecords = records.filter((record) => {
      const occurredAt = record.occurredAt

      return (
        occurredAt &&
        occurredAt.getFullYear() === current.getFullYear() &&
        occurredAt.getMonth() === current.getMonth() &&
        occurredAt.getDate() === current.getDate()
      )
    })

    return {
      day: dayLabels[current.getDay()],
      growth: calculateAverageDashboardScore(
        sameDayRecords.map((record) => record.constructivenessScore),
      ) ?? 0,
      drain: calculateAverageDashboardScore(sameDayRecords.map((record) => record.energyCostScore)) ?? 0,
    }
  })
