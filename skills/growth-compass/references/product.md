# 产品规则

## 产品定位

Growth Compass / 真实建设感复盘是一个以“真实建设感”为核心的 AI 辅助成长复盘工具。

它帮助用户记录职业、关系、情绪、学习、生活、健康、社交和项目事件，并识别：

```text
哪些事情真的在建设自己，哪些事情只是让自己忙起来。
```

它不是打卡工具，不是心理诊断工具，也不是后台管理系统。

## 产品气质

- 安静
- 清爽
- 稳定
- 有一点温度
- 低压力
- 低饱和
- 卡片式
- 不像医疗产品
- 不像企业后台
- 不制造焦虑
- 不给用户贴标签

核心文案原则：

```text
先看清楚，再慢慢推进。
```

## MVP 范围

当前阶段重点完成作品级 MVP：

- Dashboard 真实数据展示
- 记录列表
- 记录详情
- 新建记录
- 编辑记录
- 删除记录
- 标签基础能力
- 基础筛选
- 基础统计
- AI 功能结构预留
- 周复盘结构预留

当前阶段不追求商业级完整产品。

## 记录字段

每条记录包含：

- title
- content
- category
- moodScore
- constructivenessScore
- energyCostScore
- tags
- occurredAt
- createdAt
- updatedAt

分类：

- WORK
- RELATIONSHIP
- EMOTION
- STUDY
- LIFE
- PROJECT
- HEALTH
- SOCIAL
- OTHER

## 评分规则

三类评分统一使用 `0-5`。

- `0` 是有效评分。
- `null` 才表示未评分。
- 后端校验范围是 `0 <= score <= 5`。
- 统计平均值时必须包含 `0`，只排除 `null`。

推荐默认值：

- moodScore: 3
- constructivenessScore: 3
- energyCostScore: 2

内耗程度语义：

- 0 表示几乎不内耗。
- 5 表示严重内耗。
- 内耗高不是正向反馈，视觉上不要做成庆祝或鼓励感。

## AI 边界

AI 总结是保存后的增强反馈，不是保存主流程。

- 新建记录成功后，未来可以触发 AI 总结生成。
- 编辑记录成功后，未来可以触发 AI 重新生成。
- AI 失败不能影响原始记录。
- 不要因为 AI 阻塞记录保存。
- 未来重新生成 AI 分析时，新建 AiAnalysis，不覆盖旧记录。
