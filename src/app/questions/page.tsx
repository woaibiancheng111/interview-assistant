"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useHydration } from "@/hooks/use-hydration";
import { useQuestionStore } from "@/lib/store/question-store";
import {
  type Difficulty,
  type Category,
  type Question,
  difficultyLabels,
  categories,
} from "@/lib/data/questions";
import type { QuestionStatus } from "@/lib/store/question-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Markdown } from "@/components/ui/markdown";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Search,
  Filter,
  Star,
  CheckCircle2,
  RotateCcw,
  Circle,
  ChevronRight,
  BookOpen,
  Target,
  Flame,
  X,
  Code,
} from "lucide-react";

// ==================== 图标映射 ====================
const categoryIconMap: Record<Category, React.ReactNode> = {
  "数据结构与算法": <BookOpen className="size-4" />,
  "计算机网络": <Target className="size-4" />,
  "操作系统": <Circle className="size-4" />,
  "数据库": <BookOpen className="size-4" />,
  "系统设计": <Filter className="size-4" />,
  "编程语言": <Code className="size-4" />,
  "前端开发": <Circle className="size-4" />,
  "后端开发": <Circle className="size-4" />,
};

// ==================== 难度颜色 ====================
const difficultyColorMap: Record<Difficulty, string> = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

// ==================== 状态图标 ====================
function StatusIcon({ status }: { status: QuestionStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />;
    case "review":
      return <RotateCcw className="size-4 text-yellow-600 dark:text-yellow-400" />;
    default:
      return <Circle className="size-4 text-muted-foreground" />;
  }
}

// ==================== 频率星星 ====================
function FrequencyStars({ frequency }: { frequency: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Flame
          key={i}
          className={cn(
            "size-3",
            i < frequency
              ? "text-orange-500 dark:text-orange-400"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

// ==================== 题目卡片 ====================
function QuestionCard({
  question,
  onSelect,
}: {
  question: Question;
  onSelect: (q: Question) => void;
}) {
  const { getQuestionStatus, isFavorite, toggleFavorite } =
    useQuestionStore();
  const status = getQuestionStatus(question.id);
  const favorite = isFavorite(question.id);

  return (
    <div
      className="group flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent cursor-pointer"
      onClick={() => onSelect(question)}
    >
      <div className="mt-0.5 flex-shrink-0">
        <StatusIcon status={status} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{question.title}</span>
          <Badge
            variant="secondary"
            className={cn("text-xs flex-shrink-0", difficultyColorMap[question.difficulty])}
          >
            {difficultyLabels[question.difficulty]}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <FrequencyStars frequency={question.frequency} />
          <div className="flex items-center gap-1 flex-wrap">
            {question.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {question.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{question.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "size-7",
            favorite && "text-yellow-500 dark:text-yellow-400"
          )}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(question.id);
          }}
        >
          <Star
            className={cn("size-3.5", favorite && "fill-current")}
          />
        </Button>
        <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

// ==================== 主页面 ====================
export default function QuestionsPage() {
  const router = useRouter();
  const {
    filters,
    setCategory,
    setDifficulty,
    setSearch,
    setStatus,
    getFilteredQuestions,
    getStats,
    getAllTags,
    resetFilters,
  } = useQuestionStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const filteredQuestions = useMemo(() => getFilteredQuestions(), [filters, getFilteredQuestions]);
  const stats = useMemo(() => getStats(), [getStats]);
  const allTags = useMemo(() => getAllTags(), [getAllTags]);
  const hydrated = useHydration();

  const handleSelectQuestion = (q: Question) => {
    router.push(`/questions/${q.id}`);
  };

  // 计算各分类的题目数量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const q of useQuestionStore.getState().allQuestions) {
      counts[q.category] = (counts[q.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div className="flex h-full">
      {/* 左侧分类导航 */}
      <aside
        className={cn(
          "flex-shrink-0 border-r border-border bg-card transition-all duration-200",
          sidebarCollapsed ? "w-12" : "w-56"
        )}
      >
        <div className="flex items-center justify-between p-3">
          {!sidebarCollapsed && (
            <h2 className="text-sm font-medium">题库分类</h2>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <ChevronRight
              className={cn(
                "size-4 transition-transform",
                sidebarCollapsed && "rotate-180"
              )}
            />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-52px)]">
          <div className="px-2 pb-4">
            {/* 总览 */}
            <div
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors hover:bg-accent",
                filters.category === "all" && "bg-accent font-medium"
              )}
              onClick={() => setCategory("all")}
            >
              <BookOpen className="size-4 flex-shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1">全部题目</span>
                  <span className="text-xs text-muted-foreground">
                    {stats.total}
                  </span>
                </>
              )}
            </div>

            <Separator className="my-2" />

            {/* 分类列表 */}
            {categories.map((cat) => (
              <div
                key={cat}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors hover:bg-accent",
                  filters.category === cat && "bg-accent font-medium"
                )}
                onClick={() => setCategory(cat)}
              >
                <span className="flex-shrink-0">
                  {categoryIconMap[cat]}
                </span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 truncate">{cat}</span>
                    <span className="text-xs text-muted-foreground">
                      {categoryCounts[cat] ?? 0}
                    </span>
                  </>
                )}
              </div>
            ))}

            {!sidebarCollapsed && (
              <>
                <Separator className="my-2" />
                {/* 统计概览 */}
                <div className="px-2 py-1.5">
                  <p className="text-xs text-muted-foreground mb-2">
                    刷题进度
                  </p>
                  <Progress value={hydrated && stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}>
                    <span className="text-xs text-muted-foreground">
                      {hydrated ? stats.completed : 0}/{stats.total}
                    </span>
                  </Progress>
                  <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>简单</span>
                      <span>
                        {hydrated ? stats.easyCompleted : 0}/
                        {stats.total > 0 ? useQuestionStore.getState().allQuestions.filter(q => q.difficulty === 'easy').length : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>中等</span>
                      <span>
                        {hydrated ? stats.mediumCompleted : 0}/
                        {stats.total > 0 ? useQuestionStore.getState().allQuestions.filter(q => q.difficulty === 'medium').length : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>困难</span>
                      <span>
                        {hydrated ? stats.hardCompleted : 0}/
                        {stats.total > 0 ? useQuestionStore.getState().allQuestions.filter(q => q.difficulty === 'hard').length : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* 顶部筛选栏 */}
        <div className="flex items-center gap-3 p-3 border-b border-border bg-card flex-wrap">
          {/* 搜索框 */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="搜索题目、标签..."
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 size-6"
                onClick={() => setSearch("")}
              >
                <X className="size-3" />
              </Button>
            )}
          </div>

          {/* 难度筛选 */}
          <Select
            value={filters.difficulty}
            onValueChange={(v) => setDifficulty(v as Difficulty | "all")}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="难度" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部难度</SelectItem>
              <SelectItem value="easy">简单</SelectItem>
              <SelectItem value="medium">中等</SelectItem>
              <SelectItem value="hard">困难</SelectItem>
            </SelectContent>
          </Select>

          {/* 状态筛选 */}
          <Select
            value={filters.status}
            onValueChange={(v) => setStatus(v as QuestionStatus | "all")}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="none">未做</SelectItem>
              <SelectItem value="completed">已掌握</SelectItem>
              <SelectItem value="review">需复习</SelectItem>
            </SelectContent>
          </Select>

          {/* 重置筛选 */}
          {(filters.category !== "all" ||
            filters.difficulty !== "all" ||
            filters.status !== "all" ||
            filters.search !== "") && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="size-3.5 mr-1" />
              重置
            </Button>
          )}

          {/* 结果计数 */}
          <span className="text-sm text-muted-foreground ml-auto">
            共 {filteredQuestions.length} 题
          </span>
        </div>

        {/* 标签筛选 */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card overflow-x-auto">
            <span className="text-xs text-muted-foreground flex-shrink-0">
              标签：
            </span>
            {allTags.slice(0, 20).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-accent transition-colors flex-shrink-0"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* 题目列表 */}
        <ScrollArea className="flex-1">
          <div className="p-3">
            {filteredQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Search className="size-10 mb-3 opacity-30" />
                <p className="text-sm">没有找到匹配的题目</p>
                <p className="text-xs mt-1">尝试调整筛选条件</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    onSelect={handleSelectQuestion}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

    </div>
  );
}
