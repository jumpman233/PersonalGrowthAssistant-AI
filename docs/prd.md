# Growth Compass / 真实建设感复盘 PRD（更新版）

> 更新时间：2026-05-07  
> 当前阶段：作品级 MVP 开发中  
> 当前策略：先完成记录系统核心闭环，再后置接入 AI 能力

---

## 1. 产品定位

Growth Compass / 真实建设感复盘，是一个帮助用户记录职业、关系、情绪、学习、生活和项目事件，并通过分类、标签、评分、AI 总结和周复盘识别长期模式的成长复盘工具。

它不是普通打卡工具，也不是心理诊断工具，而是一个帮助用户看清：

> 哪些事情真的在建设自己，哪些事情只是让自己忙起来。

核心价值链路：

```text
记录事件 → 标记感受 → 识别模式 → 生成反馈 → 调整行动
```

---

## 2. 产品气质

整体风格：

- 安静
- 清爽
- 稳定
- 有一点温度
- 不鸡血
- 不像医疗产品
- 不像企业后台
- 不制造压力
- 不给用户贴标签
- 不做心理诊断

设计参考：

- Notion 的清爽
- Day One 的记录感
- Linear 的秩序感
- Apple Health 的趋势反馈
- 少量卡片式布局
- 浅色、低饱和、柔和、留白充足

文案原则：

```text
先看清楚，再慢慢推进。
```

推荐文案方向：

- 记录一点就够了
- 看看今天什么真正推动了你
- 不急着解决，先看清楚
- 找到一个明天能做的小行动

避免文案方向：

- 你今天必须完成复盘
- AI 帮你诊断心理问题
- 立即改变人生
- 你有某种人格/心理问题

---

## 3. 当前 MVP 范围

第一版 MVP 包括：

1. Dashboard 首页
2. 记录列表页
3. 记录详情页
4. 新建记录页
5. 编辑记录页
6. 删除记录
7. 分类与标签
8. 三类评分
   - 心情评分
   - 真实建设感评分
   - 消耗程度评分
9. 基础数据统计
10. 周复盘页面设计
11. AI 相关结构预留
12. 后续接入：AI 推荐标签、单条 AI 分析、周复盘 AI 总结

第一版暂不做：

1. 多用户正式登录
2. 复杂权限系统
3. 社交功能
4. 多人协作
5. 完整心理测评
6. 心理诊断/治疗相关功能
7. 复杂图表系统
8. AI 历史版本展示
9. WebSocket / SSE
10. 复杂任务队列
11. 商业化/付费功能
12. 移动端深度适配

---

## 4. 当前开发优先级

当前阶段优先级：

```text
1. 记录 CRUD 核心闭环
2. Dashboard / 列表 / 详情 / 新建 / 编辑之间的数据联通
3. 标签选择体验优化
4. AI 推荐标签
5. 单条记录 AI 分析
6. 周复盘 AI 总结
```

核心判断：

> AI 是产品亮点，但不是当前地基。当前地基是记录系统先稳定跑通。

---

## 5. 页面与路由设计

### 5.1 Dashboard 首页

路由：

```text
/
```

功能：

- 展示本周记录数
- 展示平均心情
- 展示平均建设感
- 展示平均消耗
- 展示最近记录
- 展示高频标签
- 展示本周趋势占位
- 展示本周 AI 观察占位

当前已完成：

- Dashboard 已从 mock 数据转为数据库真实数据链路
- 数据链路为：

```text
Dashboard 页面 → /api/dashboard/summary → Prisma → PostgreSQL
```

---

### 5.2 记录列表页

路由：

```text
/records
```

页面定位：

> 偏记录阅读，轻管理，不做后台表格感。

功能：

- 展示所有记录
- 按时间倒序
- 显示标题、摘要、分类、评分、标签
- 点击进入详情
- 分类筛选
- 标签筛选
- 时间筛选
- 支持下滑自动加载更多
- 支持加载失败后的手动重试

分页设计：

采用无限滚动，而不是传统页码分页。

交互规则：

1. 初始加载第一页记录。
2. 用户滚动到底部附近时自动加载下一页。
3. 使用 IntersectionObserver 监听底部 sentinel 元素。
4. 加载成功后 append 到已有 records 后面。
5. pending 时不重复请求。
6. hasMore=false 时停止请求。
7. 请求失败/超时时，保留已有 records，不清空列表。
8. 请求失败后显示温和错误和“重试加载”。
9. 筛选条件变化时：
   - 清空 records
   - page 重置为 1
   - hasMore 重置
   - error 清空
   - 重新请求第一页

底部状态：

- 正在加载更多记录……
- 这次没有加载成功，可以稍后再试。重试加载
- 已经看完最近的记录了。
- 还没有符合条件的记录。可以放宽筛选，或者写下一条新的记录。

API 建议：

```text
GET /api/records?page=1&pageSize=10&category=&tag=&timeRange=
```

返回结构：

```json
{
  "records": [],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 36,
    "totalPages": 4,
    "hasMore": true
  }
}
```

---

### 5.3 记录详情页

路由：

```text
/records/[id]
```

页面定位：

> 阅读优先，AI 分析辅助。

页面结构：

顶部：

- 返回我的记录
- 标题
- 分类
- 时间

左侧主内容：

- 原始记录
- 评分
- 标签

右侧辅助：

- AI 总结区
- 操作区
- 温和提示

详情页展示内容：

- 标题
- 分类
- 发生时间/创建时间
- 正文内容
- 心情评分
- 真实建设感评分
- 消耗程度评分
- 标签
- 最新 AI 分析状态/内容

操作：

- 编辑记录
- 删除记录
- 重新生成 AI 总结（后续接入）

删除：

- 使用通用确认弹窗库即可
- 删除按钮低强调，不作为主操作
- 删除前必须确认

---

### 5.4 新建记录页

路由：

```text
/records/new
```

页面标题：

```text
今天想记录什么？
```

副文案：

```text
写下一件真正推动了你，或者明显消耗了你的事。
```

字段：

- 标题
- 分类
- 内容
- 心情评分 0-5
- 真实建设感评分 0-5
- 消耗程度评分 0-5
- 标签
- 发生时间

辅助提示：

- 哪些事情让我觉得有推进？
- 哪些事情只是消耗？
- 我今天有没有把自己逼太紧？
- 明天最小行动是什么？

按钮：

- 取消
- 保存记录

AI 按钮策略：

- 当前阶段不突出“保存并生成 AI 总结”
- 不作为主按钮展示
- 可在辅助区域弱提示：AI 总结将在后续版本中接入

保存逻辑：

```text
填写记录 → 点击保存记录 → POST /api/records → 保存成功 → 跳转 /records/[id]
```

保存成功后：

- 进入详情页
- 后续接 AI 时，可触发 AI 分析生成

---

### 5.5 编辑记录页

路由：

```text
/records/[id]/edit
```

原则：

> 新建和编辑使用不同路由，但复用同一个表单组件。

结构：

```text
pages/records/new.vue
pages/records/[id]/edit.vue
components/records/RecordForm.vue
```

RecordForm 负责：

- 表单 UI
- 字段输入
- 基础校验
- pending 状态
- error 状态
- submit/cancel 事件

new.vue 负责：

- 初始化空表单
- 调用 POST /api/records
- 保存成功后跳转详情页

edit.vue 负责：

- 根据 id 获取已有记录
- 将已有记录填入 RecordForm
- 调用 PUT /api/records/:id
- 保存成功后跳转详情页

编辑成功后：

- 后续接 AI 时，默认触发重新生成 AI 分析
- 但 AI 生成不能阻塞记录保存

---

### 5.6 每周复盘页

路由建议：

```text
/weekly-review
或
/reviews/current
```

页面标题：

```text
本周复盘
```

顶部：

- 本周复盘
- 时间范围
- 生成/更新周复盘按钮
- 返回总览

数据区：

- 本周记录数
- 平均心情
- 平均建设感
- 平均消耗感
- 高频标签

AI 复盘区：

- 本周主要推进
- 本周主要消耗
- 重复出现的模式
- 下周最小行动

页面状态：

设计图先展示 SUCCESS 已生成状态。

后续实现需要支持：

- 未生成
- 生成中
- 已生成
- 生成失败
- 需要更新

视觉定位：

> 报告型 + Dashboard 辅助，不做复杂图表，不做后台数据分析页。

“下周最小行动”需要突出显示。

---

## 6. 记录模块

### 6.1 Record 字段

建议字段：

```text
id
userId
title
content
category
moodScore
constructivenessScore
energyCostScore
status
occurredAt
createdAt
updatedAt
```

分类枚举：

```text
WORK：职业
RELATIONSHIP：关系
EMOTION：情绪
STUDY：学习
LIFE：生活
PROJECT：项目
HEALTH：健康
SOCIAL：社交
OTHER：其他
```

记录状态：

```text
ACTIVE
ARCHIVED
DELETED
```

---

## 7. 标签模块

### 7.1 当前问题

当前标签数量变多后，如果把所有标签直接铺开，会带来问题：

- 视觉噪音太大
- 用户选择成本高
- 标签之间没有层级
- 高频标签、推荐标签、历史标签混在一起
- 低压力记录动作被打断
- 页面容易变成后台标签墙

核心判断：

> 标签不是让用户从一堆选项里做分类考试，而是 AI/系统帮用户减负后的轻确认。

---

### 7.2 标签展示原则

标签不应默认全量平铺。

新建/编辑页标签区应分层：

1. 已选标签
2. 标签输入
3. AI 推荐标签
4. 常用标签
5. 更多标签/搜索标签

---

### 7.3 新建/编辑页标签区建议结构

```text
标签

已选标签
AI开发 ×   长期项目 ×

输入标签
[ 输入标签，回车添加 ]

AI 推荐
真实建设感 +   掌控感 +   输出实践 +

常用标签
恢复节奏   情绪观察   低压力推进   关系复盘

更多标签
```

规则：

- 已选标签单独展示
- 用户可以删除已选标签
- 支持输入标签，回车添加
- 不存在的标签保存时创建
- 常用标签默认最多展示 6-8 个
- AI 推荐标签最多展示 3-5 个
- 已选标签不要在推荐/常用中重复展示
- 全量标签通过“更多标签”或搜索展示

---

### 7.4 列表页标签筛选优化

列表页筛选区不应全量展示标签。

默认展示：

```text
标签：全部 / 高频标签前 5-8 个 / 更多
```

点击“更多”后：

- 打开轻量弹层/抽屉
- 支持搜索标签
- 可查看完整标签
- 保持浅色、低饱和、胶囊式视觉风格

---

### 7.5 AI 推荐标签

AI 推荐标签是一个轻量 AI 能力，可排在完整单条 AI 总结之前实现。

目标：

> 用户负责写真实内容，AI 负责初步提取标签，用户只做确认/微调。

交互：

```text
用户写记录
↓
点击 AI 推荐标签
↓
AI 根据标题、内容、分类、评分生成建议标签
↓
展示 3-5 个推荐标签
↓
用户点击加入/删除/手动修改
↓
保存最终标签
```

推荐标签按钮：

```text
AI 推荐标签
```

状态：

- 未推荐：显示 AI 推荐标签按钮
- 生成中：正在根据内容推荐标签……
- 成功：展示推荐标签 chips
- 失败：这次没有推荐成功，可以先手动添加。

AI 推荐失败不能影响记录保存。

---

### 7.6 AI 标签生成规则

AI 推荐标签必须遵守：

1. 每次推荐 3-5 个标签。
2. 标签尽量短，建议 2-6 个字。
3. 优先复用已有标签。
4. 标签描述事件、主题、状态或行为模式。
5. 不生成心理诊断类标签。
6. 不生成评价人格或攻击性的标签。
7. 不制造压力，不给用户贴负面标签。
8. 推荐标签只作为建议，不自动强制保存。

推荐示例：

- AI开发
- 掌控感
- 项目推进
- 真实建设感
- 恢复节奏
- 低压力推进
- 情绪观察
- 关系边界

禁止示例：

- 焦虑型人格
- 拖延症
- 低自尊
- 心理问题
- 失败
- 不成熟

---

### 7.7 AI 推荐标签接口建议

接口：

```text
POST /api/records/suggest-tags
```

请求：

```json
{
  "title": "string",
  "content": "string",
  "category": "string",
  "moodScore": 3,
  "constructivenessScore": 4,
  "energyCostScore": 2,
  "existingTags": ["AI开发", "掌控感"]
}
```

返回：

```json
{
  "suggestedTags": ["真实建设感", "项目推进", "输出实践"]
}
```

数据处理：

- 推荐阶段不直接写入 Tag 表
- 保存记录时根据最终 tags：
  - 已存在 Tag 则复用
  - 不存在则创建
  - 建立 JournalRecordTag 关联

---

## 8. AI 功能总体策略

AI 目前包括三个层次：

1. AI 推荐标签
2. 单条记录 AI 分析
3. 周复盘 AI 总结

当前建议顺序：

```text
记录 CRUD → 标签体验优化 → AI 推荐标签 → 单条 AI 分析 → 周复盘 AI 总结
```

AI 设计原则：

```text
记录保存是主流程，AI 是保存后的反馈增强。
AI 失败不能影响记录保存。
```

---

## 9. 单条记录 AI 分析

### 9.1 生成时机

单条 AI 分析最佳触发时机：

1. 新建记录成功后
2. 编辑记录成功后
3. 用户手动点击重新生成

不建议：

- 在保存前生成
- 阻塞记录保存
- 用户必须等待 AI 成功才能进入详情页

推荐链路：

```text
新建记录
↓
POST /api/records
↓
保存 JournalRecord 成功
↓
跳转详情页
↓
触发 AI 分析生成
↓
详情页展示生成中状态
↓
成功后展示 AI 分析
```

编辑链路：

```text
编辑记录
↓
PUT /api/records/:id
↓
更新 JournalRecord 成功
↓
跳转详情页
↓
触发重新生成 AI 分析
```

---

### 9.2 单条 AI 分析输出

输入：

- 标题
- 内容
- 分类
- 心情评分
- 建设感评分
- 消耗评分
- 标签

输出：

- 事件摘要
- 情绪关键词
- 主要消耗来源
- 真实建设感来源
- 下一步建议

---

### 9.3 AI 分析状态模型

AI 分析不应只是前端 loading，而应作为业务状态保存。

状态：

```text
NONE：没有 AI 分析记录（页面推导）
PENDING：正在生成
SUCCESS：生成成功
FAILED：生成失败
```

建议新增枚举：

```prisma
enum AiAnalysisStatus {
  PENDING
  SUCCESS
  FAILED
}
```

AiAnalysis 建议字段：

```text
status
errorMessage
startedAt
completedAt
failedAt
createdAt
```

生成逻辑：

1. 先创建 `status=PENDING` 的 AiAnalysis。
2. 生成成功后更新为 `SUCCESS`，写入分析结果。
3. 生成失败后更新为 `FAILED`，写入 errorMessage。
4. 重新生成时新建一条 AiAnalysis，不覆盖旧记录。
5. 详情页默认展示最新一条 AiAnalysis。
6. 第一版暂不展示 AI 历史版本。

---

### 9.4 详情页 AI 区状态

详情页 AI 区需要支持：

#### 无 AI 分析

文案：

```text
这条记录还没有 AI 总结。
```

按钮：

```text
生成 AI 总结
```

#### PENDING

文案：

```text
正在整理这条记录里的模式……
记录已经保存，你可以先查看原始内容。
```

#### SUCCESS

展示：

- 事件摘要
- 情绪关键词
- 消耗来源
- 建设感来源
- 下一步建议

按钮：

```text
重新生成 AI 总结
```

#### FAILED

文案：

```text
这次没有生成成功，记录已经保存，可以稍后重试。
```

按钮：

```text
重试生成
```

---

### 9.5 轮询机制

当详情页发现最新 AiAnalysis.status = PENDING 时：

1. 启动轮询。
2. 每 2-3 秒请求一次 AI 分析状态。
3. 状态变为 SUCCESS 或 FAILED 后停止轮询。
4. 用户离开详情页时停止轮询。
5. 最大轮询时间建议 60 秒。
6. 超过最大时间后停止轮询并提示稍后查看。
7. 轮询期间不要重复触发新的 AI 生成任务。

接口建议：

```text
POST /api/records/:id/ai-analysis
GET /api/ai-analyses/:analysisId
```

第一版也可以暂时轮询：

```text
GET /api/records/:id
```

---

## 10. 周复盘模块

### 10.1 周复盘内容

周复盘基于本周所有记录生成。

输入：

- 本周所有 JournalRecord
- 分类
- 标签
- 心情评分
- 建设感评分
- 消耗评分
- 内容

输出：

- 本周主要推进
- 本周主要消耗
- 重复出现的模式
- 高频标签
- 下周最小行动

---

### 10.2 周复盘重构需求

记录新增、编辑、删除后，周复盘的数据源会变化。

但不建议记录变更时立刻同步重新生成周复盘。

更合理的设计：

```text
记录新增 / 编辑 / 删除
↓
标记对应 WeeklyReview 为 STALE
↓
用户进入 Dashboard / 周复盘页 / 查询周复盘时
↓
判断是否需要重新生成
↓
需要则生成，不需要则直接返回已有结果
```

---

### 10.3 WeeklyReview 状态字段

建议新增：

```prisma
enum WeeklyReviewStatus {
  PENDING
  SUCCESS
  FAILED
  STALE
}
```

WeeklyReview 建议字段：

```text
status
updatedAt
generatedAt
sourceUpdatedAt
errorMessage
startedAt
completedAt
failedAt
```

字段含义：

- updatedAt：WeeklyReview 记录自身最后更新时间
- generatedAt：AI 周复盘内容最后一次成功生成时间
- sourceUpdatedAt：生成时参与计算的 records 最新更新时间
- errorMessage：生成失败原因
- status：当前状态

注意：

`updatedAt` 和 `generatedAt` 不完全一样。标记 STALE 会更新 updatedAt，但 AI 内容没有重新生成，因此 generatedAt 不应变化。

---

### 10.4 标记 STALE 规则

记录变更时调用：

```text
markWeeklyReviewStale(userId, affectedWeek)
```

规则：

1. 新增记录：标记该记录 occurredAt/createdAt 所在周为 STALE。
2. 删除记录：标记该记录所在周为 STALE。
3. 编辑记录：如果内容、评分、分类、标签、occurredAt 等影响复盘的字段变化，需要标记 STALE。
4. 如果编辑 occurredAt 导致记录跨周，需要同时标记旧周和新周为 STALE。
5. 如果对应 WeeklyReview 不存在，可以先不创建，等查询周复盘时再 upsert。

---

### 10.5 重新生成判断

查询 Dashboard summary / WeeklyReview 时判断是否需要重新生成。

触发条件：

- WeeklyReview 不存在
- WeeklyReview.status === STALE
- latestRecordUpdatedAt > WeeklyReview.generatedAt
- WeeklyReview.generatedAt 不属于当前自然天

“超过 1 天”的定义：

> 按自然天判断，不按 24 小时判断。

示例：

```text
5月20日 23:50 生成
5月21日 00:10 查询
```

虽然只过了 20 分钟，但已经跨自然天，应视为需要重新生成。

第一版可以按服务器本地时区处理，后续再支持用户时区。

---

### 10.6 统计数据与 AI 总结分离

周复盘包含两类内容：

#### 可计算统计

- 本周记录数
- 平均心情
- 平均建设感
- 平均消耗
- 高频标签

这些可以实时计算或快速刷新。

#### AI 生成内容

- 本周主要推进
- 本周主要消耗
- 重复出现的模式
- 下周最小行动

这些采用状态模型异步生成。

原则：

> 不要为了更新简单统计，就强制同步调用 AI。

---

## 11. 数据模型建议

### 11.1 User

```text
id
email
passwordHash?
nickname?
avatarUrl?
createdAt
updatedAt
```

第一版暂不做完整登录，可使用 defaultUser。

---

### 11.2 JournalRecord

```text
id
userId
title
content
category
moodScore
constructivenessScore
energyCostScore
status
occurredAt
createdAt
updatedAt
```

---

### 11.3 Tag

```text
id
userId
name
color?
usageCount?
lastUsedAt?
createdAt
updatedAt
```

可考虑新增：

- usageCount：用于常用标签排序
- lastUsedAt：用于最近使用标签

---

### 11.4 JournalRecordTag

```text
id
recordId
tagId
createdAt
```

约束：

- 同一记录不能重复绑定同一个标签

---

### 11.5 AiAnalysis

```text
id
userId
recordId
type
status
summary
emotionKeywords
behaviorPatterns
constructivenessNote
energyCostNote
nextAction
fullResult
errorMessage
modelName
promptVersion
startedAt
completedAt
failedAt
createdAt
```

---

### 11.6 WeeklyReview

```text
id
userId
weekStart
weekEnd
title
recordCount
averageMoodScore
averageConstructiveness
averageEnergyCost
mainProgress
mainEnergyCost
repeatedPatterns
highFrequencyTags
nextWeekAction
aiSummary
status
errorMessage
generatedAt
sourceUpdatedAt
startedAt
completedAt
failedAt
createdAt
updatedAt
```

约束：

- 同一用户同一周只生成一条周复盘

---

### 11.7 UserPreference

```text
id
userId
aiTone
language
defaultReviewStyle
weeklyReviewDay
enableAiSuggestion
enableWeeklyReview
createdAt
updatedAt
```

---

## 12. 接口建议汇总

### Records

```text
GET /api/records
POST /api/records
GET /api/records/:id
PUT /api/records/:id
DELETE /api/records/:id
```

### Dashboard

```text
GET /api/dashboard/summary
```

### Tags

```text
GET /api/tags
POST /api/tags
POST /api/records/suggest-tags
```

### AI Analysis

```text
POST /api/records/:id/ai-analysis
GET /api/ai-analyses/:analysisId
```

### Weekly Review

```text
GET /api/weekly-reviews/current
POST /api/weekly-reviews/generate
POST /api/weekly-reviews/:id/retry
```

---

## 13. Codex 执行边界

当前不要让 Codex 一次性执行所有 AI 和周复盘逻辑。

建议分阶段：

### 当前可执行

1. 完成新建记录页
2. 完成编辑记录页
3. 复用 RecordForm
4. 完成删除确认
5. 优化标签展示，不再全量平铺
6. 列表页标签筛选增加“更多/搜索”结构

### 后续执行

1. AI 推荐标签
2. 单条 AI 分析状态模型
3. AI 分析轮询
4. WeeklyReview STALE 重构
5. 周复盘生成/更新逻辑

### 暂不执行

1. 真实 AI 模型调用
2. 周复盘 AI 生成
3. WebSocket / SSE
4. 复杂任务队列
5. AI 历史版本展示

---

## 14. 作品展示重点

这个项目最终在简历/面试中可以突出：

1. 产品定位清晰：以“真实建设感”为核心，不是普通记录工具。
2. 全栈链路完整：Nuxt + Prisma + PostgreSQL。
3. 页面链路完整：Dashboard、列表、详情、新建、编辑、周复盘。
4. 数据建模完整：Record、Tag、AiAnalysis、WeeklyReview。
5. AI 能力设计成熟：不是简单调接口，而是有状态、可失败、可重试的异步任务。
6. 用户体验取舍明确：无限滚动、失败重试、AI 后置、标签减负。
7. 工程边界清楚：记录保存是主流程，AI 失败不影响主流程。
8. 视觉风格统一：浅色、低饱和、低压力、非后台感。

---

## 15. 当前一句话总结

> Growth Compass 是一个以“真实建设感”为核心的 AI 辅助成长复盘工具。当前应优先完成记录 CRUD 和数据链路闭环，并通过标签优化降低记录成本；AI 推荐标签、单条 AI 分析和周复盘 AI 总结作为后续增强能力，以异步状态模型接入，保证 AI 不阻塞记录主流程。
