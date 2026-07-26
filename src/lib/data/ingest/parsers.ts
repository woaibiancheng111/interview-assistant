// 各来源仓库的文档解析器
//
// 每个解析器输入一篇 Markdown 文档，输出若干 ParsedQa。全部为纯函数。

import type { Difficulty } from "../question-types";
import {
  absolutizeUrls,
  collapseBlankLines,
  extractDetails,
  htmlToMarkdown,
  normalizeTabbedCode,
  parseFrontmatter,
  removeDetails,
  splitSections,
  splitSectionsWhere,
  stripHtmlComments,
  toPlainText,
} from "./markdown.ts";
import type { ParsedQa, ParserId, SourceDoc, SourceSpec } from "./types";

/** 答案纯文本至少这么长才算一道有效题目 */
const MIN_ANSWER_LENGTH = 120;

const QUESTION_KEYWORDS =
  /(是什么|什么是|为什么|怎么|怎样|如何|区别|原理|作用|优缺点|优点|缺点|流程|机制|有哪些|哪几种|介绍一下|说说|讲讲|谈谈|实现方式|适用场景)/;

/** 标题是否像一道面试题 */
export function isQuestionTitle(title: string): boolean {
  const text = title.trim();
  if (text.length < 4 || text.length > 60) return false;
  if (/^[\d.\s]+$/.test(text)) return false;
  if (/^(参考资料|参考链接|推荐阅读|总结|小结|文章推荐|后记|附录|目录)/.test(text)) return false;
  if (/[?？]\s*$/.test(text)) return true;
  return QUESTION_KEYWORDS.test(text);
}

/** 清洗标题：去掉序号、锚点、Markdown 链接、加粗符号 */
export function cleanHeading(title: string): string {
  return title
    .replace(/\{#[^}]*\}\s*$/, "")
    .replace(/^\s*\d+(\.\d+)*[.、)]?\s+/, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*`]/g, "")
    .trim();
}

/**
 * 生成 GitHub 风格锚点（支持中文）。
 * 与 cleanHeading 不同：保留标题里的序号——GitHub 锚点本身带序号，
 * 而且序号是"同名标题"（如多道『输出是什么？』）唯一性的来源。
 */
export function slugifyAnchor(title: string): string {
  return title
    .replace(/\{#[^}]*\}\s*$/, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*`]/g, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeAnswer(markdown: string, doc: SourceDoc): string {
  return absolutizeUrls(collapseBlankLines(markdown.trim()), doc.bases);
}

function isSubstantial(answer: string): boolean {
  return toPlainText(answer).length >= MIN_ANSWER_LENGTH;
}

function frontmatterTags(data: Record<string, string | string[]>): string[] {
  const raw = data.tag ?? data.tags ?? [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map((item) => String(item).trim()).filter(Boolean);
}

/**
 * 通用解析器：把"问句形式的标题"当作题目，标题下的正文当作答案。
 * 适用于 JavaGuide 这类"一篇文档 = 多道面试题"的仓库。
 */
export function parseQuestionHeadings(
  doc: SourceDoc,
  options: { minLevel?: number; maxLevel?: number } = {}
): ParsedQa[] {
  const minLevel = options.minLevel ?? 3;
  const maxLevel = options.maxLevel ?? 5;
  const { data, body } = parseFrontmatter(doc.markdown);
  const sections = splitSections(stripHtmlComments(body));
  const tags = frontmatterTags(data);

  const candidates = sections.filter(
    (section) =>
      section.level >= minLevel &&
      section.level <= maxLevel &&
      isQuestionTitle(cleanHeading(section.title))
  );

  // 父级小节的 body 包含子级问题，会造成内容重复，只保留最内层的问题标题
  const leaves = candidates.filter((candidate) =>
    candidates.every((other) => {
      if (other === candidate) return true;
      const headingRe = new RegExp(
        `^#{1,6}\\s+${escapeRegExp(other.title)}\\s*#*\\s*$`,
        "m"
      );
      return !headingRe.test(candidate.body);
    })
  );

  return leaves
    .map((section) => {
      const question = cleanHeading(section.title);
      return {
        question,
        content: question,
        answer: normalizeAnswer(section.body, doc),
        tags,
        anchor: slugifyAnchor(section.title),
      } satisfies ParsedQa;
    })
    .filter((qa) => isSubstantial(qa.answer));
}

/**
 * doocs/advanced-java 专用：文档结构固定为
 * `# 标题` / `## 面试题` / `## 面试官心理分析` / `## 面试题剖析`
 */
export function parseAdvancedJava(doc: SourceDoc): ParsedQa[] {
  const { body } = parseFrontmatter(doc.markdown);
  const sections = splitSections(stripHtmlComments(body));
  const title = sections.find((section) => section.level === 1)?.title;
  if (!title) return [];

  const find = (name: string) =>
    sections.find((section) => section.level >= 2 && cleanHeading(section.title) === name);

  const questionSection = find("面试题");
  const analysisSection = find("面试官心理分析");
  const answerSection = find("面试题剖析");

  const question = cleanHeading(title);
  const content = questionSection
    ? collapseBlankLines(questionSection.body).trim()
    : question;
  const answerBody = answerSection?.body ?? body;
  const answer = normalizeAnswer(answerBody, doc);
  if (!isSubstantial(answer)) return [];

  return [
    {
      question,
      content: content === "" ? question : content,
      answer,
      hints: analysisSection ? toHints(analysisSection.body) : [],
    },
  ];
}

/** 把"面试官心理分析"压缩成 1-3 条提示 */
export function toHints(markdown: string): string[] {
  return toPlainText(markdown)
    .split(/(?<=[。！？!?])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 12 && sentence.length <= 80)
    .slice(0, 3);
}

const LEETCODE_DIFFICULTY: Record<string, Difficulty> = {
  "简单": "easy",
  "中等": "medium",
  "困难": "hard",
  "Easy": "easy",
  "Medium": "medium",
  "Hard": "hard",
};

/** doocs/leetcode 专用：frontmatter + `## 题目描述`（HTML） + `## 解法` */
export function parseLeetcode(doc: SourceDoc): ParsedQa[] {
  const { data, body } = parseFrontmatter(doc.markdown);
  const sections = splitSections(stripHtmlComments(body));
  const heading = sections.find((section) => section.level === 1);
  if (!heading) return [];

  const description = sections.find(
    (section) => cleanHeading(section.title) === "题目描述"
  );
  const solution = sections.find((section) => cleanHeading(section.title) === "解法");
  if (!description || !solution) return [];

  const content = absolutizeUrls(htmlToMarkdown(description.body), doc.bases);
  const answer = normalizeAnswer(normalizeTabbedCode(solution.body), doc);
  if (!isSubstantial(answer)) return [];

  const title = cleanHeading(heading.title);
  const difficulty = LEETCODE_DIFFICULTY[String(data.difficulty ?? "")] ?? undefined;

  return [
    {
      question: title,
      content: content === "" ? title : content,
      answer,
      tags: frontmatterTags(data),
      difficulty,
    },
  ];
}

/**
 * lydiahallie/javascript-questions 专用：
 * `###### 1. 输出是什么？` + 选项 + `<details>` 折叠答案
 */
export function parseDetailsQuiz(doc: SourceDoc): ParsedQa[] {
  const { body } = parseFrontmatter(doc.markdown);
  // 折叠答案里也有 `#### 答案：D` 这类标题，所以只把"带题号的标题"当作分节点
  const sections = splitSectionsWhere(
    body,
    (level, title) => level >= 4 && /^\s*\d+[.、)]/.test(title)
  );

  return sections
    .map((section): ParsedQa | null => {
      const numberMatch = section.title.match(/^\s*(\d+)[.、)]/);
      const label = cleanHeading(section.title);
      const details = extractDetails(section.body);
      if (details.length === 0) return null;
      const content = absolutizeUrls(
        collapseBlankLines(removeDetails(section.body)),
        doc.bases
      );
      const answer = normalizeAnswer(details[0].body, doc);
      const number = numberMatch ? numberMatch[1] : "";
      return {
        question: number ? `JavaScript 进阶第 ${number} 题：${label}` : label,
        content: content === "" ? label : content,
        answer,
        anchor: slugifyAnchor(section.title),
      } satisfies ParsedQa;
    })
    .filter((qa): qa is ParsedQa => qa !== null && isSubstantial(qa.answer));
}

export function runParser(parser: ParserId, doc: SourceDoc, spec: SourceSpec): ParsedQa[] {
  switch (parser) {
    case "question-headings":
      return parseQuestionHeadings(doc, spec.options ?? {});
    case "advanced-java":
      return parseAdvancedJava(doc);
    case "leetcode":
      return parseLeetcode(doc);
    case "details-quiz":
      return parseDetailsQuiz(doc);
    default: {
      const exhaustive: never = parser;
      throw new Error(`未知解析器: ${String(exhaustive)}`);
    }
  }
}
