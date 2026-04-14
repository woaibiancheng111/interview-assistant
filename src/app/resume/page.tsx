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
} from "lucide-react";
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

// ==================== 常量 ====================

const STEPS = [
  { id: "personal", label: "个人信息", icon: User },
  { id: "education", label: "教育经历", icon: GraduationCap },
  { id: "work", label: "工作经历", icon: Briefcase },
  { id: "project", label: "项目经历", icon: FolderGit2 },
  { id: "skills", label: "技能列表", icon: Wrench },
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
                <Button
                  onClick={() =>
                    setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))
                  }
                  disabled={activeStep === STEPS.length - 1}
                >
                  下一步
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 右侧：AI 建议面板 */}
            <div>
              <AISuggestionsPanel />
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
