"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Send,
  MessageSquare,
  Trophy,
  XCircle,
  Edit2,
  Trash2,
  Calendar,
  BarChart3,
  Clock,
  User,
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  MapPin,
  DollarSign,
  ExternalLink,
  Briefcase,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJobStore } from "@/lib/store/job-store";
import type {
  JobStatus,
  JobApplication,
  InterviewResult,
  InterviewRecord,
} from "@/lib/store/job-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ==================== 常量 ====================

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  applied: { label: "投递中", color: "bg-blue-500", icon: Send },
  interviewing: { label: "面试中", color: "bg-yellow-500", icon: MessageSquare },
  offered: { label: "已Offer", color: "bg-green-500", icon: Trophy },
  rejected: { label: "已拒绝", color: "bg-red-500", icon: XCircle },
};

const INTERVIEW_RESULT_CONFIG: Record<
  InterviewResult,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "待面试", variant: "outline" },
  passed: { label: "通过", variant: "default" },
  failed: { label: "未通过", variant: "destructive" },
  cancelled: { label: "已取消", variant: "secondary" },
};

const INTERVIEW_ROUNDS = [
  "HR初筛",
  "技术一面",
  "技术二面",
  "技术三面",
  "HR面试",
  "终面",
  "其他",
];

// ==================== 子组件 ====================

/** 添加/编辑岗位弹窗 */
function JobFormDialog({
  job,
  open,
  onOpenChange,
}: {
  job?: JobApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addJob, updateJob } = useJobStore();
  const isEdit = !!job;

  const [form, setForm] = useState({
    companyName: job?.companyName ?? "",
    position: job?.position ?? "",
    status: job?.status ?? ("applied" as JobStatus),
    salary: job?.salary ?? "",
    location: job?.location ?? "",
    jobUrl: job?.jobUrl ?? "",
    notes: job?.notes ?? "",
    appliedDate: job?.appliedDate ?? new Date().toISOString().split("T")[0],
  });

  const handleSubmit = () => {
    if (!form.companyName.trim() || !form.position.trim()) return;

    if (isEdit && job) {
      updateJob(job.id, form);
    } else {
      addJob(form);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑岗位" : "添加岗位"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>公司名称 *</Label>
              <Input
                placeholder="请输入公司名称"
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>职位名称 *</Label>
              <Input
                placeholder="请输入职位名称"
                value={form.position}
                onChange={(e) =>
                  setForm({ ...form, position: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>状态</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: (v ?? "applied") as JobStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>薪资范围</Label>
              <Input
                placeholder="如：20k-35k"
                value={form.salary}
                onChange={(e) =>
                  setForm({ ...form, salary: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>工作地点</Label>
              <Input
                placeholder="如：北京、上海"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>投递日期</Label>
              <Input
                type="date"
                value={form.appliedDate}
                onChange={(e) =>
                  setForm({ ...form, appliedDate: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>职位链接（选填）</Label>
            <Input
              placeholder="https://..."
              value={form.jobUrl}
              onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>备注（选填）</Label>
            <Textarea
              placeholder="备注信息..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose render={<Button variant="outline" />}>
            取消
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={!form.companyName.trim() || !form.position.trim()}
          >
            {isEdit ? "保存" : "添加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 添加面试记录弹窗 */
function InterviewFormDialog({
  jobId,
  companyName,
  position,
  open,
  onOpenChange,
}: {
  jobId: string;
  companyName: string;
  position: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addInterview } = useJobStore();
  const [form, setForm] = useState({
    round: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    result: "pending" as InterviewResult,
    notes: "",
    interviewer: "",
  });

  const handleSubmit = () => {
    if (!form.round.trim()) return;
    addInterview({
      jobId,
      companyName,
      position,
      ...form,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>添加面试记录</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>面试轮次 *</Label>
              <Select
                value={form.round}
                onValueChange={(v) => setForm({ ...form, round: v ?? "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择面试轮次" />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_ROUNDS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>面试官（选填）</Label>
              <Input
                placeholder="面试官姓名"
                value={form.interviewer}
                onChange={(e) =>
                  setForm({ ...form, interviewer: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>日期 *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>时间</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>结果</Label>
              <Select
                value={form.result}
                onValueChange={(v) =>
                  setForm({ ...form, result: (v ?? "pending") as InterviewResult })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INTERVIEW_RESULT_CONFIG).map(
                    ([key, cfg]) => (
                      <SelectItem key={key} value={key}>
                        {cfg.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>面试笔记（选填）</Label>
            <Textarea
              placeholder="记录面试内容、问题、感受..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose render={<Button variant="outline" />}>
            取消
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!form.round.trim()}>
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 岗位卡片 */
function JobCard({
  job,
  onEdit,
}: {
  job: JobApplication;
  onEdit: (job: JobApplication) => void;
}) {
  const { removeJob, updateJobStatus, interviewRecords } = useJobStore();
  const [interviewOpen, setInterviewOpen] = useState(false);
  const statusConfig = STATUS_CONFIG[job.status];
  const StatusIcon = statusConfig.icon;

  const jobInterviews = interviewRecords.filter((i) => i.jobId === job.id);

  return (
    <>
      <Card className="group transition-shadow hover:shadow-md">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold">{job.companyName}</span>
                <div
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    statusConfig.color
                  )}
                />
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {job.position}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
              >
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(job)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setInterviewOpen(true)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  添加面试
                </DropdownMenuItem>
                {Object.entries(STATUS_CONFIG)
                  .filter(([key]) => key !== job.status)
                  .map(([key, cfg]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => updateJobStatus(job.id, key as JobStatus)}
                    >
                      <StatusIcon className="mr-2 h-4 w-4" />
                      移至{cfg.label}
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => removeJob(job.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {job.salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {job.salary}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {job.appliedDate}
            </span>
            {jobInterviews.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {jobInterviews.length}次面试
              </span>
            )}
          </div>

          {job.notes && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {job.notes}
            </p>
          )}

          {job.jobUrl && (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              查看职位
            </a>
          )}
        </CardContent>
      </Card>

      <InterviewFormDialog
        jobId={job.id}
        companyName={job.companyName}
        position={job.position}
        open={interviewOpen}
        onOpenChange={setInterviewOpen}
      />
    </>
  );
}

/** 看板列 */
function KanbanColumn({
  status,
  jobs,
  onEdit,
}: {
  status: JobStatus;
  jobs: JobApplication[];
  onEdit: (job: JobApplication) => void;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className={cn("h-3 w-3 rounded-full", config.color)} />
        <span className="font-semibold text-sm">{config.label}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {jobs.length}
        </Badge>
      </div>
      <ScrollArea className="h-[calc(100vh-320px)] min-h-[200px]">
        <div className="flex flex-col gap-3 pr-3">
          {jobs.length === 0 ? (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-6 text-xs text-muted-foreground">
              暂无岗位
            </div>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} onEdit={onEdit} />)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

/** 统计仪表盘 */
function StatisticsDashboard() {
  const { getStatistics, jobList } = useJobStore();
  const stats = getStatistics();

  const statCards = [
    {
      label: "总投递数",
      value: stats.totalApplied,
      icon: Send,
      color: "text-blue-500",
    },
    {
      label: "面试中",
      value: stats.totalInterviewing,
      icon: MessageSquare,
      color: "text-yellow-500",
    },
    {
      label: "已获Offer",
      value: stats.totalOffered,
      icon: Trophy,
      color: "text-green-500",
    },
    {
      label: "已拒绝",
      value: stats.totalRejected,
      icon: XCircle,
      color: "text-red-500",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">求职统计</h3>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex flex-col items-center py-3">
                <Icon className={cn("mb-1 h-6 w-6", stat.color)} />
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 转化率 */}
      {stats.totalApplied > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">转化漏斗</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span>面试转化率</span>
                <span className="font-medium">{stats.interviewRate}%</span>
              </div>
              <Progress value={stats.interviewRate} className="h-2" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span>Offer 率</span>
                <span className="font-medium">{stats.offerRate}%</span>
              </div>
              <Progress value={stats.offerRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 最近动态 */}
      {jobList.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">最近投递</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {jobList
                .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
                .slice(0, 5)
                .map((job) => {
                  const config = STATUS_CONFIG[job.status];
                  return (
                    <div
                      key={job.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            config.color
                          )}
                        />
                        <span className="font-medium">
                          {job.companyName}
                        </span>
                        <span className="text-muted-foreground">
                          {job.position}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {job.lastUpdated}
                      </span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** 面试时间线视图 */
function InterviewTimeline() {
  const { interviewRecords, updateInterview, removeInterview } = useJobStore();

  const sortedInterviews = useMemo(
    () =>
      [...interviewRecords].sort(
        (a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
      ),
    [interviewRecords]
  );

  // 按日期分组
  const grouped = useMemo(() => {
    const groups: Record<string, InterviewRecord[]> = {};
    sortedInterviews.forEach((interview) => {
      if (!groups[interview.date]) {
        groups[interview.date] = [];
      }
      groups[interview.date].push(interview);
    });
    return groups;
  }, [sortedInterviews]);

  if (interviewRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Calendar className="mb-3 h-10 w-10" />
        <p className="text-sm">暂无面试记录</p>
        <p className="text-xs">在岗位卡片中点击「添加面试」来记录面试信息</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">面试时间线</h3>
      <ScrollArea className="h-[calc(100vh-320px)] min-h-[300px]">
        <div className="flex flex-col gap-6 pr-3">
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, interviews]) => (
              <div key={date} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{date}</span>
                  <Badge variant="outline" className="text-xs">
                    {interviews.length}场面试
                  </Badge>
                </div>
                <div className="ml-4 flex flex-col gap-2 border-l-2 border-border pl-4">
                  {interviews
                    .sort((a, b) => b.time.localeCompare(a.time))
                    .map((interview) => {
                      const resultConfig =
                        INTERVIEW_RESULT_CONFIG[interview.result];
                      return (
                        <Card key={interview.id}>
                          <CardContent className="pt-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {interview.companyName}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {interview.position}
                                  </Badge>
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{interview.time}</span>
                                  <span>|</span>
                                  <span>{interview.round}</span>
                                  {interview.interviewer && (
                                    <>
                                      <span>|</span>
                                      <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {interview.interviewer}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {interview.notes && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {interview.notes}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={resultConfig.variant} className="text-xs">
                                  {resultConfig.label}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={<Button variant="ghost" size="icon" className="h-7 w-7" />}
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {Object.entries(INTERVIEW_RESULT_CONFIG).map(
                                      ([key, cfg]) => (
                                        <DropdownMenuItem
                                          key={key}
                                          onClick={() =>
                                            updateInterview(interview.id, {
                                              result: key as InterviewResult,
                                            })
                                          }
                                        >
                                          {cfg.label}
                                        </DropdownMenuItem>
                                      )
                                    )}
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() =>
                                        removeInterview(interview.id)
                                      }
                                    >
                                      删除
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}

/** 岗位列表视图 */
function JobListView({
  jobs,
  onEdit,
}: {
  jobs: JobApplication[];
  onEdit: (job: JobApplication) => void;
}) {
  const { removeJob, updateJobStatus, interviewRecords } = useJobStore();

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>公司</TableHead>
              <TableHead>职位</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="hidden md:table-cell">薪资</TableHead>
              <TableHead className="hidden md:table-cell">地点</TableHead>
              <TableHead className="hidden sm:table-cell">投递日期</TableHead>
              <TableHead className="w-[60px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => {
                const config = STATUS_CONFIG[job.status];
                const interviews = interviewRecords.filter(
                  (i) => i.jobId === job.id
                );
                return (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">
                      {job.companyName}
                    </TableCell>
                    <TableCell>{job.position}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="gap-1 text-xs"
                      >
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            config.color
                          )}
                        />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {job.salary || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {job.location || "-"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {job.appliedDate}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEdit(job)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeJob(job.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ==================== 主页面 ====================

export default function JobsPage() {
  const { jobList, searchJobs, filterJobsByStatus, resetJobs } = useJobStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | undefined>();

  // 筛选后的岗位
  const filteredJobs = useMemo(() => {
    let jobs = jobList;
    if (statusFilter !== "all") {
      jobs = jobs.filter((j) => j.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const searched = searchJobs(searchQuery);
      const searchedIds = new Set(searched.map((j) => j.id));
      jobs = jobs.filter((j) => searchedIds.has(j.id));
    }
    return jobs;
  }, [jobList, statusFilter, searchQuery, searchJobs]);

  // 按状态分组的岗位（用于看板视图）
  const kanbanJobs = useMemo(() => {
    const grouped: Record<JobStatus, JobApplication[]> = {
      applied: [],
      interviewing: [],
      offered: [],
      rejected: [],
    };
    const source = searchQuery.trim() ? searchJobs(searchQuery) : jobList;
    source.forEach((job) => {
      grouped[job.status].push(job);
    });
    return grouped;
  }, [jobList, searchQuery, searchJobs]);

  const handleEdit = (job: JobApplication) => {
    setEditingJob(job);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingJob(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingJob(undefined);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* 页面头部 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">求职管理</h1>
            <p className="text-sm text-muted-foreground">
              跟踪你的求职进度和面试安排
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetJobs}>
              <RotateCcw className="mr-2 h-4 w-4" />
              重置
            </Button>
            <Button size="sm" onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              添加岗位
            </Button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索公司、职位、地点..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter((v ?? "all") as JobStatus | "all")
            }
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 主内容区域 */}
        <Tabs defaultValue="kanban">
          <TabsList className="mb-4">
            <TabsTrigger value="kanban">
              <Briefcase className="mr-2 h-4 w-4" />
              看板视图
            </TabsTrigger>
            <TabsTrigger value="list">
              <FileText className="mr-2 h-4 w-4" />
              列表视图
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Calendar className="mr-2 h-4 w-4" />
              面试时间线
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="mr-2 h-4 w-4" />
              统计仪表盘
            </TabsTrigger>
          </TabsList>

          {/* 看板视图 */}
          <TabsContent value="kanban">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KanbanColumn
                status="applied"
                jobs={kanbanJobs.applied}
                onEdit={handleEdit}
              />
              <KanbanColumn
                status="interviewing"
                jobs={kanbanJobs.interviewing}
                onEdit={handleEdit}
              />
              <KanbanColumn
                status="offered"
                jobs={kanbanJobs.offered}
                onEdit={handleEdit}
              />
              <KanbanColumn
                status="rejected"
                jobs={kanbanJobs.rejected}
                onEdit={handleEdit}
              />
            </div>
          </TabsContent>

          {/* 列表视图 */}
          <TabsContent value="list">
            <JobListView jobs={filteredJobs} onEdit={handleEdit} />
          </TabsContent>

          {/* 面试时间线 */}
          <TabsContent value="timeline">
            <InterviewTimeline />
          </TabsContent>

          {/* 统计仪表盘 */}
          <TabsContent value="stats">
            <StatisticsDashboard />
          </TabsContent>
        </Tabs>

        {/* 添加/编辑弹窗 */}
        <JobFormDialog
          job={editingJob}
          open={dialogOpen}
          onOpenChange={handleDialogClose}
        />
      </div>
    </div>
  );
}
