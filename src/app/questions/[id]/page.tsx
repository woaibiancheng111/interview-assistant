"use client";

import { useState, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useQuestionStore, type QuestionStatus } from "@/lib/store/question-store";
import {
  type Difficulty,
  difficultyLabels,
  questions,
} from "@/lib/data/questions";

export function generateStaticParams() {
  return questions.map((q) => ({
    id: q.id,
  }));
}

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Markdown } from "@/components/ui/markdown";
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  RotateCcw,
  Circle,
  Eye,
  EyeOff,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";

// ==================== 难度颜色 ====================
const difficultyColorMap: Record<Difficulty, string> = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

// ==================== 频率星星 ====================
function FrequencyStars({ frequency }: { frequency: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={cn(
            "size-3.5",
            i < frequency
              ? "text-orange-500 dark:text-orange-400"
              : "text-muted-foreground/30"
          )}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ))}
    </div>
  );
}

// ==================== 题目详情页面 ====================
export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const {
    allQuestions,
    getQuestionStatus,
    isFavorite,
    toggleFavorite,
    markQuestion,
    answerRecords,
  } = useQuestionStore();

  const [showAnswer, setShowAnswer] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [userNote, setUserNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  const question = useMemo(
    () => allQuestions.find((q) => q.id === id),
    [allQuestions, id]
  );

  // 查找当前分类下的上一题和下一题
  const { prevQuestion, nextQuestion } = useMemo(() => {
    if (!question) return { prevQuestion: null, nextQuestion: null };
    const sameCategoryQuestions = allQuestions.filter(
      (q) => q.category === question.category
    );
    const currentIndex = sameCategoryQuestions.findIndex(
      (q) => q.id === question.id
    );
    return {
      prevQuestion:
        currentIndex > 0
          ? sameCategoryQuestions[currentIndex - 1]
          : null,
      nextQuestion:
        currentIndex < sameCategoryQuestions.length - 1
          ? sameCategoryQuestions[currentIndex + 1]
          : null,
    };
  }, [question, allQuestions]);

  // 初始化笔记
  useMemo(() => {
    if (question) {
      const record = answerRecords[question.id];
      setUserNote(record?.note ?? "");
    }
  }, [question, answerRecords]);

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <BookOpen className="size-12 mb-4 opacity-30" />
        <p className="text-lg font-medium">题目未找到</p>
        <p className="text-sm mt-1">请检查题目 ID 是否正确</p>
        <Button variant="outline" className="mt-4" render={<Link href="/questions" />} nativeButton={false}>
          返回题库
        </Button>
      </div>
    );
  }

  const status = getQuestionStatus(question.id);
  const favorite = isFavorite(question.id);

  const handleMark = (newStatus: QuestionStatus) => {
    markQuestion(question.id, newStatus, userNote);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 1500);
  };

  const handleShowNextHint = () => {
    if (currentHintIndex < question.hints.length - 1) {
      setCurrentHintIndex((prev) => prev + 1);
    }
  };

  const handleResetHints = () => {
    setCurrentHintIndex(0);
    setShowHints(false);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" render={<Link href="/questions" />} nativeButton={false}>
            <ArrowLeft className="size-4 mr-1" />
            返回题库
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">
            {question.category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFavorite(question.id)}
          >
            <Star
              className={cn(
                "size-4 mr-1",
                favorite && "fill-current text-yellow-500 dark:text-yellow-400"
              )}
            />
            {favorite ? "已收藏" : "收藏"}
          </Button>
        </div>
      </div>

      {/* 内容区 */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
          {/* 标题区 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="secondary"
                className={difficultyColorMap[question.difficulty]}
              >
                {difficultyLabels[question.difficulty]}
              </Badge>
              <FrequencyStars frequency={question.frequency} />
              <div className="flex items-center gap-1 ml-auto">
                {status === "completed" && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  >
                    <CheckCircle2 className="size-3 mr-1" />
                    已掌握
                  </Badge>
                )}
                {status === "review" && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  >
                    <RotateCcw className="size-3 mr-1" />
                    需复习
                  </Badge>
                )}
              </div>
            </div>
            <h1 className="text-2xl font-bold">{question.title}</h1>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* 题目描述 */}
          <section>
            <h2 className="text-base font-semibold mb-3">题目描述</h2>
            <div className="rounded-lg border border-border bg-muted/10 p-4">
              <Markdown content={question.content} />
            </div>
          </section>

          <Separator />

          {/* 提示区域 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Lightbulb className="size-4 text-yellow-500" />
                提示
              </h2>
              <div className="flex items-center gap-2">
                {!showHints && question.hints.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHints(true)}
                  >
                    显示提示
                  </Button>
                )}
                {showHints && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetHints}
                    >
                      重置
                    </Button>
                    {currentHintIndex < question.hints.length - 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShowNextHint}
                      >
                        下一个提示 ({currentHintIndex + 2}/
                        {question.hints.length})
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            {showHints && (
              <div className="flex flex-col gap-2">
                {question.hints
                  .slice(0, currentHintIndex + 1)
                  .map((hint, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10 p-3 text-sm"
                    >
                      <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                        提示 {i + 1}：
                      </span>{" "}
                      {hint}
                    </div>
                  ))}
              </div>
            )}
          </section>

          <Separator />

          {/* 参考答案 */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">参考答案</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnswer(!showAnswer)}
              >
                {showAnswer ? (
                  <>
                    <EyeOff className="size-3.5 mr-1" />
                    隐藏答案
                  </>
                ) : (
                  <>
                    <Eye className="size-3.5 mr-1" />
                    显示答案
                  </>
                )}
              </Button>
            </div>
            {showAnswer && (
              <div className="rounded-lg border border-border bg-muted/10 p-4">
                <Markdown content={question.answer} />
              </div>
            )}
          </section>

          <Separator />

          {/* 笔记区域 */}
          <section>
            <h2 className="text-base font-semibold mb-3">我的笔记</h2>
            <Textarea
              placeholder="记录你的解题思路、心得和笔记..."
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              className="min-h-[120px] resize-y"
            />
          </section>

          <Separator />

          {/* 操作按钮 */}
          <section className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">标记为：</span>
            <Button
              variant={status === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => handleMark("completed")}
            >
              <CheckCircle2 className="size-3.5 mr-1.5" />
              已掌握
            </Button>
            <Button
              variant={status === "review" ? "default" : "outline"}
              size="sm"
              onClick={() => handleMark("review")}
            >
              <RotateCcw className="size-3.5 mr-1.5" />
              需复习
            </Button>
            <Button
              variant={status === "none" ? "default" : "outline"}
              size="sm"
              onClick={() => handleMark("none")}
            >
              <Circle className="size-3.5 mr-1.5" />
              未做
            </Button>
            {noteSaved && (
              <span className="text-sm text-green-600 dark:text-green-400">
                已保存
              </span>
            )}
          </section>

          {/* 上一题/下一题导航 */}
          <div className="flex items-center justify-between pt-4 pb-8">
            {prevQuestion ? (
              <Button variant="outline" render={<Link href={`/questions/${prevQuestion.id}`} />} nativeButton={false}>
                <ChevronLeft className="size-4 mr-1" />
                {prevQuestion.title}
              </Button>
            ) : (
              <div />
            )}
            {nextQuestion ? (
              <Button variant="outline" render={<Link href={`/questions/${nextQuestion.id}`} />} nativeButton={false}>
                {nextQuestion.title}
                <ChevronRight className="size-4 ml-1" />
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
