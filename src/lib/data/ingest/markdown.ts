// Markdown / HTML 解析工具
//
// 全部为纯函数：不访问网络、不读文件，方便用 vitest 直接测试。
// 抓取脚本负责取内容，这里只负责把各仓库五花八门的写法整理成统一的 Markdown。

export interface MarkdownSection {
  /** 标题级别 1-6 */
  level: number;
  /** 标题文本（已去掉 # 与尾部 #） */
  title: string;
  /** 正文，包含所有更深层级的子小节 */
  body: string;
}

export interface FrontmatterResult {
  data: Record<string, string | string[]>;
  body: string;
}

const FENCE_RE = /^\s{0,3}(`{3,}|~{3,})/;

/** 解析 YAML frontmatter（只支持 `key: value` 与简单的 `- item` 列表） */
export function parseFrontmatter(markdown: string): FrontmatterResult {
  const normalized = markdown.replace(/^﻿/, "");
  if (!/^---\r?\n/.test(normalized)) {
    return { data: {}, body: normalized };
  }
  const lines = normalized.split(/\r?\n/);
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (/^---\s*$/.test(lines[i])) {
      end = i;
      break;
    }
  }
  if (end === -1) return { data: {}, body: normalized };

  const data: Record<string, string | string[]> = {};
  let currentListKey: string | null = null;
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentListKey) {
      const existing = data[currentListKey];
      const value = unquote(listItem[1].trim());
      if (Array.isArray(existing)) existing.push(value);
      else data[currentListKey] = [value];
      continue;
    }
    const pair = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (pair) {
      const key = pair[1];
      const value = pair[2].trim();
      if (value === "") {
        currentListKey = key;
        data[key] = [];
      } else {
        currentListKey = null;
        data[key] = unquote(value);
      }
    }
  }
  return { data, body: lines.slice(end + 1).join("\n").replace(/^\s*\n/, "") };
}

function unquote(value: string): string {
  return value.replace(/^["'](.*)["']$/, "$1").trim();
}

/**
 * 按标题切分文档。每个小节的 body 一直延伸到下一个"同级或更高级"标题为止，
 * 因此父级小节天然包含其子小节内容。代码块内的 `#` 不会被误判为标题。
 */
export function splitSections(markdown: string): MarkdownSection[] {
  const lines = markdown.split(/\r?\n/);
  const headings = collectHeadings(lines);

  return headings.map((heading, index) => {
    let end = lines.length;
    for (let next = index + 1; next < headings.length; next++) {
      if (headings[next].level <= heading.level) {
        end = headings[next].line;
        break;
      }
    }
    return {
      level: heading.level,
      title: heading.title,
      body: lines.slice(heading.line + 1, end).join("\n").trim(),
    };
  });
}

function collectHeadings(
  lines: string[]
): { level: number; title: string; line: number }[] {
  const headings: { level: number; title: string; line: number }[] = [];
  let fenceChar: string | null = null;

  lines.forEach((line, index) => {
    const fence = line.match(FENCE_RE);
    if (fence) {
      const char = fence[1][0];
      if (fenceChar === null) fenceChar = char;
      else if (fenceChar === char) fenceChar = null;
      return;
    }
    if (fenceChar !== null) return;
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      headings.push({ level: heading[1].length, title: heading[2].trim(), line: index });
    }
  });

  return headings;
}

/**
 * 只把满足条件的标题当作分节点，其余标题留在正文里。
 * 用于"答案里也有标题"的文档（例如折叠答案中的 `#### 答案：D`）。
 */
export function splitSectionsWhere(
  markdown: string,
  predicate: (level: number, title: string) => boolean
): MarkdownSection[] {
  const lines = markdown.split(/\r?\n/);
  const headings = collectHeadings(lines).filter((heading) =>
    predicate(heading.level, heading.title)
  );

  return headings.map((heading, index) => {
    const end = index + 1 < headings.length ? headings[index + 1].line : lines.length;
    return {
      level: heading.level,
      title: heading.title,
      body: lines.slice(heading.line + 1, end).join("\n").trim(),
    };
  });
}

export interface DetailsBlock {
  summary: string;
  body: string;
}

/** 提取 `<details><summary>…</summary>…</details>` 块 */
export function extractDetails(markdown: string): DetailsBlock[] {
  const blocks: DetailsBlock[] = [];
  const re = /<details[^>]*>([\s\S]*?)<\/details>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown)) !== null) {
    const inner = match[1];
    const summaryMatch = inner.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i);
    const summary = summaryMatch ? stripTags(summaryMatch[1]).trim() : "";
    const body = inner.replace(/<summary[^>]*>[\s\S]*?<\/summary>/i, "");
    blocks.push({ summary, body: htmlToMarkdown(body) });
  }
  return blocks;
}

/** 删除 `<details>` 块，用于拿到"题干"部分 */
export function removeDetails(markdown: string): string {
  return markdown.replace(/<details[^>]*>[\s\S]*?<\/details>/gi, "").trim();
}

export function stripHtmlComments(markdown: string): string {
  return markdown.replace(/<!--[\s\S]*?-->/g, "");
}

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&hellip;": "…",
  "&mdash;": "—",
  "&ndash;": "–",
  "&le;": "≤",
  "&ge;": "≥",
  "&ne;": "≠",
  "&times;": "×",
  "&rarr;": "→",
};

export function decodeEntities(text: string): string {
  let out = text;
  for (const [entity, char] of Object.entries(ENTITIES)) {
    out = out.split(entity).join(char);
  }
  return out.replace(/&#(\d+);/g, (_, code: string) =>
    String.fromCodePoint(Number(code))
  );
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ""));
}

/**
 * 把内嵌 HTML（LeetCode 题面等）转换成 Markdown。
 * 只处理题库里真实出现的标签，未知标签直接剥离。
 */
// `&lt;`/`&gt;` 必须最后才解码：提前解码会让 `2 &lt;= n` 变成 `2 <= n`，
// 后续剥离标签的正则会把 `<= n …>` 当成标签整段吃掉。
const LT_TOKEN = String.fromCharCode(1);
const GT_TOKEN = String.fromCharCode(2);

/**
 * 生成强调语法。两处细节决定了渲染是否正确：
 * 1. 中文标点若留在 `**…**` 内部（`**进阶：**你`），CommonMark 不会识别成加粗，把标点移到外面；
 * 2. 原文里的首尾空格要保留，否则相邻的 `**x**` 与 `*y*` 会粘成 `***`。
 */
function emphasize(raw: string, marker: "*" | "**"): string {
  const text = raw.trim();
  if (text === "") return "";
  const lead = /^\s/.test(raw) ? " " : "";
  const trail = /\s$/.test(raw) ? " " : "";
  const match = text.match(/^(.*?)([：:，,。.、；;！!？?]+)$/);
  const body = match ? match[1] : text;
  const punctuation = match ? match[2] : "";
  if (body === "") return `${lead}${text}${trail}`;
  return `${lead}${marker}${body}${marker}${punctuation}${trail}`;
}

export function htmlToMarkdown(html: string): string {
  const codeBlocks: string[] = [];
  let out = html.split("&lt;").join(LT_TOKEN).split("&gt;").join(GT_TOKEN);

  // 先把 <pre> 保护起来，避免内部内容被后续规则破坏
  out = out.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, inner: string) => {
    const text = decodeEntities(inner.replace(/<[^>]+>/g, "")).replace(/^\n+|\n+$/g, "");
    const token = `@@CODE_BLOCK_${codeBlocks.length}@@`;
    codeBlocks.push("```\n" + text + "\n```");
    return `\n\n${token}\n\n`;
  });

  out = out.replace(/<br\s*\/?>/gi, "\n");
  out = out.replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, "\n\n![]($1)\n\n");
  out = out.replace(
    /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_, href: string, text: string) => `[${stripTags(text).trim()}](${href})`
  );
  // 上下标要在 <code> 之前处理，否则会被当作普通标签剥掉（10<sup>4</sup> → 104）
  out = out.replace(/<sup[^>]*>([\s\S]*?)<\/sup>/gi, (_, inner: string) => {
    const text = stripTags(inner).trim();
    return text === "" ? "" : `^${text}`;
  });
  out = out.replace(/<sub[^>]*>([\s\S]*?)<\/sub>/gi, (_, inner: string) => {
    const text = stripTags(inner).trim();
    return text === "" ? "" : `_${text}`;
  });
  out = out.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, inner: string) => {
    const text = decodeEntities(inner.replace(/<[^>]+>/g, "")).trim();
    return text === "" ? "" : "`" + text + "`";
  });
  out = out.replace(
    /<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi,
    (_, __, inner: string) => emphasize(stripTags(inner), "**")
  );
  out = out.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, inner: string) =>
    emphasize(stripTags(inner), "*")
  );
  out = out.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, inner: string) => {
    const text = decodeEntities(inner.replace(/<[^>]+>/g, "")).trim();
    return text === "" ? "" : `\n- ${text}`;
  });
  out = out.replace(/<\/(p|div|ul|ol|table|tr|h[1-6])>/gi, "\n\n");
  out = out.replace(/<[^>]+>/g, "");
  out = decodeEntities(out);

  codeBlocks.forEach((block, index) => {
    out = out.split(`@@CODE_BLOCK_${index}@@`).join(block);
  });

  // 还原被保护的尖括号
  out = out.split(LT_TOKEN).join("<").split(GT_TOKEN).join(">");

  return collapseBlankLines(out).trim();
}

export function collapseBlankLines(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

/**
 * 展开 mkdocs-material 的代码分页语法：
 * `=== "Python3"` + 4 空格缩进代码块 → `**Python3**` + 普通代码块
 */
export function normalizeTabbedCode(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const out: string[] = [];
  let inTab = false;

  for (const line of lines) {
    const tab = line.match(/^={3,}\s+"(.+?)"\s*$/);
    if (tab) {
      inTab = true;
      out.push(`**${tab[1]}**`);
      continue;
    }
    if (inTab) {
      if (line.trim() === "") {
        out.push("");
        continue;
      }
      if (line.startsWith("    ")) {
        out.push(line.slice(4));
        continue;
      }
      inTab = false;
    }
    out.push(line);
  }
  return collapseBlankLines(out.join("\n"));
}

export interface UrlBases {
  /** 图片等原始文件基址，例如 https://raw.githubusercontent.com/owner/repo/main/ */
  rawBase: string;
  /** 网页基址，例如 https://github.com/owner/repo/blob/main/ */
  blobBase: string;
  /** 当前文档所在目录，相对路径以此为基准，例如 docs/cs-basics/network/ */
  docDir: string;
}

const ABSOLUTE_RE = /^(https?:|mailto:|data:|#|\/\/)/i;

/** 把相对链接改写成绝对地址，否则站内渲染会 404 */
export function absolutizeUrls(markdown: string, bases: UrlBases): string {
  const resolve = (target: string, isImage: boolean): string => {
    const trimmed = target.trim();
    if (trimmed === "" || ABSOLUTE_RE.test(trimmed)) return trimmed;
    const base = isImage ? bases.rawBase : bases.blobBase;
    const path = trimmed.startsWith("/")
      ? trimmed.slice(1)
      : normalizePath(bases.docDir + trimmed);
    return base + path;
  };

  let out = markdown.replace(
    /(!?)\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g,
    (_, bang: string, text: string, href: string, title = "") =>
      `${bang}[${text}](${resolve(href, bang === "!")}${title})`
  );
  out = out.replace(
    /(<img[^>]*src=["'])([^"']+)(["'])/gi,
    (_, prefix: string, src: string, suffix: string) =>
      `${prefix}${resolve(src, true)}${suffix}`
  );
  return out;
}

function normalizePath(path: string): string {
  const parts = path.split("/");
  const stack: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return stack.join("/");
}

/** 按段落边界截断，并保证代码块闭合 */
export function truncateMarkdown(markdown: string, maxLength: number): string {
  if (markdown.length <= maxLength) return markdown;
  const slice = markdown.slice(0, maxLength);
  const lastBreak = slice.lastIndexOf("\n\n");
  let out = lastBreak > maxLength * 0.5 ? slice.slice(0, lastBreak) : slice;
  const fences = (out.match(/^\s{0,3}```/gm) ?? []).length;
  if (fences % 2 === 1) out += "\n```";
  return `${out.trim()}\n\n> 内容较长已截断，完整版本请查看原文链接。`;
}

/** 粗略提取纯文本，用于长度判断与关键词匹配 */
export function toPlainText(markdown: string): string {
  return decodeEntities(
    markdown
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/<[^>]+>/g, " ")
      .replace(/[#>*_~|-]+/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

/** 生成稳定 id 用的 32 位 FNV-1a 哈希（题目 id 必须跨次运行保持不变） */
export function hashString(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
