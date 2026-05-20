# Personal Growth Assistant

Nuxt 4 + TypeScript project scaffolded with pnpm, ESLint, Prettier, Tailwind CSS, Prisma, and PostgreSQL.

## 线上数据库切换与展示数据

线上建议准备两套独立 PostgreSQL database：

- `growth_demo`：纯展示用，只放公开、轻松的演示数据。
- `growth_personal`：自用库，放真实数据。

不要把展示数据和自用数据放在同一个 database 里切 schema，独立 database 更好备份、回滚和排查。

### 1. 新建展示库

如果线上服务器可以直接使用本机 PostgreSQL 用户：

```bash
createdb -h 127.0.0.1 -p 5432 -U postgres growth_demo
createdb -h 127.0.0.1 -p 5432 -U postgres growth_personal
```

如果需要通过 `psql` 执行：

```bash
psql -h 127.0.0.1 -p 5432 -U postgres -d postgres -c "CREATE DATABASE growth_demo;"
psql -h 127.0.0.1 -p 5432 -U postgres -d postgres -c "CREATE DATABASE growth_personal;"
```

### 2. 准备两份环境变量文件

`.env.demo`：

```env
DATABASE_URL="postgresql://postgres:你的密码@127.0.0.1:5432/growth_demo?schema=public"
AI_BASE_URL="https://ark.cn-beijing.volces.com/api/v3"
AI_MODEL_NAME="doubao-seed-2-0-lite-260428"
AI_API_KEY="你的线上 AI Key"
AI_MOCK_MODE="false"
```

`.env.personal`：

```env
DATABASE_URL="postgresql://postgres:你的密码@127.0.0.1:5432/growth_personal?schema=public"
AI_BASE_URL="https://ark.cn-beijing.volces.com/api/v3"
AI_MODEL_NAME="doubao-seed-2-0-lite-260428"
AI_API_KEY="你的线上 AI Key"
AI_MOCK_MODE="false"
```

### 3. 初始化展示库并写入假数据

```bash
cp .env.demo .env
pnpm db:push
pnpm db:seed:demo
pm2 reload ecosystem.config.cjs --update-env
```

`pnpm db:seed:demo` 会写入 32 条轻松的展示记录，并创建一个展示用默认用户。脚本默认只允许写入数据库名包含 `demo` 的库，避免误把展示数据写入自用库。

### 4. 切换到展示库

```bash
cp .env.demo .env
pm2 reload ecosystem.config.cjs --update-env
pm2 logs growth-compass
```

### 5. 切换回自用库

```bash
cp .env.personal .env
pm2 reload ecosystem.config.cjs --update-env
pm2 logs growth-compass
```

### 6. 查看当前连接的是哪个库

```bash
node -e "const fs=require('fs'); const line=fs.readFileSync('.env','utf8').split(/\r?\n/).find((item)=>item.startsWith('DATABASE_URL=')); const raw=line.split('=').slice(1).join('=').replace(/^\"|\"$/g,''); const u=new URL(raw); console.log(u.pathname.slice(1), u.searchParams.get('schema') || 'public')"
```

## 第一次安装

### 1. 安装前确认

本项目默认使用本机 PostgreSQL：

```powershell
$env:PG_BIN = "E:\software\postgreSQL\postgresql-18.3-3-windows-x64-binaries\pgsql\bin"
$env:PG_DATA = "E:\software\postgreSQL\postgresql-18.3-3-windows-x64-binaries\pgsql\data"
```

数据库连接配置在 `.env`：

```env
DATABASE_URL="postgresql://postgres@127.0.0.1:5432/personal_growth_assistant?schema=public"
```

### 2. 安装依赖

```powershell
pnpm install
```

如果 pnpm 提示 Prisma build scripts 被禁用，先执行：

```powershell
pnpm approve-builds
```

允许这些包：

```text
@prisma/client
@prisma/engines
prisma
```

### 3. 启动 PostgreSQL

如果 PostgreSQL 还没有启动：

```powershell
& "$env:PG_BIN\pg_ctl.exe" -D "$env:PG_DATA" -l "$env:PG_DATA\postgresql.log" start
```

检查数据库服务是否可连接：

```powershell
& "$env:PG_BIN\pg_isready.exe" -h 127.0.0.1 -p 5432
```

### 4. 创建数据库

如果数据库还不存在：

```powershell
& "$env:PG_BIN\createdb.exe" -h 127.0.0.1 -p 5432 -U postgres personal_growth_assistant
```

查看数据库列表：

```powershell
& "$env:PG_BIN\psql.exe" -h 127.0.0.1 -p 5432 -U postgres -d postgres -c "\l"
```

### 5. 同步 Prisma 表结构

```powershell
pnpm db:push
pnpm db:generate
pnpm db:seed
```

确认表已经创建：

```powershell
& "$env:PG_BIN\psql.exe" -h 127.0.0.1 -p 5432 -U postgres -d personal_growth_assistant -c "\dt"
```

## 启动/开发流程

### 1. 启动数据库

```powershell
$env:PG_BIN = "E:\software\postgreSQL\postgresql-18.3-3-windows-x64-binaries\pgsql\bin"
$env:PG_DATA = "E:\software\postgreSQL\postgresql-18.3-3-windows-x64-binaries\pgsql\data"

& "$env:PG_BIN\pg_ctl.exe" -D "$env:PG_DATA" -l "$env:PG_DATA\postgresql.log" start
& "$env:PG_BIN\pg_isready.exe" -h 127.0.0.1 -p 5432
```

### 2. 启动 Nuxt 开发服务器

```powershell
pnpm dev
```

默认访问：

```text
http://localhost:3000
```

### 3. 常用开发命令

```powershell
pnpm lint
pnpm format
pnpm build
pnpm preview
```

### 4. 数据库相关命令

```powershell
# 同步 schema 到 PostgreSQL
pnpm db:push

# 生成 Prisma Client
pnpm db:generate

# 写入本地 Dashboard 示例数据
pnpm db:seed

# 打开 Prisma Studio
pnpm db:studio

# 登录 PostgreSQL
& "$env:PG_BIN\psql.exe" -h 127.0.0.1 -p 5432 -U postgres -d personal_growth_assistant

# 停止 PostgreSQL
& "$env:PG_BIN\pg_ctl.exe" -D "$env:PG_DATA" stop
```

## Common Commands

```bash
# Install dependencies
pnpm install

# Start the local development server
pnpm dev

# Run ESLint checks
pnpm lint

# Format files with Prettier
pnpm format

# Build for production
pnpm build

# Preview the production build
pnpm preview

# Open Prisma Studio
pnpm db:studio

# Seed local dashboard data
pnpm db:seed
```
