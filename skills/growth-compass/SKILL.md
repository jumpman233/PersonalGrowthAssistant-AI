---
name: growth-compass
description: Growth Compass / 真实建设感复盘项目开发规则。Use when working in the PersonalGrowthAssistant repository on records, dashboard, RecordForm, tags, delete interactions, PRD-aligned UI, API/model changes, docs, tests, or Git commits for this product.
---

# Growth Compass

## 用途

这是 Growth Compass 项目的执行入口。

- `docs/` 是产品事实源。
- `skills/growth-compass` 是给 Codex 使用的精简工作手册。
- 如果 reference 与最新产品文档冲突，以最新产品文档为准，并在之后同步更新 skill reference。

## 工作流程

1. 先判断用户请求涉及的范围：记录、Dashboard、表单、标签、AI、周复盘、测试、文档或 Git。
2. 只读取本次任务相关的 reference，不要一次性塞入全部文档。
3. 优先沿用项目已有组件、页面结构、服务层和样式模式。
4. 改动后按风险运行验证：纯函数优先跑单测，后端跑 `pnpm test:server`，前端关键链路跑 `pnpm test:e2e`。
5. 提交代码时使用 `references/git.md` 中记录的 Git 路径和中文 Conventional Commit 规则。

## Reference 索引

- 产品定位、MVP 范围、评分和 AI 边界：`references/product.md`
- 表单输入规则、字段级错误和保存按钮规则：`references/input-rules.md`
- 前端结构、视觉风格、响应式规则：`references/frontend.md`
- 编码与中文乱码规避：`references/encoding.md`
- 删除确认、列表垃圾桶、Dashboard 最近记录和 RecordCard hover：`references/record-interactions.md`
- API、模型、标签、删除语义和周复盘边界：`references/api-model.md`
- AI 模型、环境变量、任务顺序、mock 模式和结构化输出规则：`references/ai.md`
- Git 路径和中文提交规范：`references/git.md`

## 核心规则

- 保持 Growth Compass 安静、低压力、浅色、低饱和、卡片式，不做后台管理感。
- 除非用户明确要求，不要把 AI 调用接进记录保存主流程。
- 危险操作不能直接执行；删除记录必须二次确认。
- Dashboard 最近记录不添加删除按钮。
- 表单错误使用字段级提示，并滚动到对应字段。
- 不要回滚用户已有改动，不做无关重构。
- 用户可见文案和 commit 正文使用中文。
- 涉及中文文案、中文注释、中文测试断言、Markdown 文档、Vue template 或服务端返回文案时，必须遵守 `references/encoding.md`。

## 乱码规避速记

项目经常出现中文乱码。每次改中文前后都要记住：

- 仓库文本文件按 UTF-8 处理。
- 不要把 PowerShell 终端里显示出来的乱码复制回文件。
- 手工改中文文件优先使用 `apply_patch`。
- 脚本化改中文文件时使用 Node UTF-8 读写。
- 改完扫描 `锛|鐨|璁|鎴|鍐|鍛|鈫|鈻|鉁|�` 等乱码特征。
- 发现已有乱码时，按产品语义恢复为正常中文，不要盲目整文件转码。

## 测试规则

当前项目测试目标不是追求高覆盖率，而是为 AI 后续改代码提供关键回归安全网。

### 测试优先级

优先覆盖：

1. RecordForm 校验逻辑
2. 标签 normalize 逻辑
3. Dashboard summary 计算
4. WeeklyReview stale 判断
5. 新建记录 E2E
6. 编辑记录 E2E
7. 删除记录 E2E
8. AI 总结 pending / success / failed mock 流程

### 技术选型

- 单测使用 Vitest。
- Vue / Nuxt 相关测试使用 `@nuxt/test-utils`、`@vue/test-utils`。
- DOM 环境优先使用 happy-dom。
- E2E 使用 Playwright。
- AI 相关测试必须 mock，不允许真实调用任何模型。

### 数据规则

- 测试数据必须稳定，不依赖真实当前日期。
- 涉及周复盘、趋势图、Dashboard summary 时，`occurredAt` 年份、月份、日期必须明确。
- 0 是有效评分，必须参与平均值计算。
- null 表示未评分，不参与平均值计算。

### E2E 定位规则

E2E 不要过度依赖样式 class。

优先使用：

- role
- label
- text
- placeholder
- data-testid

关键元素可以增加稳定 test id，但不要为了测试给所有元素加 test id。

### 测试执行规则

不要一次性“补完整测试体系”。每次只执行一个明确测试任务。

任务完成后必须说明：

1. 修改了哪些文件
2. 如何运行测试
3. 覆盖了哪些场景
4. 哪些场景暂未覆盖
