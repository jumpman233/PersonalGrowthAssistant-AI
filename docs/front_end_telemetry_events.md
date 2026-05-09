# 前端打点事件与字段映射

第一版前端打点只在开发环境输出到 console，生产环境 no-op，不上报到后端，也不接第三方平台。

## 通用规则

- 不记录用户正文、prompt、AI 完整输出、userProfile、密钥、token、authorization。
- 所有 payload 在输出前经过 `sanitizePayload` 脱敏。
- 事件失败不能影响业务流程。
- 事件命名使用 snake_case。

## 通用字段

| 字段 | 类型 | 中文含义 | 说明 |
| --- | --- | --- | --- |
| `type` | `event \| warn \| error` | 日志级别 | 普通事件、警告、错误 |
| `eventName` | `string` | 事件名 | 只在 `trackEvent` 中出现 |
| `message` | `string` | 警告或错误信息 | 只在 `clientWarn` / `clientError` 中出现 |
| `path` | `string` | 当前页面路径 | 只记录 pathname，不记录敏感 query |
| `time` | `string` | 事件发生时间 | ISO 字符串 |
| `durationMs` | `number` | 耗时毫秒数 | 业务耗时、接口耗时使用 |
| `success` | `boolean` | 是否成功 | 成功/失败路径都可记录 |
| `statusCode` | `number` | HTTP 状态码 | 接口失败时使用 |
| `reason` | `string` | 失败或超时原因 | 只放非敏感枚举或简短原因 |
| `target` | `string` | 业务目标 | 例如 `record_create`、`dashboard_summary` |
| `requestPath` | `string` | 请求路径 | 不含敏感 query 和正文 |

## 已接入事件

| 事件名 | 中文业务逻辑 | 触发时机 | 字段 |
| --- | --- | --- | --- |
| `web_vital` | Core Web Vitals 性能指标 | 浏览器上报 LCP / INP / CLS / FCP / TTFB 时 | `name`、`value`、`rating`、`delta`、`id`、`navigationType` |
| `blank_screen_detected` | 白屏检测 | 页面加载 3 秒后没有可见主要内容 | `reason` |
| `runtime_error` | 前端运行时错误 | `window.error` 捕获到非资源加载错误 | `message`、`filename`、`lineno`、`colno` |
| `unhandled_rejection` | 未处理 Promise 异常 | `window.unhandledrejection` 捕获到异常 | `reason` |
| `chunk_load_failed` | JS chunk 加载失败 | 脚本资源加载失败且路径包含 Nuxt chunk | `requestPath`、`target`、`reason` |
| `resource_load_failed` | 静态资源加载失败 | 图片、字体、CSS、普通脚本等资源加载失败 | `requestPath`、`target`、`reason` |
| `api_request_duration` | API 请求耗时 | 显式包裹的轻量 API 请求完成或失败 | `requestPath`、`durationMs`、`success`、`statusCode`、`reason`、`target` |
| `records_list_load_duration` | 记录列表首屏加载耗时 | 记录列表第一页加载完成或失败 | `durationMs`、`success`、`requestPath`、`statusCode`、`reason` |
| `records_load_more_duration` | 记录列表加载更多耗时 | 滚动加载下一页完成或失败 | `durationMs`、`success`、`requestPath`、`statusCode`、`reason` |
| `dashboard_summary_duration` | Dashboard 汇总数据加载耗时 | Dashboard 数据请求完成或失败 | `durationMs`、`success`、`requestPath`、`statusCode`、`reason` |
| `record_save_duration` | 保存记录耗时 | 新建或编辑记录完成或失败 | `durationMs`、`success`、`mode`、`requestPath`、`statusCode`、`reason` |
| `record_create_duration` | 新建记录耗时 | 新建记录完成或失败 | `durationMs`、`success`、`requestPath`、`statusCode`、`reason` |
| `record_update_duration` | 编辑记录耗时 | 编辑记录完成或失败 | `durationMs`、`success`、`requestPath`、`statusCode`、`reason` |
| `record_delete_duration` | 删除记录耗时 | 记录列表页删除记录完成或失败 | `durationMs`、`success`、`requestPath`、`statusCode`、`reason` |
| `ai_analysis_duration` | 单条记录 AI 总结请求耗时 | AI 总结 POST 请求完成或失败 | `durationMs`、`success`、`requestPath`、`status`、`statusCode`、`reason` |
| `ai_polling_duration` | AI 轮询耗时 | AI 总结或周复盘轮询拿到最终结果或请求失败 | `durationMs`、`success`、`pollCount`、`status`、`statusCode`、`reason`、`target` |
| `ai_polling_timeout` | AI 轮询超时 | 轮询达到上限仍未结束 | `durationMs`、`pollCount`、`reason`、`target` |
| `weekly_review_generate_duration` | 周复盘生成请求耗时 | 周复盘生成 POST 请求完成或失败 | `durationMs`、`success`、`requestPath`、`status`、`statusCode`、`reason` |

## 业务字段取值

| 字段 | 取值 | 中文含义 |
| --- | --- | --- |
| `target` | `records_list` | 记录列表首屏加载 |
| `target` | `records_load_more` | 记录列表加载更多 |
| `target` | `records_summary_refresh` | 记录列表侧栏统计刷新 |
| `target` | `dashboard_summary` | Dashboard 汇总数据加载 |
| `target` | `record_create` | 新建记录 |
| `target` | `record_update` | 编辑记录 |
| `target` | `record_delete` | 删除记录 |
| `target` | `ai_analysis` | 单条记录 AI 总结 |
| `target` | `weekly_review` | 周复盘轮询 |
| `target` | `weekly_review_generate` | 周复盘生成请求 |
| `mode` | `create` | 新建保存 |
| `mode` | `update` | 编辑保存 |

## 暂未接入事件

| 事件名 | 中文业务逻辑 | 说明 |
| --- | --- | --- |
| `long_task` | 长任务卡顿 | 第一版先不接 PerformanceObserver 长任务 |
| `long_animation_frame` | 长动画帧卡顿 | 浏览器支持差异较大，后续再接 |
| `resource_load_duration` | 单个资源加载耗时 | 第一版只记录资源加载失败 |
