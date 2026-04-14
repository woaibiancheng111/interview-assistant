"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RotateCcw,
  Home,
  Trophy,
  Clock,
  Target,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useInterviewStore } from "@/lib/store/interview-store";

// ==================== CSS 雷达图组件 ====================

function RadarChart({
  dimensions,
}: {
  dimensions: { dimension: string; score: number; maxScore: number }[];
}) {
  const size = 240;
  const center = size / 2;
  const maxRadius = 90;
  const levels = 4;

  // 计算每个维度的角度位置
  const angleStep = (2 * Math.PI) / dimensions.length;

  // 生成网格多边形路径
  const getGridPath = (level: number) => {
    const r = (maxRadius / levels) * level;
    return dimensions
      .map((_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");
  };

  // 生成数据多边形路径
  const dataPoints = dimensions.map((dim, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const ratio = dim.score / dim.maxScore;
    const r = maxRadius * ratio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      label: dim.dimension,
      score: dim.score,
    };
  });

  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // 标签位置
  const labelPositions = dimensions.map((_, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const labelR = maxRadius + 24;
    return {
      x: center + labelR * Math.cos(angle),
      y: center + labelR * Math.sin(angle),
      label: dimensions[i].dimension,
      score: dimensions[i].score,
    };
  });

  return (
    <div className="flex justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* 网格 */}
        {Array.from({ length: levels }, (_, i) => (
          <polygon
            key={`grid-${i}`}
            points={getGridPath(i + 1)}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border"
          />
        ))}

        {/* 轴线 */}
        {dimensions.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const x = center + maxRadius * Math.cos(angle);
          const y = center + maxRadius * Math.sin(angle);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border"
            />
          );
        })}

        {/* 数据区域 */}
        <polygon
          points={dataPath}
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
        />

        {/* 数据点 */}
        {dataPoints.map((p, i) => (
          <circle
            key={`point-${i}`}
            cx={p.x}
            cy={p.y}
            r="3"
            className="fill-primary"
          />
        ))}

        {/* 标签 */}
        {labelPositions.map((pos, i) => {
          const isTop = pos.y < center;
          const isBottom = pos.y > center;
          const isLeft = pos.x < center;
          const isRight = pos.x > center;

          let textAnchor: "start" | "middle" | "end" = "middle";
          let dominantBaseline: "auto" | "hanging" | "middle" = "middle";
          let offsetY = 0;

          if (isTop) {
            dominantBaseline = "auto";
            offsetY = -4;
          } else if (isBottom) {
            dominantBaseline = "hanging";
            offsetY = 4;
          }

          if (isLeft && !isTop && !isBottom) {
            textAnchor = "end";
          } else if (isRight && !isTop && !isBottom) {
            textAnchor = "start";
          }

          return (
            <text
              key={`label-${i}`}
              x={pos.x}
              y={pos.y + offsetY}
              textAnchor={textAnchor}
              dominantBaseline={dominantBaseline}
              className="fill-foreground text-[10px] font-medium"
            >
              {pos.label} ({pos.score})
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ==================== 结果页面 ====================

export default function InterviewResultPage() {
  const router = useRouter();
  const { status, interviewResult, resetInterview } = useInterviewStore();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (status !== "completed" || !interviewResult) {
      router.push("/interview");
    }
  }, [status, interviewResult, router]);

  if (!interviewResult) {
    return null;
  }

  const { overallScore, maxScore, questionResults, dimensionAverages, summary, suggestions, duration } =
    interviewResult;
  const percentage = overallScore / maxScore;

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}分${seconds}秒`;
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleRestart = () => {
    resetInterview();
    router.push("/interview");
  };

  const handleNewInterview = () => {
    resetInterview();
    router.push("/interview");
  };

  const getScoreColor = (ratio: number) => {
    if (ratio >= 0.8) return "text-primary";
    if (ratio >= 0.6) return "text-chart-2";
    return "text-destructive";
  };

  const getScoreLabel = (ratio: number) => {
    if (ratio >= 0.9) return "卓越";
    if (ratio >= 0.8) return "优秀";
    if (ratio >= 0.7) return "良好";
    if (ratio >= 0.6) return "合格";
    return "待提升";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">面试结果报告</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {interviewResult.typeLabel} · {formatDuration(duration)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleNewInterview}>
              <Home className="size-4" />
              返回首页
            </Button>
            <Button onClick={handleRestart}>
              <RotateCcw className="size-4" />
              重新面试
            </Button>
          </div>
        </div>

        {/* 总体评分卡片 */}
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:items-start sm:justify-center">
            {/* 分数圆环 */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative flex size-32 items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${percentage * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                    strokeLinecap="round"
                    className={getScoreColor(percentage)}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
                    {Math.round(percentage * 100)}
                  </span>
                  <span className="text-xs text-muted-foreground">综合得分</span>
                </div>
              </div>
              <Badge
                variant={
                  percentage >= 0.8
                    ? "default"
                    : percentage >= 0.6
                      ? "secondary"
                      : "destructive"
                }
              >
                {getScoreLabel(percentage)}
              </Badge>
            </div>

            {/* 统计信息 */}
            <div className="flex flex-col gap-3 sm:ml-8">
              <div className="flex items-center gap-3">
                <Trophy className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  总分：
                  <span className="font-semibold">
                    {overallScore}/{maxScore}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Target className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  答题数：
                  <span className="font-semibold">{questionResults.length}</span> 道
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  用时：
                  <span className="font-semibold">
                    {formatDuration(duration)}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Lightbulb className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  评估维度：
                  <span className="font-semibold">
                    {dimensionAverages.length}
                  </span>{" "}
                  个
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 雷达图和维度评分 */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* 雷达图 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">能力维度雷达图</CardTitle>
              <CardDescription>
                各维度的综合得分分布（满分100分）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadarChart dimensions={dimensionAverages} />
            </CardContent>
          </Card>

          {/* 维度详细评分 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">维度评分详情</CardTitle>
              <CardDescription>
                各维度的平均得分和反馈
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {dimensionAverages.map((dim) => {
                  const ratio = dim.score / dim.maxScore;
                  return (
                    <div key={dim.dimension} className="rounded-md border px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {dim.dimension}
                        </span>
                        <span
                          className={`text-sm font-semibold ${getScoreColor(ratio)}`}
                        >
                          {dim.score}分
                        </span>
                      </div>
                      <Progress value={ratio * 100} className="mt-1.5" />
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {dim.feedback}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 总结 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">面试总结</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {summary}
            </p>
          </CardContent>
        </Card>

        {/* 详细反馈 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">详细反馈</CardTitle>
            <CardDescription>
              点击展开查看每道题的详细评分和反馈
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {questionResults.map((result, index) => {
                const isExpanded = expandedQuestions.has(result.questionId);
                const ratio = result.totalScore / result.maxTotalScore;
                return (
                  <div key={result.questionId} className="rounded-md border">
                    <button
                      onClick={() => toggleQuestion(result.questionId)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium line-clamp-1">
                          {result.question}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            ratio >= 0.8
                              ? "default"
                              : ratio >= 0.6
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {result.totalScore}/{result.maxTotalScore}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t px-4 py-3">
                        <div className="mb-3">
                          <p className="mb-1 text-xs font-medium text-muted-foreground">
                            你的回答
                          </p>
                          <p className="text-sm leading-relaxed">
                            {result.userAnswer}
                          </p>
                        </div>
                        <Separator className="my-3" />
                        <div className="mb-3">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            各维度评分
                          </p>
                          <div className="flex flex-col gap-2">
                            {result.scores.map((score) => (
                              <div
                                key={score.dimension}
                                className="flex items-center gap-2"
                              >
                                <span className="w-20 shrink-0 text-xs">
                                  {score.dimension}
                                </span>
                                <Progress
                                  value={(score.score / score.maxScore) * 100}
                                  className="flex-1"
                                />
                                <span className="w-12 shrink-0 text-right text-xs font-medium">
                                  {score.score}/{score.maxScore}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-md bg-muted px-3 py-2">
                          <p className="text-xs text-muted-foreground">
                            {result.feedback}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 改进建议 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-sm">改进建议</CardTitle>
            <CardDescription>
              基于你的面试表现，以下是一些有针对性的改进建议
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2.5">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5 rounded-md border px-3 py-2.5"
                >
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm leading-relaxed">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 底部操作 */}
        <div className="flex justify-center gap-3">
          <Button variant="outline" size="lg" onClick={handleNewInterview}>
            <Home className="size-4" />
            返回首页
          </Button>
          <Button size="lg" onClick={handleRestart}>
            <RotateCcw className="size-4" />
            重新面试
          </Button>
        </div>
      </div>
    </div>
  );
}
