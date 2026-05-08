# 给 Codex 的新增需求记录（现在只记录，不执行）

> 这份内容用于让 Codex 了解后续 AI 功能和表单路由设计。  
> 当前不要执行这些 AI 相关开发，不要接真实模型，不要新增 OpenAI 调用。

---

## 一、当前阶段判断

当前 Growth Compass 项目先完成记录系统，不急着接 AI。

当前优先级：

```text
记录 CRUD / 详情 / 新建 / 编辑 / 删除
>
Dashboard 与记录列表真实数据链路
>
AI 单条分析
>
周复盘
```

AI 是产品亮点，但不是当前地基。  
当前地基是：

```text
新建记录 → 保存到数据库 → 列表展示 → 详情查看 → 编辑 / 删除
```

---

## 二、新建和编辑的页面设计

### 路由设计

新建和编辑使用不同路由：

```text
/records/new
/records/[id]/edit
```

但复用同一个表单组件：

```text
components/records/RecordForm.vue
```

推荐结构：

```text
pages/
  records/
    new.vue
    [id]/
      index.vue
      edit.vue

components/
  records/
    RecordForm.vue
```

### RecordForm 字段

RecordForm 需要支持：

- title
- content
- category
- moodScore
- constructivenessScore
- energyCostScore
- tags

### 新建页要求

```text
/records/new
```

负责：

1. 初始化空表单
2. 提交时调用 `POST /api/records`
3. 成功后跳转到 `/records/:id`
4. 后续接 AI 时，新建成功后触发 AI 分析

### 编辑页要求

```text
/records/[id]/edit
```

负责：

1. 根据 route params.id 拉取已有记录
2. 将已有数据填入 RecordForm
3. 提交时调用 `PUT /api/records/:id`
4. 成功后跳转回 `/records/:id`
5. 后续接 AI 时，编辑成功后触发重新生成 AI 分析

### 注意

不要在 new.vue 和 edit.vue 中复制两套表单 UI。  
表单 UI 只放在 RecordForm 中。  
new.vue / edit.vue 只负责数据获取、提交和跳转。

---

## 三、AI 功能后置原则

当前不要接入真实 AI 模型。

不要做：

1. 不要新增 OpenAI API 调用
2. 不要实现真实单条 AI 分析
3. 不要实现周复盘生成
4. 不要引入 WebSocket / SSE
5. 不要引入复杂任务队列
6. 不要做 AI 历史版本展示

可以先保留：

1. AI 总结 UI 占位
2. 未来 AiAnalysis 数据结构预留
3. 详情页 AI 状态展示结构预留
4. 重新生成按钮占位

---

## 四、单条 AI 分析的生成时机

后续接 AI 时，单条 AI 总结的生成时机应该是：

1. 新建记录成功后
2. 编辑记录成功后
3. 用户在详情页点击“重新生成 AI 总结”

核心原则：

```text
记录保存是主流程。
AI 总结是保存成功后的反馈增强。
AI 失败不能影响记录保存。
```

### 新建记录后

推荐链路：

```text
POST /api/records
↓
JournalRecord 保存成功
↓
跳转 /records/:id
↓
触发 AI 分析生成
↓
详情页展示 pending 状态
↓
生成成功后展示 AI 总结
```

### 编辑记录后

推荐链路：

```text
PUT /api/records/:id
↓
JournalRecord 更新成功
↓
跳转 /records/:id
↓
触发 AI 分析重新生成
↓
详情页展示 pending 状态
↓
生成成功后展示最新 AI 总结
```

---

## 五、AI 分析应按异步状态模型设计

AI 总结不要当成普通同步请求。

它应该是一个有状态的异步分析任务。

状态包括：

```text
NONE：还没有 AI 分析
PENDING：正在生成
SUCCESS：生成成功
FAILED：生成失败
```

其中 `NONE` 可以由“查不到 AiAnalysis”推导，不一定是数据库字段。

数据库建议枚举：

```text
PENDING
SUCCESS
FAILED
```

---

## 六、AiAnalysis 表字段预留建议

后续建议给 AiAnalysis 增加：

```text
status
errorMessage
startedAt
completedAt
failedAt
```

建议枚举：

```prisma
enum AiAnalysisStatus {
  PENDING
  SUCCESS
  FAILED
}
```

字段含义：

- status：AI 分析状态
- errorMessage：失败原因
- startedAt：开始生成时间
- completedAt：生成完成时间
- failedAt：生成失败时间

生成成功后写入：

- summary
- emotionKeywords
- behaviorPatterns
- constructivenessNote
- energyCostNote
- nextAction
- fullResult
- modelName
- promptVersion

重新生成时：

1. 新建一条 AiAnalysis
2. 不覆盖旧 AiAnalysis
3. 详情页默认展示最新一条
4. 第一版不做历史版本展示

---

## 七、详情页 AI 状态展示

详情页 AI 总结区需要支持四种状态。

### 1. 未生成

文案：

```text
这条记录还没有 AI 总结。
```

按钮：

```text
生成 AI 总结
```

### 2. 生成中

文案：

```text
正在整理这条记录里的模式……
记录已经保存，你可以先查看原始内容。
```

要求：

- 显示 loading / skeleton / 柔和动效
- 让用户明确感知 AI 正在 pending
- 启动轮询获取最新状态

### 3. 已生成

展示：

- 事件摘要
- 情绪关键词
- 内耗来源
- 建设感来源
- 下一步建议

按钮：

```text
重新生成 AI 总结
```

### 4. 生成失败

文案：

```text
这次没有生成成功，记录已经保存，可以稍后重试。
```

按钮：

```text
重试生成
```

要求：

- 不清空原始记录
- 不影响记录保存
- 不自动无限重试

---

## 八、AI 状态轮询策略

当详情页发现最新 AiAnalysis.status 为 PENDING 时，启动轮询。

轮询要求：

1. 每 2-3 秒请求一次 AI 分析状态
2. 状态变为 SUCCESS 后停止轮询
3. 状态变为 FAILED 后停止轮询
4. 用户离开详情页时停止轮询
5. 设置最大轮询时间，例如 60 秒
6. 超过最大轮询时间后停止轮询，并提示用户稍后查看
7. 轮询期间不要重复触发新的 AI 生成任务
8. 不要无限轮询

超时文案建议：

```text
AI 总结还没有完成，可以稍后回来查看。
```

---

## 九、推荐 API 设计（后续接 AI 时）

### 触发 AI 分析

```text
POST /api/records/:id/ai-analysis
```

行为：

1. 创建一条 status=PENDING 的 AiAnalysis
2. 返回 analysisId
3. 后续生成成功后更新为 SUCCESS
4. 生成失败后更新为 FAILED

返回示例：

```json
{
  "analysisId": "xxx",
  "status": "PENDING"
}
```

### 查询 AI 分析状态

```text
GET /api/ai-analyses/:analysisId
```

返回示例：

```json
{
  "id": "xxx",
  "status": "SUCCESS",
  "summary": "...",
  "emotionKeywords": [],
  "constructivenessNote": "...",
  "energyCostNote": "...",
  "nextAction": "...",
  "errorMessage": null
}
```

### 记录详情返回最新 AI 分析

```text
GET /api/records/:id
```

建议返回：

```json
{
  "record": {},
  "latestAiAnalysis": {}
}
```

---

## 十、周复盘后续设计

周复盘是第二个 AI 功能，但放在单条 AI 分析之后做。

周复盘输入：

- 本周所有记录
- 本周评分统计
- 高频标签
- 高频情绪
- 主要分类分布

周复盘输出：

- 本周主要推进
- 本周主要内耗
- 高频情绪
- 高频标签
- 下周一个最小行动

后续建议 WeeklyReview 也增加状态：

```text
PENDING
SUCCESS
FAILED
```

字段：

```text
status
errorMessage
startedAt
completedAt
failedAt
```

第一版建议手动触发周复盘，不做自动定时任务。

---

## 十一、交互原则

请记录以下原则，后续实现时遵守：

1. 记录保存是主流程
2. AI 总结是保存后的反馈增强
3. AI 生成不能阻塞记录保存
4. AI 生成失败不能影响原始记录
5. pending 状态必须让用户可感知
6. 异步状态应落库，不只存在前端 loading
7. 轮询成功或失败后必须自动断开
8. 不要无限轮询
9. 失败时给手动重试入口
10. 第一版不做 AI 历史版本展示
11. 第一版不做周复盘真实生成

---

## 十二、当前不要执行

现在请不要执行本文档中的 AI 开发任务。

当前只需要记录这些需求，后续等记录 CRUD 完整稳定后再实现。
