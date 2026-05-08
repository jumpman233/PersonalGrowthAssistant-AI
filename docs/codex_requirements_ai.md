# Codex 记录：Growth Compass AI Task / 轻量 Skill 需求

> 现在不要执行，只记录需求。后续接入 AI 功能时按此设计实现。

---

## 1. 总体判断

Growth Compass 的 AI 功能不是聊天机器人，也不是复杂 agent。

本项目只需要三个结构化 AI Task：

1. AI 推荐标签
2. 单条记录 AI 分析
3. 周复盘生成

它们本质上是极轻量级 skill / task template：

```text
固定任务类型
+ 固定输入结构
+ 固定规则 prompt
+ 固定输出 JSON schema
```

每次调用都显式传入规则和内容，不依赖模型默认上下文。

---

## 2. AI 技术选型

第一版使用国内模型。

要求：

- 所有 AI 调用发生在服务端
- 前端不能暴露 API Key
- 最好支持 OpenAI-compatible API
- 输出尽量使用 JSON
- 失败不能影响记录保存
- 支持 mock 模式，方便本地开发

环境变量建议：

```env
AI_API_KEY=""
AI_BASE_URL=""
AI_MODEL_NAME=""
AI_PROVIDER="domestic"
AI_MOCK_MODE="false"
```

---

## 3. 工程结构建议

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

每个 task 包含：

- type
- promptVersion
- buildMessages(input)
- schema / output contract
- parseResult(result)

底层统一调用：

```ts
await callAiModel({
  task,
  input,
  schema,
  promptVersion,
})
```

业务接口分开：

```text
POST /api/ai/suggest-tags
POST /api/records/:id/ai-analysis
POST /api/weekly-reviews/generate
GET  /api/ai-analyses/:id
```

---

## 4. 上下文策略

AI API 不应被视为具有长期上下文。

每次请求必须显式传入：

- 当前任务规则 prompt
- 当前输入内容
- 输出 JSON 格式要求
- 产品语气规则
- 必要的已有标签 / 本周记录 / 统计数据

不要依赖模型记忆。

---

## 5. 通用产品语气规则

所有 AI Task 都要遵循：

- 平静克制
- 具体
- 不鸡血
- 不做心理诊断
- 不给用户贴负面标签
- 不评价人格
- 不替用户做决定
- 帮助用户看清真实建设感和消耗来源
- 最多给一个清晰的小行动

---

## 6. Task 1：AI 推荐标签

### 目标

降低用户手动打标签成本。

用户写内容，AI 推荐标签，用户确认后保存。

### 输入

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

### 输出

```json
{
  "suggestedTags": ["AI开发", "掌控感", "项目推进", "真实建设感"]
}
```

### 规则

- 推荐 3-5 个标签
- 标签尽量短，建议 2-6 个字
- 优先复用已有标签
- 不生成心理诊断类标签
- 不生成人格评价类标签
- 不生成攻击性标签
- 标签描述事件、主题、状态或行为模式
- 推荐标签不自动保存，必须用户确认

### 状态

标签推荐是轻量 AI 能力，可以先使用前端局部状态：

```text
idle
pending
success
failed
```

失败不影响记录保存。

---

## 7. Task 2：单条记录 AI 分析

### 目标

根据单条记录生成结构化分析。

### 输入

```ts
{
  title: string
  content: string
  category: string
  moodScore?: number
  constructivenessScore?: number
  energyCostScore?: number
  tags?: string[]
  occurredAt?: string
}
```

### 输出

```json
{
  "summary": "事件摘要",
  "emotionKeywords": ["掌控感", "轻微紧张", "推进感"],
  "energyCostNote": "主要消耗来源",
  "constructivenessNote": "真实建设感来源",
  "nextAction": "下一步建议"
}
```

### 生成时机

- 新建记录成功后
- 编辑记录成功后
- 用户手动重新生成

AI 生成不能阻塞记录保存。

### AiAnalysis 状态

需要支持：

```text
PENDING
SUCCESS
FAILED
```

无记录时由前端推导为 NONE。

建议字段：

```text
status
errorMessage
startedAt
completedAt
failedAt
modelName
promptVersion
fullResult
```

### 详情页状态

- NONE：显示“生成 AI 总结”
- PENDING：显示生成中状态，并启动轮询
- SUCCESS：展示结果，并显示“重新生成 AI 总结”
- FAILED：显示失败提示和“重试生成”

pending 文案：

```text
正在整理这条记录里的模式……
记录已经保存，你可以先查看原始内容。
```

失败文案：

```text
这次没有生成成功，记录已经保存，可以稍后重试。
```

### 轮询规则

当详情页发现最新 AiAnalysis.status = PENDING 时：

- 每 2-3 秒请求一次状态
- SUCCESS 后停止
- FAILED 后停止
- 用户离开页面时停止
- 最大轮询时间建议 60 秒
- 不无限轮询
- 轮询期间不重复触发新的 AI 生成任务

---

## 8. Task 3：周复盘生成

### 目标

根据本周所有记录和统计数据生成周复盘。

### 输入

```ts
{
  weekStart: string
  weekEnd: string
  records: Array<{
    title: string
    content: string
    category: string
    moodScore?: number
    constructivenessScore?: number
    energyCostScore?: number
    tags?: string[]
    occurredAt?: string
  }>
  stats: {
    recordCount: number
    averageMoodScore?: number
    averageConstructiveness?: number
    averageEnergyCost?: number
    highFrequencyTags?: string[]
  }
}
```

### 输出

```json
{
  "mainProgress": "本周主要推进",
  "mainEnergyCost": "本周主要消耗",
  "repeatedPatterns": "重复出现的模式",
  "nextWeekAction": "下周最小行动"
}
```

### WeeklyReview 状态

需要支持：

```text
PENDING
SUCCESS
FAILED
STALE
```

含义：

- PENDING：正在生成
- SUCCESS：生成成功
- FAILED：生成失败
- STALE：数据源变化，需要重新生成

建议字段：

```text
updatedAt
generatedAt
sourceUpdatedAt
errorMessage
status
```

### 记录变更后的处理

记录新增、编辑、删除时，不立即重新生成周复盘，而是标记对应 WeeklyReview 为 STALE。

规则：

- 新增记录：标记该记录所在周 STALE
- 删除记录：标记该记录所在周 STALE
- 编辑记录：如果内容、评分、分类、标签、occurredAt 等影响复盘的字段变化，标记 STALE
- 如果编辑 occurredAt 导致跨周，需要同时标记旧周和新周 STALE

### 查询时判断是否重新生成

查询 Dashboard / 周复盘页时判断：

- WeeklyReview 不存在
- status = STALE
- latestRecordUpdatedAt > generatedAt
- generatedAt 不属于当前自然天

“超过 1 天”按自然天判断，不按 24 小时判断。

---

## 9. 统计与 AI 文案分离

周复盘有两类内容：

1. 可计算统计
   - 本周记录数
   - 平均心情
   - 平均建设感
   - 平均消耗
   - 高频标签

2. AI 生成内容
   - 本周主要推进
   - 本周主要消耗
   - 重复出现的模式
   - 下周最小行动

统计数据可以实时计算或快速刷新。

AI 文案采用状态模型异步生成。

不要为了更新简单统计强制同步调用 AI。

---

## 10. Mock 模式

本地开发需要支持 mock 模式：

```env
AI_MOCK_MODE="true"
```

mock 模式下：

- 不调用真实模型
- 返回固定结构化结果
- 方便调试 pending / success / failed 状态
- 方便无 API Key 时开发

---

## 11. 暂不做

当前阶段暂不做：

- 聊天机器人
- 多轮对话上下文
- agent 自动执行
- 工具调用链
- 复杂任务队列
- WebSocket / SSE
- AI 历史版本展示
- 多模型调度
- 向量检索
- embedding
- 复杂 prompt 管理后台

---

## 12. 总结

Growth Compass 的 AI 层是三个可控、可测试、可版本管理的结构化任务：

```text
AI 推荐标签
单条记录分析
周复盘生成
```

核心原则：

> 把 AI 从“聊天”降级成三个可控的结构化任务，让它降低记录成本、提供复盘反馈，而不是替用户做决定。
