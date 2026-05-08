# API 与模型边界

## 当前核心 API

Records：

- `GET /api/records`
- `POST /api/records`
- `GET /api/records/:id`
- `DELETE /api/records/:id`

Tags：

- `GET /api/tags`

Dashboard：

- `GET /api/dashboard`

未来 AI 推荐标签：

- `POST /api/ai/suggest-tags`

编辑记录：

- `PATCH /api/records/:id`

## 用户假设

当前后端使用默认本地用户：

```text
local@personal-growth.local
```

除非用户明确要求，不要引入完整多用户登录。

## 删除语义

记录删除是软删除，通过 `JournalRecord.status = DELETED` 实现。

已删除记录不应该出现在列表、Dashboard 或统计中。

## 标签

保存记录时：

- trim 标签。
- 移除空标签。
- 去重。
- 按 `(userId, name)` 复用已有 Tag。
- 不存在则创建 Tag。
- 创建 JournalRecordTag 关联。

## WeeklyReview 未来模型

未来 WeeklyReview 状态：

- PENDING
- SUCCESS
- FAILED
- STALE

建议字段：

- updatedAt
- generatedAt
- sourceUpdatedAt
- errorMessage
- status

记录新增、编辑、删除后，不要同步重新生成 WeeklyReview，只标记对应周为 STALE。

需要重新生成的判断条件包括：

- WeeklyReview 不存在。
- status 是 STALE。
- latestRecordUpdatedAt > generatedAt。
- generatedAt 不属于当前自然天。

“超过 1 天”按自然天判断，不按 24 小时判断。
