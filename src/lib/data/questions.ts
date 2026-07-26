// 题库入口：站内精选题 + 开源仓库抓取题
//
// - 类型与常量见 question-types.ts
// - 精选题见 questions.curated.ts（人工维护）
// - 抓取题见 questions.generated.json（由 `npm run questions:fetch` 生成，含来源与协议信息）

import generated from "./questions.generated.json";
import { parseGeneratedQuestions, parseGeneratedSources } from "./ingest/loader";
import { curatedQuestions } from "./questions.curated";
import type { Question } from "./question-types";

export * from "./question-types";
export { curatedQuestions };
export type { GeneratedSourceSummary } from "./ingest/loader";

/** 抓取所得题目（运行时已做结构校验，脏数据会被丢弃） */
export const importedQuestions: Question[] = parseGeneratedQuestions(generated);

/** 抓取来源清单，用于设置页/署名展示 */
export const questionSources = parseGeneratedSources(generated);

/** 抓取产物的生成时间 */
export const questionsGeneratedAt: string =
  typeof (generated as { generatedAt?: unknown }).generatedAt === "string"
    ? (generated as { generatedAt: string }).generatedAt
    : "";

export const questions: Question[] = [...curatedQuestions, ...importedQuestions];
