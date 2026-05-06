# Personal Growth Assistant

Nuxt 4 + TypeScript project scaffolded with pnpm, ESLint, Prettier, Tailwind CSS, Prisma, and PostgreSQL.

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
```
