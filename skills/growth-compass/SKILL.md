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
