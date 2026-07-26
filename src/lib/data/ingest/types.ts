import type { Category, Difficulty } from "../question-types";
import type { UrlBases } from "./markdown";

/** 解析器的输入：一篇已下载的 Markdown 文档 */
export interface SourceDoc {
  /** 仓库内路径，例如 docs/cs-basics/network/other-network-questions.md */
  path: string;
  /** 原始 Markdown 内容 */
  markdown: string;
  /** 相对链接改写所需的基址 */
  bases: UrlBases;
}

/** 解析器的输出：一道尚未归一化的题目 */
export interface ParsedQa {
  /** 完整问句 */
  question: string;
  /** 题干正文，为空时回退为 question */
  content: string;
  /** 参考答案（Markdown） */
  answer: string;
  hints?: string[];
  tags?: string[];
  difficulty?: Difficulty;
  /** 原文锚点，用于拼接跳转链接 */
  anchor?: string;
}

export type ParserId =
  | "question-headings"
  | "advanced-java"
  | "leetcode"
  | "details-quiz";

/** 单个抓取来源的配置 */
export interface SourceSpec {
  /** 稳定 id，参与题目 id 生成，不要随意改动 */
  id: string;
  /** GitHub 仓库全名 */
  repo: string;
  /** 展示名 */
  name: string;
  /** 期望的 SPDX 协议；与 GitHub API 返回值不一致时跳过该来源 */
  expectedLicense: string;
  /** 解析器 */
  parser: ParserId;
  /** 默认分类，解析结果没有更精确的判断时使用 */
  defaultCategory: Category;
  /** 需要抓取的文档路径（相对仓库根目录） */
  paths: string[];
  /** 该来源最多产出多少题 */
  maxQuestions: number;
  /** 追加到每道题上的固定标签 */
  extraTags?: string[];
  /** 解析器可选参数 */
  options?: {
    /** question-headings：参与识别的标题级别范围 */
    minLevel?: number;
    maxLevel?: number;
  };
  /** 说明这个来源为什么可用（写进 ATTRIBUTIONS.md） */
  note?: string;
}

/** 抓取过程中的单条日志，用于最终报告 */
export interface SourceReport {
  id: string;
  repo: string;
  license: string | null;
  accepted: boolean;
  reason?: string;
  docsFetched: number;
  parsed: number;
  kept: number;
  dropped: number;
}
