# Growth Compass 部署步骤简版

1. 购买一台国内 ECS / 轻量服务器，先选 Ubuntu + 2C2G 左右即可。

2. 在服务器安装基础环境：Node.js、pnpm、Git、PostgreSQL、Nginx、PM2。

3. 准备项目代码：能访问 GitHub 就服务器 git pull；不稳定就本地打包后用 scp / rsync 上传。

4. 在本地或服务器执行 `pnpm build`，确认生成 Nuxt 生产产物 `.output`。

5. 在服务器项目目录创建 `.env`，写入数据库连接、AI API Key、AI Base URL、模型名、端口等变量。

6. 在服务器安装并启动 PostgreSQL，创建项目数据库和数据库用户。

7. 执行 Prisma 初始化：`pnpm prisma generate` 和 `pnpm prisma migrate deploy`。

8. 用 PM2 启动 Nuxt 生产入口：`.output/server/index.mjs`。

9. 配置 PM2 日志输出到文件，并确认 stdout / stderr 能被收集。

10. 配置 Nginx，把外部 80 端口反向代理到本机 3000 端口。

11. 如果有域名，做 DNS 解析到服务器 IP。

12. 如果服务器在国内且域名公开访问，处理备案问题。

13. 域名和备案完成后，配置 HTTPS 证书。

14. 验证线上页面、API、数据库、AI 接口、日志、PM2 重启都正常。

15. 后续每次部署：上传 / 拉取代码 → 安装依赖 → migrate → build → PM2 restart。

16. 日志轮转pm2-logrotate