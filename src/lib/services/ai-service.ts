import type { ResumeState } from "@/lib/store/resume-store";

export interface KeywordMatch {
  keyword: string;
  matched: boolean;
  category: string;
}

export interface KeywordAnalysisResult {
  overallMatchScore: number;
  matchedKeywords: KeywordMatch[];
  missingKeywords: KeywordMatch[];
  categories: {
    name: string;
    matchCount: number;
    totalCount: number;
    score: number;
  }[];
}

export interface HighlightExtraction {
  category: string;
  content: string;
  suggestion: string;
}

export interface ResumeOptimizationResult {
  keywordAnalysis: KeywordAnalysisResult;
  highlights: HighlightExtraction[];
  optimizationSuggestions: string[];
  rewrittenSections: {
    section: string;
    original: string;
    optimized: string;
  }[];
}

export type ResumeSnapshot = Pick<
  ResumeState,
  "personalInfo" | "educationList" | "workExperienceList" | "projectExperienceList" | "skillCategories"
>;

function buildResumeContext(state: ResumeSnapshot): string {
  const { personalInfo, educationList, workExperienceList, projectExperienceList, skillCategories } = state;

  let context = `
【个人信息】
姓名：${personalInfo.name || "未填写"}
邮箱：${personalInfo.email || "未填写"}
电话：${personalInfo.phone || "未填写"}
GitHub：${personalInfo.github || "未填写"}
个人网站：${personalInfo.website || "未填写"}
个人简介：${personalInfo.summary || "未填写"}
`;

  if (educationList.length > 0) {
    context += `\n【教育经历】\n`;
    educationList.forEach((edu, i) => {
      context += `
第${i + 1}段教育：
  学校：${edu.school}
  专业：${edu.major}
  学历：${edu.degree}
  时间：${edu.startDate} ~ ${edu.endDate}
  描述：${edu.description || "无"}
`;
    });
  }

  if (workExperienceList.length > 0) {
    context += `\n【工作经历】\n`;
    workExperienceList.forEach((work, i) => {
      context += `
第${i + 1}段工作：
  公司：${work.company}
  职位：${work.position}
  时间：${work.startDate} ~ ${work.endDate}
  描述：${work.description || "无"}
  技术栈：${work.techStack.join(", ") || "无"}
`;
    });
  }

  if (projectExperienceList.length > 0) {
    context += `\n【项目经历】\n`;
    projectExperienceList.forEach((proj, i) => {
      context += `
第${i + 1}个项目：
  项目名：${proj.name}
  角色：${proj.role}
  描述：${proj.description || "无"}
  技术栈：${proj.techStack.join(", ") || "无"}
  成果：${proj.achievements.join("\n    - ") || "无"}
`;
    });
  }

  if (skillCategories.length > 0) {
    context += `\n【技能列表】\n`;
    skillCategories.forEach((cat) => {
      context += `  ${cat.category}：${cat.skills.join(", ")}\n`;
    });
  }

  return context;
}

function getDashscopeApiKey(): string {
  const apiKey = process.env.BAILIAN_API_KEY || process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("AI 服务未配置，请联系管理员");
  }
  return apiKey;
}

async function callDashscopeAPI(
  model: string,
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const apiKey = getDashscopeApiKey();

  const response = await fetch(
    "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `API 调用失败: ${response.status} ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI 响应为空，请重试");
  }

  return content;
}

export async function analyzeKeywordMatch(
  model: string,
  jdText: string,
  resumeState: ResumeSnapshot
): Promise<KeywordAnalysisResult> {
  const resumeContext = buildResumeContext(resumeState);

  const prompt = `
你是一位专业的简历分析师。请分析以下简历与职位描述（JD）的关键词匹配度。

【职位描述（JD）】
${jdText}

【简历内容】
${resumeContext}

请以 JSON 格式返回分析结果，格式如下：
{
  "overallMatchScore": 85,
  "categories": [
    {
      "name": "技术技能",
      "matchCount": 8,
      "totalCount": 10,
      "score": 80
    },
    {
      "name": "项目经验",
      "matchCount": 3,
      "totalCount": 4,
      "score": 75
    },
    {
      "name": "软技能",
      "matchCount": 2,
      "totalCount": 3,
      "score": 67
    }
  ],
  "matchedKeywords": [
    { "keyword": "React", "matched": true, "category": "技术技能" },
    { "keyword": "TypeScript", "matched": true, "category": "技术技能" }
  ],
  "missingKeywords": [
    { "keyword": "微服务", "matched": false, "category": "技术技能" },
    { "keyword": "Kubernetes", "matched": false, "category": "技术技能" }
  ]
}

要求：
1. overallMatchScore 是 0-100 的整数，表示整体匹配度
2. 从 JD 中提取关键词，分为：技术技能、项目经验、软技能、教育背景、其他
3. matchedKeywords 是简历中匹配到的关键词
4. missingKeywords 是 JD 中要求但简历中缺失的关键词
5. 每个类别计算匹配分数（匹配数/总数*100）

只返回 JSON，不要有其他解释。`;

  const output = await callDashscopeAPI(model, prompt, {
    temperature: 0.1,
    maxTokens: 2000,
  });

  let result: KeywordAnalysisResult;

  try {
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]) as KeywordAnalysisResult;
    } else {
      result = JSON.parse(output) as KeywordAnalysisResult;
    }
  } catch {
    throw new Error("AI 响应解析失败，请重试");
  }

  return result;
}

export async function extractHighlights(
  model: string,
  resumeState: ResumeSnapshot
): Promise<HighlightExtraction[]> {
  const resumeContext = buildResumeContext(resumeState);

  const prompt = `
你是一位专业的简历优化顾问。请从以下简历中提取亮点，并给出优化建议。

【简历内容】
${resumeContext}

请以 JSON 格式返回结果，格式如下：
{
  "highlights": [
    {
      "category": "工作经历",
      "content": "在某科技公司担任前端负责人，主导重构项目使性能提升50%",
      "suggestion": "建议添加具体的量化数据，如'页面加载时间从3秒降至1.5秒'，并突出你的领导力和技术决策能力"
    },
    {
      "category": "项目经历",
      "content": "开发了一款用户量10万+的移动端应用",
      "suggestion": "建议突出你的技术贡献和解决的关键问题，可以补充你负责的核心模块和技术难点"
    }
  ]
}

要求：
1. 从简历中提取 3-5 个最突出的亮点
2. 每个亮点包括：类别（工作经历、项目经历、技能、教育背景等）、内容、优化建议
3. 优化建议要具体、可操作，帮助用户更好地展示自己的优势
4. 如果简历内容较少，可以基于现有内容给出建设性的填充建议

只返回 JSON，不要有其他解释。`;

  const output = await callDashscopeAPI(model, prompt, {
    temperature: 0.7,
    maxTokens: 2000,
  });

  let result: { highlights: HighlightExtraction[] };

  try {
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]) as { highlights: HighlightExtraction[] };
    } else {
      result = JSON.parse(output) as { highlights: HighlightExtraction[] };
    }
  } catch {
    throw new Error("AI 响应解析失败，请重试");
  }

  return result.highlights;
}

export async function optimizeForJD(
  model: string,
  jdText: string,
  resumeState: ResumeSnapshot
): Promise<ResumeOptimizationResult> {
  const resumeContext = buildResumeContext(resumeState);

  const prompt = `
你是一位专业的简历优化顾问。请根据以下职位描述（JD），对简历进行全面优化分析。

【职位描述（JD）】
${jdText}

【简历内容】
${resumeContext}

请以 JSON 格式返回优化结果，格式如下：
{
  "keywordAnalysis": {
    "overallMatchScore": 85,
    "categories": [
      { "name": "技术技能", "matchCount": 8, "totalCount": 10, "score": 80 }
    ],
    "matchedKeywords": [
      { "keyword": "React", "matched": true, "category": "技术技能" }
    ],
    "missingKeywords": [
      { "keyword": "微服务", "matched": false, "category": "技术技能" }
    ]
  },
  "highlights": [
    {
      "category": "工作经历",
      "content": "在某科技公司担任前端负责人",
      "suggestion": "建议添加具体的量化数据"
    }
  ],
  "optimizationSuggestions": [
    "建议在工作经历中突出与 JD 要求匹配的项目经验",
    "建议补充微服务相关的技能或项目经验",
    "建议使用 STAR 法则重写项目描述，突出量化成果"
  ],
  "rewrittenSections": [
    {
      "section": "工作经历 - 第1段",
      "original": "负责前端开发工作",
      "optimized": "主导公司核心产品前端架构设计与开发，带领3人团队完成从0到1的技术选型与落地，采用 React + TypeScript 技术栈，实现页面性能提升40%，用户留存率提高15%"
    }
  ]
}

要求：
1. keywordAnalysis：关键词匹配分析，从 JD 提取关键词并分析匹配情况
2. highlights：从简历中提取 3-5 个亮点，并给出优化建议
3. optimizationSuggestions：5-8 条具体的优化建议，针对 JD 要求
4. rewrittenSections：重写 2-3 个关键段落（工作经历或项目经历），使其更符合 JD 要求，使用量化数据和专业话术

只返回 JSON，不要有其他解释。`;

  const output = await callDashscopeAPI(model, prompt, {
    temperature: 0.7,
    maxTokens: 3000,
  });

  let result: ResumeOptimizationResult;

  try {
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]) as ResumeOptimizationResult;
    } else {
      result = JSON.parse(output) as ResumeOptimizationResult;
    }
  } catch {
    throw new Error("AI 响应解析失败，请重试");
  }

  return result;
}
