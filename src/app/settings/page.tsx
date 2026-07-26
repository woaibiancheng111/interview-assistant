"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import {
  Settings,
  Trash2,
  Download,
  Upload,
  User,
  Bell,
  Palette,
  Shield,
  Bot,
  BookOpen,
  ExternalLink,
} from "lucide-react"
import {
  curatedQuestions,
  importedQuestions,
  questions,
  questionSources,
  questionsGeneratedAt,
} from "@/lib/data/questions"
import { useHydration } from "@/hooks/use-hydration"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useQuestionStore } from "@/lib/store/question-store"
import { useInterviewStore } from "@/lib/store/interview-store"
import { useJobStore } from "@/lib/store/job-store"
import { useResumeStore } from "@/lib/store/resume-store"
import { useSettingsStore } from "@/lib/store/settings-store"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

function SettingSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <div className="flex flex-col">
            <CardTitle className="text-sm">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

const DASHSCOPE_MODELS = [
  { value: "qwen-turbo", label: "qwen-turbo (快速版)", description: "适合简单任务，响应最快" },
  { value: "qwen-plus", label: "qwen-plus (标准版)", description: "平衡性能与速度，推荐使用" },
  { value: "qwen-max", label: "qwen-max (高级版)", description: "最强模型，适合复杂推理" },
  { value: "qwen-plus-latest", label: "qwen-plus-latest", description: "最新版 qwen-plus" },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const mounted = useHydration()
  const [language, setLanguage] = useState("zh-CN")
  const [dailyReminder, setDailyReminder] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const { aiSettings, setDashscopeModel, resetAISettings } = useSettingsStore()

  const resetQuestionStore = useQuestionStore((s) => s.resetFilters)
  const resetInterviewStore = useInterviewStore((s) => s.resetInterview)
  const resetJobStore = useJobStore((s) => s.resetJobs)
  const resetResumeStore = useResumeStore((s) => s.resetResume)

  const handleThemeChange = (value: string | null) => {
    if (!value) return
    setTheme(value)
  }

  const handleResetAll = () => {
    resetQuestionStore()
    resetInterviewStore()
    resetJobStore()
    resetResumeStore()
  }

  const handleExportData = () => {
    const data = {
      questions: useQuestionStore.getState(),
      interview: useInterviewStore.getState(),
      jobs: useJobStore.getState(),
      resume: useResumeStore.getState(),
      settings: useSettingsStore.getState(),
      exportDate: new Date().toISOString(),
    }
    const jsonString = JSON.stringify(data, (key, value) => {
      if (value instanceof Set) {
        return { __type: "Set", value: Array.from(value) }
      }
      return value
    }, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cs-interview-assistant-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string, (key, value) => {
          if (value && typeof value === "object" && value.__type === "Set") {
            return new Set(value.value)
          }
          return value
        })
        if (data.questions) useQuestionStore.setState(data.questions)
        if (data.interview) useInterviewStore.setState(data.interview)
        if (data.jobs) useJobStore.setState(data.jobs)
        if (data.resume) useResumeStore.setState(data.resume)
        if (data.settings) useSettingsStore.setState(data.settings)
        alert("数据导入成功！")
      } catch {
        alert("导入失败，文件格式不正确")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 pb-20 md:p-6 lg:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="size-5" />
          设置
        </h1>
        <p className="text-sm text-muted-foreground">管理你的偏好设置和数据</p>
      </div>

      <div className="flex flex-col gap-4">
        <SettingSection
          icon={Bot}
          title="AI 服务配置"
          description="AI Key 由服务器统一配置"
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
              AI 简历优化使用服务器端配置的百炼 API Key。
              如无法使用，请联系管理员检查服务端环境变量。
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col">
                <Label className="text-sm">模型选择</Label>
                <span className="text-xs text-muted-foreground">选择用于 AI 分析的模型版本</span>
              </div>
              <Select value={aiSettings.dashscopeModel} onValueChange={(v) => v && setDashscopeModel(v)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DASHSCOPE_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span>{model.label}</span>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="text-xs">{model.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <Button variant="outline" size="sm" onClick={resetAISettings} className="w-fit">
              重置 AI 设置
            </Button>
          </div>
        </SettingSection>

        <SettingSection
          icon={Palette}
          title="外观"
          description="自定义应用的外观和主题"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Label className="text-sm">主题模式</Label>
              {mounted ? (
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">浅色</SelectItem>
                    <SelectItem value="dark">深色</SelectItem>
                    <SelectItem value="system">跟随系统</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-9 w-full rounded-md border border-border opacity-50 sm:w-32" />
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Label className="text-sm">语言</Label>
              <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">简体中文</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingSection>

        <SettingSection
          icon={Bell}
          title="通知"
          description="管理提醒和通知设置"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <Label className="text-sm">每日刷题提醒</Label>
                <span className="text-xs text-muted-foreground">每天提醒你完成面试题练习</span>
              </div>
              <Switch checked={dailyReminder} onCheckedChange={setDailyReminder} />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <Label className="text-sm">自动保存</Label>
                <span className="text-xs text-muted-foreground">自动保存你的答题记录和笔记</span>
              </div>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            </div>
          </div>
        </SettingSection>

        <SettingSection
          icon={Shield}
          title="数据管理"
          description="导出、导入或清除你的数据"
        >
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center">
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="size-4 mr-1" />
                导出数据
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" type="button" className="w-full sm:w-auto" onClick={() => document.getElementById('import-file')?.click()}>
                  <Upload className="size-4 mr-1" />
                  导入数据
                </Button>
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportData}
                />
              </label>
            </div>
            <Separator />
            <Dialog>
              <DialogTrigger render={<Button variant="destructive" size="sm" />}>
                <Trash2 className="size-4 mr-1" />
                清除所有数据
              </DialogTrigger>
              <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>确认清除所有数据？</DialogTitle>
                  <DialogDescription>
                    此操作将清除你的所有刷题记录、面试历史、简历数据和求职信息。此操作不可撤销。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">取消</Button>
                  <Button variant="destructive" onClick={handleResetAll}>
                    确认清除
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </SettingSection>

        <SettingSection
          icon={BookOpen}
          title="题库来源"
          description="开源题目的出处与授权协议"
        >
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">题目总数</span>
              <span>
                {questions.length} 道（精选 {curatedQuestions.length} · 开源{" "}
                {importedQuestions.length}）
              </span>
            </div>
            {questionSources.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                当前未引入开源题库，可执行 <code>npm run questions:fetch</code> 抓取。
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {questionSources.map((source) => (
                  <div
                    key={source.id}
                    className="flex flex-wrap items-center justify-between gap-1 rounded-lg border border-border px-3 py-2"
                  >
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
                    >
                      {source.name}
                      <ExternalLink className="size-3" />
                    </a>
                    <span className="text-xs text-muted-foreground">
                      {source.questionCount} 道 ·{" "}
                      <a
                        href={source.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2"
                      >
                        {source.license}
                      </a>
                    </span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  内容版权归各原作者所有，本站在保留署名与协议声明的前提下再分发。
                  {questionsGeneratedAt
                    ? ` 最近更新：${questionsGeneratedAt.slice(0, 10)}。`
                    : ""}
                </p>
              </div>
            )}
          </div>
        </SettingSection>

        <SettingSection
          icon={User}
          title="关于"
          description="应用信息"
        >
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">应用名称</span>
              <span>CS 面试助手</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">版本</span>
              <span>1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">技术栈</span>
              <span>Next.js + TypeScript + Tailwind CSS</span>
            </div>
          </div>
        </SettingSection>
      </div>
    </div>
  )
}
