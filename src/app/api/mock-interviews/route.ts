import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/server/auth";
import prisma from "@/lib/server/prisma";
import { InterviewType } from "@prisma/client";

function parseSuggestions(suggestions: string): string[] {
  try {
    return JSON.parse(suggestions);
  } catch {
    return [];
  }
}

function formatInterview(interview: any) {
  return {
    ...interview,
    suggestions: parseSuggestions(interview.suggestions),
  };
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return createUnauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as InterviewType | null;
    const limit = searchParams.get("limit");

    let where: Record<string, unknown> = {
      userId: user.userId,
    };

    if (type) {
      where.type = type;
    }

    const interviews = await prisma.mockInterview.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit ? parseInt(limit) : undefined,
    });

    const formattedInterviews = interviews.map(formatInterview);

    return NextResponse.json({
      success: true,
      data: formattedInterviews,
    });
  } catch (error) {
    console.error("Get mock interviews error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "获取模拟面试历史失败",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return createUnauthorizedResponse();
  }

  try {
    const body = await request.json();
    const {
      type,
      typeLabel,
      startTime,
      endTime,
      duration,
      overallScore,
      maxScore,
      questionCount,
      summary,
      suggestions,
    } = body;

    if (!type || !startTime || !endTime) {
      return NextResponse.json(
        {
          success: false,
          message: "面试类型、开始时间和结束时间是必填字段",
        },
        { status: 400 }
      );
    }

    const validTypes: InterviewType[] = ["technical", "hr", "behavioral"];
    if (!validTypes.includes(type as InterviewType)) {
      return NextResponse.json(
        {
          success: false,
          message: "无效的面试类型",
        },
        { status: 400 }
      );
    }

    const interview = await prisma.mockInterview.create({
      data: {
        userId: user.userId,
        type: type as InterviewType,
        typeLabel: typeLabel ?? "",
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: duration ?? 0,
        overallScore: overallScore ?? 0,
        maxScore: maxScore ?? 100,
        questionCount: questionCount ?? 0,
        summary: summary ?? "",
        suggestions: JSON.stringify(suggestions ?? []),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "模拟面试记录已保存",
        data: formatInterview(interview),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create mock interview error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "保存模拟面试记录失败",
      },
      { status: 500 }
    );
  }
}
