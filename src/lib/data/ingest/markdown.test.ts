import { describe, expect, it } from "vitest";
import {
  absolutizeUrls,
  decodeEntities,
  extractDetails,
  hashString,
  htmlToMarkdown,
  normalizeTabbedCode,
  parseFrontmatter,
  removeDetails,
  splitSections,
  toPlainText,
  truncateMarkdown,
} from "./markdown";

const BASES = {
  rawBase: "https://raw.githubusercontent.com/o/r/main/",
  blobBase: "https://github.com/o/r/blob/main/",
  docDir: "docs/cs-basics/network/",
};

describe("parseFrontmatter", () => {
  it("解析键值对与列表", () => {
    const { data, body } = parseFrontmatter(
      ["---", "title: 计算机网络", "difficulty: 简单", "tags:", "    - 数组", "    - 哈希表", "---", "", "# 正文"].join("\n")
    );
    expect(data.title).toBe("计算机网络");
    expect(data.difficulty).toBe("简单");
    expect(data.tags).toEqual(["数组", "哈希表"]);
    expect(body.trim()).toBe("# 正文");
  });

  it("没有 frontmatter 时原样返回", () => {
    const markdown = "# 标题\n\n正文";
    expect(parseFrontmatter(markdown)).toEqual({ data: {}, body: markdown });
  });
});

describe("splitSections", () => {
  it("小节包含其子小节，且忽略代码块内的 #", () => {
    const markdown = [
      "# 顶层",
      "",
      "## A",
      "a-body",
      "",
      "### A1",
      "a1-body",
      "",
      "```bash",
      "# 这不是标题",
      "```",
      "",
      "## B",
      "b-body",
    ].join("\n");

    const sections = splitSections(markdown);
    expect(sections.map((section) => section.title)).toEqual(["顶层", "A", "A1", "B"]);

    const sectionA = sections.find((section) => section.title === "A")!;
    expect(sectionA.body).toContain("a1-body");
    expect(sectionA.body).not.toContain("b-body");
    expect(sections.some((section) => section.title === "这不是标题")).toBe(false);
  });
});

describe("details 块", () => {
  const markdown = [
    "问题正文",
    "<details><summary><b>答案</b></summary>",
    "<p>",
    "#### 答案：D",
    "</p>",
    "</details>",
  ].join("\n");

  it("提取答案", () => {
    const blocks = extractDetails(markdown);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].summary).toBe("答案");
    expect(blocks[0].body).toContain("答案：D");
  });

  it("移除后只剩题干", () => {
    expect(removeDetails(markdown)).toBe("问题正文");
  });
});

describe("htmlToMarkdown", () => {
  it("转换 LeetCode 风格的题面", () => {
    const html = [
      "<p>给定一个整数数组 <code>nums</code>&nbsp;和目标值 <strong>target</strong>。</p>",
      "<pre>",
      "<strong>输入：</strong>nums = [2,7], target = 9",
      "</pre>",
      "<ul><li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li></ul>",
    ].join("\n");

    const markdown = htmlToMarkdown(html);
    expect(markdown).toContain("`nums`");
    expect(markdown).toContain("**target**");
    expect(markdown).toContain("```");
    expect(markdown).toContain("输入：nums = [2,7], target = 9");
    // 转义后的尖括号不能让剥离标签的正则把整段列表项吃掉
    expect(markdown).toContain("- `2 <= nums.length <= 10^4`");
    expect(markdown).not.toContain("<p>");
  });

  it("把中文标点移到强调标记外面，并保留原有空格", () => {
    expect(htmlToMarkdown("<p><strong>进阶：</strong>你可以优化吗</p>")).toContain(
      "**进阶**：你可以优化吗"
    );
    expect(
      htmlToMarkdown("<p><strong>和为目标值 </strong><em><code>target</code></em></p>")
    ).toContain("**和为目标值** *`target`*");
  });

  it("解码常见实体", () => {
    expect(decodeEntities("a&nbsp;&lt;b&gt;&amp;c&#65;")).toBe("a <b>&cA");
  });
});

describe("normalizeTabbedCode", () => {
  it("展开 mkdocs 代码分页", () => {
    const markdown = [
      '=== "Python3"',
      "",
      "    ```python",
      "    print(1)",
      "    ```",
      "",
      "正文",
    ].join("\n");

    const out = normalizeTabbedCode(markdown);
    expect(out).toContain("**Python3**");
    expect(out).toContain("```python\nprint(1)\n```");
    expect(out).toContain("正文");
  });
});

describe("absolutizeUrls", () => {
  it("改写相对图片与文档链接，保留绝对链接", () => {
    const markdown = [
      "![图](images/tcp.png)",
      "[另一篇](../operating-system/process.md)",
      "[外链](https://example.com/a)",
      "[锚点](#section)",
    ].join("\n");

    const out = absolutizeUrls(markdown, BASES);
    expect(out).toContain("![图](https://raw.githubusercontent.com/o/r/main/docs/cs-basics/network/images/tcp.png)");
    expect(out).toContain("[另一篇](https://github.com/o/r/blob/main/docs/cs-basics/operating-system/process.md)");
    expect(out).toContain("[外链](https://example.com/a)");
    expect(out).toContain("[锚点](#section)");
  });

  it("处理仓库根路径与 HTML img", () => {
    const out = absolutizeUrls('<img src="/docs/a.png"> [x](/docs/b.md)', BASES);
    expect(out).toContain('src="https://raw.githubusercontent.com/o/r/main/docs/a.png"');
    expect(out).toContain("[x](https://github.com/o/r/blob/main/docs/b.md)");
  });
});

describe("truncateMarkdown", () => {
  it("短内容不变", () => {
    expect(truncateMarkdown("短内容", 100)).toBe("短内容");
  });

  it("超长内容截断并补齐未闭合代码块", () => {
    const markdown = `${"段落。".repeat(20)}\n\n\`\`\`js\n${"code();\n".repeat(40)}`;
    const out = truncateMarkdown(markdown, 120);
    expect(out.length).toBeLessThan(markdown.length);
    expect((out.match(/```/g) ?? []).length % 2).toBe(0);
    expect(out).toContain("已截断");
  });
});

describe("toPlainText", () => {
  it("剥离代码块、链接与标签", () => {
    const text = toPlainText("# 标题\n\n```js\ncode\n```\n\n[链接](https://a.com) **粗体**");
    expect(text).toContain("标题");
    expect(text).toContain("链接");
    expect(text).toContain("粗体");
    expect(text).not.toContain("code");
    expect(text).not.toContain("https://a.com");
  });
});

describe("hashString", () => {
  it("同输入同输出、不同输入不同输出", () => {
    expect(hashString("docs/a.md#锚点")).toBe(hashString("docs/a.md#锚点"));
    expect(hashString("docs/a.md#锚点")).not.toBe(hashString("docs/a.md#其他"));
    expect(hashString("x")).toHaveLength(8);
  });
});
