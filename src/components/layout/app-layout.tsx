"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  BookOpen,
  Mic,
  FileText,
  Briefcase,
  LayoutDashboard,
  GraduationCap,
  Settings,
  Moon,
  Sun,
  LogOut,
  User,
  LogIn,
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useQuestionStore } from "@/lib/store/question-store"
import { useJobStore } from "@/lib/store/job-store"
import { useInterviewStore } from "@/lib/store/interview-store"
import { syncService } from "@/lib/store/sync-service"

const navItems = [
  { title: "仪表盘", href: "/", icon: LayoutDashboard },
  { title: "面试题库", href: "/questions", icon: BookOpen },
  { title: "模拟面试", href: "/interview", icon: Mic },
  { title: "简历管理", href: "/resume", icon: FileText },
  { title: "求职管理", href: "/jobs", icon: Briefcase },
]

const quickItems = [
  { title: "每日挑战", href: "/questions?difficulty=hard", icon: BookOpen },
  { title: "快速面试", href: "/interview", icon: Mic },
]

function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">CS面试助手</span>
            <span className="text-xs text-muted-foreground">Interview Assistant</span>
          </div>
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>导航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href)
                    }
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>快捷入口</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickItems.map((item) => (
                <SidebarMenuItem key={item.href + item.title}>
                  <SidebarMenuButton onClick={() => router.push(item.href)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator />
        <div className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => router.push("/settings")}>
                <Settings />
                <span>设置</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button variant="ghost" size="icon"><Sun className="size-4" /></Button>
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === "dark" || theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches ? (
        <Moon className="size-4" />
      ) : (
        <Sun className="size-4" />
      )}
    </Button>
  )
}

function UserMenu() {
  const router = useRouter()
  const { user, isLoggedIn, logout } = useAuthStore()

  const handleLogin = () => {
    router.push("/login")
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (!isLoggedIn) {
    return (
      <Button variant="ghost" size="sm" onClick={handleLogin}>
        <LogIn className="mr-2 h-4 w-4" />
        登录
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="sm" className="gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {user?.username?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{user?.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{user?.username}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          设置
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function useDataSync() {
  const { isLoggedIn } = useAuthStore()
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) return

    const syncData = async () => {
      setIsSyncing(true)
      try {
        const [answerRecords, favorites, jobs, interviews] = await Promise.all([
          syncService.syncAnswerRecordsFromApi(),
          syncService.syncFavoritesFromApi(),
          syncService.syncJobsFromApi(),
          syncService.syncInterviewsFromApi(),
        ])

        const { setAnswerRecords, setFavorites } = useQuestionStore.getState()
        const { setJobList, setInterviewRecords } = useJobStore.getState()

        if (Object.keys(answerRecords).length > 0) {
          setAnswerRecords(answerRecords)
        }
        if (favorites.size > 0) {
          setFavorites(favorites)
        }
        if (jobs.length > 0) {
          setJobList(jobs)
        }
        if (interviews.length > 0) {
          setInterviewRecords(interviews)
        }
      } catch (error) {
        console.error("Data sync failed:", error)
      } finally {
        setIsSyncing(false)
      }
    }

    syncData()
  }, [isLoggedIn])

  return { isSyncing }
}

function TopBar() {
  useDataSync()

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger />
      <div className="flex-1" />
      <ThemeToggle />
      <UserMenu />
    </header>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/login") {
    return <>{children}</>
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopBar />
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
