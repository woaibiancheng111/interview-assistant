# CS 面试助手

支持本地使用和登录同步的全栈面试求职平台，覆盖题库刷题、模拟面试、简历优化、求职追踪和数据备份。未登录时数据保存在浏览器本地；登录后可通过服务端 API 同步到 MySQL。

## 功能概览

- 面试题库：分类筛选、收藏、刷题状态、题解阅读、个人笔记。
- 模拟面试：技术面、HR 面、行为面试，支持评分、反馈和历史记录。
- 简历管理：分步编辑、模板预览、基础评分、AI 简历优化和 JD 关键词匹配。
- 求职管理：岗位看板、列表、面试时间线、求职漏斗统计。
- 账号与同步：注册登录、JWT Cookie 鉴权、Prisma/MySQL 持久化、Redis 支持限流。
- 移动端体验：核心页面已适配手机视图，包含底部导航、移动筛选和卡片化列表。
- Docker 部署：内置 MySQL、Redis、应用容器和健康检查。

## 技术栈

- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui + Lucide React
- Zustand + localStorage 本地持久化
- Prisma + MySQL
- Redis + ioredis
- DashScope/百炼 AI 简历分析
- Docker Compose

## 本地开发

```bash
npm install
cp .env.example .env
npm run dev
```

开发服务默认访问：

```text
http://localhost:3000
```

如果需要使用登录同步、AI、限流等服务端能力，请确保 `.env` 中的 `DATABASE_URL`、`REDIS_URL`、`JWT_SECRET`、`BAILIAN_API_KEY` 已正确配置。

## 题库来源与合规

题库由两部分组成：

- **站内精选题**：`src/lib/data/questions.curated.ts`，人工维护。
- **开源抓取题**：`src/lib/data/questions.generated.json`，由 `scripts/fetch-questions.ts` 从开源仓库抓取生成，每道题都带 `source`（仓库、原文链接、协议、作者）。

抓取遵循以下规则，避免引入版权风险：

1. 只访问公开的 GitHub API 与 `raw.githubusercontent.com`，不绕过任何访问控制，请求之间有节流；
2. 仓库协议必须能被 GitHub 机器识别、落在白名单内（MIT / Apache-2.0 / BSD / ISC / CC0 / CC-BY / CC-BY-SA），且与来源配置中声明的协议一致，否则整个来源直接跳过；
3. `NOASSERTION`、无 LICENSE、非商业（NC）、GPL 系仓库一律不纳入；
4. 所有来源汇总在 [ATTRIBUTIONS.md](./ATTRIBUTIONS.md)，题目详情页也会展示原文链接与协议。

重新抓取：

```bash
npm run questions:fetch
```

常用参数：

```bash
node scripts/fetch-questions.ts --only=leetcode   # 只抓某个来源
node scripts/fetch-questions.ts --limit=5         # 每个来源只抓 5 篇文档
node scripts/fetch-questions.ts --dry-run         # 只看报告不写盘
node scripts/fetch-questions.ts --offline         # 只用 .cache 里的缓存
```

未设置 `GITHUB_TOKEN` 时 GitHub API 限额为 60 次/小时；设置后提升到 5000 次/小时：

```bash
GITHUB_TOKEN=ghp_xxx npm run questions:fetch
```

新增来源：在 `src/lib/data/ingest/sources.ts` 里添加一项配置（仓库、期望协议、解析器、目录），必要时在 `src/lib/data/ingest/parsers.ts` 中补一个解析器。题目 id 由「来源 id + 文档路径 + 锚点」哈希得到，重复抓取保持稳定，用户的刷题记录不会丢。

## 质量检查

```bash
npm run lint
npm run test
npm run build
```

## Docker VPS 部署

### 1. 准备服务器

在 VPS 上安装 Docker 和 Docker Compose 插件，并开放应用端口或配置反向代理。

### 2. 配置环境变量

```bash
cp .env.example .env
```

生产环境必须替换：

- `JWT_SECRET`：使用长随机字符串，例如 `openssl rand -base64 48`
- `MYSQL_PASSWORD` 和 `MYSQL_ROOT_PASSWORD`
- `DATABASE_URL` 中的数据库密码
- `NEXT_PUBLIC_APP_URL`：你的公网域名
- `BAILIAN_API_KEY`：需要 AI 简历分析时填写

### 3. 启动服务

```bash
docker compose up -d --build
```

应用容器启动时会自动执行：

```bash
prisma migrate deploy
```

### 4. 查看状态

```bash
docker compose ps
docker compose logs -f app
```

健康检查地址：

```text
http://你的域名或服务器IP:3000/api/health
```

### 5. 反向代理建议

生产环境建议使用 Nginx、Caddy 或云厂商负载均衡，将 HTTPS 域名代理到：

```text
http://127.0.0.1:3000
```

同时确保代理保留 `Host`、`X-Forwarded-For`、`X-Forwarded-Proto` 请求头。

## 常用 Docker 命令

```bash
# 查看日志
docker compose logs -f app

# 重启应用
docker compose restart app

# 停止服务
docker compose down

# 停止并删除数据库卷，谨慎使用
docker compose down -v
```

## 目录结构

```text
scripts/
└── fetch-questions.ts   # 开源题库抓取脚本
src/
├── app/                 # 页面与 API Route
├── components/          # 布局和 UI 组件
├── hooks/               # 通用 Hooks
├── lib/
│   ├── api/             # 前端 API Client
│   ├── data/            # 题库与面试静态数据
│   │   ├── ingest/      # 抓取管线：协议白名单、解析器、归一化、去重
│   │   ├── questions.curated.ts     # 站内精选题
│   │   └── questions.generated.json # 抓取产物
│   ├── server/          # Prisma、Redis、鉴权、限流
│   ├── services/        # AI 服务
│   └── store/           # Zustand 状态管理
└── prisma/              # Prisma schema 与迁移
```

## 备注

- 未登录用户仍可使用核心功能，数据保存在本地浏览器。
- 登录后会尝试从服务端同步刷题、收藏、岗位、面试等数据。
- Redis 不可用时，部分限流会降级为放行，应用不会因此崩溃。
