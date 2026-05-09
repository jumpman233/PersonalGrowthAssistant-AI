# Growth Compass PRD 最新补充版：AI Task / 轻量 Skill 设计

> 更新时间：2026-05-07  
> 本文档在现有 Growth Compass PRD 基础上，补充 AI 技术选型、AI Task / 轻量 Skill 设计、结构化输出、上下文策略与 Codex 实现说明。

---

## 1. AI 功能总体定位

Growth Compass 的 AI 功能不是聊天机器人，也不是复杂 agent。

当前项目只需要三个结构化 AI Task：

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

核心原则：

```text
规则明确
输入明确
输出结构明确
失败可恢复
结果可追溯
不依赖默认上下文
不影响记录主流程
```

---

## 2. AI 技术选型

### 2.1 模型选择

第一版使用国内模型。

要求：

- 支持服务端 API 调用
- 最好兼容 OpenAI-style API 格式
- 支持 JSON 输出约束，或至少能稳定输出 JSON 文本
- 支持较长上下文，能够处理一周记录列表
- 成本可控
- 响应速度可接受

### 2.2 调用方式

所有 AI 调用必须发生在服务端。

前端不能直接调用模型 API，不能暴露 API Key。

环境变量建议：

```env
AI_API_KEY=""
AI_BASE_URL=""
AI_MODEL_NAME=""
AI_PROVIDER="domestic"
AI_MOCK_MODE="false"
```

### 2.3 是否有上下文

AI API 不应被视为具有长期上下文。

本项目不依赖模型记忆。

每次调用都显式传入：

- 当前任务规则 prompt
- 当前输入内容
- 输出 JSON 格式要求
- 产品语气规则
- 必要的已有标签 / 本周记录 / 统计数据

### 2.4 产品语气规则

每个 AI Task 都应遵循：

- 平静克制
- 具体
- 不鸡血
- 不做心理诊断
- 不给用户贴负面标签
- 不评价人格
- 不替用户做决定
- 帮助用户看清真实建设感和内耗来源
- 最多给一个清晰的小行动

---

## 3. AI Task / 轻量 Skill 工程设计

建议工程命名使用：

```text
AI Task
Prompt Template
Structured AI Processor
```

不建议在工程命名中过度使用 Skill，避免和复杂 agent 概念混淆。

推荐目录：

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

业务接口分开，底层模型调用统一。

建议业务接口：

```text
POST /api/ai/suggest-tags
POST /api/records/:id/ai-analysis
POST /api/weekly-reviews/generate
GET  /api/ai-analyses/:id
```

---

## 4. AI Task 1：推荐标签

### 4.1 目标

降低用户手动打标签成本。

用户主要负责写真实内容，AI 根据标题、内容、分类、评分等信息推荐标签，用户确认后保存。

### 4.2 输入

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

### 4.3 输出

```json
{
  "suggestedTags": ["AI开发", "掌控感", "项目推进", "真实建设感"]
}
```

### 4.4 规则

- 推荐 3-5 个标签
- 标签尽量短，建议 2-6 个字
- 优先复用已有标签
- 不生成心理诊断类标签
- 不生成人格评价类标签
- 不生成攻击性标签
- 标签描述事件、主题、状态或行为模式
- 推荐标签不自动保存，必须用户确认

### 4.5 交互状态

标签推荐是轻量 AI 能力，可以先使用前端局部状态：

```text
idle
pending
success
failed
```

失败不影响记录保存。

### 4.6 数据处理

推荐阶段不直接写入 Tag 表。

用户保存记录时，根据最终 tags：

- 已存在 Tag 则复用
- 不存在则创建
- 建立 JournalRecordTag 关联

---

## 5. AI Task 2：单条记录 AI 分析

### 5.1 目标

根据单条记录生成结构化复盘结果。

### 5.2 输入

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

### 5.3 输出

```json
{
  "summary": "事件摘要",
  "emotionKeywords": ["掌控感", "轻微紧张", "推进感"],
  "energyCostNote": "主要内耗来源",
  "constructivenessNote": "真实建设感来源",
  "nextAction": "下一步建议"
}
```

### 5.4 生成时机

- 新建记录成功后
- 编辑记录成功后
- 用户手动重新生成

AI 生成不能阻塞记录保存。

记录保存是主流程，AI 分析是保存成功后的反馈增强。

### 5.5 状态模型

单条记录分析使用 AiAnalysis 表状态：

```text
PENDING
SUCCESS
FAILED
```

无分析记录时，前端推导为 NONE。

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

### 5.6 详情页交互状态

详情页 AI 区状态：

- NONE：显示“生成 AI 总结”
- PENDING：显示生成中，并启动轮询
- SUCCESS：展示分析结果，并显示“重新生成 AI 总结”
- FAILED：显示失败提示和“重试生成”

pending 文案示例：

```text
正在整理这条记录里的模式……
记录已经保存，你可以先查看原始内容。
```

失败文案示例：

```text
这次没有生成成功，记录已经保存，可以稍后重试。
```

### 5.7 轮询规则

当详情页发现最新 AiAnalysis.status = PENDING 时：

- 每 2-3 秒请求一次状态
- SUCCESS 后停止
- FAILED 后停止
- 用户离开页面时停止
- 最大轮询时间建议 60 秒
- 不无限轮询
- 轮询期间不重复触发新的 AI 生成任务

### 5.8 重新生成

重新生成时建议新建一条 AiAnalysis，不覆盖旧记录。

详情页默认展示最新一条 AiAnalysis。

第一版暂不展示 AI 历史版本。

---

## 6. AI Task 3：周复盘生成

### 6.1 目标

根据本周所有记录和统计数据，生成结构化周复盘。

### 6.2 输入

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

### 6.3 输出

```json
{
  "mainProgress": "本周主要推进",
  "mainEnergyCost": "本周主要内耗",
  "repeatedPatterns": "重复出现的模式",
  "nextWeekAction": "下周最小行动"
}
```

### 6.4 WeeklyReview 状态

WeeklyReview 使用状态：

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

### 6.5 记录变更后的处理

记录新增、编辑、删除时，不立即重新生成周复盘，而是标记对应 WeeklyReview 为 STALE。

规则：

- 新增记录：标记该记录所在周 STALE
- 删除记录：标记该记录所在周 STALE
- 编辑记录：如果内容、评分、分类、标签、occurredAt 等影响复盘的字段变化，标记 STALE
- 如果编辑 occurredAt 导致跨周，需要同时标记旧周和新周 STALE

### 6.6 查询时判断是否重新生成

查询 Dashboard / 周复盘页时判断：

- WeeklyReview 不存在
- status = STALE
- latestRecordUpdatedAt > generatedAt
- generatedAt 不属于当前自然天

“超过 1 天”按自然天判断，不按 24 小时判断。

例如：

```text
5月20日 23:50 生成
5月21日 00:10 查询
```

虽然只过了 20 分钟，但已经跨自然天，应视为需要重新生成。

### 6.7 统计与 AI 文案分离

周复盘有两类内容：

1. 可计算统计
   - 本周记录数
   - 平均心情
   - 平均建设感
   - 平均内耗
   - 高频标签

2. AI 生成内容
   - 本周主要推进
   - 本周主要内耗
   - 重复出现的模式
   - 下周最小行动

统计数据可以实时计算或快速刷新。

AI 文案采用状态模型异步生成。

不要为了更新简单统计强制同步调用 AI。

---

## 7. Mock 模式

本地开发可以支持 mock 模式。

环境变量：

```env
AI_MOCK_MODE="true"
```

mock 模式下：

- 不调用真实模型
- 返回固定结构化结果
- 便于前端调试 pending / success / failed 状态
- 便于无 API Key 时开发

---

## 8. 暂不做

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

## 9. 总结

Growth Compass 的 AI 层是三个可控、可测试、可版本管理的结构化任务：

```text
AI 推荐标签
单条记录分析
周复盘生成
```

一句话：

> 把 AI 从“聊天”降级成三个可控的结构化任务，让它降低记录成本、提供复盘反馈，而不是替用户做决定。
