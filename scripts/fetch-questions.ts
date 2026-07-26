#!/usr/bin/env node
/**
 * 从开源仓库抓取面试题，生成 src/lib/data/questions.generated.json 与 ATTRIBUTIONS.md。
 *
 *   node scripts/fetch-questions.ts                 # 全量抓取
 *   node scripts/fetch-questions.ts --only=leetcode # 只抓某个来源
 *   node scripts/fetch-questions.ts --limit=5       # 每个来源最多抓 5 篇文档（调试用）
 *   node scripts/fetch-questions.ts --dry-run       # 不写盘，只打印报告
 *   node scripts/fetch-questions.ts --offline       # 只用本地缓存
 *
 * 合规要点：
 *   1. 只请求公开的 GitHub API 与 raw 文件，不绕过任何访问控制；
 *   2. 仓库协议必须被 GitHub 机器识别、在白名单内、且与来源配置一致，否则跳过；
 *   3. 每道题都带 source（仓库、原文链接、协议、作者），页面与 ATTRIBUTIONS.md 均会展示。
 *
 * 需要 Node 22.6+（直接执行 TypeScript）。设置 GITHUB_TOKEN 可提高 API 限额。
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { curatedQuestions } from "../src/lib/data/questions.curated.ts";
import type { Question, QuestionSource } from "../src/lib/data/question-types.ts";
import { dedupeQuestions } from "../src/lib/data/ingest/dedupe.ts";
import { getLicenseInfo, licenseRejectionReason } from "../src/lib/data/ingest/license.ts";
import { runParser } from "../src/lib/data/ingest/parsers.ts";
import { toQuestion } from "../src/lib/data/ingest/normalize.ts";
import { SOURCES, type RegistrySource } from "../src/lib/data/ingest/sources.ts";
import type { SourceDoc, SourceReport } from "../src/lib/data/ingest/types.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = path.join(ROOT, ".cache", "ingest");
const OUT_JSON = path.join(ROOT, "src", "lib", "data", "questions.generated.json");
const OUT_ATTRIBUTIONS = path.join(ROOT, "ATTRIBUTIONS.md");
const USER_AGENT = "interview-assistant-question-ingest/1.0 (+https://github.com)";
const REQUEST_DELAY_MS = 200;

interface CliOptions {
  only: string[] | null;
  limit: number | null;
  dryRun: boolean;
  offline: boolean;
  noCache: boolean;
}

function parseCli(argv: string[]): CliOptions {
  const options: CliOptions = {
    only: null,
    limit: null,
    dryRun: false,
    offline: false,
    noCache: false,
  };
  for (const arg of argv) {
    if (arg.startsWith("--only=")) {
      options.only = arg.slice(7).split(",").map((id) => id.trim()).filter(Boolean);
    } else if (arg.startsWith("--limit=")) {
      const value = Number(arg.slice(8));
      options.limit = Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--offline") {
      options.offline = true;
    } else if (arg === "--no-cache") {
      options.noCache = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(
        [
          "用法: node scripts/fetch-questions.ts [选项]",
          "  --only=id1,id2   只抓取指定来源",
          "  --limit=N        每个来源最多抓 N 篇文档",
          "  --dry-run        不写盘",
          "  --offline        只读本地缓存",
          "  --no-cache       忽略本地缓存，强制重新下载",
        ].join("\n")
      );
      process.exit(0);
    }
  }
  return options;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "application/vnd.github+json",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

class RateLimitError extends Error {}

async function githubApi<T>(endpoint: string): Promise<T> {
  const url = `https://api.github.com${endpoint}`;
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, { headers: authHeaders() });
      if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") {
        const reset = Number(response.headers.get("x-ratelimit-reset") ?? 0) * 1000;
        throw new RateLimitError(
          `GitHub API 限额已用尽，恢复时间 ${new Date(reset).toLocaleString()}。` +
            "设置环境变量 GITHUB_TOKEN 可将限额提升到 5000 次/小时。"
        );
      }
      if (!response.ok) {
        throw new Error(`GitHub API ${response.status} ${response.statusText}: ${endpoint}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof RateLimitError) throw error;
      lastError = error;
      await sleep(attempt * 800);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function encodePath(filePath: string): string {
  return filePath.split("/").map(encodeURIComponent).join("/");
}

function cachePathFor(repo: string, branch: string, filePath: string): string {
  return path.join(CACHE_DIR, repo.replace("/", "__"), branch, filePath);
}

async function fetchRaw(
  repo: string,
  branch: string,
  filePath: string,
  options: CliOptions
): Promise<string> {
  const cacheFile = cachePathFor(repo, branch, filePath);
  if (!options.noCache && existsSync(cacheFile)) {
    return readFile(cacheFile, "utf8");
  }
  if (options.offline) {
    throw new Error(`离线模式下缺少缓存: ${repo}/${filePath}`);
  }

  const url = `https://raw.githubusercontent.com/${repo}/${branch}/${encodePath(filePath)}`;
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (!response.ok) {
        throw new Error(`下载失败 ${response.status}: ${url}`);
      }
      const text = await response.text();
      await mkdir(path.dirname(cacheFile), { recursive: true });
      await writeFile(cacheFile, text, "utf8");
      await sleep(REQUEST_DELAY_MS);
      return text;
    } catch (error) {
      lastError = error;
      await sleep(attempt * 800);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

interface RepoMeta {
  default_branch: string;
  html_url: string;
  description: string | null;
  owner: { login: string };
  license: { spdx_id: string | null } | null;
}

interface TreeEntry {
  path: string;
  type: string;
}

function selectDocs(tree: TreeEntry[], source: RegistrySource, limit: number | null): string[] {
  const blobs = tree.filter((entry) => entry.type === "blob").map((entry) => entry.path);
  const selected: string[] = [...source.paths];

  for (const selector of source.docs ?? []) {
    const filePattern = new RegExp(selector.filePattern ?? "\\.md$");
    const excludePattern = selector.excludePattern
      ? new RegExp(selector.excludePattern)
      : /(^|\/)(README|readme|index)\.md$/;
    const matches = blobs
      .filter((blobPath) => blobPath.startsWith(selector.prefix))
      .filter((blobPath) => filePattern.test(blobPath))
      .filter((blobPath) => !excludePattern.test(blobPath))
      .sort();
    selected.push(...matches.slice(0, selector.maxDocs ?? matches.length));
  }

  const unique = [...new Set(selected)];
  return limit === null ? unique : unique.slice(0, limit);
}

interface SourceResult {
  report: SourceReport;
  questions: Question[];
  meta?: {
    name: string;
    repo: string;
    url: string;
    license: string;
    licenseLabel: string;
    licenseUrl: string;
    author: string;
    shareAlike: boolean;
    note?: string;
  };
}

async function ingestSource(
  source: RegistrySource,
  options: CliOptions,
  fetchedAt: string
): Promise<SourceResult> {
  const report: SourceReport = {
    id: source.id,
    repo: source.repo,
    license: null,
    accepted: false,
    docsFetched: 0,
    parsed: 0,
    kept: 0,
    dropped: 0,
  };

  const metaCache = path.join(CACHE_DIR, "meta", `${source.id}.json`);
  let repoMeta: RepoMeta;
  let tree: TreeEntry[];

  if (options.offline || (!options.noCache && existsSync(metaCache))) {
    if (!existsSync(metaCache)) {
      report.reason = "离线模式下缺少仓库元数据缓存";
      return { report, questions: [] };
    }
    const cached = JSON.parse(await readFile(metaCache, "utf8")) as {
      repoMeta: RepoMeta;
      tree: TreeEntry[];
    };
    repoMeta = cached.repoMeta;
    tree = cached.tree;
  } else {
    repoMeta = await githubApi<RepoMeta>(`/repos/${source.repo}`);
    const treeResponse = await githubApi<{ tree: TreeEntry[] }>(
      `/repos/${source.repo}/git/trees/${repoMeta.default_branch}?recursive=1`
    );
    tree = treeResponse.tree;
    await mkdir(path.dirname(metaCache), { recursive: true });
    await writeFile(metaCache, JSON.stringify({ repoMeta, tree }), "utf8");
  }

  const spdx = repoMeta.license?.spdx_id ?? null;
  report.license = spdx;
  const licenseInfo = getLicenseInfo(spdx);
  if (!licenseInfo) {
    report.reason = licenseRejectionReason(spdx);
    return { report, questions: [] };
  }
  if (licenseInfo.spdx.toUpperCase() !== source.expectedLicense.toUpperCase()) {
    report.reason = `协议与配置不一致：期望 ${source.expectedLicense}，实际 ${licenseInfo.spdx}`;
    return { report, questions: [] };
  }
  report.accepted = true;

  const branch = repoMeta.default_branch;
  const docPaths = selectDocs(tree, source, options.limit);
  const rawBase = `https://raw.githubusercontent.com/${source.repo}/${branch}/`;
  const blobBase = `https://github.com/${source.repo}/blob/${branch}/`;
  const questions: Question[] = [];

  for (const docPath of docPaths) {
    if (questions.length >= source.maxQuestions) break;
    let markdown: string;
    try {
      markdown = await fetchRaw(source.repo, branch, docPath, options);
    } catch (error) {
      console.warn(`  ! 跳过 ${docPath}: ${(error as Error).message}`);
      continue;
    }
    report.docsFetched += 1;

    const doc: SourceDoc = {
      path: docPath,
      markdown,
      bases: {
        rawBase,
        blobBase,
        docDir: docPath.includes("/") ? `${docPath.slice(0, docPath.lastIndexOf("/"))}/` : "",
      },
    };

    const parsed = runParser(source.parser, doc, source);
    report.parsed += parsed.length;

    for (const qa of parsed) {
      if (questions.length >= source.maxQuestions) break;
      const questionSource: QuestionSource = {
        sourceId: source.id,
        repo: source.repo,
        repoName: source.name,
        url: `${blobBase}${encodePath(docPath)}${qa.anchor ? `#${qa.anchor}` : ""}`,
        license: licenseInfo.spdx,
        licenseUrl: licenseInfo.url,
        author: repoMeta.owner.login,
        fetchedAt,
      };
      const question = toQuestion({ spec: source, docPath, source: questionSource, qa });
      if (question) questions.push(question);
      else report.dropped += 1;
    }
  }

  report.kept = questions.length;
  return {
    report,
    questions,
    meta: {
      name: source.name,
      repo: source.repo,
      url: repoMeta.html_url,
      license: licenseInfo.spdx,
      licenseLabel: licenseInfo.label,
      licenseUrl: licenseInfo.url,
      author: repoMeta.owner.login,
      shareAlike: licenseInfo.shareAlike,
      note: source.note,
    },
  };
}

function buildAttributions(
  metas: NonNullable<SourceResult["meta"]>[],
  counts: Record<string, number>,
  fetchedAt: string
): string {
  const lines: string[] = [
    "# 第三方内容署名（Attributions）",
    "",
    `本项目题库中带「来源」标记的题目，抓取自下列开源仓库，抓取日期 ${fetchedAt}。`,
    "内容版权归原作者所有，本项目仅在保留署名与协议声明的前提下再分发。",
    "",
    "抓取脚本：`scripts/fetch-questions.ts`（仅访问公开的 GitHub API 与 raw 文件）。",
    "协议白名单：`src/lib/data/ingest/license.ts`。",
    "",
    "## 来源清单",
    "",
    "| 仓库 | 作者 | 协议 | 题目数 |",
    "| --- | --- | --- | --- |",
  ];

  for (const meta of metas) {
    lines.push(
      `| [${meta.name}](${meta.url}) | ${meta.author} | [${meta.licenseLabel}](${meta.licenseUrl}) | ${
        counts[meta.repo] ?? 0
      } |`
    );
  }

  lines.push("", "## 说明", "");
  for (const meta of metas) {
    lines.push(`### ${meta.name}（${meta.repo}）`, "");
    if (meta.note) lines.push(meta.note, "");
    lines.push(
      `- 原始仓库：${meta.url}`,
      `- 版权归属：${meta.author}`,
      `- 授权协议：${meta.licenseLabel}（${meta.licenseUrl}）`
    );
    if (meta.shareAlike) {
      lines.push(
        "- 该协议要求「相同方式共享」：本仓库中由其衍生的题目内容同样以 " +
          `${meta.licenseLabel} 提供，转载须保留本署名。`
      );
    }
    lines.push("");
  }

  lines.push(
    "## 移除请求",
    "",
    "如果你是上述内容的作者并希望移除，请提 issue 说明仓库与题目 id，我们会在下一次发布前删除对应条目。",
    ""
  );
  return lines.join("\n");
}

async function main(): Promise<void> {
  const options = parseCli(process.argv.slice(2));
  const fetchedAt = new Date().toISOString().slice(0, 10);
  const selected = options.only
    ? SOURCES.filter((source) => options.only!.includes(source.id))
    : SOURCES;

  if (selected.length === 0) {
    console.error("没有匹配的来源，可用 id：" + SOURCES.map((s) => s.id).join(", "));
    process.exitCode = 1;
    return;
  }

  const reports: SourceReport[] = [];
  const metas: NonNullable<SourceResult["meta"]>[] = [];
  let collected: Question[] = [];

  for (const source of selected) {
    console.log(`\n▶ ${source.name} (${source.repo})`);
    try {
      const result = await ingestSource(source, options, fetchedAt);
      reports.push(result.report);
      if (!result.report.accepted) {
        console.log(`  ✗ 跳过：${result.report.reason}`);
        continue;
      }
      if (result.meta) metas.push(result.meta);
      collected = collected.concat(result.questions);
      console.log(
        `  ✓ 协议 ${result.report.license}｜文档 ${result.report.docsFetched} 篇｜` +
          `解析 ${result.report.parsed} 题｜入库 ${result.report.kept} 题`
      );
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.error(`\n${error.message}`);
        process.exitCode = 1;
        return;
      }
      console.error(`  ✗ 抓取失败：${(error as Error).message}`);
      reports.push({
        id: source.id,
        repo: source.repo,
        license: null,
        accepted: false,
        reason: (error as Error).message,
        docsFetched: 0,
        parsed: 0,
        kept: 0,
        dropped: 0,
      });
    }
  }

  const { kept, dropped } = dedupeQuestions(curatedQuestions, collected);
  const counts: Record<string, number> = {};
  for (const question of kept) {
    const repo = question.source?.repo ?? "unknown";
    counts[repo] = (counts[repo] ?? 0) + 1;
  }

  console.log("\n===== 汇总 =====");
  console.log(`站内精选题：${curatedQuestions.length}`);
  console.log(`抓取入库题：${kept.length}（去重丢弃 ${dropped.length}）`);
  for (const [repo, count] of Object.entries(counts)) {
    console.log(`  ${repo}: ${count}`);
  }
  const byCategory: Record<string, number> = {};
  for (const question of kept) {
    byCategory[question.category] = (byCategory[question.category] ?? 0) + 1;
  }
  console.log("分类分布：", byCategory);

  if (options.dryRun) {
    console.log("\n--dry-run：未写入文件。");
    return;
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    sources: metas.map((meta) => ({
      id: SOURCES.find((source) => source.repo === meta.repo)?.id ?? meta.repo,
      repo: meta.repo,
      name: meta.name,
      url: meta.url,
      license: meta.license,
      licenseUrl: meta.licenseUrl,
      author: meta.author,
      questionCount: counts[meta.repo] ?? 0,
    })),
    questions: kept,
  };

  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await writeFile(OUT_ATTRIBUTIONS, buildAttributions(metas, counts, fetchedAt), "utf8");
  console.log(`\n已写入 ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`已写入 ${path.relative(ROOT, OUT_ATTRIBUTIONS)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
