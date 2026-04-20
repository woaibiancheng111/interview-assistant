import {
  type AIModelProvider,
  type ChatMessage,
  type STARCheckResult,
  type ResumeOptimizationResult,
  type AIConfig,
} from "@/lib/store/ai-store";
import type { Question } from "@/lib/data/questions";
import type { ResumeState, WorkExperience, ProjectExperience } from "@/lib/store/resume-store";

interface ChatCompletionParams {
  messages: { role: string; content: string }[];
  temperature?: number;
  maxTokens?: number;
}

interface ChatCompletionResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = { ...config };
  }

  updateConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private getBaseUrl(): string {
    const { provider, baseUrl } = this.config;
    switch (provider) {
      case "openai":
        return baseUrl || "https://api.openai.com/v1";
      case "ollama":
        return baseUrl || "http://localhost:11434/v1";
      case "custom":
        return baseUrl;
      default:
        return "https://api.openai.com/v1";
    }
  }

  private getModel(): string {
    const { provider, model } = this.config;
    if (provider === "ollama" && !model) {
      return "llama2";
    }
    return model || "gpt-3.5-turbo";
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.config.apiKey && this.config.provider !== "ollama") {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }
    return headers;
  }

  async isConfigured(): Promise<boolean> {
    if (this.config.provider === "ollama") {
      try {
        const response = await fetch(`${this.getBaseUrl()}/tags`, {
          method: "GET",
          headers: this.getHeaders(),
        });
        return response.ok;
      } catch {
        return false;
      }
    }
    return !!this.config.apiKey;
  }

  async chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResponse> {
    const baseUrl = this.getBaseUrl();
    const model = this.getModel();
    const headers = this.getHeaders();

    const requestBody = {
      model,
      messages: params.messages,
      temperature: params.temperature ?? this.config.temperature,
      max_tokens: params.maxTokens ?? this.config.maxTokens,
    };

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return {
      content,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }

  async chat(
    userMessage: string,
    systemPrompt?: string,
    contextMessages?: ChatMessage[]
  ): Promise<string> {
    const messages: { role: string; content: string }[] = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    if (contextMessages) {
      messages.push(
        ...contextMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }))
      );
    }

    messages.push({ role: "user", content: userMessage });

    const response = await this.chatCompletion({ messages });
    return response.content;
  }

  async chatAboutQuestion(
    question: Question,
    userMessage: string,
    contextMessages?: ChatMessage[]
  ): Promise<string> {
    const systemPrompt = `你是一位专业的计算机科学面试教练，正在帮助用户准备面试。

当前题目信息：
- 标题：${question.title}
- 分类：${question.category}
- 难度：${question.difficulty}
- 标签：${question.tags.join(", ")}
- 题目内容：
${question.content}

参考答案：
${question.answer}

你的角色是一位耐心、专业的面试教练。请遵循以下指导原则：
1. 不要直接给出完整答案，而是通过引导性问题帮助用户自己思考
2. 当用户遇到困难时，提供渐进式的提示（从宽泛到具体）
3. 鼓励用户用自己的话解释概念，而不是背诵
4. 当用户给出回答后，分析其优点和需要改进的地方
5. 使用引导式提问，例如："你觉得这个问题的关键是什么？"、"有没有考虑过边界情况？"

如果用户问"这道题怎么做"或类似问题，请使用引导式回答，而不是直接给出答案。`;

    return this.chat(userMessage, systemPrompt, contextMessages);
  }

  async checkSTARPrinciple(answer: string, question?: string): Promise<STARCheckResult> {
    const systemPrompt = `你是一位专业的行为面试评估专家，擅长使用STAR法则（情境-Situation、任务-Task、行动-Action、结果-Result）来评估面试回答。

请仔细分析用户的回答，评估其是否遵循了STAR法则。

评估标准：
1. **情境(Situation)**：是否清晰描述了事件发生的背景和情境？
2. **任务(Task)**：是否明确说明了自己在该情境中承担的任务和责任？
3. **行动(Action)**：是否详细描述了自己采取的具体行动？是否强调了"我"做了什么？
4. **结果(Result)**：是否说明了行动的结果？是否用数据量化了成果？

请按以下JSON格式输出评估结果（只输出JSON，不要其他内容）：
{
  "hasSituation": true/false,
  "hasTask": true/false,
  "hasAction": true/false,
  "hasResult": true/false,
  "score": 0-100,
  "suggestions": ["改进建议1", "改进建议2", ...],
  "rawAnalysis": "详细的分析说明"
}`;

    const userMessage = question
      ? `面试问题：${question}\n\n我的回答：${answer}`
      : `我的回答：${answer}`;

    const response = await this.chat(userMessage, systemPrompt);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]) as STARCheckResult;
        return result;
      }
    } catch (e) {
      console.error("Failed to parse STAR check result:", e);
    }

    return {
      hasSituation: answer.toLowerCase().includes("情境") || answer.toLowerCase().includes("背景"),
      hasTask: answer.toLowerCase().includes("任务") || answer.toLowerCase().includes("负责"),
      hasAction: answer.toLowerCase().includes("我") || answer.toLowerCase().includes("行动"),
      hasResult: answer.toLowerCase().includes("结果") || answer.toLowerCase().includes("数据"),
      score: 50,
      suggestions: ["无法完整评估，请确保AI配置正确"],
      rawAnalysis: response,
    };
  }

  async optimizeResume(
    resume: ResumeState,
    jobDescription: string
  ): Promise<ResumeOptimizationResult> {
    const resumeText = this.formatResumeForAI(resume);

    const systemPrompt = `你是一位资深的简历优化专家和HR顾问。请根据用户提供的简历内容和目标职位描述，进行专业的简历优化分析。

请从以下维度进行评估：
1. **关键词匹配度**：简历中的关键词与职位描述的匹配程度
2. **技能相关性**：技能列表是否覆盖了职位要求
3. **经历描述质量**：工作和项目经历是否使用了STAR法则，是否有数据量化
4. **整体结构**：简历结构是否清晰，重点是否突出

请按以下JSON格式输出优化建议（只输出JSON，不要其他内容）：
{
  "overallScore": 0-100,
  "matchPercentage": 0-100,
  "strengths": ["优点1", "优点2", ...],
  "weaknesses": ["缺点1", "缺点2", ...],
  "suggestions": ["具体的优化建议1", "具体的优化建议2", ...],
  "optimizedContent": "针对主要问题的优化后的简历内容示例或重写建议"
}`;

    const userMessage = `目标职位描述：
${jobDescription}

我的简历内容：
${resumeText}`;

    const response = await this.chat(userMessage, systemPrompt);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]) as ResumeOptimizationResult;
        return result;
      }
    } catch (e) {
      console.error("Failed to parse resume optimization result:", e);
    }

    return {
      overallScore: 50,
      matchPercentage: 50,
      strengths: ["简历结构完整"],
      weaknesses: ["需要更多数据量化成果"],
      suggestions: ["建议使用STAR法则描述经历", "添加更多量化成果"],
      optimizedContent: response,
    };
  }

  private formatResumeForAI(resume: ResumeState): string {
    let text = "";

    text += "【个人信息】\n";
    if (resume.personalInfo.name) text += `姓名：${resume.personalInfo.name}\n`;
    if (resume.personalInfo.summary) text += `个人简介：${resume.personalInfo.summary}\n`;

    if (resume.educationList.length > 0) {
      text += "\n【教育经历】\n";
      resume.educationList.forEach((edu, i) => {
        text += `${i + 1}. ${edu.school} - ${edu.major} (${edu.degree})\n`;
        if (edu.description) text += `   ${edu.description}\n`;
      });
    }

    if (resume.workExperienceList.length > 0) {
      text += "\n【工作经历】\n";
      resume.workExperienceList.forEach((work, i) => {
        text += `${i + 1}. ${work.company} - ${work.position}\n`;
        text += `   时间：${work.startDate} - ${work.endDate}\n`;
        if (work.description) text += `   ${work.description}\n`;
        if (work.techStack.length > 0) text += `   技术栈：${work.techStack.join(", ")}\n`;
      });
    }

    if (resume.projectExperienceList.length > 0) {
      text += "\n【项目经历】\n";
      resume.projectExperienceList.forEach((proj, i) => {
        text += `${i + 1}. ${proj.name} - ${proj.role}\n`;
        if (proj.description) text += `   ${proj.description}\n`;
        if (proj.techStack.length > 0) text += `   技术栈：${proj.techStack.join(", ")}\n`;
        if (proj.achievements.length > 0) {
          text += `   成果：\n`;
          proj.achievements.forEach((a) => text += `   - ${a}\n`);
        }
      });
    }

    if (resume.skillCategories.length > 0) {
      text += "\n【技能】\n";
      resume.skillCategories.forEach((cat) => {
        text += `${cat.category}：${cat.skills.join(", ")}\n`;
      });
    }

    return text;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const baseUrl = this.getBaseUrl();
    const headers = this.getHeaders();

    if (this.config.provider === "ollama") {
      try {
        const response = await fetch(`${baseUrl.replace("/v1", "")}/api/embeddings`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: this.getModel(),
            prompt: text,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.embedding || [];
        }
      } catch (e) {
        console.log("Ollama embedding not available, using fallback");
      }
    } else {
      try {
        const response = await fetch(`${baseUrl}/embeddings`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: "text-embedding-ada-002",
            input: text,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.data?.[0]?.embedding || [];
        }
      } catch (e) {
        console.log("OpenAI embedding not available, using fallback");
      }
    }

    return this.generateSimpleEmbedding(text);
  }

  private generateSimpleEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/);
    const embedding: number[] = new Array(128).fill(0);

    const commonWords = new Set([
      "的", "是", "在", "了", "和", "与", "或", "我", "你", "他", "她", "它",
      "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
      "have", "has", "had", "do", "does", "did", "will", "would", "could",
      "should", "may", "might", "must", "shall", "can", "need", "dare",
      "and", "or", "but", "so", "if", "then", "else", "when", "where",
      "why", "how", "what", "which", "who", "whom", "whose", "this",
      "that", "these", "those", "it", "its", "as", "for", "to", "from",
      "in", "on", "at", "by", "with", "about", "into", "through", "over",
      "under", "again", "further", "then", "once", "here", "there", "all",
      "each", "few", "more", "most", "other", "some", "such", "no", "nor",
      "not", "only", "own", "same", "than", "too", "very", "just", "also",
    ]);

    words.forEach((word, index) => {
      if (commonWords.has(word) || word.length < 2) return;

      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash = hash & hash;
      }

      const position = Math.abs(hash) % 128;
      const weight = 1.0 / (1 + Math.log(1 + words.indexOf(word)));

      embedding[position] += weight;

      if (position + 1 < 128) embedding[position + 1] += weight * 0.5;
      if (position - 1 >= 0) embedding[position - 1] += weight * 0.5;
    });

    const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    if (magnitude > 0) {
      return embedding.map((v) => v / magnitude);
    }

    return embedding;
  }

  async semanticSearch(
    query: string,
    questions: Question[],
    topK: number = 10
  ): Promise<{ questionId: string; score: number; reason: string }[]> {
    const queryEmbedding = await this.generateEmbedding(query);

    const results: { questionId: string; score: number; reason: string }[] = [];

    for (const question of questions) {
      const questionText = `${question.title} ${question.content} ${question.tags.join(" ")} ${question.category}`;
      const questionEmbedding = await this.generateSimpleEmbedding(questionText);

      const similarity = this.cosineSimilarity(queryEmbedding, questionEmbedding);

      let reason = "";
      if (similarity > 0.7) {
        reason = "高度相关：标题、内容或标签与查询语义匹配";
      } else if (similarity > 0.4) {
        reason = "部分相关：分类或标签有一定关联";
      } else {
        reason = "低相关度";
      }

      if (similarity > 0.1) {
        results.push({
          questionId: question.id,
          score: similarity,
          reason,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    if (magnitude === 0) return 0;

    return dotProduct / magnitude;
  }
}

export function createAIService(config: AIConfig): AIService {
  return new AIService(config);
}
