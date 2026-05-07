"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Lightbulb,
  Square,
  ArrowRight,
  Bot,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { interviewTypeConfig } from "@/lib/data/interview-questions";
import { useInterviewStore } from "@/lib/store/interview-store";

export default function InterviewSessionPage() {
  const router = useRouter();
  const {
    status,
    interviewType,
    currentQuestionIndex,
    questions,
    messages,
    currentQuestionResult,
    allResults,
    hintUsed,
    isTyping,
    submitAnswer,
    nextQuestion,
    useHint,
    endInterview,
  } = useInterviewStore();

  const [inputValue, setInputValue] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 如果没有进行中的面试，跳转回选择页
  useEffect(() => {
    if (status === "idle") {
      router.push("/interview");
    }
  }, [status, router]);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-slot='scroll-area-viewport']"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  // 聚焦输入框
  useEffect(() => {
    if (!isTyping && !hasSubmitted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTyping, hasSubmitted]);

  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping || hasSubmitted) return;

    submitAnswer(trimmed);
    setInputValue("");
    setHasSubmitted(true);
  }, [inputValue, isTyping, hasSubmitted, submitAnswer]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleNext = () => {
    setHasSubmitted(false);
    nextQuestion();
  };

  const handleEnd = () => {
    endInterview();
    router.push("/interview/result");
  };

  if (status === "idle") {
    return null;
  }

  const config = interviewType
    ? interviewTypeConfig[interviewType]
    : null;
  const progressValue =
    questions.length > 0
      ? ((currentQuestionIndex + (hasSubmitted ? 1 : 0)) / questions.length) * 100
      : 0;

  const isLastQuestion = currentQuestionIndex >= questions.length - 1;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* 顶部栏 */}
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline">{config?.label}</Badge>
            <span className="text-sm text-muted-foreground">
              第 {currentQuestionIndex + 1}/{questions.length} 题
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={useHint}
              disabled={hintUsed || isTyping}
            >
              <Lightbulb className="size-4" />
              {hintUsed ? "已使用提示" : "获取提示"}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleEnd}>
              <Square className="size-4" />
              结束面试
            </Button>
          </div>
        </div>
        <Progress value={progressValue} />
      </div>

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 对话区域 */}
        <div className="flex flex-1 flex-col">
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="mx-auto max-w-3xl px-4 py-6">
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar size="sm">
                      <AvatarFallback
                        className={
                          msg.role === "interviewer"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }
                      >
                        {msg.role === "interviewer" ? (
                          <Bot className="size-3.5" />
                        ) : (
                          <User className="size-3.5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
                        msg.role === "interviewer"
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {/* 打字指示器 */}
                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar size="sm">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="size-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1 rounded-lg bg-muted px-4 py-2.5">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        面试官正在思考...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* 输入区域 */}
          <div className="border-t bg-card">
            <div className="mx-auto max-w-3xl px-4 py-3">
              {hasSubmitted && currentQuestionResult && !isTyping ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary" />
                    <span className="text-sm">
                      本题得分：
                      <span className="font-semibold">
                        {currentQuestionResult.totalScore}/
                        {currentQuestionResult.maxTotalScore}
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {isLastQuestion ? (
                      <Button onClick={handleEnd}>
                        查看面试结果
                        <ArrowRight className="size-4" />
                      </Button>
                    ) : (
                      <Button onClick={handleNext}>
                        下一题
                        <ArrowRight className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isTyping
                        ? "请等待面试官回复..."
                        : "输入你的回答... (按 Enter 发送，Shift+Enter 换行)"
                    }
                    disabled={isTyping}
                    className="min-h-[44px] max-h-[120px] resize-none"
                    rows={1}
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={!inputValue.trim() || isTyping}
                    size="icon"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧评分面板 */}
        <div className="hidden w-80 border-l bg-card lg:block">
          <div className="flex h-full flex-col">
            <CardHeader className="border-b py-3">
              <CardTitle className="text-sm">实时评分面板</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              <CardContent className="flex flex-col gap-4 py-4">
                {/* 当前题目信息 */}
                {currentQuestion && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      当前题目
                    </p>
                    <p className="text-sm leading-relaxed">
                      {currentQuestion.question}
                    </p>
                  </div>
                )}

                <Separator />

                {/* 评分标准 */}
                {currentQuestion && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      评分维度
                    </p>
                    <div className="flex flex-col gap-2">
                      {currentQuestion.evaluationCriteria.map((criteria) => (
                        <div
                          key={criteria.dimension}
                          className="rounded-md border px-3 py-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">
                              {criteria.dimension}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {criteria.maxScore}分
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {criteria.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* 已完成题目评分 */}
                {allResults.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      已完成题目
                    </p>
                    <div className="flex flex-col gap-2">
                      {allResults.map((result, index) => {
                        const percentage =
                          result.totalScore / result.maxTotalScore;
                        return (
                          <div
                            key={result.questionId}
                            className="rounded-md border px-3 py-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">
                                第 {index + 1} 题
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold">
                                  {result.totalScore}/{result.maxTotalScore}
                                </span>
                                <Badge
                                  variant={
                                    percentage >= 0.8
                                      ? "default"
                                      : percentage >= 0.6
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className="text-[10px]"
                                >
                                  {percentage >= 0.8
                                    ? "优秀"
                                    : percentage >= 0.6
                                      ? "良好"
                                      : "待提升"}
                                </Badge>
                              </div>
                            </div>
                            <Progress
                              value={percentage * 100}
                              className="mt-1.5"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 当前题目评分详情 */}
                {currentQuestionResult && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        本题评分详情
                      </p>
                      <div className="flex flex-col gap-2">
                        {currentQuestionResult.scores.map((score) => (
                          <div
                            key={score.dimension}
                            className="rounded-md border px-3 py-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">
                                {score.dimension}
                              </span>
                              <span className="text-xs font-semibold">
                                {score.score}/{score.maxScore}
                              </span>
                            </div>
                            <Progress
                              value={(score.score / score.maxScore) * 100}
                              className="mt-1.5"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                              {score.feedback}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 rounded-md bg-muted px-3 py-2">
                        <div className="flex items-start gap-1.5">
                          <AlertCircle className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {currentQuestionResult.feedback}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
