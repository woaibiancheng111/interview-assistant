# 🎓 CS 面试助手 (CS Interview Assistant)

> 一站式计算机专业面试求职平台 —— 题库刷题 · AI 模拟面试 · 简历优化 · 求职管理

## ✨ 项目亮点 (Key Features)

本项目是一款专门针对计算机专业学生和初高级开发者的 **全前端驱动面试求职辅助利器**。它极大地提升了备战面试的效率和体验：

* 🚀 **极速全栈体验，零后端负担** 
  利用 Next.js 16.x App Router 与客户端缓存构建。所有核心数据（刷题记录、简历草稿、收藏夹等）均通过 `Zustand` 搭配 `persist` 在本地 `localStorage` 进行高性能持久化，做到打开即用，无需登录，甚至支持离线访问。
* 📝 **富文本优雅阅读与代码高亮** 
  所有题库和题解均使用 `@tailwindcss/typography` 结合 `react-markdown` 渲染，内置高保真 `github-dark` 代码高亮，无论是算法解析还是代码复现都能获得绝佳的阅读体验。
* 🌓 **全局无缝状态同步与暗色模式** 
  全面整合 `next-themes`，不仅提供了随心配置的明亮/暗黑/跟随系统三种主题环境，更保证了系统多标签页、根节点与各类深层面板间的 UI 状态实时双向绑定。
* 🤖 **极客风 AI 模拟面试引擎** 
  具备高度拟真度的面试评分系统：按知识维度客观计分（丢弃随机数惩罚，分数绝对公平）、根据用户的文字详细程度智能给分，并输出专业点评雷达图与雷达图能力维度的强弱项建议。
* 💼 **Kanban 看板投递追踪** 
  类似精简版 Trello 或 Notion，通过流畅的看板 UI，轻松拖拽记录、整理从“简历投递”到“拿到 Offer”的全生命周期状态转化，对自己的求职漏斗一目了然。
* 🛡️ **支持数据自由迁移与完整保护** 
  特有定制化序列化方案（完美解决 JavaScript `Set` 集合数据类型的序列化难题），一键即可无损导出所有刷题进度和收藏信息存为本地离线 JSON 包，且随时可以恢复导入，永远拥有数据的绝对控制权。

## 🎯 核心功能模块

| 板块 | 功能描述 |
|------|----------|
| 📚 **面试题库** | 8 大垂直领域分类（数据结构、网络、数据库等）、46+ 核心高频精选题目，支持独立沉浸阅读模式和多维混合筛选、备忘笔记书写 |
| 🎤 **模拟面试** | 三大方向覆盖：技术钻研面 / HR 综合评估 / 行为深挖面（STAR 法则）。附带全套回答评估与专项意见反馈 |
| 📝 **简历管理** | 多重步骤式动态建立向导展示，具备 100% 连通真实数据的【动态健康度评分系统】，并内置高颜值经典简历模板 |
| 💼 **求职追踪** | 通过可交互视图或面试时间线视图，将繁杂零散的面试排期理清，助你精准投递、有效复盘 |
| ⚙️ **控制中心** | 支持全局一键清空记录、全量数据一键备份并迁移、主题环境管理 |

## 🛠 技术栈

* **Web 框架**：[Next.js 16.x](https://nextjs.org/) (App Router + Turbopack)
* **核心语言**：[TypeScript](https://www.typescriptlang.org/) (5.x, 全面类型追踪)
* **状态管理**：[Zustand](https://zustand-demo.pmnd.rs/) (结合中间件负责数据深度持久化控制)
* **样式驱动**：[Tailwind CSS v4](https://tailwindcss.com/)
* **组件引擎**：[shadcn/ui](https://ui.shadcn.com/) + `@base-ui/react` + `Lucide React`
* **Markdown 解析**：`react-markdown` + `remark-gfm` + `rehype-highlight`

## 🚀 快速开始

### 环境依赖
- **Node.js**: >= 18
- **npm**: >= 9

### 安装与运行

```bash
# 克隆项目仓库
git clone <仓库地址>
cd interview-assistant

# 极速拉取依赖
npm install

# 启动研发环境与监听热重载
npm run dev
```

成功后访问 [http://localhost:3000](http://localhost:3000) 即刻开始体验刷题。

## 📁 目录结构快览

```text
src/
├── app/                          # 原生 App Router 目录体系
│   ├── layout.tsx                # App Root (装配 ThemeProvider)
│   ├── page.tsx                  # Dashboard 看板 (全局数据统计)
│   ├── globals.css               # 标准 CSS + 变量装配 + TW 插件引入
│   ├── questions/                # 题库专属版块
│   │   ├── page.tsx              # 筛选器和题库核心 List 渲染视图
│   │   └── [id]/page.tsx         # 题目详情专用落地屏
│   ├── interview/                # 面试场馆
│   ├── resume/                   # 简历编辑器
│   ├── jobs/                     # 投递进度追踪
│   └── settings/                 # 设置与数据流接管
├── components/
│   ├── layout/app-layout.tsx     # 左侧导航 + 响应式顶部
│   ├── theme-provider.tsx        # Next-Themes 桥接
│   └── ui/                       # 大量原语/无头原子组件集成
├── hooks/
│   └── use-hydration.ts          # 用于平滑处理服务端渲染数据闪烁的自定义 Hook
└── lib/
    ├── data/                     # 系统内核静态知识库数据集
    └── store/                    # Zustand Store 中心 (题目、面试历史、求职等业务容器)
```
