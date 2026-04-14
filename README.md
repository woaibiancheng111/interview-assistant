# 🎓 CS 面试助手

> 一站式计算机专业面试求职平台 —— 题库刷题 · AI 模拟面试 · 简历优化 · 求职管理

## ✨ 项目简介

CS 面试助手是一款面向计算机专业学生和初级工程师的 **纯前端面试求职辅助工具**。无需后端服务器，所有功能在浏览器端完成，数据通过 `localStorage` 持久化，零部署成本。

### 核心功能

| 模块 | 功能亮点 |
|------|----------|
| 📚 **面试题库** | 8 大分类、46+ 精选题目，支持难度/分类/标签多维筛选、收藏、笔记、进度追踪 |
| 🎤 **AI 模拟面试** | 技术面 / HR 面 / 行为面，实时评分、智能追问、雷达图分析、改进建议 |
| 📝 **简历管理** | 分步编辑器、3 种模板实时预览、AI 评分优化建议、打印导出 PDF |
| 💼 **求职管理** | Kanban 看板、面试时间线、数据统计仪表盘、全流程岗位追踪 |
| ⚙️ **设置中心** | 浅色/深色/跟随系统三种主题、数据导出/导入/重置 |

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [Next.js](https://nextjs.org/) (App Router) | 16.2.3 | React 全栈框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | 类型安全 |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | 原子化样式 |
| [shadcn/ui](https://ui.shadcn.com/) (base-ui) | 4.2.0 | 28 个高质量 UI 组件 |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5.0.12 | 轻量状态管理 + persist 持久化 |
| [Framer Motion](https://www.framer.com/motion/) | 12.38.0 | 页面过渡和微交互动画 |
| [Lucide React](https://lucide.dev/) | 1.8.0 | 统一图标体系 |
| Turbopack | — | Next.js 内置高性能打包器 |

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18
- **npm** >= 9

### 安装与运行

```bash
# 克隆项目
git clone <仓库地址>
cd interview-assistant

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

启动后访问 [http://localhost:3000](http://localhost:3000) 即可。

### 构建生产版本

```bash
npm run build    # 构建
npm start        # 启动生产服务器
```

### 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（Turbopack 热更新） |
| `npm run build` | 构建生产版本 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | ESLint 代码检查 |

## 📁 项目结构

```
src/
├── app/                          # Next.js App Router 页面
│   ├── layout.tsx                # 根布局（侧边栏 + 顶栏 + 主题）
│   ├── page.tsx                  # 首页仪表盘
│   ├── globals.css               # 全局样式 + CSS 变量主题
│   ├── questions/                # 面试题库
│   │   ├── page.tsx              # 题库列表（筛选 + 详情弹窗）
│   │   └── [id]/page.tsx         # 题目详情页
│   ├── interview/                # 模拟面试
│   │   ├── page.tsx              # 面试类型选择
│   │   ├── session/page.tsx      # 面试进行（对话界面）
│   │   └── result/page.tsx       # 结果报告（雷达图 + 评分）
│   ├── resume/page.tsx           # 简历管理（编辑 + 预览）
│   ├── jobs/page.tsx             # 求职管理（看板 + 时间线）
│   └── settings/page.tsx         # 设置
├── components/
│   ├── layout/app-layout.tsx     # 全局布局组件
│   └── ui/                       # shadcn/ui 组件库 (28 个)
├── lib/
│   ├── utils.ts                  # 工具函数
│   ├── data/                     # 静态数据
│   │   ├── questions.ts          # 面试题库（46 题 · 8 大分类）
│   │   └── interview-questions.ts # 模拟面试题库（16 题 · 3 种类型）
│   └── store/                    # Zustand 状态管理
│       ├── question-store.ts     # 刷题进度 + 筛选 + 收藏
│       ├── interview-store.ts    # 面试状态 + 评分 + 历史
│       ├── resume-store.ts       # 简历数据 + 评分 + 模板
│       └── job-store.ts          # 岗位 + 面试记录 + 统计
└── hooks/
    └── use-mobile.ts             # 移动端检测 Hook
```

## 🎯 技术亮点

- **纯前端架构**：零后端依赖，所有逻辑在浏览器端完成
- **数据持久化**：基于 Zustand `persist` 中间件，刷新不丢失
- **本地 AI 评估**：模拟面试评分引擎完全在本地运行，基于关键词匹配和回答质量进行多维度评分
- **响应式设计**：桌面端侧边栏展开 + 双栏布局、移动端自动收起为抽屉
- **深色模式**：浅色/深色/跟随系统，基于 CSS 自定义属性 (oklch) 实现无缝切换
- **SVG 可视化**：面试结果雷达图和得分圆环使用纯 SVG 绘制，无第三方图表依赖

## 📊 面试题库覆盖

| 分类 | 题目数 | 示例 |
|------|--------|------|
| 数据结构与算法 | 8 | 反转链表、LRU 缓存、岛屿数量 |
| 计算机网络 | 6 | TCP 三次握手、HTTPS、DNS 解析 |
| 操作系统 | 6 | 进程与线程、死锁、虚拟内存 |
| 数据库 | 6 | MySQL 索引、事务隔离、Redis 缓存 |
| 系统设计 | 5 | 短链接系统、秒杀系统、分布式锁 |
| 编程语言 | 5 | Java HashMap、JS 事件循环、Go GMP |
| 前端开发 | 5 | React Hooks、Virtual DOM、CSS 布局 |
| 后端开发 | 5 | Spring Boot、RESTful API、微服务 |

## 📜 许可证

本项目为私有项目，仅供学习和个人使用。
