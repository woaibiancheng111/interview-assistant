// 抓取来源清单
//
// 只收录 GitHub 能机器识别协议、且协议在白名单内的仓库（见 license.ts）。
// expectedLicense 与线上返回不一致时，脚本会拒绝该来源而不是"先抓了再说"。
// 顺序即优先级：同名题目保留靠前来源的版本。

import type { SourceSpec } from "./types";

export interface DocSelector {
  /** 仓库内路径前缀 */
  prefix: string;
  /** 文件名匹配（正则字符串），默认 `\.md$` */
  filePattern?: string;
  /** 排除匹配（正则字符串） */
  excludePattern?: string;
  /** 该前缀下最多取多少篇文档 */
  maxDocs?: number;
}

export interface RegistrySource extends SourceSpec {
  /** 目录选择器；与 paths 合并后作为最终抓取列表 */
  docs?: DocSelector[];
}

export const SOURCES: RegistrySource[] = [
  {
    id: "javaguide",
    repo: "Snailclimb/JavaGuide",
    name: "JavaGuide",
    expectedLicense: "Apache-2.0",
    parser: "question-headings",
    defaultCategory: "后端开发",
    paths: [],
    docs: [
      { prefix: "docs/cs-basics/network/", maxDocs: 12 },
      { prefix: "docs/cs-basics/operating-system/", maxDocs: 10 },
      { prefix: "docs/database/mysql/", maxDocs: 10 },
      { prefix: "docs/database/redis/", maxDocs: 8 },
      { prefix: "docs/java/basis/", maxDocs: 8 },
      { prefix: "docs/java/concurrent/", maxDocs: 8 },
      { prefix: "docs/java/jvm/", maxDocs: 6 },
      { prefix: "docs/java/collection/", maxDocs: 6 },
    ],
    maxQuestions: 140,
    options: { minLevel: 3, maxLevel: 5 },
    note: "计算机基础与 Java 方向的高频八股，按问句标题拆题。",
  },
  {
    id: "advanced-java",
    repo: "doocs/advanced-java",
    name: "advanced-java",
    expectedLicense: "CC-BY-SA-4.0",
    parser: "advanced-java",
    defaultCategory: "系统设计",
    paths: [],
    docs: [
      { prefix: "docs/high-concurrency/", maxDocs: 22 },
      { prefix: "docs/distributed-system/", maxDocs: 12 },
      { prefix: "docs/high-availability/", maxDocs: 10 },
      { prefix: "docs/micro-services/", maxDocs: 8 },
    ],
    maxQuestions: 48,
    extraTags: ["分布式"],
    note: "文档结构固定为 面试题 / 面试官心理分析 / 面试题剖析，天然适合作为题目。",
  },
  {
    id: "leetcode",
    repo: "doocs/leetcode",
    name: "doocs/leetcode 题解",
    expectedLicense: "CC-BY-SA-4.0",
    parser: "leetcode",
    defaultCategory: "数据结构与算法",
    paths: [],
    docs: [
      {
        prefix: "solution/0000-0099/",
        filePattern: "/README\\.md$",
        excludePattern: "README_EN\\.md$",
        maxDocs: 45,
      },
    ],
    maxQuestions: 45,
    extraTags: ["LeetCode"],
    note: "LeetCode 前 100 号中的经典算法题（当前收录 44 道）中文题面与题解，难度与标签取自文档 frontmatter。",
  },
  {
    id: "js-questions",
    repo: "lydiahallie/javascript-questions",
    name: "JavaScript 进阶问题列表",
    expectedLicense: "MIT",
    parser: "details-quiz",
    defaultCategory: "前端开发",
    paths: ["zh-CN/README-zh_CN.md"],
    maxQuestions: 40,
    extraTags: ["JavaScript"],
    note: "官方中文版；每题含选项与折叠解析，适合前端自测。",
  },
];

/** 按 id 取来源配置 */
export function findSource(id: string): RegistrySource | undefined {
  return SOURCES.find((source) => source.id === id);
}
