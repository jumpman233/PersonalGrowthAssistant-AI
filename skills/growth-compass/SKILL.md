---
name: growth-compass
description: Growth Compass / 真实建设感复盘项目开发规则。Use when working in the PersonalGrowthAssistant repository on records, dashboard, RecordForm, tags, delete interactions, PRD-aligned UI, API/model changes, docs, or Git commits for this product.
---

# Growth Compass

## 用途

这是 Growth Compass 项目的执行入口。`docs/` 是产品事实源，`skills/growth-compass` 是给 Codex 使用的精简工作手册。

## 工作流程

1. 先判断用户请求涉及的范围：记录、Dashboard、表单、标签、AI、周复盘、文档或 Git。
2. 只读取本次任务相关的 reference，不要一次性塞入全部文档。
3. 优先沿用项目已有组件、页面结构、服务层和样式模式。
4. 代码改动后运行 `pnpm lint`；涉及 Nuxt 页面、组件、composable、server route 或类型时运行 `pnpm build`。
5. 提交代码时使用 `references/git.md` 中记录的 Git 路径和中文 Conventional Commit 规则。

## Reference 索引

- 产品定位、MVP 范围、评分和 AI 边界：读 `references/product.md`
- 表单输入规则、字段级错误和保存按钮规则：读 `references/input-rules.md`
- 前端结构、视觉风格和日期选择器注意事项：读 `references/frontend.md`
- 删除确认、列表垃圾桶、Dashboard 最近记录和 RecordCard hover：读 `references/record-interactions.md`
- API、模型、标签、删除语义和周复盘边界：读 `references/api-model.md`
- AI 模型、环境变量、任务顺序、mock 模式和结构化输出规则：读 `references/ai.md`
- Git 路径和中文提交规范：读 `references/git.md`

如果 reference 与 `docs/prd.md` 冲突，以最新版 `docs/prd.md` 为准，并在之后更新 skill reference。

## 核心规则

- 保持 Growth Compass 安静、低压力、浅色、低饱和、卡片式，不做后台管理感。
- 除非用户明确要求，不要把 AI 调用接进记录保存主流程。
- 危险操作不能直接执行；删除记录必须二次确认。
- Dashboard 最近记录不添加删除按钮。
- 表单错误使用字段级提示，并滚动到对应字段。
- 不要回滚用户已有改动，不做无关重构。
- 用户可见文案和 commit 正文使用中文。

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

- 单测使用 Vitest
- Vue / Nuxt 相关测试使用 @nuxt/test-utils、@vue/test-utils
- DOM 环境优先使用 happy-dom
- E2E 使用 Playwright
- AI 相关测试必须 mock，不允许真实调用豆包或任何真实模型

### AI 测试规则

测试中不得真实调用 AI API。

必须避免：

- 产生真实 AI 调用费用
- 依赖模型输出稳定性
- 用自动化测试评估模型质量

测试应该验证：

- pending 状态是否展示
- success 状态是否展示结果
- failed 状态是否展示失败与重试
- 轮询是否能停止
- JSON parse 失败是否有兜底

### 数据规则

测试数据必须稳定，不依赖真实当前日期。

涉及周复盘、趋势图、Dashboard summary 时：

- occurredAt 年份、月份、日期必须明确
- 测试记录必须落在预期周内
- 没有记录的日期不能当作 0 分
- 0 是有效评分
- null 才表示未评分
- null 不参与平均值计算
- 0 必须参与平均值计算

### E2E 定位规则

E2E 不要过度依赖样式 class。

优先使用：

- role
- label
- text
- placeholder
- data-testid

关键元素可以增加稳定 test id，例如：

- record-form-content
- record-form-save
- record-delete-button
- confirm-delete-dialog
- ai-analysis-panel
- weekly-review-panel

但不要为了测试给所有元素加 test id。

### Codex 执行测试任务规则

不要一次性“补完整测试体系”。

每次只执行一个明确测试任务，例如：

- 只接入测试基础设施
- 只补 RecordForm 单测
- 只补标签 normalize 单测
- 只补 Dashboard summary 单测
- 只补新建记录 E2E
- 只补删除记录 E2E

每次任务完成后必须说明：

1. 修改了哪些文件
2. 如何运行测试
3. 覆盖了哪些场景
4. 哪些场景暂未覆盖

### 业务代码修改限制

补测试时不要大规模重构业务代码。

如果为了测试需要抽 pure function，可以做最小抽取，但必须保持原有功能和 UI 行为不变。

不得因为测试方便而改变产品逻辑。

### 暂不做

当前阶段不做：

- 高覆盖率门槛
- 可视化回归测试
- 复杂组件浏览器测试
- 多浏览器全量矩阵
- 性能测试
- 压力测试
- 合约测试平台
- 真实 AI 模型质量自动评测
- 复杂 CI 流水线