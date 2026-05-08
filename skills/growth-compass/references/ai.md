# AI 接入规则

## 当前决策

第一阶段先做 `AI 推荐标签`。

周复盘生成已接入 STALE 标记：记录新增、编辑、删除后只标记对应自然周过期，不同步调用模型。

编辑记录接口使用当前实现：

```text
PATCH /api/records/:id
```

不要改回 `PUT`，除非用户明确要求重新统一 API 语义。

## 模型与环境变量

第一版使用火山方舟 OpenAI-compatible API。

本地 `.env` 使用：

```env
AI_BASE_URL="https://ark.cn-beijing.volces.com/api/v3"
AI_MODEL_NAME="doubao-seed-2-0-lite-260428"
AI_API_KEY="<只放本地 .env，禁止写入 docs、skill 或提交记录>"
AI_PROVIDER="volcengine"
AI_MOCK_MODE="false"
```

`AI_MOCK_MODE` 是项目侧约定变量，不是火山方舟控制台里的配置项。

含义：

- `true`：不调用真实模型，返回固定结构化结果，便于无 key 或调试 UI 状态。
- `false`：调用真实模型。

所有 AI 调用必须发生在服务端，前端不能暴露 API Key。

## 工程结构

推荐结构：

```text
server/ai/
  client.ts
  types.ts
  tasks/
    suggestTags.ts
    analyzeRecord.ts
    generateWeeklyReview.ts
  schemas/
    suggestTags.ts
    analyzeRecord.ts
    weeklyReview.ts
```

每个 task 应包含：

- `type`
- `promptVersion`
- `buildMessages(input)`
- 输出结构约束
- `parseResult(result)`

底层统一通过 `callAiModel` 调用模型。

AI 接口规则拆分要求：

- API handler 不能写死 prompt 文案、promptVersion、输出 schema 或结果清洗规则。
- API handler 只负责读取请求、做轻量业务校验、补充必要上下文、调用对应 task。
- 每个结构化 AI 任务必须同时有 `tasks/*` 和 `schemas/*` 文件。
- `schemas/*` 负责维护输入清洗、promptVersion、task type、`buildMessages`、输出 JSON 格式要求和 `parseResult`。
- `tasks/*` 负责 mock fallback、调用 `callAiModel`、把模型返回交给 schema parser。
- 新增 AI 任务时先补 schema，再补 task，最后再接 API route 或 service。

当前任务文件对应关系：

```text
server/ai/tasks/suggestTags.ts
server/ai/schemas/suggestTags.ts

server/ai/tasks/analyzeRecord.ts
server/ai/schemas/analyzeRecord.ts

server/ai/tasks/generateWeeklyReview.ts
server/ai/schemas/weeklyReview.ts
```

## Task 顺序

优先级：

1. AI 推荐标签
2. 单条记录 AI 分析
3. 周复盘生成

## AI 推荐标签

接口建议：

```text
POST /api/ai/suggest-tags
```

输入：

```ts
{
  title: string
  content: string
  category?: string
  moodScore?: number
  constructivenessScore?: number
  energyCostScore?: number
  existingTags?: string[]
}
```

输出：

```json
{
  "suggestedTags": ["AI开发", "掌控感", "项目推进", "真实建设感"]
}
```

规则：

- 推荐 3-5 个标签。
- 标签尽量短，建议 2-6 个字。
- 优先复用已有标签。
- 不生成心理诊断类标签。
- 不生成人格评价类标签。
- 不生成攻击性标签。
- 标签描述事件、主题、状态或行为模式。
- 推荐标签不自动保存，必须由用户确认。
- 推荐失败不能影响记录保存。
- 编辑页重新推荐标签时，不自动覆盖已有标签，只推荐可添加的新标签。

前端状态可以先用局部状态：

```text
idle
pending
success
failed
```

## 单条记录 AI 分析

允许改 Prisma schema，以支持状态化 AI 分析。

`AiAnalysis` 后续需要支持：

```text
PENDING
SUCCESS
FAILED
```

建议字段：

- `status`
- `errorMessage`
- `startedAt`
- `completedAt`
- `failedAt`
- `modelName`
- `promptVersion`
- `fullResult`

触发时机：

- 新建记录成功后可触发。
- 编辑记录成功后可触发。
- 用户可在详情页手动重新生成。

原则：

- AI 生成不能阻塞记录保存。
- AI 失败不能影响记录本身。
- 重新生成时新建一条 `AiAnalysis`，不覆盖旧记录。
- `AiAnalysis` 必须有 `updatedAt` 字段，用于识别热更新或进程中断后卡住的 `PENDING`。
- 单条记录 AI 分析如果 `PENDING.updatedAt` 距当前时间超过 1 分钟，应在服务端标记为 `FAILED`，并允许用户重新生成。

## 周复盘生成

周复盘当前实现：

- `PENDING`
- `SUCCESS`
- `FAILED`
- `STALE`

记录新增、编辑、删除后，不同步重新生成周复盘，只标记对应周为 `STALE`。

如果编辑 `occurredAt` 跨周，需要同时标记旧周和新周为 `STALE`。

实现规则：
- 周复盘使用自然周，周一 00:00 到周日 23:59:59。
- 页面查询只读取当前周状态和统计，不自动触发 AI。
- 手动触发接口为 `POST /api/weekly-review/generate`，轮询接口为 `GET /api/weekly-review/:id`。
- 轮询节奏为 `3s -> 5s -> 5s...`，最多 10 次，`SUCCESS` / `FAILED` 后停止。
- `PENDING.updatedAt` 超过 5 分钟会在服务端标记为 `FAILED`，允许重新生成。
- 新增、编辑、删除记录后，只把对应自然周已有 `WeeklyReview` 标记为 `STALE`，不同步调用模型。
- 服务端定时任务 `server/tasks/weekly-review.ts` 每天 09:00 检查当前周；仅在缺失、过期、跨自然天或数据源更新后触发生成。

## 通用 AI 输出规则

所有 AI Task 都必须遵守：

- 平静克制。
- 具体。
- 不鸡血。
- 不做心理诊断。
- 不给用户贴负面标签。
- 不评价人格。
- 不替用户做决定。
- 帮助用户看清真实建设感和内耗来源。
- 最多给一个清晰的小行动。

每次请求都必须显式传入任务规则、输入内容、输出 JSON 格式要求和产品语气规则，不依赖模型记忆。
