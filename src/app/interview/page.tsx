"use client";

import { useRouter } from "next/navigation";
import {
  Code2,
  MessageCircle,
  Users,
  Play,
  Clock,
  Trophy,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  type InterviewType,
  interviewTypeConfig,
} from "@/lib/data/interview-questions";
import { useInterviewStore } from "@/lib/store/interview-store";

const iconMap: Record<InterviewType, React.ReactNode> = {
  technical: <Code2 className="size-6" />,
  hr: <MessageCircle className="size-6" />,
  behavioral: <Users className="size-6" />,
};

const typeColors: Record<InterviewType, string> = {
  technical: "bg-primary/10 text-primary",
  hr: "bg-chart-2/10 text-chart-2",
  behavioral: "bg-chart-3/10 text-chart-3",
};

export default function InterviewPage() {
  const router = useRouter();
  const { history, startInterview, clearHistory } = useInterviewStore();

  const handleStart = (type: InterviewType) => {
    startInterview(type);
    router.push("/interview/session");
  };

  const handleClearHistory = () => {
    clearHistory();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">AI 模拟面试</h1>
          <p className="mt-2 text-muted-foreground">
            选择面试类型，开始你的模拟面试之旅。AI面试官会根据你的回答给出实时评分和反馈。
          </p>
        </div>

        {/* 面试类型选择 */}
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">选择面试类型</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(interviewTypeConfig) as InterviewType[]).map((type) => {
              const config = interviewTypeConfig[type];
              return (
                <Card key={type} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex size-10 items-center justify-center rounded-lg ${typeColors[type]}`}
                      >
                        {iconMap[type]}
                      </div>
                      <Badge variant="secondary">{config.label}</Badge>
                    </div>
                    <CardTitle className="mt-2">{config.label}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="flex flex-col gap-1.5">
                      {config.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <ArrowRight className="size-3 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleStart(type)}
                    >
                      <Play className="size-4" />
                      开始面试
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        <Separator className="mb-10" />

        {/* 历史面试记录 */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">历史面试记录</h2>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="text-muted-foreground"
              >
                <Trash2 className="size-4" />
                清除记录
              </Button>
            )}
          </div>

          {history.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Clock className="mx-auto mb-3 size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  暂无面试记录，选择一种面试类型开始你的第一次模拟面试吧！
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((record) => (
                <Card key={record.id} size="sm">
                  <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex size-8 items-center justify-center rounded-lg ${typeColors[record.type]}`}
                      >
                        {iconMap[record.type]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{record.typeLabel}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.date} · 共 {record.questionCount} 道题
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {record.overallScore}/{record.maxScore}
                        </span>
                      </div>
                      <Badge
                        variant={
                          record.overallScore / record.maxScore >= 0.8
                            ? "default"
                            : record.overallScore / record.maxScore >= 0.6
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {record.overallScore / record.maxScore >= 0.8
                          ? "优秀"
                          : record.overallScore / record.maxScore >= 0.6
                            ? "良好"
                            : "待提升"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
