"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  BookOpen,
  Mic,
  FileText,
  Briefcase,
  TrendingUp,
  Target,
  Clock,
  Award,
  ArrowRight,
  Flame,
  CheckCircle2,
  Circle,
  Star,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useQuestionStore } from "@/lib/store/question-store"
import { useInterviewStore } from "@/lib/store/interview-store"
import { useJobStore } from "@/lib/store/job-store"
import { useResumeStore } from "@/lib/store/resume-store"
import { questions } from "@/lib/data/questions"

const featureCards = [
  {
    title: "面试题库",
    description: "涵盖8大分类，48+精选面试题",
    icon: BookOpen,
    href: "/questions",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "模拟面试",
    description: "AI面试官，技术面/HR面/行为面试",
    icon: Mic,
    href: "/interview",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "简历管理",
    description: "智能优化，多模板，一键导出",
    icon: FileText,
    href: "/resume",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "求职管理",
    description: "岗位追踪，面试记录，数据统计",
    icon: Briefcase,
    href: "/jobs",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
]

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  trend?: string
  color?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-2xl font-bold">{value}</span>
            {trend && (
              <span className="text-xs text-emerald-500 flex items-center gap-1">
                <TrendingUp className="size-3" />
                {trend}
              </span>
            )}
          </div>
          <div className={cn("flex size-10 items-center justify-center rounded-lg", color || "bg-primary/10")}>
            <Icon className="size-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DailyChallenge() {
  const [dailyQuestion, setDailyQuestion] = useState<typeof questions[0] | null>(null)

  useEffect(() => {
    const today = new Date()
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
    const index = seed % questions.length
    setDailyQuestion(questions[index])
  }, [])

  if (!dailyQuestion) return null

  const difficultyMap = {
    easy: { label: "简单", variant: "secondary" as const },
    medium: { label: "中等", variant: "default" as const },
    hard: { label: "困难", variant: "destructive" as const },
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="size-4 text-amber-500" />
            每日挑战
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            <Flame className="size-3 mr-1 text-orange-500" />
            坚持打卡
          </Badge>
        </div>
        <CardDescription>每天一道精选面试题，保持手感</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-sm">{dailyQuestion.title}</span>
              <div className="flex items-center gap-2">
                <Badge variant={difficultyMap[dailyQuestion.difficulty].variant} className="text-xs">
                  {difficultyMap[dailyQuestion.difficulty].label}
                </Badge>
                <span className="text-xs text-muted-foreground">{dailyQuestion.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Flame
                  key={i}
                  className={cn(
                    "size-3",
                    i < dailyQuestion.frequency
                      ? "text-orange-500"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {dailyQuestion.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <Link href={`/questions/${dailyQuestion.id}`}>
            <Button size="sm" className="w-full">
              开始挑战
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function StudyProgress() {
  const getStats = useQuestionStore((s) => s.getStats)
  const stats = getStats()

  const totalQuestions = questions.length
  const completedCount = stats.completed
  const overallProgress = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0

  const categoryEntries = Object.entries(stats.categoryProgress)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="size-4 text-blue-500" />
            学习进度
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {overallProgress}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>总体进度</span>
            <span>{completedCount}/{totalQuestions} 题</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium text-muted-foreground">分类进度</span>
          {categoryEntries.slice(0, 5).map(([name, cat]) => (
            <div key={name} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate">{name}</span>
                <span className="text-muted-foreground">{cat.completed}/{cat.total}</span>
              </div>
              <Progress value={cat.total > 0 ? (cat.completed / cat.total) * 100 : 0} className="h-1.5" />
            </div>
          ))}
        </div>

        <Link href="/questions">
          <Button variant="outline" size="sm" className="w-full">
            继续刷题
            <ArrowRight className="size-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function RecentActivity() {
  const { history } = useInterviewStore()
  const { jobList } = useJobStore()

  const recentInterviews = history.slice(0, 3)
  const recentJobs = jobList.slice(0, 3)

  const typeLabels: Record<string, string> = {
    technical: "技术面试",
    hr: "HR面试",
    behavioral: "行为面试",
  }

  const statusLabels: Record<string, string> = {
    applied: "投递中",
    interviewing: "面试中",
    offered: "已Offer",
    rejected: "已拒绝",
  }

  const statusColors: Record<string, string> = {
    applied: "bg-blue-500/10 text-blue-500",
    interviewing: "bg-amber-500/10 text-amber-500",
    offered: "bg-emerald-500/10 text-emerald-500",
    rejected: "bg-red-500/10 text-red-500",
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="size-4 text-purple-500" />
          最近动态
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {recentInterviews.length === 0 && recentJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Circle className="size-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">暂无动态</p>
              <p className="text-xs text-muted-foreground mt-1">开始你的面试准备之旅吧</p>
            </div>
          ) : (
            <>
              {recentInterviews.map((item, i) => (
                <div key={`interview-${i}`} className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
                    <Mic className="size-3.5 text-purple-500" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {typeLabels[item.type] || item.type}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        得分 {item.overallScore}分
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.questionCount}题
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {recentJobs.map((job, i) => (
                <div key={`job-${i}`} className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-500/10">
                    <Briefcase className="size-3.5 text-orange-500" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {job.companyName} · {job.position}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("text-xs w-fit", statusColors[job.status])}
                    >
                      {statusLabels[job.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickTips() {
  const tips = [
    {
      icon: Star,
      title: "面试技巧",
      content: "回答问题时使用 STAR 法则：情境、任务、行动、结果",
      color: "text-amber-500",
    },
    {
      icon: CheckCircle2,
      title: "简历要点",
      content: "用数据量化成果，如「将响应时间降低40%」比「优化了性能」更有说服力",
      color: "text-emerald-500",
    },
    {
      icon: Award,
      title: "系统设计",
      content: "先明确需求再设计方案，展示你的思考过程比给出完美答案更重要",
      color: "text-blue-500",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="size-4 text-amber-500" />
          面试小贴士
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
              <tip.icon className={cn("size-3.5", tip.color)} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{tip.title}</span>
              <span className="text-xs text-muted-foreground leading-relaxed">
                {tip.content}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const getStats = useQuestionStore((s) => s.getStats)
  const stats = getStats()
  const { history } = useInterviewStore()
  const { jobList } = useJobStore()
  const { personalInfo } = useResumeStore()

  const completedQuestions = stats.completed
  const avgInterviewScore =
    history.length > 0
      ? Math.round(history.reduce((sum, h) => sum + h.overallScore, 0) / history.length)
      : 0
  const offerCount = jobList.filter((j) => j.status === "offered").length
  const resumeScore = personalInfo.name ? 75 : 0

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          欢迎使用 CS 面试助手 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          你的专属计算机专业面试求职平台，助你拿到心仪 Offer
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="已刷题目"
          value={completedQuestions}
          icon={BookOpen}
          trend="持续进步"
          color="bg-blue-500/10"
        />
        <StatCard
          label="面试次数"
          value={history.length}
          icon={Mic}
          trend={avgInterviewScore > 0 ? `均分 ${avgInterviewScore}` : undefined}
          color="bg-purple-500/10"
        />
        <StatCard
          label="Offer 数"
          value={offerCount}
          icon={Award}
          color="bg-emerald-500/10"
        />
        <StatCard
          label="简历评分"
          value={resumeScore > 0 ? `${resumeScore}分` : "未填写"}
          icon={FileText}
          color="bg-orange-500/10"
        />
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {featureCards.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className={cn("flex size-10 items-center justify-center rounded-lg", feature.bg)}>
                  <feature.icon className={cn("size-5", feature.color)} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm">{feature.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {feature.description}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>进入</span>
                  <ArrowRight className="size-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <DailyChallenge />
          <QuickTips />
        </div>
        <div className="flex flex-col gap-4">
          <StudyProgress />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
