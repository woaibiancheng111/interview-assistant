// 把解析结果归一化成站内的 Question 结构
//
// 分类 / 难度 / 频率都是启发式推断：来源仓库自己的元数据优先，
// 没有元数据时按关键词打分。全部为纯函数，便于测试与回归。

import type { Category, Difficulty, Question, QuestionSource } from "../question-types";
import { hashString, toPlainText, truncateMarkdown } from "./markdown.ts";
import type { ParsedQa, SourceSpec } from "./types";

export const MAX_ANSWER_LENGTH = 4200;
export const MAX_CONTENT_LENGTH = 1600;
export const MAX_TITLE_LENGTH = 36;

const CATEGORY_PATTERNS: Record<Category, RegExp[]> = {
  "计算机网络": [
    /网络/,
    /\btcp\b/i,
    /\budp\b/i,
    /https?/i,
    /\bdns\b/i,
    /\bosi\b/i,
    /websocket/i,
    /三次握手|四次挥手|拥塞控制|滑动窗口|长连接|跨域|抓包/,
  ],
  "操作系统": [
    /操作系统/,
    /进程|线程模型|协程|上下文切换/,
    /死锁|信号量|管程/,
    /虚拟内存|分页|分段|页表|内存管理/,
    /文件系统|inode/,
    /\blinux\b/i,
    /用户态|内核态|系统调用|零拷贝|IO 多路复用|epoll|select/i,
  ],
  "数据库": [
    /数据库/,
    /\bmysql\b/i,
    /\bsql\b/i,
    /索引|事务|隔离级别|回表|explain|慢查询/i,
    /\bredis\b/i,
    /innodb|\bmvcc\b|binlog|redolog|undolog/i,
    /分库分表|读写分离|范式|主从复制/,
    /mongodb|elasticsearch/i,
  ],
  "数据结构与算法": [
    /算法|数据结构/,
    /链表|二叉树|红黑树|字典树|堆栈|队列/,
    /排序|查找|递归|回溯|贪心|动态规划|双指针|滑动窗口算法/,
    /哈希表|位运算|前缀和|并查集|图论/,
    /leetcode/i,
    /时间复杂度|空间复杂度/,
  ],
  "前端开发": [
    /前端|浏览器/,
    /javascript|typescript/i,
    /\bcss\b|\bhtml\b/i,
    /\breact\b|\bvue\b|\bangular\b/i,
    /\bdom\b|\bbom\b/i,
    /事件循环|作用域|闭包|原型链|promise|柯里化|重排|重绘|虚拟 ?dom/i,
  ],
  "系统设计": [
    /系统设计|架构设计/,
    /高并发|高可用|可扩展/,
    /分布式|集群|一致性哈希|\bcap\b|\bbase\b理论|分布式事务|分布式锁/i,
    /微服务|服务治理|服务发现|注册中心|网关/,
    /限流|熔断|降级|削峰/,
    /消息队列|\bmq\b|kafka|rabbitmq|rocketmq/i,
    /缓存雪崩|缓存穿透|缓存击穿|秒杀/,
    /dubbo|zookeeper|nacos/i,
  ],
  "编程语言": [
    /\bjvm\b|垃圾回收|\bgc\b|类加载|字节码/i,
    /java ?基础|集合框架|泛型|反射|注解/i,
    /synchronized|volatile|\baqs\b|线程池|并发编程|锁优化/i,
    /\bgolang\b|\bgo 语言\b|python|c\+\+|rust/i,
    /面向对象|多态|继承|设计模式/,
  ],
  "后端开发": [
    /后端|服务端/,
    /spring|mybatis|springboot/i,
    /restful|接口设计|接口幂等|鉴权|\bjwt\b|\boauth\b/i,
    /nginx|docker|kubernetes|运维/i,
    /日志|监控|链路追踪/,
  ],
};

/**
 * 按关键词命中次数给各分类打分，得分最高者胜出；全部为 0 时回退到来源的默认分类。
 * 路径与标签也参与匹配，因此 `docs/cs-basics/network/xx.md` 会强烈倾向"计算机网络"。
 */
export function inferCategory(text: string, fallback: Category): Category {
  let best: Category = fallback;
  let bestScore = 0;
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS) as [
    Category,
    RegExp[],
  ][]) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(text)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }
  return bestScore === 0 ? fallback : best;
}

const HARD_HINTS =
  /(底层实现|源码|原理|一致性|分布式事务|调优|优化方案|设计一个|架构|jvm|mvcc|无锁|内存模型|协议栈)/i;
const EASY_HINTS = /(是什么|什么是|简述|区别|概念|作用)/;

export function inferDifficulty(text: string, answerLength: number): Difficulty {
  if (HARD_HINTS.test(text) && answerLength > 1600) return "hard";
  if (answerLength > 3000) return "hard";
  if (answerLength < 700 && EASY_HINTS.test(text)) return "easy";
  if (answerLength < 500) return "easy";
  return "medium";
}

const HIGH_FREQUENCY =
  /(三次握手|四次挥手|http|tcp|索引|事务|隔离级别|线程池|死锁|垃圾回收|\bgc\b|缓存|redis|进程|线程|事件循环|闭包|原型链|排序|链表|哈希|锁|分布式|消息队列|jvm|volatile|synchronized)/i;

export function inferFrequency(text: string, answerLength: number): number {
  let frequency = 3;
  if (HIGH_FREQUENCY.test(text)) frequency += 1;
  if (answerLength > 2000) frequency += 1;
  return Math.min(5, Math.max(1, frequency));
}

const TAG_PATTERNS: [RegExp, string][] = [
  [/\btcp\b/i, "TCP"],
  [/https?/i, "HTTP"],
  [/\bdns\b/i, "DNS"],
  [/\bredis\b/i, "Redis"],
  [/\bmysql\b/i, "MySQL"],
  [/索引/, "索引"],
  [/事务/, "事务"],
  [/线程|并发/, "并发"],
  [/进程/, "进程"],
  [/缓存/, "缓存"],
  [/消息队列|\bmq\b|kafka/i, "消息队列"],
  [/分布式/, "分布式"],
  [/\bjvm\b|垃圾回收/i, "JVM"],
  [/javascript/i, "JavaScript"],
  [/\breact\b/i, "React"],
  [/\bcss\b/i, "CSS"],
  [/排序|链表|二叉树|动态规划|哈希表|双指针/, "算法"],
];

export function buildTags(
  text: string,
  parsedTags: string[] = [],
  extraTags: string[] = []
): string[] {
  const tags = new Set<string>();
  for (const tag of [...extraTags, ...parsedTags]) {
    const normalized = tag.trim();
    if (normalized !== "" && normalized.length <= 12) tags.add(normalized);
  }
  for (const [pattern, tag] of TAG_PATTERNS) {
    if (tags.size >= 5) break;
    if (pattern.test(text)) tags.add(tag);
  }
  return [...tags].slice(0, 5);
}

/** 列表页展示用的短标题 */
export function shortenTitle(question: string, maxLength = MAX_TITLE_LENGTH): string {
  const cleaned = question.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  const head = cleaned.slice(0, maxLength);
  const breakIndex = Math.max(
    head.lastIndexOf("？"),
    head.lastIndexOf("?"),
    head.lastIndexOf("，"),
    head.lastIndexOf("、"),
    head.lastIndexOf("："),
    head.lastIndexOf(" ")
  );
  const cut = breakIndex > maxLength * 0.5 ? head.slice(0, breakIndex + 1) : head;
  return `${cut.replace(/[，、：\s]+$/, "")}…`;
}

/** 题目 id 必须跨次抓取保持稳定，否则用户的刷题记录会丢失 */
export function makeQuestionId(spec: SourceSpec, docPath: string, qa: ParsedQa): string {
  return `ext-${spec.id}-${hashString(`${docPath}#${qa.anchor ?? qa.question}`)}`;
}

export interface NormalizeInput {
  spec: SourceSpec;
  docPath: string;
  source: QuestionSource;
  qa: ParsedQa;
}

/** 归一化为 Question；内容不合格时返回 null */
export function toQuestion({ spec, docPath, source, qa }: NormalizeInput): Question | null {
  const question = qa.question.trim();
  const answer = truncateMarkdown(qa.answer.trim(), MAX_ANSWER_LENGTH);
  if (question === "" || toPlainText(answer).length < 120) return null;

  const content = truncateMarkdown(
    (qa.content.trim() === "" ? question : qa.content.trim()),
    MAX_CONTENT_LENGTH
  );
  const haystack = `${docPath} ${question} ${(qa.tags ?? []).join(" ")} ${toPlainText(
    answer
  ).slice(0, 400)}`;
  const answerLength = toPlainText(answer).length;

  return {
    id: makeQuestionId(spec, docPath, qa),
    title: shortenTitle(question),
    category: inferCategory(haystack, spec.defaultCategory),
    difficulty: qa.difficulty ?? inferDifficulty(haystack, answerLength),
    tags: buildTags(haystack, qa.tags, spec.extraTags),
    content,
    answer,
    hints: (qa.hints ?? []).map((hint) => hint.trim()).filter(Boolean).slice(0, 3),
    frequency: inferFrequency(haystack, answerLength),
    source,
  };
}
