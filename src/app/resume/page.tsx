"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Wrench,
  Eye,
  Sparkles,
  Download,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  LayoutTemplate,
  Target,
  MapPin,
  DollarSign,
  Clock,
  Zap,
  X,
  ArrowRight,
  Check,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { useJobStore } from "@/lib/store/job-store";
import type { JobMatchResult } from "@/lib/store/resume-store";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/lib/store/resume-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// ==================== 常量 ====================

const STEPS = [
  { id: "personal", label: "个人信息", icon: User },
  { id: "education", label: "教育经历", icon: GraduationCap },
  { id: "work", label: "工作经历", icon: Briefcase },
  { id: "project", label: "项目经历", icon: FolderGit2 },
  { id: "skills", label: "技能列表", icon: Wrench },
  { id: "intent", label: "就业意向", icon: Target },
];

const TEMPLATES = [
  {
    id: "classic",
    name: "经典模板",
    description: "传统简洁风格，适合大多数场景",
  },
  {
    id: "modern",
    name: "现代模板",
    description: "双栏布局，突出技术能力",
  },
  {
    id: "minimal",
    name: "极简模板",
    description: "留白充足，突出核心内容",
  },
];

const DEGREE_OPTIONS = ["高中", "大专", "本科", "硕士", "博士", "其他"];

const SKILL_CATEGORY_PRESETS = [
  "编程语言",
  "前端框架",
  "后端框架",
  "数据库",
  "工具与平台",
  "其他技能",
];

// ==================== 就业意向常量 ====================

const POSITION_PRESETS = [
  "前端开发工程师",
  "后端开发工程师",
  "全栈开发工程师",
  "Java开发工程师",
  "Python开发工程师",
  "Go开发工程师",
  "Node.js开发工程师",
  "React开发工程师",
  "Vue开发工程师",
  "iOS开发工程师",
  "Android开发工程师",
  "小程序开发工程师",
  "算法工程师",
  "数据分析师",
  "数据工程师",
  "运维工程师",
  "测试工程师",
  "产品经理",
  "UI设计师",
  "架构师",
  "技术主管",
];

const LOCATION_PRESETS = [
  "北京",
  "上海",
  "广州",
  "深圳",
  "杭州",
  "成都",
  "武汉",
  "西安",
  "南京",
  "苏州",
  "重庆",
  "天津",
  "长沙",
  "郑州",
  "青岛",
  "大连",
  "厦门",
  "珠海",
  "远程",
  "全国",
  "异地",
];

const EMPLOYMENT_TYPE_PRESETS = [
  "全职",
  "兼职",
  "实习",
  "远程",
  "自由职业",
  "合同工",
];

const INDUSTRY_PRESETS = [
  "互联网",
  "金融科技",
  "电商",
  "在线教育",
  "医疗健康",
  "人工智能",
  "大数据",
  "云计算",
  "游戏",
  "社交",
  "企业服务",
  "新能源",
  "智能硬件",
  "其他",
];

const AVAILABILITY_PRESETS = [
  "随时到岗",
  "一周内到岗",
  "两周内到岗",
  "一个月内到岗",
  "在职考虑机会",
  "暂不考虑",
];

const SALARY_RANGE_PRESETS = [
  "5k-10k",
  "10k-15k",
  "15k-20k",
  "20k-25k",
  "25k-30k",
  "30k-40k",
  "40k-50k",
  "50k-60k",
  "60k-80k",
  "80k-100k",
  "100k以上",
  "面议",
];

// ==================== 子组件 ====================

/** 个人信息表单 */
function PersonalInfoForm() {
  const { personalInfo, updatePersonalInfo } = useResumeStore();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">姓名</Label>
          <Input
            id="name"
            placeholder="请输入姓名"
            value={personalInfo.name}
            onChange={(e) => updatePersonalInfo({ name: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            value={personalInfo.email}
            onChange={(e) => updatePersonalInfo({ email: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">电话</Label>
          <Input
            id="phone"
            placeholder="请输入电话号码"
            value={personalInfo.phone}
            onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            placeholder="https://github.com/username"
            value={personalInfo.github}
            onChange={(e) => updatePersonalInfo({ github: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="website">个人网站</Label>
          <Input
            id="website"
            placeholder="https://yourwebsite.com"
            value={personalInfo.website}
            onChange={(e) => updatePersonalInfo({ website: e.target.value })}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="summary">个人简介</Label>
        <Textarea
          id="summary"
          placeholder="简要介绍你的技术背景、核心优势和职业目标..."
          className="min-h-[100px]"
          value={personalInfo.summary}
          onChange={(e) => updatePersonalInfo({ summary: e.target.value })}
        />
      </div>
    </div>
  );
}

/** 教育经历表单 */
function EducationForm() {
  const { educationList, addEducation, updateEducation, removeEducation } =
    useResumeStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    school: "",
    major: "",
    degree: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const handleAdd = () => {
    addEducation(form);
    setForm({
      school: "",
      major: "",
      degree: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {educationList.map((edu) => (
        <Card key={edu.id}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{edu.school}</span>
                  <Badge variant="secondary">{edu.degree}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {edu.major} | {edu.startDate} ~ {edu.endDate}
                </p>
                {edu.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {edu.description}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEducation(edu.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {showAdd ? (
        <Card className="border-primary/50">
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>学校名称</Label>
                  <Input
                    placeholder="请输入学校名称"
                    value={form.school}
                    onChange={(e) =>
                      setForm({ ...form, school: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>专业</Label>
                  <Input
                    placeholder="请输入专业"
                    value={form.major}
                    onChange={(e) =>
                      setForm({ ...form, major: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>学历</Label>
                  <Select
                    value={form.degree}
                    onValueChange={(v) => setForm({ ...form, degree: v ?? "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择学历" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEGREE_OPTIONS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>入学时间</Label>
                  <Input
                    type="month"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>毕业时间</Label>
                  <Input
                    type="month"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>描述（选填）</Label>
                <Textarea
                  placeholder="主修课程、GPA、荣誉奖项等..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAdd(false)}>
                  取消
                </Button>
                <Button onClick={handleAdd}>添加</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加教育经历
        </Button>
      )}
    </div>
  );
}

/** 工作经历表单 */
function WorkExperienceForm() {
  const {
    workExperienceList,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
  } = useResumeStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: "",
    techStack: "",
  });

  const handleAdd = () => {
    addWorkExperience({
      ...form,
      techStack: form.techStack
        .split(/[,，、]/)
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setForm({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
      techStack: "",
    });
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {workExperienceList.map((work) => (
        <Card key={work.id}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{work.company}</span>
                  <Badge variant="outline">{work.position}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {work.startDate} ~ {work.endDate}
                </p>
                {work.description && (
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                    {work.description}
                  </p>
                )}
                {work.techStack.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {work.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeWorkExperience(work.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {showAdd ? (
        <Card className="border-primary/50">
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>公司名称</Label>
                  <Input
                    placeholder="请输入公司名称"
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>职位</Label>
                  <Input
                    placeholder="请输入职位"
                    value={form.position}
                    onChange={(e) =>
                      setForm({ ...form, position: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>入职时间</Label>
                  <Input
                    type="month"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>离职时间</Label>
                  <Input
                    type="month"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>工作描述</Label>
                <Textarea
                  placeholder="描述你的工作职责和成果，建议使用 STAR 法则..."
                  className="min-h-[100px]"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>技术栈（用逗号分隔）</Label>
                <Input
                  placeholder="React, TypeScript, Node.js, MySQL"
                  value={form.techStack}
                  onChange={(e) =>
                    setForm({ ...form, techStack: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAdd(false)}>
                  取消
                </Button>
                <Button onClick={handleAdd}>添加</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加工作经历
        </Button>
      )}
    </div>
  );
}

/** 项目经历表单 */
function ProjectExperienceForm() {
  const {
    projectExperienceList,
    addProjectExperience,
    removeProjectExperience,
  } = useResumeStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "",
    description: "",
    techStack: "",
    achievements: "",
  });

  const handleAdd = () => {
    addProjectExperience({
      ...form,
      techStack: form.techStack
        .split(/[,，、]/)
        .map((s) => s.trim())
        .filter(Boolean),
      achievements: form.achievements
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setForm({
      name: "",
      role: "",
      description: "",
      techStack: "",
      achievements: "",
    });
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {projectExperienceList.map((proj) => (
        <Card key={proj.id}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{proj.name}</span>
                  <Badge variant="outline">{proj.role}</Badge>
                </div>
                {proj.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {proj.description}
                  </p>
                )}
                {proj.techStack.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {proj.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
                {proj.achievements.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                    {proj.achievements.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeProjectExperience(proj.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {showAdd ? (
        <Card className="border-primary/50">
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>项目名称</Label>
                  <Input
                    placeholder="请输入项目名称"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>你的角色</Label>
                  <Input
                    placeholder="如：全栈开发、前端负责人"
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>项目描述</Label>
                <Textarea
                  placeholder="简要描述项目背景和你的职责..."
                  className="min-h-[80px]"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>技术栈（用逗号分隔）</Label>
                <Input
                  placeholder="Vue3, Python, PostgreSQL, Docker"
                  value={form.techStack}
                  onChange={(e) =>
                    setForm({ ...form, techStack: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>项目成果（每行一条）</Label>
                <Textarea
                  placeholder={"系统性能提升40%\n日活用户达到10万+\n获得公司优秀项目奖"}
                  className="min-h-[80px]"
                  value={form.achievements}
                  onChange={(e) =>
                    setForm({ ...form, achievements: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAdd(false)}>
                  取消
                </Button>
                <Button onClick={handleAdd}>添加</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加项目经历
        </Button>
      )}
    </div>
  );
}

/** 技能列表表单 */
function SkillsForm() {
  const { skillCategories, addSkillCategory, updateSkillCategory, removeSkillCategory } =
    useResumeStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: "", skills: "" });

  const handleAdd = () => {
    addSkillCategory({
      category: form.category,
      skills: form.skills
        .split(/[,，、]/)
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setForm({ category: "", skills: "" });
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {skillCategories.map((cat) => (
        <Card key={cat.id}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="font-semibold">{cat.category}</span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {cat.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSkillCategory(cat.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {showAdd ? (
        <Card className="border-primary/50">
          <CardContent className="pt-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>技能分类</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v ?? "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择或输入分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_CATEGORY_PRESETS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>技能（用逗号分隔）</Label>
                <Input
                  placeholder="TypeScript, React, Node.js, Go"
                  value={form.skills}
                  onChange={(e) =>
                    setForm({ ...form, skills: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAdd(false)}>
                  取消
                </Button>
                <Button onClick={handleAdd}>添加</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加技能分类
        </Button>
      )}
    </div>
  );
}

// ==================== 标签输入组件 ====================

function TagInput({
  label,
  value,
  onChange,
  presets,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  presets?: string[];
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState("");
  const [showPresets, setShowPresets] = useState(false);

  const handleAdd = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue("");
  };

  const handleRemove = (item: string) => {
    onChange(value.filter((v) => v !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAdd(inputValue);
      }
    }
  };

  const filteredPresets = presets?.filter((p) =>
    p.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(p)
  );

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="relative">
        <div className="flex flex-wrap gap-2 rounded-md border bg-background p-2 focus-within:ring-2 focus-within:ring-primary/30">
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="flex items-center gap-1">
              {item}
              <button
                onClick={() => handleRemove(item)}
                className="ml-1 rounded-full hover:bg-background"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            type="text"
            className="flex-1 min-w-[100px] outline-none bg-transparent text-sm"
            placeholder={placeholder || "输入后按回车添加"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => presets && setShowPresets(true)}
            onBlur={() => setTimeout(() => setShowPresets(false), 200)}
          />
        </div>
        {showPresets && filteredPresets && filteredPresets.length > 0 && (
          <div className="absolute z-10 mt-1 w-full max-h-[200px] overflow-auto rounded-md border bg-popover p-1 shadow-md">
            {filteredPresets.slice(0, 10).map((preset) => (
              <button
                key={preset}
                type="button"
                className="w-full rounded-sm px-3 py-1.5 text-left text-sm hover:bg-accent"
                onClick={() => handleAdd(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== 就业意向表单 ====================

function JobIntentForm() {
  const { jobIntent, updateJobIntent } = useResumeStore();

  return (
    <div className="flex flex-col gap-6">
      {/* 意向职位 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5 text-primary" />
            意向职位
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TagInput
            label="选择或输入你想要申请的职位"
            value={jobIntent.desiredPositions}
            onChange={(v) => updateJobIntent({ desiredPositions: v })}
            presets={POSITION_PRESETS}
            placeholder="输入职位后按回车添加"
          />
        </CardContent>
      </Card>

      {/* 意向地点 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5 text-primary" />
            工作地点
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TagInput
            label="选择或输入你期望的工作地点（可多选）"
            value={jobIntent.desiredLocations}
            onChange={(v) => updateJobIntent({ desiredLocations: v })}
            presets={LOCATION_PRESETS}
            placeholder="输入地点后按回车添加"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            提示：选择「远程」或「全国」表示不限制地点
          </p>
        </CardContent>
      </Card>

      {/* 薪资与类型 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-primary" />
            薪资与工作类型
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>期望薪资范围（月薪）</Label>
              <Select
                value={jobIntent.salaryRange}
                onValueChange={(v) => updateJobIntent({ salaryRange: v ?? "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择薪资范围" />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_RANGE_PRESETS.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>到岗时间</Label>
              <Select
                value={jobIntent.availability}
                onValueChange={(v) => updateJobIntent({ availability: v ?? "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择到岗时间" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_PRESETS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Label>工作类型（可多选）</Label>
            <div className="flex flex-wrap gap-2">
              {EMPLOYMENT_TYPE_PRESETS.map((type) => {
                const isSelected = jobIntent.employmentType.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        updateJobIntent({
                          employmentType: jobIntent.employmentType.filter((t) => t !== type),
                        });
                      } else {
                        updateJobIntent({
                          employmentType: [...jobIntent.employmentType, type],
                        });
                      }
                    }}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {isSelected && <Check className="h-3 w-3" />}
                      {type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 行业与目标技能 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-5 w-5 text-primary" />
            行业偏好与目标技能
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Label>意向行业（可多选）</Label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_PRESETS.map((industry) => {
                const isSelected = jobIntent.industries.includes(industry);
                return (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        updateJobIntent({
                          industries: jobIntent.industries.filter((i) => i !== industry),
                        });
                      } else {
                        updateJobIntent({
                          industries: [...jobIntent.industries, industry],
                        });
                      }
                    }}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {isSelected && <Check className="h-3 w-3" />}
                      {industry}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <TagInput
              label="目标技能/需要提升的技能（选填）"
              value={jobIntent.keySkills}
              onChange={(v) => updateJobIntent({ keySkills: v })}
              placeholder="输入技能后按回车添加"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              填写你希望在新工作中使用的技能，或需要提升的技能
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 职业目标 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-5 w-5 text-primary" />
            职业目标
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Label>简述你的职业目标和期望</Label>
            <Textarea
              placeholder="例如：希望在未来1-2年成长为高级前端工程师，参与大型互联网项目，提升技术架构能力..."
              className="min-h-[100px]"
              value={jobIntent.careerGoals}
              onChange={(e) => updateJobIntent({ careerGoals: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              这将帮助系统更精准地为你推荐匹配的岗位
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== 匹配结果展示组件 ====================

function MatchResultCard({
  result,
  onViewDetails,
}: {
  result: JobMatchResult;
  onViewDetails?: () => void;
}) {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (percentage >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getMatchBgColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getMatchLabel = (percentage: number) => {
    if (percentage >= 80) return "高度匹配";
    if (percentage >= 60) return "一般匹配";
    if (percentage >= 40) return "部分匹配";
    return "匹配度低";
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{result.companyName}</span>
              <Badge
                variant="outline"
                className={cn("text-xs", getMatchColor(result.overallPercentage))}
              >
                {getMatchLabel(result.overallPercentage)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground truncate">{result.position}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className={cn("text-2xl font-bold", getMatchColor(result.overallPercentage))}>
              {result.overallPercentage}%
            </div>
            <Progress
              value={result.overallPercentage}
              className={cn("mt-1 h-1.5 w-16", getMatchBgColor(result.overallPercentage))}
            />
          </div>
        </div>

        {/* 优势和差距 */}
        {result.strengths.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              <span className="font-medium">优势</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {result.strengths.join("；")}
            </p>
          </div>
        )}

        {result.gaps.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-medium">差距</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {result.gaps.join("；")}
            </p>
          </div>
        )}

        {onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full text-xs"
            onClick={onViewDetails}
          >
            查看详情 <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function MatchDetailDialog({
  result,
  open,
  onOpenChange,
}: {
  result: JobMatchResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!result) return null;

  const getDetailColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) return "text-green-600 dark:text-green-400";
    if (percentage >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold">{result.companyName}</span>
              <span className="ml-2 text-sm text-muted-foreground">— {result.position}</span>
            </div>
            <Badge variant="outline" className="text-base px-3">
              匹配度: {result.overallPercentage}%
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* 各维度匹配详情 */}
        <div className="flex flex-col gap-4">
          {result.details.map((detail) => {
            const percentage = (detail.score / detail.maxScore) * 100;
            return (
              <Card key={detail.category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{detail.category}</span>
                    <span className={getDetailColor(detail.score, detail.maxScore)}>
                      {detail.score}/{detail.maxScore} ({Math.round(percentage)}%)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={percentage} className="h-2 mb-3" />
                  <p className="text-xs text-muted-foreground mb-2">{detail.explanation}</p>

                  {detail.matchedItems.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <Check className="h-3 w-3" />
                        <span className="font-medium">匹配项</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {detail.matchedItems.slice(0, 10).map((item) => (
                          <Badge key={item} variant="secondary" className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                            {item}
                          </Badge>
                        ))}
                        {detail.matchedItems.length > 10 && (
                          <Badge variant="outline" className="text-xs">
                            +{detail.matchedItems.length - 10} 更多
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {detail.missingItems.length > 0 && (
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                        <AlertCircle className="h-3 w-3" />
                        <span className="font-medium">未匹配/缺失项</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {detail.missingItems.slice(0, 10).map((item) => (
                          <Badge key={item} variant="outline" className="text-xs border-yellow-300 text-yellow-600 dark:border-yellow-800 dark:text-yellow-400">
                            {item}
                          </Badge>
                        ))}
                        {detail.missingItems.length > 10 && (
                          <Badge variant="outline" className="text-xs">
                            +{detail.missingItems.length - 10} 更多
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 建议 */}
        {result.suggestions.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                改进建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{s}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline">关闭</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 匹配结果面板 */
function MatchResultsPanel() {
  const { matchWithJobs, matchResults } = useResumeStore();
  const { jobList } = useJobStore();
  const [isMatching, setIsMatching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<JobMatchResult | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleMatch = useCallback(() => {
    if (jobList.length === 0) return;
    setIsMatching(true);
    setTimeout(() => {
      matchWithJobs(jobList);
      setIsMatching(false);
    }, 500);
  }, [jobList, matchWithJobs]);

  const getMatchLabel = (percentage: number) => {
    if (percentage >= 80) return "高度匹配";
    if (percentage >= 60) return "一般匹配";
    if (percentage >= 40) return "部分匹配";
    return "匹配度低";
  };

  const handleViewDetails = (result: JobMatchResult) => {
    setSelectedResult(result);
    setDetailOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">岗位匹配分析</h3>
        <Button
          size="sm"
          onClick={handleMatch}
          disabled={jobList.length === 0 || isMatching}
        >
          <Zap className="mr-2 h-4 w-4" />
          {isMatching ? "分析中..." : "开始匹配"}
        </Button>
      </div>

      {jobList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Briefcase className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">暂无求职岗位数据</p>
            <p className="mt-1 text-xs text-muted-foreground">
              请先在「求职管理」页面添加岗位信息
            </p>
          </CardContent>
        </Card>
      ) : matchResults.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Zap className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">点击「开始匹配」分析你的简历与岗位的匹配程度</p>
            <p className="mt-1 text-xs text-muted-foreground">
              共有 {jobList.length} 个岗位待分析
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 匹配统计 */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">{matchResults.length}</span>
                  <span className="text-xs text-muted-foreground">分析岗位</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {matchResults.filter((r) => r.overallPercentage >= 80).length}
                  </span>
                  <span className="text-xs text-muted-foreground">高度匹配</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {matchResults.filter((r) => r.overallPercentage >= 60 && r.overallPercentage < 80).length}
                  </span>
                  <span className="text-xs text-muted-foreground">一般匹配</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {matchResults.filter((r) => r.overallPercentage < 60).length}
                  </span>
                  <span className="text-xs text-muted-foreground">需优化</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 匹配结果列表 */}
          <div className="flex flex-col gap-3">
            {matchResults.map((result) => (
              <MatchResultCard
                key={result.jobId}
                result={result}
                onViewDetails={() => handleViewDetails(result)}
              />
            ))}
          </div>
        </>
      )}

      {/* 详情弹窗 */}
      <MatchDetailDialog
        result={selectedResult}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}

// ==================== 简历预览模板 ====================

/** 经典模板 */
function ClassicPreview() {
  const { personalInfo, educationList, workExperienceList, projectExperienceList, skillCategories } =
    useResumeStore();

  return (
    <div className="bg-card text-card-foreground p-6 text-sm leading-relaxed">
      {/* 头部 */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold">{personalInfo.name || "你的姓名"}</h1>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.github && <span>{personalInfo.github}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
        </div>
        {personalInfo.summary && (
          <p className="mt-2 text-xs text-muted-foreground">{personalInfo.summary}</p>
        )}
      </div>

      <Separator className="mb-4" />

      {/* 教育经历 */}
      {educationList.length > 0 && (
        <div className="mb-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">
            教育经历
          </h2>
          {educationList.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{edu.school}</span>
                <span className="text-xs text-muted-foreground">
                  {edu.startDate} ~ {edu.endDate}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {edu.degree} - {edu.major}
              </div>
              {edu.description && (
                <p className="mt-1 text-xs text-muted-foreground">{edu.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 工作经历 */}
      {workExperienceList.length > 0 && (
        <div className="mb-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">
            工作经历
          </h2>
          {workExperienceList.map((work) => (
            <div key={work.id} className="mb-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{work.company}</span>
                <span className="text-xs text-muted-foreground">
                  {work.startDate} ~ {work.endDate}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">{work.position}</div>
              {work.description && (
                <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">
                  {work.description}
                </p>
              )}
              {work.techStack.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {work.techStack.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px] px-1 py-0">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 项目经历 */}
      {projectExperienceList.length > 0 && (
        <div className="mb-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">
            项目经历
          </h2>
          {projectExperienceList.map((proj) => (
            <div key={proj.id} className="mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{proj.name}</span>
                <span className="text-xs text-muted-foreground">| {proj.role}</span>
              </div>
              {proj.description && (
                <p className="mt-1 text-xs text-muted-foreground">{proj.description}</p>
              )}
              {proj.achievements.length > 0 && (
                <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                  {proj.achievements.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
              {proj.techStack.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {proj.techStack.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px] px-1 py-0">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 技能 */}
      {skillCategories.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">
            技能
          </h2>
          {skillCategories.map((cat) => (
            <div key={cat.id} className="mb-1">
              <span className="font-semibold text-xs">{cat.category}：</span>
              <span className="text-xs text-muted-foreground">
                {cat.skills.join("、")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** 现代模板 - 双栏布局 */
function ModernPreview() {
  const { personalInfo, educationList, workExperienceList, projectExperienceList, skillCategories } =
    useResumeStore();

  return (
    <div className="bg-card text-card-foreground text-sm leading-relaxed">
      {/* 左侧栏 */}
      <div className="bg-primary text-primary-foreground p-6">
        <h1 className="text-xl font-bold">{personalInfo.name || "你的姓名"}</h1>
        {personalInfo.summary && (
          <p className="mt-2 text-xs opacity-80">{personalInfo.summary}</p>
        )}

        <div className="mt-4 flex flex-col gap-2 text-xs opacity-80">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.github && <span>{personalInfo.github}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
        </div>

        {skillCategories.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider opacity-70">
              技能
            </h2>
            {skillCategories.map((cat) => (
              <div key={cat.id} className="mb-2">
                <span className="text-xs font-semibold">{cat.category}</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {cat.skills.map((s) => (
                    <Badge
                      key={s}
                      variant="secondary"
                      className="border-primary-foreground/30 bg-primary-foreground/10 text-[10px]"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 右侧内容 */}
      <div className="p-6">
        {educationList.length > 0 && (
          <div className="mb-4">
            <h2 className="mb-2 border-b border-border pb-1 text-xs font-bold uppercase tracking-wide text-primary">
              教育经历
            </h2>
            {educationList.map((edu) => (
              <div key={edu.id} className="mb-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">{edu.school}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {edu.startDate} ~ {edu.endDate}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {edu.degree} - {edu.major}
                </div>
              </div>
            ))}
          </div>
        )}

        {workExperienceList.length > 0 && (
          <div className="mb-4">
            <h2 className="mb-2 border-b border-border pb-1 text-xs font-bold uppercase tracking-wide text-primary">
              工作经历
            </h2>
            {workExperienceList.map((work) => (
              <div key={work.id} className="mb-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">{work.company}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {work.startDate} ~ {work.endDate}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{work.position}</div>
                {work.description && (
                  <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">
                    {work.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {projectExperienceList.length > 0 && (
          <div>
            <h2 className="mb-2 border-b border-border pb-1 text-xs font-bold uppercase tracking-wide text-primary">
              项目经历
            </h2>
            {projectExperienceList.map((proj) => (
              <div key={proj.id} className="mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs">{proj.name}</span>
                  <span className="text-[10px] text-muted-foreground">| {proj.role}</span>
                </div>
                {proj.achievements.length > 0 && (
                  <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                    {proj.achievements.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** 极简模板 */
function MinimalPreview() {
  const { personalInfo, educationList, workExperienceList, projectExperienceList, skillCategories } =
    useResumeStore();

  return (
    <div className="bg-card text-card-foreground p-8 text-sm leading-relaxed">
      <div className="mb-6">
        <h1 className="text-3xl font-light tracking-wide">
          {personalInfo.name || "你的姓名"}
        </h1>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.github && <span>{personalInfo.github}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
        </div>
      </div>

      {personalInfo.summary && (
        <div className="mb-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {educationList.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-light uppercase tracking-[0.2em] text-muted-foreground">
            教育
          </h2>
          {educationList.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex items-baseline justify-between">
                <span className="font-light">{edu.school}</span>
                <span className="text-[10px] text-muted-foreground">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {edu.degree}，{edu.major}
              </p>
            </div>
          ))}
        </div>
      )}

      {workExperienceList.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-light uppercase tracking-[0.2em] text-muted-foreground">
            工作经历
          </h2>
          {workExperienceList.map((work) => (
            <div key={work.id} className="mb-3">
              <div className="flex items-baseline justify-between">
                <span className="font-light">{work.company}</span>
                <span className="text-[10px] text-muted-foreground">
                  {work.startDate} - {work.endDate}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{work.position}</p>
              {work.description && (
                <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">
                  {work.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {projectExperienceList.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-light uppercase tracking-[0.2em] text-muted-foreground">
            项目
          </h2>
          {projectExperienceList.map((proj) => (
            <div key={proj.id} className="mb-3">
              <span className="font-light">{proj.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">{proj.role}</span>
              {proj.achievements.length > 0 && (
                <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                  {proj.achievements.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {skillCategories.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-light uppercase tracking-[0.2em] text-muted-foreground">
            技能
          </h2>
          <div className="flex flex-wrap gap-2">
            {skillCategories.flatMap((cat) =>
              cat.skills.map((s) => (
                <span key={`${cat.id}-${s}`} className="text-xs text-muted-foreground">
                  {s}
                </span>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** 简历预览组件 */
function ResumePreview() {
  const { selectedTemplate } = useResumeStore();

  return (
    <div className="mx-auto w-full max-w-[210mm] overflow-hidden rounded-lg border shadow-sm">
      {selectedTemplate === "classic" && <ClassicPreview />}
      {selectedTemplate === "modern" && (
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
          <ModernPreview />
        </div>
      )}
      {selectedTemplate === "minimal" && <MinimalPreview />}
    </div>
  );
}

/** AI 优化建议面板 */
function AISuggestionsPanel() {
  const { resumeScore, calculateScore } = useResumeStore();
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleAnalyze = useCallback(() => {
    calculateScore();
    setHasCalculated(true);
  }, [calculateScore]);

  useEffect(() => {
    if (hasCalculated) {
      calculateScore();
    }
  }, [
    hasCalculated,
    calculateScore,
    // 依赖 store 中的所有数据字段来触发重新计算
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "优秀";
    if (score >= 80) return "良好";
    if (score >= 60) return "一般";
    if (score >= 40) return "需改进";
    return "待完善";
  };

  const scoreItems = [
    { label: "个人信息", score: resumeScore.personalInfo },
    { label: "教育经历", score: resumeScore.education },
    { label: "工作经历", score: resumeScore.workExperience },
    { label: "项目经历", score: resumeScore.projectExperience },
    { label: "技能列表", score: resumeScore.skills },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">AI 优化建议</h3>
        <Button size="sm" onClick={handleAnalyze}>
          <Sparkles className="mr-2 h-4 w-4" />
          分析简历
        </Button>
      </div>

      {!hasCalculated ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Sparkles className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              点击「分析简历」获取 AI 优化建议
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 总分 */}
          <Card>
            <CardContent className="flex flex-col items-center py-4">
              <div className="text-4xl font-bold">
                <span className={getScoreColor(resumeScore.overall)}>
                  {resumeScore.overall}
                </span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <Badge
                variant={resumeScore.overall >= 80 ? "default" : resumeScore.overall >= 60 ? "secondary" : "destructive"}
                className="mt-2"
              >
                {getScoreLabel(resumeScore.overall)}
              </Badge>
            </CardContent>
          </Card>

          {/* 分项评分 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">分项评分</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {scoreItems.map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>{item.label}</span>
                    <span className={getScoreColor(item.score)}>{item.score}分</span>
                  </div>
                  <Progress value={item.score} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 改进建议 */}
          {resumeScore.suggestions.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">改进建议</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {resumeScore.suggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">{suggestion}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 优秀项 */}
          {resumeScore.suggestions.length === 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-xs">
                你的简历非常完善，没有需要改进的地方！
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}

// ==================== 主页面 ====================

export default function ResumePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeView, setActiveView] = useState<"edit" | "preview">("edit");
  const { selectedTemplate, setTemplate, resetResume } = useResumeStore();

  const handleExport = () => {
    const printContent = document.getElementById("resume-preview-content");
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>简历导出</title>
          <style>
            body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* 页面头部 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">简历管理</h1>
            <p className="text-sm text-muted-foreground">
              创建、编辑和优化你的简历
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetResume}>
              <RotateCcw className="mr-2 h-4 w-4" />
              重置
            </Button>
            <Button size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
          </div>
        </div>

        {/* 视图切换 */}
        <Tabs
          value={activeView}
          onValueChange={(v) => setActiveView((v ?? "edit") as "edit" | "preview")}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="edit">
              <Wrench className="mr-2 h-4 w-4" />
              编辑简历
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="mr-2 h-4 w-4" />
              预览简历
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 编辑视图 */}
        {activeView === "edit" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* 左侧：编辑区域 */}
            <div className="flex flex-col gap-4">
              {/* 步骤导航 */}
              <div className="flex items-center gap-1 overflow-x-auto rounded-lg border bg-card p-1">
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(index)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        activeStep === index
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{step.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 步骤内容 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const Icon = STEPS[activeStep].icon;
                      return <Icon className="h-5 w-5" />;
                    })()}
                    {STEPS[activeStep].label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeStep === 0 && <PersonalInfoForm />}
                  {activeStep === 1 && <EducationForm />}
                  {activeStep === 2 && <WorkExperienceForm />}
                  {activeStep === 3 && <ProjectExperienceForm />}
                  {activeStep === 4 && <SkillsForm />}
                  {activeStep === 5 && <JobIntentForm />}
                </CardContent>
              </Card>

              {/* 步骤导航按钮 */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  上一步
                </Button>
                {activeStep === STEPS.length - 1 ? (
                  <Button
                    onClick={() => setActiveView("preview")}
                  >
                    去预览
                    <Eye className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))
                    }
                  >
                    下一步
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* 右侧：AI 建议和匹配分析面板 */}
            <div>
              <Tabs defaultValue="suggestions" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="suggestions" className="flex-1">
                    <Sparkles className="mr-2 h-4 w-4" />
                    简历优化
                  </TabsTrigger>
                  <TabsTrigger value="match" className="flex-1">
                    <Zap className="mr-2 h-4 w-4" />
                    岗位匹配
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="suggestions">
                  <AISuggestionsPanel />
                </TabsContent>
                <TabsContent value="match">
                  <MatchResultsPanel />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* 预览视图 */}
        {activeView === "preview" && (
          <div className="flex flex-col gap-6">
            {/* 模板选择 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <LayoutTemplate className="h-5 w-5" />
                  模板选择
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setTemplate(tpl.id)}
                      className={cn(
                        "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
                        selectedTemplate === tpl.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-accent"
                      )}
                    >
                      <span className="font-medium text-sm">{tpl.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {tpl.description}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 简历预览 */}
            <div id="resume-preview-content">
              <ResumePreview />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
