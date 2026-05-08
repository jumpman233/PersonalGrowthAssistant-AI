# Dashboard API

## GET `/api/dashboard`

首页 Dashboard 的服务端数据接口。页面层通过 `useFetch('/api/dashboard')` 获取数据。

当前数据来自本地 PostgreSQL，默认读取用户：

```text
local@personal-growth.local
```

## Response

```ts
interface DashboardApiData {
  stats: DashboardStat[]
  records: RecentRecordEntry[]
  aiInsight: DashboardAiInsight
  trend: WeeklyTrendEntry[]
  tags: string[]
}
```

字段归属：

- `stats`：服务端统计，本周记录数、平均建设感、平均内耗、情绪稳定度
- `records`：服务端最近记录，来自 `JournalRecord`
- `aiInsight`：服务端周复盘观察，来自 `WeeklyReview`
- `trend`：服务端按周聚合趋势，来自 `JournalRecord`
- `tags`：服务端高频标签，优先来自 `WeeklyReview.highFrequencyTags`

前端展示配置不在此接口返回，例如左侧导航、品牌、Hero 文案、快捷记录入口。
