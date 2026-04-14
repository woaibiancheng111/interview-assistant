// 面试题库数据

export type InterviewType = "technical" | "hr" | "behavioral";

export type TechnicalCategory = "frontend" | "backend" | "algorithm" | "system-design";

export type HRCategory = "self-introduction" | "career-planning" | "salary-expectation" | "strengths-weaknesses";

export type BehavioralCategory = "teamwork" | "conflict-resolution" | "project-challenge";

export interface EvaluationCriteria {
  dimension: string;
  description: string;
  maxScore: number;
  keywords: string[];
}

export interface FollowUp {
  id: string;
  question: string;
  triggerKeywords: string[];
}

export interface InterviewQuestion {
  id: string;
  type: InterviewType;
  category: string;
  question: string;
  followUps: FollowUp[];
  evaluationCriteria: EvaluationCriteria[];
}

export const interviewTypeConfig: Record<
  InterviewType,
  { label: string; description: string; icon: string; features: string[] }
> = {
  technical: {
    label: "技术面试",
    description: "模拟真实技术面试场景，涵盖前端、后端、算法和系统设计等方向，帮助你检验技术功底。",
    icon: "Code2",
    features: ["多方向题目覆盖", "深度追问机制", "代码设计能力评估", "技术广度与深度并重"],
  },
  hr: {
    label: "HR面试",
    description: "模拟HR面试常见问题，包括自我介绍、职业规划、薪资期望等，助你从容应对人事面试。",
    icon: "MessageCircle",
    features: ["自我介绍优化", "职业规划梳理", "薪资谈判技巧", "优缺点表达策略"],
  },
  behavioral: {
    label: "行为面试",
    description: "基于STAR法则的行为面试模拟，训练你用结构化方式讲述项目经历和解决问题的能力。",
    icon: "Users",
    features: ["STAR法则训练", "团队协作案例", "冲突处理策略", "项目挑战复盘"],
  },
};

// ==================== 技术面试题 ====================

const technicalQuestions: InterviewQuestion[] = [
  // 前端方向
  {
    id: "tech-fe-001",
    type: "technical",
    category: "frontend",
    question: "请介绍一下React的虚拟DOM机制，以及它是如何提升渲染性能的？",
    followUps: [
      {
        id: "tech-fe-001-f1",
        question: "那你能说说React的Diff算法具体是怎么工作的吗？它的时间复杂度是多少？",
        triggerKeywords: ["diff", "比较", "算法", "复杂度"],
      },
      {
        id: "tech-fe-001-f2",
        question: "在实际项目中，你是如何优化React组件渲染性能的？",
        triggerKeywords: ["优化", "性能", "memo", "useMemo", "useCallback"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "概念理解",
        description: "对虚拟DOM概念的理解深度",
        maxScore: 25,
        keywords: ["虚拟DOM", "真实DOM", "JavaScript对象", "轻量级"],
      },
      {
        dimension: "原理掌握",
        description: "对Diff算法和协调过程的掌握程度",
        maxScore: 25,
        keywords: ["Reconciliation", "key", "O(n)", "树结构"],
      },
      {
        dimension: "性能优化",
        description: "实际性能优化经验和策略",
        maxScore: 25,
        keywords: ["React.memo", "useMemo", "useCallback", "懒加载", "虚拟列表"],
      },
      {
        dimension: "表达清晰度",
        description: "回答的逻辑性和条理性",
        maxScore: 25,
        keywords: ["首先", "其次", "总结", "举例"],
      },
    ],
  },
  {
    id: "tech-fe-002",
    type: "technical",
    category: "frontend",
    question: "请解释一下JavaScript中的事件循环（Event Loop）机制，宏任务和微任务有什么区别？",
    followUps: [
      {
        id: "tech-fe-002-f1",
        question: "那Promise和setTimeout的执行顺序你能详细说明一下吗？",
        triggerKeywords: ["promise", "setTimeout", "执行顺序", "优先级"],
      },
      {
        id: "tech-fe-002-f2",
        question: "在浏览器和Node.js中，事件循环有什么不同？",
        triggerKeywords: ["浏览器", "Node.js", "区别", "不同"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "核心概念",
        description: "对事件循环基本概念的理解",
        maxScore: 25,
        keywords: ["调用栈", "任务队列", "微任务", "宏任务"],
      },
      {
        dimension: "执行机制",
        description: "对任务调度和执行顺序的理解",
        maxScore: 25,
        keywords: ["优先级", "Promise", "setTimeout", "requestAnimationFrame"],
      },
      {
        dimension: "环境差异",
        description: "对不同环境事件循环差异的了解",
        maxScore: 25,
        keywords: ["浏览器", "Node.js", "setImmediate", "process.nextTick"],
      },
      {
        dimension: "实际应用",
        description: "在实际开发中运用事件循环知识的能力",
        maxScore: 25,
        keywords: ["异步编程", "性能优化", "避免阻塞", "实际案例"],
      },
    ],
  },
  {
    id: "tech-fe-003",
    type: "technical",
    category: "frontend",
    question: "请谈谈你对CSS布局的理解，Flexbox和Grid布局各自适用于什么场景？",
    followUps: [
      {
        id: "tech-fe-003-f1",
        question: "你能举一个实际项目中使用Grid布局的例子吗？",
        triggerKeywords: ["例子", "项目", "实际", "场景"],
      },
      {
        id: "tech-fe-003-f2",
        question: "在响应式设计中，你是如何处理不同屏幕尺寸的布局适配的？",
        triggerKeywords: ["响应式", "适配", "媒体查询", "屏幕"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "布局基础",
        description: "对CSS布局基本概念的理解",
        maxScore: 25,
        keywords: ["盒模型", "定位", "浮动", "文档流"],
      },
      {
        dimension: "Flexbox掌握",
        description: "对Flexbox布局的理解和应用",
        maxScore: 25,
        keywords: ["主轴", "交叉轴", "flex-grow", "align-items", "justify-content"],
      },
      {
        dimension: "Grid掌握",
        description: "对Grid布局的理解和应用",
        maxScore: 25,
        keywords: ["grid-template", "fr", "gap", "grid-area", "行列"],
      },
      {
        dimension: "实践能力",
        description: "实际布局场景的处理能力",
        maxScore: 25,
        keywords: ["响应式", "媒体查询", "兼容性", "实际案例"],
      },
    ],
  },
  // 后端方向
  {
    id: "tech-be-001",
    type: "technical",
    category: "backend",
    question: "请介绍一下RESTful API的设计原则，以及你在实际项目中是如何设计API的？",
    followUps: [
      {
        id: "tech-be-001-f1",
        question: "那你觉得RESTful API和GraphQL相比，各自的优缺点是什么？",
        triggerKeywords: ["GraphQL", "对比", "优缺点", "比较"],
      },
      {
        id: "tech-be-001-f2",
        question: "你是如何处理API版本管理和错误处理的？",
        triggerKeywords: ["版本", "错误处理", "异常", "版本管理"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "REST原则",
        description: "对RESTful设计原则的理解",
        maxScore: 25,
        keywords: ["资源", "HTTP方法", "无状态", "统一接口", "URI"],
      },
      {
        dimension: "设计实践",
        description: "实际API设计经验和规范",
        maxScore: 25,
        keywords: ["命名规范", "状态码", "分页", "过滤", "嵌套"],
      },
      {
        dimension: "技术对比",
        description: "对不同API技术方案的了解",
        maxScore: 25,
        keywords: ["GraphQL", "gRPC", "WebSocket", "优缺点"],
      },
      {
        dimension: "工程能力",
        description: "API工程化实践能力",
        maxScore: 25,
        keywords: ["版本管理", "错误处理", "文档", "测试", "安全"],
      },
    ],
  },
  {
    id: "tech-be-002",
    type: "technical",
    category: "backend",
    question: "请解释一下数据库索引的原理，什么情况下应该创建索引？什么情况下不应该？",
    followUps: [
      {
        id: "tech-be-002-f1",
        question: "你能说说B+树索引和哈希索引的区别吗？",
        triggerKeywords: ["B+树", "哈希", "区别", "对比"],
      },
      {
        id: "tech-be-002-f2",
        question: "在项目中遇到过索引失效的情况吗？你是怎么排查和解决的？",
        triggerKeywords: ["失效", "排查", "慢查询", "EXPLAIN", "优化"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "索引原理",
        description: "对数据库索引原理的理解",
        maxScore: 25,
        keywords: ["B+树", "数据结构", "磁盘IO", "有序"],
      },
      {
        dimension: "使用策略",
        description: "索引使用场景的判断能力",
        maxScore: 25,
        keywords: ["选择性", "覆盖索引", "联合索引", "最左前缀"],
      },
      {
        dimension: "问题排查",
        description: "索引问题的诊断和解决能力",
        maxScore: 25,
        keywords: ["EXPLAIN", "慢查询", "索引失效", "优化"],
      },
      {
        dimension: "综合能力",
        description: "数据库设计和优化的综合能力",
        maxScore: 25,
        keywords: ["表设计", "范式", "反范式", "分库分表", "读写分离"],
      },
    ],
  },
  // 算法方向
  {
    id: "tech-algo-001",
    type: "technical",
    category: "algorithm",
    question: "请解释一下动态规划（Dynamic Programming）的核心思想，并举一个你熟悉的例子。",
    followUps: [
      {
        id: "tech-algo-001-f1",
        question: "动态规划和贪心算法有什么区别？在什么场景下选择动态规划更合适？",
        triggerKeywords: ["贪心", "区别", "选择", "场景"],
      },
      {
        id: "tech-algo-001-f2",
        question: "你能说说动态规划的状态转移方程是如何推导的吗？",
        triggerKeywords: ["状态转移", "推导", "方程", "过程"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "核心概念",
        description: "对动态规划基本概念的理解",
        maxScore: 25,
        keywords: ["最优子结构", "重叠子问题", "记忆化", "状态转移"],
      },
      {
        dimension: "算法实现",
        description: "动态规划算法的实现能力",
        maxScore: 25,
        keywords: ["递推", "递归", "空间优化", "时间复杂度"],
      },
      {
        dimension: "算法对比",
        description: "对不同算法策略的理解和对比",
        maxScore: 25,
        keywords: ["贪心", "分治", "回溯", "适用场景"],
      },
      {
        dimension: "问题分析",
        description: "分析问题并选择合适算法的能力",
        maxScore: 25,
        keywords: ["建模", "状态定义", "边界条件", "举例说明"],
      },
    ],
  },
  {
    id: "tech-algo-002",
    type: "technical",
    category: "algorithm",
    question: "请介绍一下常见的时间复杂度，以及你在实际项目中是如何评估算法效率的？",
    followUps: [
      {
        id: "tech-algo-002-f1",
        question: "你能说说空间复杂度和时间复杂度之间的权衡吗？",
        triggerKeywords: ["空间", "时间", "权衡", "trade-off"],
      },
      {
        id: "tech-algo-002-f2",
        question: "在什么情况下O(n^2)的算法比O(n log n)的算法更实用？",
        triggerKeywords: ["实际", "常数", "数据量", "场景"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "复杂度基础",
        description: "对时间复杂度和空间复杂度的理解",
        maxScore: 25,
        keywords: ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)"],
      },
      {
        dimension: "分析方法",
        description: "算法复杂度的分析能力",
        maxScore: 25,
        keywords: ["最好", "最坏", "平均", "摊还", "主定理"],
      },
      {
        dimension: "权衡能力",
        description: "时间和空间之间的权衡决策",
        maxScore: 25,
        keywords: ["空间换时间", "缓存", "预处理", "实际场景"],
      },
      {
        dimension: "实践评估",
        description: "实际项目中算法效率评估能力",
        maxScore: 25,
        keywords: ["性能测试", "基准测试", "Profile", "实际数据"],
      },
    ],
  },
  // 系统设计方向
  {
    id: "tech-sys-001",
    type: "technical",
    category: "system-design",
    question: "请设计一个短链接服务（类似bit.ly），你会如何考虑系统架构？",
    followUps: [
      {
        id: "tech-sys-001-f1",
        question: "在高并发场景下，你会如何保证短链接生成的唯一性和高可用性？",
        triggerKeywords: ["并发", "唯一性", "高可用", "分布式"],
      },
      {
        id: "tech-sys-001-f2",
        question: "你会如何设计缓存策略来提高短链接的访问速度？",
        triggerKeywords: ["缓存", "Redis", "CDN", "性能"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "需求分析",
        description: "对系统需求的全面分析",
        maxScore: 25,
        keywords: ["功能需求", "非功能需求", "QPS", "存储量", "可用性"],
      },
      {
        dimension: "架构设计",
        description: "系统架构的合理性和可扩展性",
        maxScore: 25,
        keywords: ["微服务", "负载均衡", "数据库", "缓存", "消息队列"],
      },
      {
        dimension: "核心算法",
        description: "短链接生成算法的设计",
        maxScore: 25,
        keywords: ["哈希", "Base62", "自增ID", "分布式ID", "冲突处理"],
      },
      {
        dimension: "扩展思考",
        description: "对系统扩展性和边界条件的考虑",
        maxScore: 25,
        keywords: ["监控", "限流", "降级", "安全", "分析统计"],
      },
    ],
  },
];

// ==================== HR面试题 ====================

const hrQuestions: InterviewQuestion[] = [
  {
    id: "hr-intro-001",
    type: "hr",
    category: "self-introduction",
    question: "请做一个简短的自我介绍，重点突出你的核心竞争力和与这个岗位的匹配度。",
    followUps: [
      {
        id: "hr-intro-001-f1",
        question: "你刚才提到了XX经历，能具体说说你在其中承担的角色和取得的成果吗？",
        triggerKeywords: ["经历", "项目", "成果", "角色"],
      },
      {
        id: "hr-intro-001-f2",
        question: "你觉得你最大的优势是什么？这个优势如何帮助你在工作中取得更好的成绩？",
        triggerKeywords: ["优势", "特长", "能力", "帮助"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "结构完整性",
        description: "自我介绍的结构是否完整、逻辑清晰",
        maxScore: 25,
        keywords: ["教育背景", "工作经历", "技能", "总结"],
      },
      {
        dimension: "岗位匹配",
        description: "与目标岗位的匹配程度",
        maxScore: 25,
        keywords: ["岗位", "匹配", "相关经验", "技能要求"],
      },
      {
        dimension: "亮点突出",
        description: "是否有效突出个人亮点和成就",
        maxScore: 25,
        keywords: ["成果", "数据", "量化", "亮点", "成就"],
      },
      {
        dimension: "表达感染力",
        description: "表达的自信度和感染力",
        maxScore: 25,
        keywords: ["自信", "简洁", "有条理", "热情"],
      },
    ],
  },
  {
    id: "hr-career-001",
    type: "hr",
    category: "career-planning",
    question: "请谈谈你未来3-5年的职业规划，以及你为什么选择我们公司？",
    followUps: [
      {
        id: "hr-career-001-f1",
        question: "如果公司的发展方向和你的职业规划出现偏差，你会怎么处理？",
        triggerKeywords: ["偏差", "调整", "适应", "变化"],
      },
      {
        id: "hr-career-001-f2",
        question: "你平时是如何提升自己的专业技能的？最近在学习什么新技术？",
        triggerKeywords: ["学习", "提升", "技术", "成长"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "规划清晰度",
        description: "职业规划是否清晰、具体、可执行",
        maxScore: 25,
        keywords: ["短期", "长期", "目标", "具体", "可行"],
      },
      {
        dimension: "公司认知",
        description: "对目标公司的了解程度",
        maxScore: 25,
        keywords: ["公司文化", "业务", "产品", "价值观", "发展"],
      },
      {
        dimension: "自我认知",
        description: "对自身发展方向的认知",
        maxScore: 25,
        keywords: ["兴趣", "能力", "差距", "提升", "方向"],
      },
      {
        dimension: "学习意愿",
        description: "持续学习和成长的意愿",
        maxScore: 25,
        keywords: ["学习", "进步", "新技术", "自我驱动"],
      },
    ],
  },
  {
    id: "hr-salary-001",
    type: "hr",
    category: "salary-expectation",
    question: "你对薪资的期望是多少？你是如何评估自己的市场价值的？",
    followUps: [
      {
        id: "hr-salary-001-f1",
        question: "如果我们给的薪资没有达到你的期望，你会考虑哪些其他因素？",
        triggerKeywords: ["其他因素", "考虑", "综合", "福利"],
      },
      {
        id: "hr-salary-001-f2",
        question: "你上一份工作的薪资结构是怎样的？你对薪资构成有什么偏好？",
        triggerKeywords: ["薪资结构", "构成", "偏好", "期权", "奖金"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "市场认知",
        description: "对市场薪资水平的了解",
        maxScore: 25,
        keywords: ["市场行情", "调研", "行业标准", "合理范围"],
      },
      {
        dimension: "自我评估",
        description: "对自身价值的合理评估",
        maxScore: 25,
        keywords: ["能力", "经验", "贡献", "价值"],
      },
      {
        dimension: "谈判策略",
        description: "薪资谈判的策略和技巧",
        maxScore: 25,
        keywords: ["范围", "弹性", "综合考量", "底线"],
      },
      {
        dimension: "表达方式",
        description: "表达薪资期望的方式和态度",
        maxScore: 25,
        keywords: ["得体", "自信", "灵活", "理性"],
      },
    ],
  },
  {
    id: "hr-sw-001",
    type: "hr",
    category: "strengths-weaknesses",
    question: "你觉得你最大的优点和最大的缺点分别是什么？你是如何克服自己的缺点的？",
    followUps: [
      {
        id: "hr-sw-001-f1",
        question: "你能举一个具体的例子来说明你是如何克服这个缺点的吗？",
        triggerKeywords: ["例子", "具体", "克服", "改进"],
      },
      {
        id: "hr-sw-001-f2",
        question: "你的同事或领导通常怎么评价你？",
        triggerKeywords: ["评价", "同事", "领导", "反馈"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "自我认知",
        description: "对自身优缺点的客观认知",
        maxScore: 25,
        keywords: ["客观", "真实", "具体", "反思"],
      },
      {
        dimension: "优点表达",
        description: "优点的表达是否恰当且有说服力",
        maxScore: 25,
        keywords: ["实例", "成果", "匹配岗位", "量化"],
      },
      {
        dimension: "缺点处理",
        description: "缺点的表达是否真诚且有改进措施",
        maxScore: 25,
        keywords: ["改进", "行动", "成长", "避免", "真诚"],
      },
      {
        dimension: "整体印象",
        description: "回答给人留下的整体印象",
        maxScore: 25,
        keywords: ["积极", "坦诚", "成熟", "平衡"],
      },
    ],
  },
];

// ==================== 行为面试题 ====================

const behavioralQuestions: InterviewQuestion[] = [
  {
    id: "bh-team-001",
    type: "behavioral",
    category: "teamwork",
    question: "请描述一次你与团队成员合作完成一个具有挑战性项目的经历。你在团队中扮演了什么角色？",
    followUps: [
      {
        id: "bh-team-001-f1",
        question: "在合作过程中，你们是如何分工和协调进度的？",
        triggerKeywords: ["分工", "协调", "进度", "沟通"],
      },
      {
        id: "bh-team-001-f2",
        question: "如果团队成员的能力参差不齐，你是如何处理这种情况的？",
        triggerKeywords: ["能力", "参差不齐", "帮助", "指导"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "情境描述",
        description: "STAR法则中Situation和Task的描述",
        maxScore: 25,
        keywords: ["背景", "目标", "挑战", "时间", "规模"],
      },
      {
        dimension: "行动细节",
        description: "STAR法则中Action的描述",
        maxScore: 25,
        keywords: ["具体行动", "我的角色", "主动", "方法", "步骤"],
      },
      {
        dimension: "结果量化",
        description: "STAR法则中Result的描述",
        maxScore: 25,
        keywords: ["结果", "数据", "成果", "影响", "量化"],
      },
      {
        dimension: "团队意识",
        description: "团队协作意识和能力",
        maxScore: 25,
        keywords: ["协作", "沟通", "支持", "共同目标", "团队"],
      },
    ],
  },
  {
    id: "bh-conflict-001",
    type: "behavioral",
    category: "conflict-resolution",
    question: "请描述一次你在工作中与同事或领导产生意见分歧的经历，你是如何处理的？",
    followUps: [
      {
        id: "bh-conflict-001-f1",
        question: "如果最终证明你的方案是错误的，你会怎么面对？",
        triggerKeywords: ["错误", "面对", "接受", "反思"],
      },
      {
        id: "bh-conflict-001-f2",
        question: "你觉得在团队中，如何建立有效的沟通机制来减少冲突？",
        triggerKeywords: ["沟通", "机制", "预防", "减少"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "冲突描述",
        description: "对冲突情境的客观描述",
        maxScore: 25,
        keywords: ["背景", "分歧点", "双方观点", "客观"],
      },
      {
        dimension: "处理方式",
        description: "处理冲突的方式和策略",
        maxScore: 25,
        keywords: ["沟通", "倾听", "妥协", "数据", "理性"],
      },
      {
        dimension: "结果反思",
        description: "对结果的描述和反思",
        maxScore: 25,
        keywords: ["解决", "关系", "反思", "改进", "经验"],
      },
      {
        dimension: "情商表现",
        description: "在冲突中展现的情商",
        maxScore: 25,
        keywords: ["冷静", "尊重", "同理心", "专业", "成熟"],
      },
    ],
  },
  {
    id: "bh-challenge-001",
    type: "behavioral",
    category: "project-challenge",
    question: "请描述一次你在项目中遇到的最大技术挑战，你是如何分析和解决的？",
    followUps: [
      {
        id: "bh-challenge-001-f1",
        question: "在解决这个问题的过程中，你从中学到了什么？",
        triggerKeywords: ["学习", "收获", "经验", "成长"],
      },
      {
        id: "bh-challenge-001-f2",
        question: "如果让你重新面对这个问题，你会采取不同的做法吗？",
        triggerKeywords: ["重新", "不同", "改进", "优化"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "问题定义",
        description: "对技术挑战的清晰定义",
        maxScore: 25,
        keywords: ["问题描述", "影响范围", "紧急程度", "背景"],
      },
      {
        dimension: "分析过程",
        description: "问题分析的方法和过程",
        maxScore: 25,
        keywords: ["排查", "分析", "根因", "方法", "工具"],
      },
      {
        dimension: "解决方案",
        description: "解决方案的设计和执行",
        maxScore: 25,
        keywords: ["方案", "执行", "验证", "效果", "创新"],
      },
      {
        dimension: "复盘能力",
        description: "事后复盘和经验总结能力",
        maxScore: 25,
        keywords: ["总结", "文档", "分享", "预防", "改进"],
      },
    ],
  },
  {
    id: "bh-challenge-002",
    type: "behavioral",
    category: "project-challenge",
    question: "请描述一次项目进度严重延期的情况，你是如何应对的？",
    followUps: [
      {
        id: "bh-challenge-002-f1",
        question: "你是如何向领导和团队沟通延期情况的？",
        triggerKeywords: ["沟通", "领导", "团队", "汇报"],
      },
      {
        id: "bh-challenge-002-f2",
        question: "在那之后，你采取了哪些措施来避免类似情况再次发生？",
        triggerKeywords: ["避免", "预防", "措施", "流程", "改进"],
      },
    ],
    evaluationCriteria: [
      {
        dimension: "危机应对",
        description: "面对延期时的应对策略",
        maxScore: 25,
        keywords: ["优先级", "资源", "沟通", "及时", "冷静"],
      },
      {
        dimension: "沟通能力",
        description: "与相关方的沟通能力",
        maxScore: 25,
        keywords: ["透明", "及时", "方案", "期望管理"],
      },
      {
        dimension: "执行能力",
        description: "推动项目回归正轨的执行力",
        maxScore: 25,
        keywords: ["加班", "砍需求", "并行", "优化", "赶工"],
      },
      {
        dimension: "经验沉淀",
        description: "从延期中总结的经验和改进",
        maxScore: 25,
        keywords: ["复盘", "流程优化", "风险管理", "预警"],
      },
    ],
  },
];

// ==================== 汇总所有题目 ====================

export const allQuestions: InterviewQuestion[] = [
  ...technicalQuestions,
  ...hrQuestions,
  ...behavioralQuestions,
];

// 按类型获取题目
export function getQuestionsByType(type: InterviewType): InterviewQuestion[] {
  return allQuestions.filter((q) => q.type === type);
}

// 随机选择指定数量的题目
export function getRandomQuestions(type: InterviewType, count: number = 3): InterviewQuestion[] {
  const questions = getQuestionsByType(type);
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// 获取分类标签
export function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    frontend: "前端开发",
    backend: "后端开发",
    algorithm: "算法与数据结构",
    "system-design": "系统设计",
    "self-introduction": "自我介绍",
    "career-planning": "职业规划",
    "salary-expectation": "薪资期望",
    "strengths-weaknesses": "优缺点",
    teamwork: "团队协作",
    "conflict-resolution": "冲突处理",
    "project-challenge": "项目挑战",
  };
  return categoryMap[category] || category;
}
