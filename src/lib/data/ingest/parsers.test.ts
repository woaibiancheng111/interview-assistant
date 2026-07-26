import { describe, expect, it } from "vitest";
import {
  cleanHeading,
  isQuestionTitle,
  parseAdvancedJava,
  parseDetailsQuiz,
  parseLeetcode,
  parseQuestionHeadings,
  slugifyAnchor,
  toHints,
} from "./parsers";
import type { SourceDoc } from "./types";

const LONG = "这里是一段足够长的解析内容，用于让答案通过最小长度校验。".repeat(6);

function makeDoc(markdown: string, docPath = "docs/cs-basics/network/demo.md"): SourceDoc {
  return {
    path: docPath,
    markdown,
    bases: {
      rawBase: "https://raw.githubusercontent.com/o/r/main/",
      blobBase: "https://github.com/o/r/blob/main/",
      docDir: docPath.slice(0, docPath.lastIndexOf("/") + 1),
    },
  };
}

describe("标题判定", () => {
  it("识别问句与常见提问模式", () => {
    expect(isQuestionTitle("OSI 七层模型是什么？")).toBe(true);
    expect(isQuestionTitle("TCP 和 UDP 有什么区别")).toBe(true);
    expect(isQuestionTitle("参考资料")).toBe(false);
    expect(isQuestionTitle("HTTP")).toBe(false);
    expect(isQuestionTitle("1.2")).toBe(false);
  });

  it("清洗序号、锚点与链接", () => {
    expect(cleanHeading("1.2 什么是 TCP？{#tcp}")).toBe("什么是 TCP？");
    expect(cleanHeading("[两数之和](https://leetcode.cn/problems/two-sum)")).toBe("两数之和");
    // 锚点保留序号：GitHub 锚点带序号，且序号是同名标题唯一性的来源
    expect(slugifyAnchor("2. 什么是 TCP？")).toBe("2-什么是-tcp");
    expect(slugifyAnchor("1. 输出是什么？")).not.toBe(slugifyAnchor("2. 输出是什么？"));
  });
});

describe("parseQuestionHeadings", () => {
  const doc = makeDoc(
    [
      "---",
      "title: 计算机网络常见面试题",
      "tag:",
      "    - 计算机网络",
      "---",
      "",
      "# 计算机网络常见面试题总结",
      "",
      "## 网络分层模型",
      "",
      "### OSI 七层模型是什么？",
      "",
      LONG,
      "",
      "![图](images/osi.png)",
      "",
      "### TCP 三次握手过程是怎样的？",
      "",
      LONG,
      "",
      "### 太短的问题是什么？",
      "",
      "一句话。",
      "",
      "## 参考资料",
      "",
      LONG,
    ].join("\n")
  );

  const parsed = parseQuestionHeadings(doc);

  it("只保留问句标题，且过滤掉过短的答案", () => {
    expect(parsed.map((qa) => qa.question)).toEqual([
      "OSI 七层模型是什么？",
      "TCP 三次握手过程是怎样的？",
    ]);
  });

  it("不会把包含子问题的父级小节重复收录", () => {
    expect(parsed.some((qa) => qa.question.includes("网络分层模型"))).toBe(false);
  });

  it("继承 frontmatter 标签并改写相对图片链接", () => {
    expect(parsed[0].tags).toEqual(["计算机网络"]);
    expect(parsed[0].answer).toContain(
      "https://raw.githubusercontent.com/o/r/main/docs/cs-basics/network/images/osi.png"
    );
    expect(parsed[0].anchor).toBe("osi-七层模型是什么");
  });
});

describe("parseAdvancedJava", () => {
  const doc = makeDoc(
    [
      "# Redis 持久化机制",
      "",
      "## 面试题",
      "",
      "Redis 的持久化有哪几种方式？不同的持久化机制都有什么优缺点？",
      "",
      "## 面试官心理分析",
      "",
      "如果 Redis 宕机了再重启，内存里的数据就全部丢了，所以必须要有持久化机制来兜底。",
      "",
      "## 面试题剖析",
      "",
      LONG,
    ].join("\n"),
    "docs/high-concurrency/redis-persistence.md"
  );

  it("按 面试题 / 心理分析 / 剖析 三段拆解", () => {
    const [qa] = parseAdvancedJava(doc);
    expect(qa.question).toBe("Redis 持久化机制");
    expect(qa.content).toContain("持久化有哪几种方式");
    expect(qa.answer).toContain("最小长度校验");
    expect(qa.hints?.[0]).toContain("宕机");
  });

  it("剖析内容过短时不产出题目", () => {
    const shortDoc = makeDoc(
      ["# 标题", "", "## 面试题", "", "问题？", "", "## 面试题剖析", "", "太短。"].join("\n")
    );
    expect(parseAdvancedJava(shortDoc)).toHaveLength(0);
  });

  it("toHints 只取长度适中的句子", () => {
    expect(toHints("短。这是一句长度适中的提示内容，可以作为提示展示给用户。")).toEqual([
      "这是一句长度适中的提示内容，可以作为提示展示给用户。",
    ]);
  });
});

describe("parseLeetcode", () => {
  const doc = makeDoc(
    [
      "---",
      "difficulty: 简单",
      "tags:",
      "    - 数组",
      "    - 哈希表",
      "---",
      "",
      "# [1. 两数之和](https://leetcode.cn/problems/two-sum)",
      "",
      "## 题目描述",
      "",
      "<p>给定一个整数数组 <code>nums</code>&nbsp;和一个整数目标值 <code>target</code>。</p>",
      "",
      "## 解法",
      "",
      "### 方法一：哈希表",
      "",
      LONG,
      "",
      '=== "Python3"',
      "",
      "    ```python",
      "    print(1)",
      "    ```",
    ].join("\n"),
    "solution/0000-0099/0001.Two Sum/README.md"
  );

  it("取用 frontmatter 的难度与标签", () => {
    const [qa] = parseLeetcode(doc);
    expect(qa.question).toBe("1. 两数之和");
    expect(qa.difficulty).toBe("easy");
    expect(qa.tags).toEqual(["数组", "哈希表"]);
  });

  it("题面 HTML 转 Markdown，题解展开代码分页", () => {
    const [qa] = parseLeetcode(doc);
    expect(qa.content).toContain("`nums`");
    expect(qa.content).not.toContain("<p>");
    expect(qa.answer).toContain("**Python3**");
    expect(qa.answer).toContain("```python");
  });

  it("缺少题解时不产出题目", () => {
    const noSolution = makeDoc(["# [2. 标题](https://x)", "", "## 题目描述", "", "<p>x</p>"].join("\n"));
    expect(parseLeetcode(noSolution)).toHaveLength(0);
  });
});

describe("parseDetailsQuiz", () => {
  const doc = makeDoc(
    [
      "# JavaScript 进阶问题列表",
      "",
      "###### 1. 输出是什么？",
      "",
      "```javascript",
      "console.log(name)",
      "```",
      "",
      "- A: `Lydia`",
      "- B: `undefined`",
      "",
      "<details><summary><b>答案</b></summary>",
      "<p>",
      "#### 答案：B",
      "",
      LONG,
      "</p>",
      "</details>",
    ].join("\n"),
    "zh-CN/README-zh_CN.md"
  );

  it("题干与折叠答案分离，并带上题号", () => {
    const [qa] = parseDetailsQuiz(doc);
    expect(qa.question).toBe("JavaScript 进阶第 1 题：输出是什么？");
    expect(qa.content).toContain("console.log(name)");
    expect(qa.content).not.toContain("答案：B");
    expect(qa.answer).toContain("答案：B");
  });
});
