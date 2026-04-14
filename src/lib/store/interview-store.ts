import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type InterviewType,
  type InterviewQuestion,
  getRandomQuestions,
} from "@/lib/data/interview-questions";

// ==================== 类型定义 ====================

export type InterviewStatus = "idle" | "in-progress" | "completed";

export interface Message {
  id: string;
  role: "interviewer" | "user";
  content: string;
  timestamp: number;
  questionId?: string;
}

export interface DimensionScore {
  dimension: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface QuestionResult {
  questionId: string;
  question: string;
  userAnswer: string;
  scores: DimensionScore[];
  totalScore: number;
  maxTotalScore: number;
  feedback: string;
}

export interface InterviewResult {
  id: string;
  type: InterviewType;
  typeLabel: string;
  startTime: number;
  endTime: number;
  duration: number;
  overallScore: number;
  maxScore: number;
  questionResults: QuestionResult[];
  dimensionAverages: DimensionScore[];
  summary: string;
  suggestions: string[];
}

export interface InterviewHistory {
  id: string;
  type: InterviewType;
  typeLabel: string;
  date: string;
  overallScore: number;
  maxScore: number;
  questionCount: number;
}

// ==================== Store 接口 ====================

interface InterviewStore {
  // 面试状态
  status: InterviewStatus;
  interviewType: InterviewType | null;
  currentQuestionIndex: number;
  questions: InterviewQuestion[];
  messages: Message[];
  currentQuestionResult: QuestionResult | null;
  allResults: QuestionResult[];
  interviewResult: InterviewResult | null;
  history: InterviewHistory[];
  hintUsed: boolean;
  isTyping: boolean;

  // 操作方法
  startInterview: (type: InterviewType) => void;
  addMessage: (role: "interviewer" | "user", content: string, questionId?: string) => void;
  submitAnswer: (answer: string) => void;
  nextQuestion: () => void;
  useHint: () => void;
  endInterview: () => void;
  resetInterview: () => void;
  clearHistory: () => void;
  setTyping: (typing: boolean) => void;
}

// ==================== 辅助函数 ====================

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function evaluateAnswer(
  question: InterviewQuestion,
  answer: string
): { scores: DimensionScore[]; feedback: string } {
  const scores: DimensionScore[] = question.evaluationCriteria.map((criteria) => {
    const matchedKeywords = criteria.keywords.filter((kw) =>
      answer.toLowerCase().includes(kw.toLowerCase())
    );
    const keywordRatio = matchedKeywords.length / criteria.keywords.length;
    const answerLength = answer.length;

    // 基于关键词匹配和回答长度计算分数
    let baseScore = keywordRatio * criteria.maxScore * 0.7;

    // 回答长度奖励（鼓励详细回答）
    if (answerLength > 50) baseScore += criteria.maxScore * 0.1;
    if (answerLength > 150) baseScore += criteria.maxScore * 0.1;
    if (answerLength > 300) baseScore += criteria.maxScore * 0.05;

    // 移除随机浮动以保证结果确定性
    const finalScore = Math.min(
      criteria.maxScore,
      Math.max(1, Math.round(baseScore))
    );

    let feedback: string;
    if (finalScore >= criteria.maxScore * 0.8) {
      feedback = `对"${criteria.dimension}"方面有很好的理解和表达。`;
    } else if (finalScore >= criteria.maxScore * 0.6) {
      feedback = `对"${criteria.dimension}"方面有基本的了解，可以更深入地阐述。`;
    } else if (finalScore >= criteria.maxScore * 0.4) {
      feedback = `对"${criteria.dimension}"方面的回答较为简略，建议加强相关知识储备。`;
    } else {
      feedback = `对"${criteria.dimension}"方面的回答不够充分，需要重点学习和提升。`;
    }

    return {
      dimension: criteria.dimension,
      score: finalScore,
      maxScore: criteria.maxScore,
      feedback,
    };
  });

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const maxTotal = scores.reduce((sum, s) => sum + s.maxScore, 0);
  const percentage = totalScore / maxTotal;

  let feedback: string;
  if (percentage >= 0.8) {
    feedback = "回答非常出色，逻辑清晰、内容充实，展现了扎实的知识储备和良好的表达能力。";
  } else if (percentage >= 0.6) {
    feedback = "回答整体不错，覆盖了主要知识点，但部分方面可以更加深入和具体。";
  } else if (percentage >= 0.4) {
    feedback = "回答基本合格，但内容较为简略，建议在相关方面加强学习和练习。";
  } else {
    feedback = "回答较为薄弱，建议系统性地学习相关知识，并通过练习提升表达能力。";
  }

  return { scores, feedback };
}

function checkFollowUp(question: InterviewQuestion, answer: string): string | null {
  for (const followUp of question.followUps) {
    const hasMatch = followUp.triggerKeywords.some((kw) =>
      answer.toLowerCase().includes(kw.toLowerCase())
    );
    if (hasMatch) {
      return followUp.question;
    }
  }
  return null;
}

function generateSuggestions(
  type: InterviewType,
  results: QuestionResult[]
): string[] {
  const suggestions: string[] = [];
  const avgScore =
    results.reduce((sum, r) => sum + r.totalScore / r.maxTotalScore, 0) / results.length;

  if (avgScore < 0.6) {
    suggestions.push("建议加强基础知识的学习，建立系统的知识框架。");
    suggestions.push("可以多进行模拟面试练习，提升回答的流畅度和自信心。");
  }

  if (avgScore >= 0.6 && avgScore < 0.8) {
    suggestions.push("整体表现不错，建议在薄弱维度进行针对性提升。");
  }

  // 找出得分最低的维度
  const dimensionScores: Record<string, { total: number; count: number }> = {};
  results.forEach((r) => {
    r.scores.forEach((s) => {
      if (!dimensionScores[s.dimension]) {
        dimensionScores[s.dimension] = { total: 0, count: 0 };
      }
      dimensionScores[s.dimension].total += s.score / s.maxScore;
      dimensionScores[s.dimension].count += 1;
    });
  });

  const weakDimensions = Object.entries(dimensionScores)
    .map(([dim, data]) => ({ dimension: dim, avg: data.total / data.count }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 2);

  weakDimensions.forEach((dim) => {
    suggestions.push(`"${dim.dimension}"维度得分较低，建议重点加强这方面的能力。`);
  });

  // 根据面试类型给出特定建议
  if (type === "technical") {
    suggestions.push("建议多刷LeetCode，保持算法手感，同时关注系统设计方面的知识积累。");
    suggestions.push("面试中尽量用具体的项目经验来佐证你的技术能力。");
  } else if (type === "hr") {
    suggestions.push("建议提前准备好常见HR问题的回答模板，并结合自身经历进行个性化调整。");
    suggestions.push("在回答薪资期望时，建议先做好市场调研，给出合理的薪资范围。");
  } else if (type === "behavioral") {
    suggestions.push("建议使用STAR法则（情境-任务-行动-结果）来组织行为面试的回答。");
    suggestions.push("多准备几个不同类型的项目经历案例，以应对不同方向的行为面试问题。");
  }

  return suggestions;
}

function generateSummary(
  type: InterviewType,
  results: QuestionResult[],
  overallScore: number
): string {
  const questionCount = results.length;
  const avgPercentage = overallScore / (questionCount * 100);

  let summary: string;

  if (type === "technical") {
    if (avgPercentage >= 0.8) {
      summary = `在本次技术面试模拟中，你展现了扎实的技术功底和良好的表达能力。共回答了${questionCount}道技术题，综合表现优秀。继续保持，注意在细节上精益求精。`;
    } else if (avgPercentage >= 0.6) {
      summary = `本次技术面试模拟整体表现良好，共回答了${questionCount}道技术题。基础知识掌握较好，但在部分技术深度上还有提升空间。建议针对薄弱方向进行专项练习。`;
    } else {
      summary = `本次技术面试模拟共回答了${questionCount}道技术题，综合表现有待提升。建议系统性地复习核心技术知识，并通过大量练习来提升解题能力和表达水平。`;
    }
  } else if (type === "hr") {
    if (avgPercentage >= 0.8) {
      summary = `在本次HR面试模拟中，你的回答自信得体，展现了良好的职业素养和自我认知能力。共回答了${questionCount}道HR题，整体表现优秀。`;
    } else if (avgPercentage >= 0.6) {
      summary = `本次HR面试模拟整体表现不错，共回答了${questionCount}道HR题。回答内容较为充实，但在表达的结构性和针对性上还有提升空间。`;
    } else {
      summary = `本次HR面试模拟共回答了${questionCount}道HR题，建议提前准备好常见HR问题的回答框架，并结合自身经历进行充分准备。`;
    }
  } else {
    if (avgPercentage >= 0.8) {
      summary = `在本次行为面试模拟中，你很好地运用了STAR法则来描述经历，展现了优秀的项目经验和问题解决能力。共回答了${questionCount}道行为题，表现优秀。`;
    } else if (avgPercentage >= 0.6) {
      summary = `本次行为面试模拟整体表现良好，共回答了${questionCount}道行为题。经历描述较为具体，但建议更加注重结构化表达，突出"行动"和"结果"部分。`;
    } else {
      summary = `本次行为面试模拟共回答了${questionCount}道行为题，建议多准备项目案例，并使用STAR法则来组织回答，使描述更加完整和有说服力。`;
    }
  }

  return summary;
}

// ==================== Store 创建 ====================

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set, get) => ({
      // 初始状态
  status: "idle",
  interviewType: null,
  currentQuestionIndex: 0,
  questions: [],
  messages: [],
  currentQuestionResult: null,
  allResults: [],
  interviewResult: null,
  history: [],
  hintUsed: false,
  isTyping: false,

  // 开始面试
  startInterview: (type: InterviewType) => {
    const questions = getRandomQuestions(type, 3);
    const firstQuestion = questions[0];

    const typeLabels: Record<InterviewType, string> = {
      technical: "技术面试",
      hr: "HR面试",
      behavioral: "行为面试",
    };

    set({
      status: "in-progress",
      interviewType: type,
      currentQuestionIndex: 0,
      questions,
      messages: [
        {
          id: generateId(),
          role: "interviewer",
          content: `你好！欢迎参加${typeLabels[type]}模拟面试。我是你的面试官，接下来我会问你几个问题，请尽量详细地回答。准备好了吗？\n\n${firstQuestion.question}`,
          timestamp: Date.now(),
          questionId: firstQuestion.id,
        },
      ],
      currentQuestionResult: null,
      allResults: [],
      interviewResult: null,
      hintUsed: false,
      isTyping: false,
    });
  },

  // 添加消息
  addMessage: (role, content, questionId) => {
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: generateId(),
          role,
          content,
          timestamp: Date.now(),
          questionId,
        },
      ],
    }));
  },

  // 提交回答
  submitAnswer: (answer: string) => {
    const state = get();
    if (state.status !== "in-progress" || !state.interviewType) return;

    const currentQuestion = state.questions[state.currentQuestionIndex];

    // 添加用户消息
    state.addMessage("user", answer, currentQuestion.id);

    // 评估回答
    const { scores, feedback } = evaluateAnswer(currentQuestion, answer);
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    const maxTotal = scores.reduce((sum, s) => sum + s.maxScore, 0);

    const questionResult: QuestionResult = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      userAnswer: answer,
      scores,
      totalScore,
      maxTotalScore: maxTotal,
      feedback,
    };

    // 检查是否触发追问
    const followUpQuestion = checkFollowUp(currentQuestion, answer);

    set({
      currentQuestionResult: questionResult,
      allResults: [...state.allResults, questionResult],
      isTyping: true,
    });

    // 模拟面试官回复延迟
    setTimeout(() => {
      const currentState = get();
      if (currentState.status !== "in-progress") return;

      let interviewerReply: string;

      if (followUpQuestion) {
        interviewerReply = `不错的回答。${followUpQuestion}`;
      } else {
        const isLastQuestion =
          currentState.currentQuestionIndex >= currentState.questions.length - 1;

        if (isLastQuestion) {
          interviewerReply =
            "好的，我的问题问完了。感谢你参加本次模拟面试，稍后我会给出详细的评估报告。你可以点击「结束面试」查看结果。";
        } else {
          interviewerReply =
            "好的，了解了。我们来看下一个问题。";
        }
      }

      set((s) => ({
        messages: [
          ...s.messages,
          {
            id: generateId(),
            role: "interviewer",
            content: interviewerReply,
            timestamp: Date.now(),
          },
        ],
        isTyping: false,
      }));
    }, 1500);
  },

  // 下一题
  nextQuestion: () => {
    const state = get();
    if (state.status !== "in-progress") return;

    const nextIndex = state.currentQuestionIndex + 1;

    if (nextIndex >= state.questions.length) {
      // 所有题目已完成
      return;
    }

    const nextQuestion = state.questions[nextIndex];

    set({
      currentQuestionIndex: nextIndex,
      currentQuestionResult: null,
      hintUsed: false,
      isTyping: true,
    });

    // 模拟面试官提问延迟
    setTimeout(() => {
      set((s) => ({
        messages: [
          ...s.messages,
          {
            id: generateId(),
            role: "interviewer",
            content: nextQuestion.question,
            timestamp: Date.now(),
            questionId: nextQuestion.id,
          },
        ],
        isTyping: false,
      }));
    }, 1000);
  },

  // 使用提示
  useHint: () => {
    const state = get();
    if (state.status !== "in-progress" || state.hintUsed) return;

    const currentQuestion = state.questions[state.currentQuestionIndex];
    const criteriaHints = currentQuestion.evaluationCriteria
      .slice(0, 2)
      .map((c) => c.dimension)
      .join("、");

    const hintMessage = `提示：回答时建议从以下维度展开：${criteriaHints}。尽量结合具体的项目经历或案例来说明。`;

    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: generateId(),
          role: "interviewer",
          content: hintMessage,
          timestamp: Date.now(),
        },
      ],
      hintUsed: true,
    }));
  },

  // 结束面试
  endInterview: () => {
    const state = get();
    if (state.status !== "in-progress" || !state.interviewType) return;

    const typeLabels: Record<InterviewType, string> = {
      technical: "技术面试",
      hr: "HR面试",
      behavioral: "行为面试",
    };

    const results = state.allResults;
    const overallScore = results.reduce((sum, r) => sum + r.totalScore, 0);
    const maxScore = results.reduce((sum, r) => sum + r.maxTotalScore, 0);

    // 计算各维度平均分
    const dimensionMap: Record<string, { total: number; count: number; feedbacks: string[] }> = {};
    results.forEach((r) => {
      r.scores.forEach((s) => {
        if (!dimensionMap[s.dimension]) {
          dimensionMap[s.dimension] = { total: 0, count: 0, feedbacks: [] };
        }
        dimensionMap[s.dimension].total += s.score;
        dimensionMap[s.dimension].count += 1;
        dimensionMap[s.dimension].feedbacks.push(s.feedback);
      });
    });

    const dimensionAverages: DimensionScore[] = Object.entries(dimensionMap).map(
      ([dim, data]) => ({
        dimension: dim,
        score: Math.round(data.total / data.count),
        maxScore: 100,
        feedback: data.feedbacks[data.feedbacks.length - 1],
      })
    );

    const suggestions = generateSuggestions(state.interviewType, results);
    const summary = generateSummary(state.interviewType, results, overallScore);

    const interviewResult: InterviewResult = {
      id: generateId(),
      type: state.interviewType,
      typeLabel: typeLabels[state.interviewType],
      startTime: state.messages[0]?.timestamp || Date.now(),
      endTime: Date.now(),
      duration: Date.now() - (state.messages[0]?.timestamp || Date.now()),
      overallScore,
      maxScore,
      questionResults: results,
      dimensionAverages,
      summary,
      suggestions,
    };

    // 添加到历史记录
    const historyItem: InterviewHistory = {
      id: interviewResult.id,
      type: state.interviewType,
      typeLabel: typeLabels[state.interviewType],
      date: new Date().toLocaleDateString("zh-CN"),
      overallScore,
      maxScore,
      questionCount: results.length,
    };

    set({
      status: "completed",
      interviewResult,
      history: [historyItem, ...state.history],
    });
  },

  // 重置面试
  resetInterview: () => {
    set({
      status: "idle",
      interviewType: null,
      currentQuestionIndex: 0,
      questions: [],
      messages: [],
      currentQuestionResult: null,
      allResults: [],
      interviewResult: null,
      hintUsed: false,
      isTyping: false,
    });
  },

  // 清除历史
  clearHistory: () => {
    set({ history: [] });
  },

  // 设置打字状态
  setTyping: (typing: boolean) => {
    set({ isTyping: typing });
  },
}), {
  name: "interview-store",
  partialize: (state) => ({ history: state.history }),
}));
