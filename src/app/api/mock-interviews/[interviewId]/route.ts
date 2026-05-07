import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/server/auth";
import prisma from "@/lib/server/prisma";
import type { MockInterview } from "@prisma/client";

function parseSuggestions(suggestions: string): string[] {
  try {
    return JSON.parse(suggestions);
  } catch {
    return [];
  }
}

function formatInterview(interview: MockInterview) {
  return {
    ...interview,
    suggestions: parseSuggestions(interview.suggestions),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return createUnauthorizedResponse();
  }

  const resolvedParams = await params;
  const interviewId = resolvedParams.interviewId;

  try {
    const interview = await prisma.mockInterview.findFirst({
      where: {
        id: interviewId,
        userId: user.userId,
      },
    });

    if (!interview) {
      return NextResponse.json(
        {
          success: false,
          message: "模拟面试记录不存在",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: formatInterview(interview),
    });
  } catch (error) {
    console.error("Get mock interview error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "获取模拟面试记录失败",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return createUnauthorizedResponse();
  }

  const resolvedParams = await params;
  const interviewId = resolvedParams.interviewId;

  try {
    const existingInterview = await prisma.mockInterview.findFirst({
      where: {
        id: interviewId,
        userId: user.userId,
      },
    });

    if (!existingInterview) {
      return NextResponse.json(
        {
          success: false,
          message: "模拟面试记录不存在",
        },
        { status: 404 }
      );
    }

    await prisma.mockInterview.delete({
      where: {
        id: interviewId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "模拟面试记录已删除",
    });
  } catch (error) {
    console.error("Delete mock interview error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "删除模拟面试记录失败",
      },
      { status: 500 }
    );
  }
}
