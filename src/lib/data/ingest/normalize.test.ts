import { describe, expect, it } from "vitest";
import type { QuestionSource } from "../question-types";
import {
  buildTags,
  inferCategory,
  inferDifficulty,
  inferFrequency,
  makeQuestionId,
  MAX_ANSWER_LENGTH,
  shortenTitle,
  toQuestion,
} from "./normalize";
import type { ParsedQa, SourceSpec } from "./types";

const SPEC: SourceSpec = {
  id: "demo",
  repo: "o/r",
  name: "Demo",
  expectedLicense: "MIT",
  parser: "question-headings",
  defaultCategory: "后端开发",
  paths: [],
  maxQuestions: 10,
  extraTags: ["开源题库"],
};

const SOURCE: QuestionSource = {
  sourceId: "demo",
  repo: "o/r",
  repoName: "Demo",
  url: "https://github.com/o/r/blob/main/docs/a.md#x",
  license: "MIT",
  licenseUrl: "https://opensource.org/licenses/MIT",
  author: "o",
  fetchedAt: "2026-07-26",
};

const LONG_ANSWER = "TCP 通过三次握手建立连接，保证双方的收发能力都是正常的。".repeat(8);

describe("inferCategory", () => {
  it("按关键词命中数选择分类", () => {
    expect(
      inferCategory("docs/cs-basics/network/tcp.md TCP 三次握手 http", "后端开发")
    ).toBe("计算机网络");
    expect(
      inferCategory("docs/database/mysql/index.md MySQL 索引 事务 explain", "后端开发")
    ).toBe("数据库");
    expect(
      inferCategory("docs/high-concurrency/mq.md 消息队列 kafka 削峰 限流", "后端开发")
    ).toBe("系统设计");
    expect(inferCategory("solution/0001 两数之和 哈希表 时间复杂度", "前端开发")).toBe(
      "数据结构与算法"
    );
  });

  it("完全没有命中时回退到来源默认分类", () => {
    expect(inferCategory("一些无关内容", "后端开发")).toBe("后端开发");
  });
});

describe("难度与频率", () => {
  it("按关键词与篇幅推断难度", () => {
    expect(inferDifficulty("什么是 HTTP", 300)).toBe("easy");
    expect(inferDifficulty("MVCC 底层实现原理", 2000)).toBe("hard");
    expect(inferDifficulty("普通内容", 1200)).toBe("medium");
  });

  it("高频考点频率更高且不越界", () => {
    expect(inferFrequency("TCP 三次握手", 2500)).toBe(5);
    expect(inferFrequency("冷门内容", 300)).toBe(3);
    expect(inferFrequency("索引", 5000)).toBeLessThanOrEqual(5);
  });
});

describe("buildTags", () => {
  it("合并固定标签、来源标签与关键词标签，最多 5 个", () => {
    const tags = buildTags("TCP HTTP Redis MySQL 索引 事务", ["计算机网络"], ["开源题库"]);
    expect(tags[0]).toBe("开源题库");
    expect(tags).toContain("计算机网络");
    expect(tags.length).toBeLessThanOrEqual(5);
  });
});

describe("shortenTitle", () => {
  it("短标题保持原样", () => {
    expect(shortenTitle("什么是 TCP？")).toBe("什么是 TCP？");
  });

  it("长标题在标点处截断并加省略号", () => {
    const title = shortenTitle(
      "OSI 七层模型是什么？每一层的作用是什么？请结合实际的网络请求场景展开说明各层职责"
    );
    expect(title.endsWith("…")).toBe(true);
    expect(title.length).toBeLessThanOrEqual(37);
  });
});

describe("makeQuestionId", () => {
  const qa: ParsedQa = { question: "问题", content: "问题", answer: "答案", anchor: "a" };

  it("同一篇文档的同一道题 id 稳定", () => {
    expect(makeQuestionId(SPEC, "docs/a.md", qa)).toBe(makeQuestionId(SPEC, "docs/a.md", qa));
  });

  it("不同锚点或不同文档产生不同 id", () => {
    expect(makeQuestionId(SPEC, "docs/a.md", qa)).not.toBe(
      makeQuestionId(SPEC, "docs/b.md", qa)
    );
    expect(makeQuestionId(SPEC, "docs/a.md", qa)).not.toBe(
      makeQuestionId(SPEC, "docs/a.md", { ...qa, anchor: "b" })
    );
  });

  it("id 带来源前缀，便于与站内精选题区分", () => {
    expect(makeQuestionId(SPEC, "docs/a.md", qa)).toMatch(/^ext-demo-[0-9a-f]{8}$/);
  });
});

describe("toQuestion", () => {
  it("产出完整的 Question 并带上来源信息", () => {
    const question = toQuestion({
      spec: SPEC,
      docPath: "docs/cs-basics/network/tcp.md",
      source: SOURCE,
      qa: {
        question: "TCP 三次握手的过程是什么？",
        content: "TCP 三次握手的过程是什么？",
        answer: LONG_ANSWER,
        tags: ["计算机网络"],
      },
    });

    expect(question).not.toBeNull();
    expect(question!.category).toBe("计算机网络");
    expect(question!.source?.repo).toBe("o/r");
    expect(question!.frequency).toBeGreaterThanOrEqual(3);
    expect(question!.id.startsWith("ext-demo-")).toBe(true);
  });

  it("答案过短时丢弃", () => {
    expect(
      toQuestion({
        spec: SPEC,
        docPath: "docs/a.md",
        source: SOURCE,
        qa: { question: "问题？", content: "问题？", answer: "太短了。" },
      })
    ).toBeNull();
  });

  it("超长答案被截断到上限附近", () => {
    const question = toQuestion({
      spec: SPEC,
      docPath: "docs/a.md",
      source: SOURCE,
      qa: {
        question: "很长的题目？",
        content: "很长的题目？",
        answer: "内容。".repeat(5000),
      },
    });
    expect(question!.answer.length).toBeLessThanOrEqual(MAX_ANSWER_LENGTH + 60);
  });
});
