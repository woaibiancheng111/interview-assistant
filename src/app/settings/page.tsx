"use client"

import { useState, useEffect } from "react"
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
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
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
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
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
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useQuestionStore } from "@/lib/store/question-store"
import { useInterviewStore } from "@/lib/store/interview-store"
import { useJobStore } from "@/lib/store/job-store"
import { useResumeStore } from "@/lib/store/resume-store"
import { useAIStore, type AIModelProvider } from "@/lib/store/ai-store"
import { createAIService } from "@/lib/services/ai-service"

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

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState("zh-CN")
  const [dailyReminder, setDailyReminder] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  const {
    config,
    updateConfig,
    resetConfig,
    clearAllChats,
  } = useAIStore()

  const [showApiKey, setShowApiKey] = useState(false)
  const [testConnectionStatus, setTestConnectionStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [testConnectionMessage, setTestConnectionMessage] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

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
        alert("数据导入成功！")
      } catch {
        alert("导入失败，文件格式不正确")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const handleTestConnection = async () => {
    setTestConnectionStatus("loading")
    setTestConnectionMessage("")

    try {
      const service = createAIService(config)
      const response = await service.chat([
        { role: "user", content: "Hi, please reply with 'Hello' only." }
      ])

      if (response) {
        setTestConnectionStatus("success")
        setTestConnectionMessage("连接成功！AI服务正常工作。")
      } else {
        setTestConnectionStatus("error")
        setTestConnectionMessage("连接失败：未收到有效响应。")
      }
    } catch (error: unknown) {
      setTestConnectionStatus("error")
      setTestConnectionMessage(`连接失败：${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  const providerDescription = {
    openai: "使用 OpenAI 官方 API（GPT-4, GPT-3.5 等）",
    ollama: "使用本地 Ollama 模型（完全免费，需本地安装 Ollama）",
    custom: "使用自定义 OpenAI 兼容 API（可用于 Claude, Gemini 等的兼容接口）",
  }

  const providerPlaceholderApiKey = {
    openai: "sk-...",
    ollama: "Ollama 本地模型无需 API Key",
    custom: "输入您的 API Key（可选）",
  }

  const providerPlaceholderBaseUrl = {
    openai: "https://api.openai.com/v1",
    ollama: "http://localhost:11434/v1",
    custom: "https://your-custom-api.com/v1",
  }

  const commonModels = {
    openai: ["gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
    ollama: ["llama3.2", "llama3.1", "llama3", "mistral", "codellama"],
    custom: ["gpt-4", "gpt-3.5-turbo", "claude-3-opus", "claude-3-sonnet"],
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-3xl mx-auto">
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
          title="AI 教练配置"
          description="配置 AI 服务，启用智能对话、语义搜索、简历优化等功能"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm">AI 提供商</Label>
              <Select
                value={config.provider}
                onValueChange={(v) => {
                  updateConfig({ provider: v as AIModelProvider })
                  setTestConnectionStatus("idle")
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-3.5 text-emerald-500" />
                      OpenAI API
                    </div>
                  </SelectItem>
                  <SelectItem value="ollama">
                    <div className="flex items-center gap-2">
                      <Bot className="size-3.5 text-blue-500" />
                      Ollama（本地模型）
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <Settings className="size-3.5 text-purple-500" />
                      自定义 API（OpenAI 兼容）
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {providerDescription[config.provider]}
              </p>
            </div>

            <Separator />

            {config.provider !== "ollama" && (
              <>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm">API Key</Label>
                  <div className="relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={config.apiKey}
                      onChange={(e) => {
                        updateConfig({ apiKey: e.target.value })
                        setTestConnectionStatus("idle")
                      }}
                      placeholder={providerPlaceholderApiKey[config.provider]}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {config.provider === "openai"
                      ? "从 openai.com 获取 API Key。仅存储在本地浏览器中。"
                      : "可选，取决于您的 API 服务要求。"}
                  </p>
                </div>
                <Separator />
              </>
            )}

            <div className="flex flex-col gap-2">
              <Label className="text-sm">API Base URL</Label>
              <Input
                value={config.baseUrl}
                onChange={(e) => {
                  updateConfig({ baseUrl: e.target.value })
                  setTestConnectionStatus("idle")
                }}
                placeholder={providerPlaceholderBaseUrl[config.provider]}
              />
              <p className="text-xs text-muted-foreground">
                {config.provider === "ollama"
                  ? "确保 Ollama 已安装并运行在本地。默认端口 11434。"
                  : "API 服务的基础地址，包含 /v1 路径。"}
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">模型名称</Label>
                <Badge variant="outline" className="text-xs">
                  常用：{commonModels[config.provider].slice(0, 2).join(", ")}
                </Badge>
              </div>
              <Input
                value={config.model}
                onChange={(e) => {
                  updateConfig({ model: e.target.value })
                  setTestConnectionStatus("idle")
                }}
                placeholder={commonModels[config.provider][0]}
              />
              <div className="flex flex-wrap gap-1.5 mt-1">
                {commonModels[config.provider].map((model) => (
                  <Badge
                    key={model}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 transition-colors text-xs"
                    onClick={() => {
                      updateConfig({ model })
                      setTestConnectionStatus("idle")
                    }}
                  >
                    {model}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">随机性 (Temperature)</Label>
                <span className="text-xs font-mono text-muted-foreground">
                  {config.temperature.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[config.temperature]}
                min={0}
                max={2}
                step={0.1}
                onValueChange={([val]) => updateConfig({ temperature: val })}
              />
              <p className="text-xs text-muted-foreground">
                较低的值（0-0.5）产生更确定、一致的回答；较高的值（0.8-1.5）产生更有创意、多样化的回答。
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">最大 Token 数</Label>
                <span className="text-xs font-mono text-muted-foreground">
                  {config.maxTokens}
                </span>
              </div>
              <Slider
                value={[config.maxTokens]}
                min={256}
                max={8192}
                step={256}
                onValueChange={([val]) => updateConfig({ maxTokens: val })}
              />
              <p className="text-xs text-muted-foreground">
                限制 AI 单次回复的最大长度。取决于模型支持。
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={testConnectionStatus === "loading" || (config.provider !== "ollama" && !config.apiKey)}
                >
                  {testConnectionStatus === "loading" ? (
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  ) : testConnectionStatus === "success" ? (
                    <CheckCircle2 className="size-3.5 mr-1.5 text-emerald-500" />
                  ) : testConnectionStatus === "error" ? (
                    <AlertCircle className="size-3.5 mr-1.5 text-red-500" />
                  ) : null}
                  {testConnectionStatus === "loading" ? "测试连接中..." : "测试连接"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetConfig()
                    setTestConnectionStatus("idle")
                  }}
                >
                  恢复默认
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearAllChats()
                    alert("所有对话历史已清除")
                  }}
                >
                  清除对话历史
                </Button>
              </div>

              {testConnectionMessage && (
                <Alert
                  className={cn(
                    "py-2 px-3",
                    testConnectionStatus === "success"
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800"
                  )}
                >
                  <AlertDescription className="text-xs">
                    {testConnectionMessage}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {!config.apiKey && config.provider === "openai" && (
              <Alert className="bg-yellow-50 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="size-4" />
                <AlertDescription className="text-xs">
                  未配置 API Key，AI 功能（对话、语义搜索、STAR原则检查、简历优化）将无法使用。
                  您可以选择使用 Ollama 本地模型或输入 OpenAI API Key。
                </AlertDescription>
              </Alert>
            )}
          </div>
        </SettingSection>

        <SettingSection
          icon={Palette}
          title="外观"
          description="自定义应用的外观和主题"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">主题模式</Label>
              {mounted ? (
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">浅色</SelectItem>
                    <SelectItem value="dark">深色</SelectItem>
                    <SelectItem value="system">跟随系统</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="w-32 h-9 border border-border rounded-md opacity-50" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">语言</Label>
              <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
                <SelectTrigger className="w-32">
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
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Label className="text-sm">每日刷题提醒</Label>
                <span className="text-xs text-muted-foreground">每天提醒你完成面试题练习</span>
              </div>
              <Switch checked={dailyReminder} onCheckedChange={setDailyReminder} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="size-4 mr-1" />
                导出数据
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" type="button" onClick={() => document.getElementById('import-file')?.click()}>
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
              <DialogContent>
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
