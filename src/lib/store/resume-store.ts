import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KeywordAnalysisResult, HighlightExtraction, ResumeOptimizationResult } from "@/lib/services/ai-service";

// ==================== 类型定义 ====================

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  github: string;
  website: string;
  summary: string;
}

export interface Education {
  id: string;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  techStack: string[];
}

export interface ProjectExperience {
  id: string;
  name: string;
  role: string;
  description: string;
  techStack: string[];
  achievements: string[];
}

export interface SkillCategory {
  id: string;
  category: string;
  skills: string[];
}

export interface ResumeScore {
  overall: number;
  personalInfo: number;
  education: number;
  workExperience: number;
  projectExperience: number;
  skills: number;
  suggestions: string[];
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
}

export interface AIAnalysisState {
  jdText: string;
  isAnalyzing: boolean;
  analysisError: string | null;
  lastAnalysisTime: number | null;
  keywordAnalysis: KeywordAnalysisResult | null;
  highlights: HighlightExtraction[] | null;
  optimizationResult: ResumeOptimizationResult | null;
}

export interface ResumeState {
  // 数据
  personalInfo: PersonalInfo;
  educationList: Education[];
  workExperienceList: WorkExperience[];
  projectExperienceList: ProjectExperience[];
  skillCategories: SkillCategory[];
  resumeScore: ResumeScore;
  selectedTemplate: string;
  aiAnalysis: AIAnalysisState;

  // 个人信息操作
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;

  // 教育经历操作
  addEducation: (education: Omit<Education, "id">) => void;
  updateEducation: (id: string, education: Partial<Education>) => void;
  removeEducation: (id: string) => void;

  // 工作经历操作
  addWorkExperience: (work: Omit<WorkExperience, "id">) => void;
  updateWorkExperience: (id: string, work: Partial<WorkExperience>) => void;
  removeWorkExperience: (id: string) => void;

  // 项目经历操作
  addProjectExperience: (project: Omit<ProjectExperience, "id">) => void;
  updateProjectExperience: (id: string, project: Partial<ProjectExperience>) => void;
  removeProjectExperience: (id: string) => void;

  // 技能操作
  addSkillCategory: (category: Omit<SkillCategory, "id">) => void;
  updateSkillCategory: (id: string, category: Partial<SkillCategory>) => void;
  removeSkillCategory: (id: string) => void;

  // 评分
  calculateScore: () => void;

  // 模板
  setTemplate: (templateId: string) => void;

  // AI 分析
  updateJDText: (text: string) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  setKeywordAnalysis: (result: KeywordAnalysisResult | null) => void;
  setHighlights: (highlights: HighlightExtraction[] | null) => void;
  setOptimizationResult: (result: ResumeOptimizationResult | null) => void;
  clearAIAnalysis: () => void;

  // 重置
  resetResume: () => void;
}

// ==================== 默认数据 ====================

const defaultPersonalInfo: PersonalInfo = {
  name: "",
  email: "",
  phone: "",
  github: "",
  website: "",
  summary: "",
};

const defaultScore: ResumeScore = {
  overall: 0,
  personalInfo: 0,
  education: 0,
  workExperience: 0,
  projectExperience: 0,
  skills: 0,
  suggestions: [],
};

const defaultAIAnalysis: AIAnalysisState = {
  jdText: "",
  isAnalyzing: false,
  analysisError: null,
  lastAnalysisTime: null,
  keywordAnalysis: null,
  highlights: null,
  optimizationResult: null,
};

const generateId = () => Math.random().toString(36).substring(2, 11);

// ==================== 评分逻辑 ====================

function calculateResumeScore(state: ResumeState): ResumeScore {
  const suggestions: string[] = [];
  let totalScore = 0;
  let maxScore = 0;

  // 个人信息评分（满分20）
  let personalScore = 0;
  const personalMax = 20;
  maxScore += personalMax;
  const { personalInfo } = state;
  if (personalInfo.name.trim()) personalScore += 4;
  else suggestions.push("请填写姓名，这是简历的基本信息");
  if (personalInfo.email.trim()) personalScore += 4;
  else suggestions.push("请填写邮箱，方便HR联系你");
  if (personalInfo.phone.trim()) personalScore += 4;
  else suggestions.push("请填写电话号码");
  if (personalInfo.github.trim() || personalInfo.website.trim()) personalScore += 4;
  else suggestions.push("建议添加 GitHub 或个人网站链接，展示技术实力");
  if (personalInfo.summary.trim() && personalInfo.summary.length >= 20) personalScore += 4;
  else suggestions.push("建议添加个人简介（至少20字），突出你的核心优势");
  totalScore += personalScore;

  // 教育经历评分（满分15）
  let educationScore = 0;
  const educationMax = 15;
  maxScore += educationMax;
  if (state.educationList.length > 0) {
    educationScore += 5;
    const hasComplete = state.educationList.every(
      (e) => e.school && e.major && e.degree && e.startDate && e.endDate
    );
    if (hasComplete) educationScore += 5;
    else suggestions.push("请完善教育经历信息，确保学校、专业、学历和时间都填写完整");
    if (state.educationList.some((e) => e.description.trim())) educationScore += 5;
    else suggestions.push("建议在教育经历中添加描述，如主修课程、GPA、荣誉等");
  } else {
    suggestions.push("请添加教育经历");
  }
  totalScore += educationScore;

  // 工作经历评分（满分25）
  let workScore = 0;
  const workMax = 25;
  maxScore += workMax;
  if (state.workExperienceList.length > 0) {
    workScore += 5;
    const hasComplete = state.workExperienceList.every(
      (w) => w.company && w.position && w.startDate && w.endDate
    );
    if (hasComplete) workScore += 5;
    else suggestions.push("请完善工作经历信息，确保公司、职位和时间都填写完整");
    const hasDesc = state.workExperienceList.every(
      (w) => w.description.trim() && w.description.length >= 30
    );
    if (hasDesc) workScore += 8;
    else suggestions.push("工作经历描述建议至少30字，使用 STAR 法则描述你的贡献");
    const hasTech = state.workExperienceList.some((w) => w.techStack.length > 0);
    if (hasTech) workScore += 7;
    else suggestions.push("建议在工作经历中标注使用的技术栈");
  } else {
    suggestions.push("请添加工作经历，即使没有正式工作经验也可以写实习经历");
  }
  totalScore += workScore;

  // 项目经历评分（满分25）
  let projectScore = 0;
  const projectMax = 25;
  maxScore += projectMax;
  if (state.projectExperienceList.length > 0) {
    projectScore += 5;
    const hasComplete = state.projectExperienceList.every(
      (p) => p.name && p.role && p.description
    );
    if (hasComplete) projectScore += 5;
    else suggestions.push("请完善项目经历信息，确保项目名、角色和描述都填写完整");
    const hasTech = state.projectExperienceList.some((p) => p.techStack.length > 0);
    if (hasTech) projectScore += 5;
    else suggestions.push("建议在项目经历中标注使用的技术栈");
    const hasAchievement = state.projectExperienceList.some((p) => p.achievements.length > 0);
    if (hasAchievement) projectScore += 10;
    else suggestions.push("强烈建议添加项目成果，用数据量化你的贡献（如：性能提升30%）");
  } else {
    suggestions.push("请添加项目经历，这是展示技术能力的最佳方式");
  }
  totalScore += projectScore;

  // 技能评分（满分15）
  let skillScore = 0;
  const skillMax = 15;
  maxScore += skillMax;
  if (state.skillCategories.length > 0) {
    skillScore += 3;
    const totalSkills = state.skillCategories.reduce((sum, c) => sum + c.skills.length, 0);
    if (totalSkills >= 5) skillScore += 5;
    else suggestions.push("建议添加更多技能，至少列出5项核心技能");
    if (totalSkills >= 10) skillScore += 4;
    const categories = state.skillCategories.map((c) => c.category);
    if (categories.length >= 2) skillScore += 3;
    else suggestions.push("建议对技能进行分类，如编程语言、框架、工具等");
  } else {
    suggestions.push("请添加技能列表，这是HR筛选简历的重要依据");
  }
  totalScore += skillScore;

  const overall = Math.round((totalScore / maxScore) * 100);

  return {
    overall,
    personalInfo: Math.round((personalScore / personalMax) * 100),
    education: Math.round((educationScore / educationMax) * 100),
    workExperience: Math.round((workScore / workMax) * 100),
    projectExperience: Math.round((projectScore / projectMax) * 100),
    skills: Math.round((skillScore / skillMax) * 100),
    suggestions,
  };
}

// ==================== Store ====================

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      personalInfo: defaultPersonalInfo,
      educationList: [],
      workExperienceList: [],
      projectExperienceList: [],
      skillCategories: [],
      resumeScore: defaultScore,
      selectedTemplate: "classic",
      aiAnalysis: { ...defaultAIAnalysis },

      // 个人信息
      updatePersonalInfo: (info) =>
        set((state) => ({
          personalInfo: { ...state.personalInfo, ...info },
        })),

      // 教育经历
      addEducation: (education) =>
        set((state) => ({
          educationList: [...state.educationList, { ...education, id: generateId() }],
        })),
      updateEducation: (id, education) =>
        set((state) => ({
          educationList: state.educationList.map((e) =>
            e.id === id ? { ...e, ...education } : e
          ),
        })),
      removeEducation: (id) =>
        set((state) => ({
          educationList: state.educationList.filter((e) => e.id !== id),
        })),

      // 工作经历
      addWorkExperience: (work) =>
        set((state) => ({
          workExperienceList: [...state.workExperienceList, { ...work, id: generateId() }],
        })),
      updateWorkExperience: (id, work) =>
        set((state) => ({
          workExperienceList: state.workExperienceList.map((w) =>
            w.id === id ? { ...w, ...work } : w
          ),
        })),
      removeWorkExperience: (id) =>
        set((state) => ({
          workExperienceList: state.workExperienceList.filter((w) => w.id !== id),
        })),

      // 项目经历
      addProjectExperience: (project) =>
        set((state) => ({
          projectExperienceList: [
            ...state.projectExperienceList,
            { ...project, id: generateId() },
          ],
        })),
      updateProjectExperience: (id, project) =>
        set((state) => ({
          projectExperienceList: state.projectExperienceList.map((p) =>
            p.id === id ? { ...p, ...project } : p
          ),
        })),
      removeProjectExperience: (id) =>
        set((state) => ({
          projectExperienceList: state.projectExperienceList.filter((p) => p.id !== id),
        })),

      // 技能
      addSkillCategory: (category) =>
        set((state) => ({
          skillCategories: [...state.skillCategories, { ...category, id: generateId() }],
        })),
      updateSkillCategory: (id, category) =>
        set((state) => ({
          skillCategories: state.skillCategories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          ),
        })),
      removeSkillCategory: (id) =>
        set((state) => ({
          skillCategories: state.skillCategories.filter((c) => c.id !== id),
        })),

      // 评分
      calculateScore: () => {
        const score = calculateResumeScore(get());
        set({ resumeScore: score });
      },

      // 模板
      setTemplate: (templateId) => set({ selectedTemplate: templateId }),

      // AI 分析
      updateJDText: (text) =>
        set((state) => ({
          aiAnalysis: { ...state.aiAnalysis, jdText: text },
        })),

      setIsAnalyzing: (isAnalyzing) =>
        set((state) => ({
          aiAnalysis: { ...state.aiAnalysis, isAnalyzing },
        })),

      setAnalysisError: (error) =>
        set((state) => ({
          aiAnalysis: { ...state.aiAnalysis, analysisError: error },
        })),

      setKeywordAnalysis: (result) =>
        set((state) => ({
          aiAnalysis: {
            ...state.aiAnalysis,
            keywordAnalysis: result,
            lastAnalysisTime: Date.now(),
          },
        })),

      setHighlights: (highlights) =>
        set((state) => ({
          aiAnalysis: {
            ...state.aiAnalysis,
            highlights,
            lastAnalysisTime: Date.now(),
          },
        })),

      setOptimizationResult: (result) =>
        set((state) => ({
          aiAnalysis: {
            ...state.aiAnalysis,
            optimizationResult: result,
            lastAnalysisTime: Date.now(),
          },
        })),

      clearAIAnalysis: () =>
        set((state) => ({
          aiAnalysis: { ...defaultAIAnalysis, jdText: state.aiAnalysis.jdText },
        })),

      // 重置
      resetResume: () =>
        set({
          personalInfo: defaultPersonalInfo,
          educationList: [],
          workExperienceList: [],
          projectExperienceList: [],
          skillCategories: [],
          resumeScore: defaultScore,
          selectedTemplate: "classic",
          aiAnalysis: { ...defaultAIAnalysis },
        }),
    }),
    {
      name: "resume-storage",
    }
  )
);
