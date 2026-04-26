import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/server/auth";
import prisma from "@/lib/server/prisma";
import { QuestionStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return createUnauthorizedResponse();
  }

  try {
    const records = await prisma.answerRecord.findMany({
      where: {
        userId: user.userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error("Get answer records error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "获取答题记录失败",
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
    const { questionId, status, note } = body;

    if (!questionId) {
      return NextResponse.json(
        {
          success: false,
          message: "questionId 是必填字段",
        },
        { status: 400 }
      );
    }

    const validStatuses: QuestionStatus[] = ["none", "completed", "review"];
    if (status && !validStatuses.includes(status as QuestionStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "无效的状态值",
        },
        { status: 400 }
      );
    }

    const existingRecord = await prisma.answerRecord.findUnique({
      where: {
        userId_questionId: {
          userId: user.userId,
          questionId,
        },
      },
    });

    if (existingRecord) {
      const updatedRecord = await prisma.answerRecord.update({
        where: {
          id: existingRecord.id,
        },
        data: {
          status: (status as QuestionStatus) ?? existingRecord.status,
          note: note ?? existingRecord.note,
        },
      });

      return NextResponse.json({
        success: true,
        message: "答题记录已更新",
        data: updatedRecord,
      });
    } else {
      const newRecord = await prisma.answerRecord.create({
        data: {
          userId: user.userId,
          questionId,
          status: (status as QuestionStatus) ?? "none",
          note: note ?? "",
        },
      });

      return NextResponse.json({
        success: true,
        message: "答题记录已创建",
        data: newRecord,
      });
    }
  } catch (error) {
    console.error("Update answer record error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "更新答题记录失败",
      },
      { status: 500 }
    );
  }
}
