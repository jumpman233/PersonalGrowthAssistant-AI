# 需求：不使用 Docker 的 Test Harness（独立测试库方案）

> 当前项目已经接入单测、E2E 和 server 维度测试。  
> 现在需要把测试流程整理成稳定的 test harness。  
> 不使用 Docker。测试数据库必须与开发库、生产库隔离。

---

## 1. 目标

新增一套测试执行流程，让测试可以通过统一命令稳定运行。

目标命令：

```bash
pnpm harness:test
```

该命令应完成：

```text
切换测试环境
→ 使用独立测试数据库
→ 确认 AI_MOCK_MODE=true
→ 清理测试库
→ 执行 Prisma migrate
→ 插入测试 seed 数据
→ 运行 unit tests
→ 运行 server tests
→ 运行 e2e tests
→ 测试结束后清理测试数据
```

---

## 2. 核心原则

### 测试库必须隔离

测试不能使用开发库或生产库。

必须单独准备测试数据库，例如：

```text
growth_compass_test
```

`.env.test` 中的 `DATABASE_URL` 必须指向测试库。

示例：

```env
DATABASE_URL="postgresql://growth_compass_test:password@127.0.0.1:5432/growth_compass_test?schema=public"
AI_MOCK_MODE="true"
NODE_ENV="test"
```

---

## 3. 必须新增文件

建议新增：

```text
.env.test.example
scripts/seed-test-data.ts
scripts/clean-test-data.ts
scripts/test-harness.ts
```

可选新增：

```text
tests/fixtures/
```

用于放稳定测试数据。

---

## 4. .env.test.example

新增 `.env.test.example`，内容类似：

```env
DATABASE_URL="postgresql://growth_compass_test:password@127.0.0.1:5432/growth_compass_test?schema=public"

AI_MOCK_MODE="true"
AI_PROVIDER="mock"
AI_API_KEY=""
AI_BASE_URL=""
AI_MODEL_NAME="mock-model"

NODE_ENV="test"
PORT="3001"
```

要求：

- 不提交真实密码
- 不提交真实 AI API Key
- 明确测试环境必须使用独立数据库
- 明确测试环境必须开启 `AI_MOCK_MODE=true`

---

## 5. package.json scripts

请补充或调整 scripts：

```json
{
  "scripts": {
    "test:unit": "vitest run tests/unit",
    "test:server": "vitest run tests/server",
    "test:e2e": "playwright test",

    "test:db:migrate": "dotenv -e .env.test -- pnpm prisma migrate deploy",
    "test:db:seed": "dotenv -e .env.test -- tsx scripts/seed-test-data.ts",
    "test:db:clean": "dotenv -e .env.test -- tsx scripts/clean-test-data.ts",

    "harness:test": "dotenv -e .env.test -- tsx scripts/test-harness.ts",
    "harness:unit": "dotenv -e .env.test -- tsx scripts/test-harness.ts --unit",
    "harness:server": "dotenv -e .env.test -- tsx scripts/test-harness.ts --server",
    "harness:e2e": "dotenv -e .env.test -- tsx scripts/test-harness.ts --e2e"
  }
}
```

如果项目没有 `dotenv-cli` 或 `tsx`，请补充 dev dependency。

---

## 6. clean-test-data.ts

新增：

```text
scripts/clean-test-data.ts
```

职责：

1. 连接测试数据库
2. 校验当前数据库一定是测试库
3. 清理测试数据
4. 不影响开发库和生产库

### 安全要求

必须做保护判断：

```ts
if (!process.env.DATABASE_URL?.includes('test')) {
  throw new Error('Refuse to clean non-test database')
}
```

如果数据库 URL 不包含 `test`，直接中断。

### 清理范围

应清理所有测试相关表，例如：

```text
AiAnalysis
WeeklyReview
JournalRecordTag
JournalRecord
Tag
UserProfile
User
```

实际表名请以 Prisma schema 为准。

### 清理方式

建议按外键依赖顺序删除，避免约束报错。

示例逻辑：

```ts
await prisma.aiAnalysis.deleteMany()
await prisma.weeklyReview.deleteMany()
await prisma.journalRecordTag.deleteMany()
await prisma.journalRecord.deleteMany()
await prisma.tag.deleteMany()
await prisma.userProfile.deleteMany()
await prisma.user.deleteMany()
```

如果项目中还有其他关联表，也需要同步清理。

---

## 7. seed-test-data.ts

新增：

```text
scripts/seed-test-data.ts
```

职责：

1. 连接测试数据库
2. 校验当前数据库一定是测试库
3. 插入稳定测试数据
4. 测试数据日期固定，不依赖真实当前日期

### 安全要求

同样必须校验：

```ts
if (!process.env.DATABASE_URL?.includes('test')) {
  throw new Error('Refuse to seed non-test database')
}
```

### Seed 数据要求

至少插入：

```text
1. 默认测试用户
2. 若干条本周记录
3. 若干标签
4. 若干 JournalRecordTag 关联
5. 可选：一条 WeeklyReview
6. 可选：一条 AiAnalysis
```

### 日期要求

测试数据必须使用固定年份、月份、日期。

不要使用：

```ts
new Date()
```

作为主要测试日期。

建议固定：

```text
2026-05-04 ~ 2026-05-10
```

原因：

- 避免周复盘测试受真实当前日期影响
- 避免跨周判断不稳定
- 避免年份被误改

示例：

```ts
const TEST_WEEK_START = new Date('2026-05-04T00:00:00.000Z')
const TEST_WEEK_END = new Date('2026-05-10T23:59:59.999Z')
```

---

## 8. test-harness.ts

新增：

```text
scripts/test-harness.ts
```

职责：

```text
设置测试环境
→ 清理测试库
→ migrate
→ seed
→ 按参数运行测试
→ finally 清理测试库
```

### 运行模式

支持：

```bash
pnpm harness:test
pnpm harness:unit
pnpm harness:server
pnpm harness:e2e
```

参数含义：

```text
无参数：运行 unit + server + e2e
--unit：只运行 unit
--server：只运行 server
--e2e：只运行 e2e
```

### 环境要求

脚本启动时必须确认：

```ts
process.env.NODE_ENV === 'test'
process.env.AI_MOCK_MODE === 'true'
process.env.DATABASE_URL includes 'test'
```

否则直接中断。

### 执行流程

伪代码：

```ts
async function main() {
  assertTestEnv()

  try {
    await run('pnpm test:db:clean')
    await run('pnpm test:db:migrate')
    await run('pnpm test:db:seed')

    if (mode === 'unit') {
      await run('pnpm test:unit')
    } else if (mode === 'server') {
      await run('pnpm test:server')
    } else if (mode === 'e2e') {
      await run('pnpm test:e2e')
    } else {
      await run('pnpm test:unit')
      await run('pnpm test:server')
      await run('pnpm test:e2e')
    }
  } finally {
    await run('pnpm test:db:clean')
  }
}
```

注意：

- 即使测试失败，也要尽量执行清理逻辑
- 不要关闭 PostgreSQL 服务
- 不要影响开发库
- 不要影响生产库

---

## 9. 测试数据库初始化说明

不需要自动创建 PostgreSQL 服务。

测试数据库可以由开发者手动创建一次。

README 或测试文档中补充：

```sql
CREATE USER growth_compass_test WITH PASSWORD 'password';
CREATE DATABASE growth_compass_test OWNER growth_compass_test;
GRANT ALL PRIVILEGES ON DATABASE growth_compass_test TO growth_compass_test;
```

如果本地已有 PostgreSQL，只需要确保 `.env.test` 指向该测试库即可。

---

## 10. AI Mock 要求

测试环境中不得真实调用 AI 模型。

必须满足：

```env
AI_MOCK_MODE="true"
AI_PROVIDER="mock"
```

测试时：

- 不调用豆包真实 API
- 不产生 AI 费用
- 不依赖模型输出稳定性
- AI Task 返回固定 mock 结果

如果发现测试中存在真实 AI 请求，应视为 bug。

---

## 11. E2E 要求

E2E 使用测试库数据。

要求：

- 每次 E2E 前测试库状态一致
- 不依赖开发库里的真实记录
- 不依赖真实当前日期
- 不真实调用 AI
- 失败时保留 Playwright trace

如果 Playwright 需要启动 dev server，可以继续使用现有 Playwright webServer 配置。

---

## 12. 禁止事项

当前 harness 不做：

- Docker
- 自动启动 / 停止 PostgreSQL 服务
- 使用开发数据库跑测试
- 使用生产数据库跑测试
- 真实调用 AI API
- 测试中写入真实用户数据
- 大规模重构业务代码
- 为了测试改变产品逻辑

---

## 13. 验收标准

完成后应满足：

1. 存在 `.env.test.example`。
2. 存在 `scripts/clean-test-data.ts`。
3. 存在 `scripts/seed-test-data.ts`。
4. 存在 `scripts/test-harness.ts`。
5. `clean-test-data.ts` 会拒绝清理非 test 数据库。
6. `seed-test-data.ts` 会拒绝写入非 test 数据库。
7. `test-harness.ts` 会校验 `NODE_ENV=test`。
8. `test-harness.ts` 会校验 `AI_MOCK_MODE=true`。
9. `test-harness.ts` 会校验 `DATABASE_URL` 指向 test 数据库。
10. `pnpm harness:unit` 可运行。
11. `pnpm harness:server` 可运行。
12. `pnpm harness:e2e` 可运行。
13. `pnpm harness:test` 可运行完整测试流程。
14. 测试失败后仍会尽量清理测试数据。
15. 测试不会真实调用 AI 模型。
16. 测试不会影响开发库和生产库。

---

## 14. 输出要求

完成后请说明：

1. 新增了哪些文件
2. 修改了哪些 package scripts
3. 如何创建测试数据库
4. 如何配置 `.env.test`
5. 如何运行完整 harness
6. 如何只运行 unit / server / e2e
7. 当前还有哪些限制

---

## 15. 目标总结

这个 test harness 的目标不是新增更多测试用例，而是把现有测试组织成一条稳定、可重复、可清理、可回归的流程。

核心价值：

```text
测试数据库隔离
+ AI mock
+ seed 固定数据
+ 自动清理
+ 一条命令回归
```
