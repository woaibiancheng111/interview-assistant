import { describe, expect, it } from "vitest";
import type { Question } from "../question-types";
import { dedupeQuestions, normalizeTitleKey } from "./dedupe";

function makeQuestion(id: string, title: string): Question {
  return {
    id,
    title,
    category: "计算机网络",
    difficulty: "medium",
    tags: [],
    content: "内容",
    answer: "答案",
    hints: [],
    frequency: 3,
  };
}

describe("normalizeTitleKey", () => {
  it("忽略标点、空格与大小写差异", () => {
    expect(normalizeTitleKey("什么是 TCP？")).toBe(normalizeTitleKey("什么是tcp"));
    expect(normalizeTitleKey("HTTP 与 HTTPS 的区别")).toBe(
      normalizeTitleKey("http与https的区别")
    );
  });
});

describe("dedupeQuestions", () => {
  it("丢弃与站内精选题重名的抓取题", () => {
    const existing = [makeQuestion("net-001", "TCP 三次握手")];
    const incoming = [
      makeQuestion("ext-a-1", "TCP 三次握手？"),
      makeQuestion("ext-a-2", "什么是 HTTP"),
    ];

    const { kept, dropped } = dedupeQuestions(existing, incoming);
    expect(kept.map((question) => question.id)).toEqual(["ext-a-2"]);
    expect(dropped[0].reason).toBe("标题重复");
  });

  it("抓取结果内部也去重，且先到先得", () => {
    const incoming = [
      makeQuestion("ext-a-1", "什么是索引"),
      makeQuestion("ext-b-1", "什么是索引？"),
      makeQuestion("ext-a-1", "重复 id"),
    ];

    const { kept, dropped } = dedupeQuestions([], incoming);
    expect(kept.map((question) => question.id)).toEqual(["ext-a-1"]);
    expect(dropped.map((item) => item.reason)).toEqual(["标题重复", "id 重复"]);
  });

  it("空输入不报错", () => {
    expect(dedupeQuestions([], [])).toEqual({ kept: [], dropped: [] });
  });
});
