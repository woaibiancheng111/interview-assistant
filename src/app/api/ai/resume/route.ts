import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/server/auth";
import { rateLimit, getRateLimitHeaders } from "@/lib/server/rate-limit";
import { normalizeString } from "@/lib/server/validation";
import {
  analyzeKeywordMatch,
  extractHighlights,
  optimizeForJD,
  type ResumeSnapshot,
} from "@/lib/services/ai-service";

const AI_LIMIT = Number.parseInt(process.env.RATE_LIMIT_AI || "10", 10);
const AI_WINDOW_SECONDS = Number.parseInt(process.env.RATE_LIMIT_AI_WINDOW || "60", 10);
const AI_REQUIRE_AUTH = process.env.AI_REQUIRE_AUTH !== "false";

function normalizeResumeSnapshot(input: unknown): ResumeSnapshot | null {
  if (!input || typeof input !== "object") return null;
  const data = input as Partial<ResumeSnapshot>;

  return {
    personalInfo: data.personalInfo ?? {
      name: "",
      email: "",
      phone: "",
      github: "",
      website: "",
      summary: "",
    },
    educationList: Array.isArray(data.educationList) ? data.educationList : [],
    workExperienceList: Array.isArray(data.workExperienceList) ? data.workExperienceList : [],
    projectExperienceList: Array.isArray(data.projectExperienceList) ? data.projectExperienceList : [],
    skillCategories: Array.isArray(data.skillCategories) ? data.skillCategories : [],
  };
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (AI_REQUIRE_AUTH && !user) {
    return createUnauthorizedResponse();
  }

  const rateResult = await rateLimit(request, {
    keyPrefix: "ai:resume",
    keySuffix: user?.userId,
    limit: AI_LIMIT,
    windowSeconds: AI_WINDOW_SECONDS,
  });

  if (!rateResult.allowed) {
    return NextResponse.json(
      { success: false, message: "请求过于频繁，请稍后再试" },
      { status: 429, headers: getRateLimitHeaders(rateResult) }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const action = normalizeString(body.action);
    const model = normalizeString(body.model) || "qwen-plus";
    const jdText = normalizeString(body.jdText);
    const resumeSnapshot = normalizeResumeSnapshot(body.resume);

    if (!action) {
      return NextResponse.json(
        { success: false, message: "action 是必填字段" },
        { status: 400 }
      );
    }

    if (!resumeSnapshot) {
      return NextResponse.json(
        { success: false, message: "resume 数据无效" },
        { status: 400 }
      );
    }

    if ((action === "keyword" || action === "optimize") && !jdText) {
      return NextResponse.json(
        { success: false, message: "JD 内容不能为空" },
        { status: 400 }
      );
    }

    let data: unknown;

    if (action === "keyword") {
      data = await analyzeKeywordMatch(model, jdText, resumeSnapshot);
    } else if (action === "highlights") {
      data = await extractHighlights(model, resumeSnapshot);
    } else if (action === "optimize") {
      data = await optimizeForJD(model, jdText, resumeSnapshot);
    } else {
      return NextResponse.json(
        { success: false, message: "action 不支持" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("AI resume error:", error);
    return NextResponse.json(
      { success: false, message: "AI 分析失败，请稍后重试" },
      { status: 500 }
    );
  }
}
