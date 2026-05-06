# Records API

## GET `/api/records`

记录列表页数据接口。页面层通过 `useFetch('/api/records')` 获取数据。

## Query

```ts
interface RecordsApiQuery {
  page?: number // 默认 1
  pageSize?: number // 默认 10，最大 50
  category?: RecordCategory | 'ALL'
  tag?: string
  timeRange?: 'latest7days' | 'thisMonth' | 'all'
}
```

`timeRange` 默认值为 `latest7days`。列表页当前会显式传入 `all` 作为默认筛选，方便展示本地示例数据。

分类固定对应 Prisma `RecordCategory`：

```text
WORK -> 职业
RELATIONSHIP -> 关系
EMOTION -> 情绪
STUDY -> 学习
LIFE -> 生活
PROJECT -> 项目
HEALTH -> 健康
SOCIAL -> 社交
OTHER -> 其他
```

## Response

```ts
interface RecordsApiData {
  filters: {
    tags: RecordsTagOption[]
  }
  summary: RecordsSummary
  records: RecordsListItem[]
  highFrequencyTags: string[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}
```

字段归属：

- 分类筛选：前端固定配置
- 时间筛选：前端固定配置
- 标签筛选：服务端从 `Tag` 返回真实标签
- 记录列表：服务端从 `JournalRecord`、`Tag`、`JournalRecordTag` 返回
- 本周小统计：服务端从 `WeeklyReview` 优先返回，缺省时聚合记录
- 高频标签：服务端从 `WeeklyReview.highFrequencyTags` 优先返回
