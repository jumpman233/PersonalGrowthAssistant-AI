# Codex Notes

## 2026-05-07 11:37 +08:00

已重新读取并记录 `docs/prd.md` 更新版。

当前产品优先级：

```text
记录系统稳定 > 页面链路完整 > 数据库真实数据 > AI 功能接入
```

当前最重要闭环：

```text
新建记录 -> 保存到数据库 -> 列表展示 -> 详情查看 -> 编辑 / 删除
```

当前执行边界：

- 先完成记录 CRUD、详情、新建、编辑、删除。
- AI 功能后置，当前不要接真实 AI API。
- AI 相关设计可以预留状态模型和 UI 占位。
- 后续 AI 分析按异步任务模型处理：`PENDING` / `SUCCESS` / `FAILED`。
- AI 失败不能影响记录保存和原始记录展示。
- 不要无限轮询，不要无限自动重试。

已读取 `docs/detail_detail.md`，这份文档是后续 AI 功能和表单路由设计的待办记录，当前只记录不执行。

提醒触发点：

```text
当 /records/new 新建记录功能和 /records/[id]/edit 编辑记录功能完成后，
提醒用户：docs/detail_detail.md 中记录的 AI 状态、AI 分析触发、轮询与详情页 AI 区域设计可以开始进入实现阶段。
```

## 2026-05-07 12:00 +08:00

记录后续需求：WeeklyReview 重构。当前只记录，不执行。

背景：

- 后续会有周复盘功能。
- 周复盘基于本周所有 `JournalRecord` 生成，包括统计数据和 AI 总结。
- 记录新增、编辑、删除后，周复盘的数据源会变化，因此需要建立周复盘的过期和重新生成机制。

模型变更建议：

- `WeeklyReview` 增加：
  - `updatedAt: DateTime @updatedAt`
  - `generatedAt: DateTime?`
  - `sourceUpdatedAt: DateTime?`
  - `errorMessage: String?`
  - `status: WeeklyReviewStatus`
- 新增 `WeeklyReviewStatus` 枚举：
  - `PENDING`：正在生成
  - `SUCCESS`：生成成功
  - `FAILED`：生成失败
  - `STALE`：数据源变化，需要重新生成

记录变更后的处理原则：

- 新增、编辑、删除记录时，不要同步重新生成周复盘，只标记对应周的 `WeeklyReview` 为 `STALE`。
- 新增记录：标记该记录 `occurredAt` 或 `createdAt` 所在周为 `STALE`。
- 删除记录：标记该记录所在周为 `STALE`。
- 编辑记录：如果内容、评分、分类、标签、`occurredAt` 等影响复盘的字段变化，需要标记 `STALE`。
- 如果编辑 `occurredAt` 导致记录跨周，需要同时标记旧周和新周为 `STALE`。

查询与重新生成触发条件：

- 查询周复盘或 Dashboard summary 时判断是否需要重新生成。
- 触发条件包括：
  - `WeeklyReview` 不存在
  - `WeeklyReview.status === STALE`
  - `latestRecordUpdatedAt > WeeklyReview.generatedAt`
  - `WeeklyReview.generatedAt` 不属于当前自然天
- “超过 1 天”按自然天判断，不按 24 小时判断。
- 例如 5 月 20 日 23:50 生成，5 月 21 日 00:10 查询，应视为跨自然天。
- 第一版可以按服务器本地时区处理，后续再支持用户时区。

重新生成流程：

- 先将 `WeeklyReview.status` 设为 `PENDING`。
- 生成成功后设为 `SUCCESS`，写入：
  - `aiSummary`
  - `mainProgress`
  - `mainEnergyCost`
  - `repeatedPatterns`
  - `highFrequencyTags`
  - `nextWeekAction`
  - `generatedAt`
  - `sourceUpdatedAt`
- 生成失败后设为 `FAILED`，并写入 `errorMessage`。
- 不要因为 AI 生成失败影响 `JournalRecord` 本身。

接口与前端状态：

- 查询接口需要返回 `WeeklyReview` 状态。
- 前端根据状态展示：
  - `PENDING`：正在生成本周复盘
  - `SUCCESS`：展示周复盘内容
  - `FAILED`：展示失败提示和重试按钮
  - `STALE`：可以展示旧内容，同时提示正在更新，或触发重新生成

统计与 AI 总结边界：

- 本周记录数、平均心情分、平均建设感、平均消耗、高频标签等统计数据可以实时计算或快速刷新。
- AI 总结内容采用状态模型异步生成。
- 不要为了更新简单统计就强制同步调用 AI。

暂不实现：

- 不做复杂任务队列。
- 不做 WebSocket / SSE。
- 不做 AI 历史版本展示。
- 不做多人并发复杂处理。
