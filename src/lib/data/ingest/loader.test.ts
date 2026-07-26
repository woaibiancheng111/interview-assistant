import { describe, expect, it } from "vitest";
import { parseGeneratedQuestion, parseGeneratedQuestions, parseGeneratedSources } from "./loader";

const VALID = {
  id: "ext-demo-abcdef12",
  title: "什么是 TCP",
  category: "计算机网络",
  difficulty: "medium",
  tags: ["TCP"],
  content: "题干",
  answer: "答案",
  hints: ["提示"],
  frequency: 4,
  source: {
    sourceId: "demo",
    repo: "o/r",
    repoName: "Demo",
    url: "https://github.com/o/r",
    license: "MIT",
    licenseUrl: "https://opensource.org/licenses/MIT",
    author: "o",
    fetchedAt: "2026-07-26",
  },
};

describe("parseGeneratedQuestion", () => {
  it("接受结构完整的记录", () => {
    const question = parseGeneratedQuestion(VALID);
    expect(question?.id).toBe("ext-demo-abcdef12");
    expect(question?.source?.license).toBe("MIT");
  });

  it("拒绝分类或难度非法的记录", () => {
    expect(parseGeneratedQuestion({ ...VALID, category: "玄学" })).toBeNull();
    expect(parseGeneratedQuestion({ ...VALID, difficulty: "impossible" })).toBeNull();
    expect(parseGeneratedQuestion({ ...VALID, id: "" })).toBeNull();
    expect(parseGeneratedQuestion(null)).toBeNull();
  });

  it("兜底修正频率并丢弃残缺的来源信息", () => {
    const question = parseGeneratedQuestion({
      ...VALID,
      frequency: 99,
      source: { repo: "o/r" },
    });
    expect(question?.frequency).toBe(5);
    expect(question?.source).toBeUndefined();
  });
});

describe("parseGeneratedQuestions", () => {
  it("过滤脏数据而不是抛错", () => {
    const questions = parseGeneratedQuestions({
      questions: [VALID, { id: "bad" }, null, { ...VALID, id: "ext-demo-2" }],
    });
    expect(questions.map((question) => question.id)).toEqual([
      "ext-demo-abcdef12",
      "ext-demo-2",
    ]);
  });

  it("结构不对时返回空数组", () => {
    expect(parseGeneratedQuestions(null)).toEqual([]);
    expect(parseGeneratedQuestions({})).toEqual([]);
    expect(parseGeneratedQuestions({ questions: "x" })).toEqual([]);
  });
});

describe("parseGeneratedSources", () => {
  it("只保留字段齐全的来源", () => {
    const sources = parseGeneratedSources({
      sources: [
        {
          id: "demo",
          repo: "o/r",
          name: "Demo",
          url: "https://github.com/o/r",
          license: "MIT",
          licenseUrl: "https://opensource.org/licenses/MIT",
          author: "o",
          questionCount: 3,
        },
        { id: "broken" },
      ],
    });
    expect(sources).toHaveLength(1);
    expect(sources[0].id).toBe("demo");
  });
});
