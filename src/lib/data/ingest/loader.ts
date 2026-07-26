// 运行时加载抓取产物
//
// questions.generated.json 是脚本生成的，可能因为解析器变更而出现脏数据，
// 因此运行时做一次校验：不合法的条目直接丢弃，绝不让题库页面崩掉。

import {
  isCategory,
  isDifficulty,
  type Question,
  type QuestionSource,
} from "../question-types";

export interface GeneratedSourceSummary {
  id: string;
  repo: string;
  name: string;
  url: string;
  license: string;
  licenseUrl: string;
  author: string;
  questionCount: number;
}

export interface GeneratedQuestionFile {
  generatedAt: string;
  sources: GeneratedSourceSummary[];
  questions: Question[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function parseSource(raw: unknown): QuestionSource | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const source = raw as Record<string, unknown>;
  const required = ["sourceId", "repo", "repoName", "url", "license", "licenseUrl", "author"];
  if (!required.every((key) => isNonEmptyString(source[key]))) return undefined;
  return {
    sourceId: source.sourceId as string,
    repo: source.repo as string,
    repoName: source.repoName as string,
    url: source.url as string,
    license: source.license as string,
    licenseUrl: source.licenseUrl as string,
    author: source.author as string,
    fetchedAt: isNonEmptyString(source.fetchedAt) ? source.fetchedAt : "",
  };
}

export function parseGeneratedQuestion(raw: unknown): Question | null {
  if (typeof raw !== "object" || raw === null) return null;
  const value = raw as Record<string, unknown>;
  if (!isNonEmptyString(value.id)) return null;
  if (!isNonEmptyString(value.title)) return null;
  if (!isNonEmptyString(value.content)) return null;
  if (!isNonEmptyString(value.answer)) return null;
  if (!isCategory(value.category)) return null;
  if (!isDifficulty(value.difficulty)) return null;

  const frequency = typeof value.frequency === "number" ? value.frequency : 3;
  const tags = Array.isArray(value.tags)
    ? value.tags.filter(isNonEmptyString).slice(0, 6)
    : [];
  const hints = Array.isArray(value.hints)
    ? value.hints.filter(isNonEmptyString).slice(0, 5)
    : [];

  return {
    id: value.id,
    title: value.title,
    category: value.category,
    difficulty: value.difficulty,
    tags,
    content: value.content,
    answer: value.answer,
    hints,
    frequency: Math.min(5, Math.max(1, Math.round(frequency))),
    source: parseSource(value.source),
  };
}

/** 解析整个抓取产物；结构不对时返回空数组而不是抛错 */
export function parseGeneratedQuestions(raw: unknown): Question[] {
  if (typeof raw !== "object" || raw === null) return [];
  const questions = (raw as { questions?: unknown }).questions;
  if (!Array.isArray(questions)) return [];
  return questions
    .map(parseGeneratedQuestion)
    .filter((question): question is Question => question !== null);
}

export function parseGeneratedSources(raw: unknown): GeneratedSourceSummary[] {
  if (typeof raw !== "object" || raw === null) return [];
  const sources = (raw as { sources?: unknown }).sources;
  if (!Array.isArray(sources)) return [];
  return sources.filter((source): source is GeneratedSourceSummary => {
    if (typeof source !== "object" || source === null) return false;
    const value = source as Record<string, unknown>;
    return ["id", "repo", "name", "url", "license", "licenseUrl", "author"].every((key) =>
      isNonEmptyString(value[key])
    );
  });
}
