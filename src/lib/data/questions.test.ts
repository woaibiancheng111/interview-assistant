// 对已提交的抓取产物做完整性校验：
// 题库是运行时数据，坏一条就可能让题目详情页白屏，所以在 CI 里守住。

import { describe, expect, it } from "vitest";
import generated from "./questions.generated.json";
import { isAllowedLicense } from "./ingest/license";
import {
  categories,
  curatedQuestions,
  importedQuestions,
  questions,
  questionSources,
} from "./questions";

describe("questions.generated.json", () => {
  it("每一条都能通过运行时校验（没有被静默丢弃的脏数据）", () => {
    expect(importedQuestions).toHaveLength(generated.questions.length);
  });

  it("题目 id 全局唯一", () => {
    const ids = questions.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("抓取题的 id 带 ext- 前缀，不会和精选题混淆", () => {
    const curatedIds = new Set(curatedQuestions.map((question) => question.id));
    for (const question of importedQuestions) {
      expect(question.id.startsWith("ext-")).toBe(true);
      expect(curatedIds.has(question.id)).toBe(false);
    }
  });

  it("每道抓取题都带完整署名，且协议在白名单内", () => {
    for (const question of importedQuestions) {
      expect(question.source, question.id).toBeDefined();
      expect(isAllowedLicense(question.source!.license), question.source!.license).toBe(true);
      expect(question.source!.url).toMatch(/^https:\/\/github\.com\//);
      expect(question.source!.author).not.toBe("");
    }
  });

  it("分类、难度、频率都在合法取值内", () => {
    for (const question of questions) {
      expect(categories, question.id).toContain(question.category);
      expect(["easy", "medium", "hard"]).toContain(question.difficulty);
      expect(question.frequency).toBeGreaterThanOrEqual(1);
      expect(question.frequency).toBeLessThanOrEqual(5);
      expect(question.title.trim()).not.toBe("");
      expect(question.content.trim()).not.toBe("");
      expect(question.answer.trim()).not.toBe("");
    }
  });

  it("来源统计与题目数量一致", () => {
    for (const source of questionSources) {
      const count = importedQuestions.filter(
        (question) => question.source?.repo === source.repo
      ).length;
      expect(count, source.repo).toBe(source.questionCount);
    }
  });
});
