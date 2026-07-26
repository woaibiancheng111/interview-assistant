// 题库核心类型与常量
// 单独成文件，供运行时代码与离线抓取脚本（scripts/fetch-questions.ts）共用，
// 避免 questions.ts <-> ingest 模块之间的循环依赖。

export type Difficulty = "easy" | "medium" | "hard";

export type Category =
  | "数据结构与算法"
  | "计算机网络"
  | "操作系统"
  | "数据库"
  | "系统设计"
  | "编程语言"
  | "前端开发"
  | "后端开发";

/** 外部开源题目的出处信息，用于满足署名类开源协议的要求 */
export interface QuestionSource {
  /** 来源配置 id，例如 "javaguide" */
  sourceId: string;
  /** GitHub 仓库全名，例如 "Snailclimb/JavaGuide" */
  repo: string;
  /** 仓库展示名 */
  repoName: string;
  /** 原文链接 */
  url: string;
  /** SPDX 协议标识，例如 "Apache-2.0" */
  license: string;
  /** 协议原文链接 */
  licenseUrl: string;
  /** 版权归属（仓库所有者） */
  author: string;
  /** 抓取日期（YYYY-MM-DD） */
  fetchedAt: string;
}

export interface Question {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  tags: string[];
  content: string;
  answer: string;
  hints: string[];
  frequency: number; // 1-5
  /** 存在则表示题目来自外部开源仓库，需要展示署名 */
  source?: QuestionSource;
}

export const categories: Category[] = [
  "数据结构与算法",
  "计算机网络",
  "操作系统",
  "数据库",
  "系统设计",
  "编程语言",
  "前端开发",
  "后端开发",
];

export const categoryIcons: Record<Category, string> = {
  "数据结构与算法": "BinaryTree",
  "计算机网络": "Globe",
  "操作系统": "Monitor",
  "数据库": "Database",
  "系统设计": "LayoutGrid",
  "编程语言": "Code",
  "前端开发": "MonitorSmartphone",
  "后端开发": "Server",
};

export const difficultyLabels: Record<Difficulty, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

export const difficulties: Difficulty[] = ["easy", "medium", "hard"];

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (categories as string[]).includes(value);
}

export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && (difficulties as string[]).includes(value);
}
