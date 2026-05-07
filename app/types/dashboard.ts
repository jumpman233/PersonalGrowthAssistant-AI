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
  id: string
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

export interface DashboardAiInsight {
  summary: string
  suggestion: string
}

export interface DashboardApiData {
  stats: DashboardStat[]
  records: RecentRecordEntry[]
  aiInsight: DashboardAiInsight
  trend: WeeklyTrendEntry[]
  tags: string[]
}
