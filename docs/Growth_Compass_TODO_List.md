# Growth Compass 后续 TODO List

> 当前状态：核心功能基本完成，进入测试、部署、移动端验证与演示材料收口阶段。  
> 原则：不再主动扩展大功能，优先保证项目可部署、可演示、可讲清楚。

---

## P0：部署前必须完成

### 1. 测试安全网第一版

目标：给后续 AI 改代码提供基础安全网，不追求高覆盖率。

#### 单测

优先补：

- RecordForm 校验单测
  - 内容必填、trim、最多 2000 字
  - 三类评分必须是 0-5 整数
  - 0 是有效评分，null 才是未评分
  - 消耗评分默认 2
  - 标签最多 12 个
  - 单个标签最多 20 字
  - 标签 trim、去空、去重
  - 发生时间必须有效

- 标签 normalize 单测
  - trim
  - 空标签过滤
  - 重复标签去重
  - 单条记录内标签上限

- Dashboard summary 计算单测
  - 本周记录数
  - 平均心情
  - 平均建设感
  - 平均消耗
  - null 不参与平均
  - 0 参与平均
  - 高频标签计算

- WeeklyReview stale 判断单测
  - 新增记录标记对应周 stale
  - 删除记录标记对应周 stale
  - 编辑 occurredAt 跨周时旧周和新周都 stale
  - generatedAt 跨自然天后需要更新

#### E2E

优先补：

- 新建记录 E2E
  - 打开 `/records/new`
  - 填写标题、内容、分类、评分、标签
  - 保存成功
  - 跳转详情页
  - 详情页展示记录内容
  - AI 使用 mock，不真实调用豆包

- 编辑记录 E2E
  - 从详情页进入编辑页
  - 回填原始数据
  - 修改内容
  - 保存成功
  - 回到详情页
  - 展示更新后的内容

- 删除记录 E2E
  - 列表页点击弱删除按钮
  - 出现二次确认弹窗
  - 点击取消后记录仍存在
  - 再次删除并确认
  - 记录从列表移除
  - 删除按钮不触发进入详情页

- AI 总结 mock E2E
  - pending 状态可见
  - success 状态展示总结
  - failed 状态展示失败与重试
  - 轮询能停止

---

### 2. Build 产物验证

本地执行：

```bash
npm run build
node .output/server/index.mjs
```

验证：

- 首页可打开
- 记录列表可打开
- 新建记录可保存
- 详情页可展示
- 编辑记录可保存
- 删除记录可执行
- 周复盘页可打开
- AI mock / real 模式可控
- Prisma 能正常连接数据库
- 静态资源正常加载

---

### 3. 环境变量整理

需要整理 `.env.example`。

至少包括：

```env
DATABASE_URL=""
AI_API_KEY=""
AI_BASE_URL=""
AI_MODEL_NAME=""
AI_PROVIDER="doubao"
AI_MOCK_MODE="false"
NODE_ENV="production"
PORT="3000"
```

要求：

- 不提交真实 API Key
- 不提交真实数据库密码
- README 中说明每个变量含义
- 确认生产环境 `AI_MOCK_MODE=false`

---

### 4. 生产数据库方案

需要确定：

#### 方案 A：PostgreSQL 装在同一台 ECS

优点：

- 便宜
- 简单
- 适合个人作品展示

缺点：

- 备份、运维、安全需要自己处理
- 不如云数据库稳定

#### 方案 B：阿里云 RDS PostgreSQL

优点：

- 更正式
- 备份和稳定性更好
- 更接近生产实践

缺点：

- 成本更高
- 配置稍复杂

当前建议：

> 第一版作品部署可以先用同机 PostgreSQL，后续再迁移 RDS。

部署后执行：

```bash
npx prisma generate
npx prisma migrate deploy
```

如需要 seed：

```bash
npm run db:seed
```

---

### 5. 后端 Log 线上落地方式

当前后端 log 已接入。

部署到国内 ECS 后，建议：

- 应用 logger 继续输出 JSON 到 stdout / stderr
- 使用 PM2 收集日志到文件
- 不在业务代码里手动写文件
- 不在日志中输出用户正文、完整 prompt、完整 AI input / output、API Key

PM2 配置中建议包含：

```js
out_file: './logs/out.log',
error_file: './logs/error.log',
merge_logs: true,
log_date_format: 'YYYY-MM-DD HH:mm:ss'
```

后续如日志过大，再考虑：

```bash
pm2 install pm2-logrotate
```

---

### 6. 部署脚本 / 启动方式

需要准备：

- Node.js 环境
- pnpm / npm
- PostgreSQL
- PM2
- Nginx
- Git
- 防火墙 / 安全组配置

建议 `package.json` 包含：

```json
{
  "scripts": {
    "build": "nuxt build",
    "start": "node .output/server/index.mjs"
  }
}
```

PM2 启动：

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

示例 `ecosystem.config.js`：

```js
module.exports = {
  apps: [
    {
      name: 'growth-compass',
      script: '.output/server/index.mjs',
      cwd: '/var/www/growth-compass',
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
}
```

第一版不需要 cluster，单实例即可。

---

## P1：部署期重要优化

### 1. 移动端核心链路验证

先验证核心页面，不做全量精修。

P0 页面：

- `/records/new`
- `/records`
- `/records/[id]`
- `/records/[id]/edit`

重点检查：

- 新建记录输入框是否舒服
- 键盘弹起是否遮挡保存按钮
- 标签区是否拥挤
- 评分按钮是否够大
- 错误滚动定位是否正常
- 删除确认弹窗是否适配小屏
- AI 总结 pending / failed 状态是否清楚
- 列表无限滚动是否顺滑
- 详情页阅读是否舒适

P1 页面：

- Dashboard 移动端概览
- 周复盘移动端阅读

暂不追求完美移动端，只保证核心链路能用。

---

### 2. Nginx 反向代理

目标：

```text
80 / 443
→ localhost:3000
```

需要准备：

- Nginx server 配置
- Node 应用监听 3000
- 防火墙 / 安全组开放 80、443、22
- 数据库端口不要公网开放

如果暂时没有域名，可以先用 IP 访问。

如果使用域名和 HTTPS，需要考虑：

- 域名解析
- 备案
- SSL 证书
- HTTPS 配置

---

### 3. README / 项目介绍

README 至少包括：

- 项目名称
- 项目定位
- 核心功能
- 技术栈
- AI Task 设计
- 数据库设计简述
- 本地启动方式
- 环境变量说明
- 部署说明
- 测试说明
- 当前阶段限制
- 后续规划

重点突出：

- 记录 CRUD
- 标签与评分
- AI 推荐标签
- 单条 AI 总结
- 周复盘
- AI pending / success / failed 状态
- WeeklyReview stale 机制
- 个人画像上下文
- 后端结构化日志
- AI Task / Prompt 模块化

---

### 4. 项目截图和演示材料

准备截图：

- Dashboard
- 记录列表页
- 新建记录页
- 详情页 AI 总结
- 编辑页
- 周复盘页
- 筛选区优化
- 移动端核心页面（如完成）

准备演示话术：

```text
这是一个 AI 辅助复盘工具，核心不是做日记，而是帮助用户识别真实建设感、消耗来源和下一步最小行动。
```

准备重点讲解：

- 为什么 AI 不阻塞记录保存
- 为什么标签是 AI 推荐 + 用户确认
- 为什么周复盘不自动重生成，而是 stale 后手动更新
- 为什么个人画像只作为辅助上下文
- 为什么当前不优先做登录

---

### 5. Dashboard 非 AI 数据刷新

当前已新增函数用于更新 Dashboard 数据。

需要继续确认：

- 新增记录后非 AI 数据正确
- 编辑记录后非 AI 数据正确
- 删除记录后非 AI 数据正确
- 周复盘 AI 文案不自动重新生成
- Dashboard summary 不触发 AI

已知可以接受的小问题：

- 某些情况下返回 Dashboard 可能短暂显示旧数据
- 刷新后正确
- 当前阶段可接受

后续优化方向：

- Dashboard 页面进入时刷新 summary
- 或记录变更后设置 `dashboardDirty` flag
- Dashboard 检测 dirty 后重新请求 summary
- 只刷新非 AI 统计数据，不触发 AI

---

## P2：后续增强，不阻塞当前部署

### 1. 周复盘历史记录

想法：

> 周复盘可以查看历史记录，支持回看历史周。

优先级：P2，不阻塞部署。

未来形态：

```text
/weekly-review
默认当前周

/weekly-review?week=2026-W20
查看历史周
```

交互：

- 上一周
- 下一周
- 回到本周
- 历史周复盘状态展示
- 不自动生成历史周，用户手动触发

---

### 2. 登录 / 多用户

当前不做完整登录。

保留策略：

- 继续使用 demo user / default user
- 数据模型保留 User / userId
- API 层可通过 `getCurrentUserId()` 抽象当前用户
- README 说明后续可接 Auth.js / OAuth / 微信开放平台

当前不做：

- 邮箱密码登录
- 微信扫码登录
- GitHub OAuth
- Google OAuth
- RBAC
- 多租户

原因：

- 登录不是当前作品核心亮点
- 当前重点是 AI 辅助复盘链路
- 微信扫码登录涉及微信开放平台、主体认证、回调域名、备案等，不适合作品 MVP

---

### 3. 标签管理

当前标签策略已经够用。

后续可考虑：

- 标签搜索
- 标签合并
- 标签重命名
- 标签删除
- 标签使用频次统计
- 标签分类

当前不做复杂标签管理后台。

---

### 4. 数据导出 / 备份

长期使用需要：

- 导出 Markdown
- 导出 JSON
- 导出 CSV
- 数据库备份
- 手动 pg_dump

部署初期至少考虑手动备份：

```bash
pg_dump
```

但不阻塞当前上线。

---

### 5. 回收站 / 软删除恢复

当前已有删除二次确认。

长期使用可考虑：

- 软删除
- 回收站
- 恢复记录
- 永久删除

当前不做。

---

### 6. 更完整的移动端体验

后续继续优化：

- 底部保存按钮
- safe-area
- 键盘弹起
- 标签弹层
- 日期选择器
- 周复盘移动端阅读
- Dashboard 移动端信息密度
- AI pending / retry 状态

当前只做核心链路可用。

---

### 7. AI 历史版本

当前不展示 AI 历史版本。

后续可考虑：

- 查看历史 AiAnalysis
- 对比不同 promptVersion
- 对比不同 modelName
- 重新生成后保留旧版本

当前只展示最新一条。

---

### 8. Agent Orchestrator

当前不做复杂 agent。

未来如果做，应建立在现有 AI Task 基础上。

理解为：

```text
触发器
+ 上下文收集
+ AI 判断
+ 既定任务执行
+ 状态管理
+ 防循环控制
```

当前只做：

- AI 推荐标签
- 单条记录 AI 分析
- 周复盘生成

---

## 当前阶段执行顺序建议

### 第一阶段：测试安全网

1. RecordForm 校验单测
2. 标签 normalize 单测
3. Dashboard summary 单测
4. WeeklyReview stale 单测
5. 新建记录 E2E
6. 编辑记录 E2E
7. 删除记录 E2E
8. AI 总结 mock E2E

### 第二阶段：移动端核心链路验证

1. 新建页
2. 列表页
3. 详情页
4. 编辑页
5. 删除弹窗
6. AI 总结状态

### 第三阶段：部署准备

1. build 验证
2. `.env.example`
3. 生产数据库
4. PM2
5. Nginx
6. 日志文件
7. Prisma migrate
8. 服务器安全组

### 第四阶段：README / 演示材料

1. README
2. 项目截图
3. 演示话术
4. 技术亮点总结
5. 面试表达

---

## 当前阶段不再主动扩展的大功能

除非明确需要，否则不再做：

- 完整登录系统
- 微信扫码登录
- 多用户权限
- 复杂 agent
- WebSocket / SSE
- 复杂任务队列
- 标签管理后台
- AI 历史版本 UI
- 搜索 / 月份归档
- 数据导出
- 回收站
- 完整移动端精修
- 复杂图表系统
- 复杂日志平台

---

## 当前结论

项目功能层面已经接近收口。

剩余重点不是继续加大功能，而是：

```text
测试安全网
+ 移动端核心链路验证
+ 国内服务器部署
+ 日志线上落地
+ README / 演示材料
```

目标是让项目从“本地可用”进入：

```text
可部署
可演示
可讲清楚
可继续迭代
```
