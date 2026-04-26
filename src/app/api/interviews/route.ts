import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/server/auth";
import prisma from "@/lib/server/prisma";
import { InterviewResult } from "@prisma/client";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return createUnauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    let where: Record<string, unknown> = {
      userId: user.userId,
    };

    if (jobId) {
      where.jobId = jobId;
    }

    const interviews = await prisma.interviewRecord.findMany({
      where,
      orderBy: [
        { date: "desc" },
        { time: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    console.error("Get interviews error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "获取面试记录失败",
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
      jobId,
      companyName,
      position,
      round,
      date,
      time,
      result,
      notes,
      interviewer,
    } = body;

    if (!round || !date) {
      return NextResponse.json(
        {
          success: false,
          message: "面试轮次和日期是必填字段",
        },
        { status: 400 }
      );
    }

    const validResults: InterviewResult[] = ["pending", "passed", "failed", "cancelled"];
    if (result && !validResults.includes(result as InterviewResult)) {
      return NextResponse.json(
        {
          success: false,
          message: "无效的结果值",
        },
        { status: 400 }
      );
    }

    const interview = await prisma.interviewRecord.create({
      data: {
        userId: user.userId,
        jobId: jobId ?? "",
        companyName: companyName ?? "",
        position: position ?? "",
        round,
        date,
        time: time ?? "",
        result: (result as InterviewResult) ?? "pending",
        notes: notes ?? "",
        interviewer: interviewer ?? "",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "面试记录已添加",
        data: interview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create interview error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "创建面试记录失败",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return createUnauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "面试记录 ID 是必填字段",
        },
        { status: 400 }
      );
    }

    const existingInterview = await prisma.interviewRecord.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existingInterview) {
      return NextResponse.json(
        {
          success: false,
          message: "面试记录不存在",
        },
        { status: 404 }
      );
    }

    const updatedInterview = await prisma.interviewRecord.update({
      where: {
        id,
      },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      message: "面试记录已更新",
      data: updatedInterview,
    });
  } catch (error) {
    console.error("Update interview error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "更新面试记录失败",
      },
      { status: 500 }
    );
  }
}
