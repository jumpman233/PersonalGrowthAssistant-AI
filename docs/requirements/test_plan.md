# Growth Compass 测试选型与落地方案

> 目标：为 AI 辅助开发后的项目提供关键安全网。  
> 原则：不追求高覆盖率，不做复杂测试平台，优先保护核心链路和高风险逻辑。

---

## 1. 总体判断

Growth Compass 当前已经进入功能收口和部署准备阶段，测试体系的目标不是“证明每一行代码都被覆盖”，而是：

```text
AI 后续继续改代码时，核心链路不要悄悄坏掉。
```

因此测试应重点覆盖：

- 记录 CRUD 主链路
- 表单校验
- 标签处理
- Dashboard summary 计算
- WeeklyReview stale 判断
- AI pending / success / failed 状态
- 删除二次确认
- 路由跳转
- 核心页面是否可用

---

## 2. 技术选型

### 单测 / 组件测试

推荐：

```text
Vitest
@nuxt/test-utils
@vue/test-utils
happy-dom
```

理由：

- 当前项目是 Nuxt / Vue / Vite 生态
- Vitest 与 Vite/Nuxt 结合更自然
- 配置成本比 Jest 更低
- 适合测试 pure function、表单校验、数据计算和轻量组件交互
- Nuxt 官方提供 `@nuxt/test-utils` 支持单元测试和端到端测试，适合 Nuxt 项目直接接入

### E2E

推荐：

```text
Playwright
@nuxt/test-utils/playwright
```

理由：

- 适合真实用户链路测试
- 支持 Chromium / Firefox / WebKit
- Trace Viewer 方便排查失败步骤
- 适合 AI 改代码后的回归验证
- 对 SSR / hydration 场景更友好

### AI Mock

推荐：

```text
AI_MOCK_MODE
vi.mock
Playwright route mock
```

原则：

- 测试中不真实调用豆包
- 不让测试产生模型费用
- 不让测试依赖模型输出稳定性
- 测试重点是状态流和兜底逻辑，不是测试模型能力

---

## 3. 不建议当前使用的方案

当前不优先使用：

```text
Jest
Cypress
Playwright Component Testing
Vitest Browser Mode
Sentry
OpenTelemetry
复杂测试平台
可视化回归测试
```

原因：

- Jest 对 Nuxt/Vite 项目配置成本更高
- Cypress 仍可用，但当前项目更适合 Playwright
- 组件浏览器测试和可视化回归会增加配置复杂度
- 当前阶段不是构建完整测试平台，而是补关键安全网

---

## 4. 测试分层

### 4.1 Unit Test

目录建议：

```text
tests/unit/
```

适合测试：

- pure function
- 表单校验
- 标签处理
- 日期和周范围计算
- Dashboard summary 计算
- WeeklyReview stale 判断
- AI JSON schema parse

优点：

- 运行快
- 成本低
- 最适合 AI 写和维护
- 能保护核心业务逻辑

---

### 4.2 Integration Test

目录建议：

```text
tests/integration/
```

适合测试：

- service 层
- API handler
- Prisma 查询逻辑
- AI task 调用封装

当前可以后置。

如果测试数据库配置复杂，第一版不强求 API handler 全量集成测试，可以先测 service / pure function。

---

### 4.3 E2E Test

目录建议：

```text
tests/e2e/
```

适合测试：

- 新建记录
- 编辑记录
- 删除记录
- 列表筛选
- AI 总结状态
- 周复盘页面
- Dashboard 基础展示

E2E 重点不是覆盖每个按钮，而是保证用户主流程跑得通。

---

## 5. 第一阶段测试范围

第一阶段只做最小有效安全网。

### P0 单测

#### 1. RecordForm 校验

覆盖：

- content trim 后为空
- content 超过 2000 字
- moodScore 必须是 0-5 整数
- constructivenessScore 必须是 0-5 整数
- energyCostScore 必须是 0-5 整数
- 0 是有效评分
- null 表示未评分
- energyCostScore 默认 2
- occurredAt 必须是有效时间

#### 2. 标签 normalize

覆盖：

- trim
- 空标签过滤
- 重复标签去重
- 单个标签最多 20 个字
- 每条记录最多 12 个标签
- AI 推荐标签不自动进入已选标签

#### 3. Dashboard summary 计算

覆盖：

- 本周记录数
- 平均心情
- 平均建设感
- 平均消耗
- null 不参与平均
- 0 参与平均
- 高频标签计算
- 删除记录后统计应变化

#### 4. WeeklyReview stale 判断

覆盖：

- 新增记录标记对应周 stale
- 删除记录标记对应周 stale
- 编辑影响内容 / 评分 / 标签时标记 stale
- 编辑 occurredAt 跨周时旧周和新周都 stale
- generatedAt 不属于当前自然天时需要重新生成

---

### P0 E2E

#### 1. 新建记录

流程：

1. 打开 `/records/new`
2. 填写标题
3. 填写内容
4. 选择分类
5. 选择三类评分
6. 添加标签
7. 点击保存
8. 断言跳转详情页
9. 断言详情页展示标题、内容、评分、标签
10. AI 接口使用 mock

#### 2. 编辑记录

流程：

1. 打开某条记录详情页
2. 点击编辑
3. 进入 `/records/:id/edit`
4. 原始数据正确回填
5. 修改内容
6. 点击保存
7. 跳回详情页
8. 断言内容已更新

#### 3. 删除记录

流程：

1. 打开记录列表页
2. 点击某条记录右侧弱删除按钮
3. 断言出现二次确认弹窗
4. 点击取消
5. 断言记录仍存在
6. 再次点击删除并确认
7. 断言记录从列表移除
8. 断言点击删除按钮没有触发进入详情页

#### 4. AI 总结状态

使用 mock 覆盖：

- pending 状态可见
- success 状态展示总结
- failed 状态展示失败与重试按钮
- 轮询能停止
- 不真实调用模型

---

## 6. 第二阶段测试范围

第二阶段在第一阶段稳定后再补。

### P1 单测

- 本周趋势图数据处理
  - 周一到周日映射
  - 无记录日期不当作 0
  - 0 分作为有效数据点

- AI output schema parse
  - suggestTags schema
  - analyzeRecord schema
  - weeklyReview schema

- 用户画像注入
  - analyzeRecord 注入用户画像
  - weeklyReview 注入用户画像
  - suggestTags 不注入用户画像

### P1 E2E

- 列表筛选
  - 分类筛选
  - 标签筛选
  - 时间筛选
  - 清除筛选
  - 更多标签入口

- 周复盘
  - stale 文案可见
  - 手动更新按钮可用
  - AI mock 生成成功
  - AI mock 生成失败

- Dashboard
  - 基础统计展示
  - 最近记录跳转详情
  - 本周趋势图存在
  - 不触发 AI 自动生成

---

## 7. 安装建议

示例依赖：

```bash
npm i -D vitest @nuxt/test-utils @vue/test-utils happy-dom playwright
npx playwright install
```

如果项目使用 pnpm：

```bash
pnpm add -D vitest @nuxt/test-utils @vue/test-utils happy-dom playwright
pnpm exec playwright install
```

---

## 8. package scripts 建议

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

当前不追求 coverage 指标。

覆盖率可以作为参考，不作为上线门槛。

---

## 9. 配置建议

### Vitest

建议使用：

```text
happy-dom
```

适合 Vue 组件和表单交互单测。

如果只测 pure function，可以使用 node environment。

### Playwright

建议：

- 本地默认 Chromium
- CI / 后续可加 Firefox / WebKit
- 开启 trace on failure
- E2E 使用测试库或 mock 数据
- AI 接口必须 mock

Playwright 配置建议：

```ts
use: {
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure'
}
```

---

## 10. Mock 策略

### AI Mock

测试中必须避免真实调用豆包。

可选方式：

1. `AI_MOCK_MODE=true`
2. Playwright route mock
3. vi.mock AI client
4. 后端 mock task 返回固定结果

推荐：

```text
单测：vi.mock AI client
E2E：AI_MOCK_MODE=true
```

### 数据 Mock

E2E 可以使用固定 seed 数据。

要求：

- 测试数据年份、月份、日期必须明确
- occurredAt 必须落在测试周内
- 周复盘测试数据需要避免跨周误判
- 不要依赖当前真实日期导致测试不稳定

---

## 11. AI 时代的测试原则

本项目测试不是为了追求传统高覆盖率，而是为了：

```text
让 AI 继续高效改代码时，核心链路不会被无声破坏。
```

核心原则：

1. 测关键路径，不测所有细枝末节
2. 测业务规则，不测无意义实现细节
3. 测状态流，不测试模型质量
4. 测数据边界，不盲信 AI 生成代码
5. 测用户路径，不追求每个 class
6. 测可恢复错误，不只测成功路径

---

## 12. Codex 执行方式建议

不要让 Codex 一次性“给项目补测试”。

应该拆小任务：

### 任务 1：测试基础设施

```text
请只接入 Vitest 和 Playwright 测试基础设施。
不要写大量测试。
不要修改业务代码。
完成后说明如何运行。
```

### 任务 2：RecordForm 校验单测

```text
请只为 RecordForm 校验逻辑补单测。
如果当前校验逻辑散在组件中，可以最小抽取 pure function。
不要重构 UI。
```

### 任务 3：标签 normalize 单测

```text
请只为标签 normalize 逻辑补单测。
覆盖 trim、去空、去重、数量限制、长度限制。
```

### 任务 4：Dashboard summary 单测

```text
请只为 Dashboard summary 计算逻辑补单测。
重点覆盖 null 不参与平均、0 参与平均。
```

### 任务 5：新建记录 E2E

```text
请只新增新建记录成功链路 E2E。
AI 使用 mock。
不要真实调用模型。
不要修改业务逻辑。
```

### 任务 6：删除记录 E2E

```text
请只新增删除记录 E2E。
覆盖二次确认、取消、确认删除、stopPropagation。
```

---

## 13. 测试定位规范

E2E 不要过度依赖脆弱 class。

优先使用：

- role
- label
- text
- placeholder
- data-testid

建议给关键元素补稳定 test id：

```text
record-form-content
record-form-save
record-delete-button
confirm-delete-dialog
ai-analysis-panel
weekly-review-panel
```

但不要为了测试给所有元素加 test id。

---

## 14. 当前暂不做

当前阶段不做：

- 高覆盖率门槛
- 可视化回归测试
- 复杂组件浏览器测试
- 多浏览器全量矩阵
- 性能测试
- 压力测试
- 合约测试平台
- 前端埋点测试
- 真实 AI 模型质量自动评测
- 复杂 CI 流水线

---

## 15. 验收标准

第一阶段完成后应满足：

1. `npm run test:unit` 可运行。
2. `npm run test:e2e` 可运行。
3. RecordForm 核心校验有单测。
4. 标签 normalize 有单测。
5. Dashboard summary 有单测。
6. WeeklyReview stale 判断有单测。
7. 新建记录 E2E 可跑通。
8. 编辑记录 E2E 可跑通。
9. 删除记录 E2E 可跑通。
10. AI 总结状态 E2E 使用 mock，不调用真实模型。
11. 测试失败时能通过 Playwright trace 定位问题。
12. 测试不依赖真实当前日期。
13. 测试不产生 AI 调用费用。
14. 不因测试引入大规模业务重构。

---

## 16. 面试表达

这个测试体系可以这样讲：

```text
这个项目的测试策略不是追求高覆盖率，而是面向 AI 辅助开发建立关键安全网。

因为 AI 改代码速度很快，但也可能在路由、状态、数据边界和异常路径上引入隐蔽问题，所以我优先用 Vitest 覆盖表单校验、标签处理、Dashboard summary 和 WeeklyReview stale 判断，用 Playwright 覆盖新建、编辑、删除和 AI 状态流这些核心用户路径。

AI 相关测试全部使用 mock，不真实调用模型，避免成本和不确定性。测试重点是保证产品主链路和状态机稳定，而不是测试模型本身。
```

---

## 17. 最终结论

推荐方案：

```text
Vitest + @nuxt/test-utils + @vue/test-utils + happy-dom
Playwright + AI_MOCK_MODE
```

落地节奏：

```text
先单测核心 pure function
再 E2E 核心用户路径
最后补 AI 状态 mock 流程
```

当前不做复杂测试平台。

测试的核心价值是：

```text
为 AI 后续高频改代码提供安全网。
```

## 后端接口测试补充原则

当前单测主要覆盖 pure function 和表单逻辑，但不能完全覆盖后端 API。

测试分层如下：

1. 单测
   - 测纯逻辑
   - 表单校验
   - 标签 normalize
   - Dashboard summary 计算
   - WeeklyReview stale 判断

2. API / service integration test
   - 测后端接口和数据库交互
   - records create / update / delete
   - AI analysis mock success / failed
   - dashboard summary
   - weekly review stale / generate

3. E2E
   - 只测用户主链路
   - 新建记录
   - 编辑记录
   - 删除记录
   - AI 状态展示
   - 不用于全量覆盖所有 API 边界

不要用 E2E 覆盖所有后端接口。
E2E 只负责证明用户路径能跑通。
后端接口边界应通过 service / integration test 覆盖。

AI 相关测试必须 mock，不得真实调用模型。