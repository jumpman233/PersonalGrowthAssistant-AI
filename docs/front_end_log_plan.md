# 前端性能指标补充

请在前端关键指标方案中补充性能指标采集，第一版保持轻量，不接复杂第三方平台。

## P0 性能指标

优先采集：

- LCP：最大内容绘制
- INP：交互响应
- CLS：布局偏移
- FCP：首次内容绘制
- TTFB：首字节时间

建议使用 `web-vitals` 库采集 Core Web Vitals。

## P1 加载链路指标

可从 PerformanceNavigationTiming 中采集：

- dnsLookupMs
- tcpConnectMs
- tlsHandshakeMs
- requestMs
- responseMs
- domInteractiveMs
- domCompleteMs
- loadEventMs

## P1 资源加载指标

记录：

- jsChunkLoadFailed
- cssLoadFailed
- imageLoadFailed
- fontLoadFailed
- resourceLoadDuration
- chunkLoadFailed

## P1 运行时卡顿指标

记录：

- longTask
- longAnimationFrame，如浏览器支持
- runtimeError
- unhandledRejection

## P1 业务路径性能

记录：

- record_create_duration
- record_update_duration
- record_delete_duration
- ai_analysis_duration
- ai_polling_duration
- weekly_review_generate_duration
- dashboard_summary_duration
- records_list_load_duration
- records_load_more_duration

## 当前第一版建议实际落地

第一版只做：

1. web-vitals：LCP / INP / CLS / FCP / TTFB
2. 白屏检测
3. runtime error
4. unhandledrejection
5. chunk load failed
6. API request duration / failed
7. AI polling timeout
8. record save duration
9. dashboard summary duration

## 注意

- 不记录用户正文
- 不记录完整 AI 输出
- 不记录 prompt / userProfile
- 指标失败不能影响业务
- 生产环境可以先 no-op 或预留 `/api/client-events`
- 当前不接 Sentry / 神策 / GA / 性能大盘