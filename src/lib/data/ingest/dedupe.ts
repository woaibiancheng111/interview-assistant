// 去重：同一知识点在多个仓库里反复出现，必须在写盘前收敛

import type { Question } from "../question-types";

/** 标题归一化：去掉标点、空白、全角字符差异，用于判定"同一道题" */
export function normalizeTitleKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\s　]+/g, "")
    .replace(/[，。、；：？！""''（）()《》【】\[\]{}<>,.;:?!"'`~\-_+=*#@%^&|/\\…]/g, "");
}

export interface DedupeResult {
  kept: Question[];
  dropped: { id: string; title: string; reason: string }[];
}

/**
 * 以 `existing`（站内精选题）为基准去重，再对 `incoming` 内部去重。
 * 先到先得，因此来源配置里的顺序决定了同题时保留哪个仓库的版本。
 */
export function dedupeQuestions(existing: Question[], incoming: Question[]): DedupeResult {
  const seenIds = new Set(existing.map((question) => question.id));
  const seenTitles = new Set(existing.map((question) => normalizeTitleKey(question.title)));
  const kept: Question[] = [];
  const dropped: DedupeResult["dropped"] = [];

  for (const question of incoming) {
    const titleKey = normalizeTitleKey(question.title);
    if (seenIds.has(question.id)) {
      dropped.push({ id: question.id, title: question.title, reason: "id 重复" });
      continue;
    }
    if (titleKey === "" ) {
      dropped.push({ id: question.id, title: question.title, reason: "标题为空" });
      continue;
    }
    if (seenTitles.has(titleKey)) {
      dropped.push({ id: question.id, title: question.title, reason: "标题重复" });
      continue;
    }
    seenIds.add(question.id);
    seenTitles.add(titleKey);
    kept.push(question);
  }

  return { kept, dropped };
}
