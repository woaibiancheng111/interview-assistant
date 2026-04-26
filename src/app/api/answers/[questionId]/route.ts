import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/server/auth";
import prisma from "@/lib/server/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return createUnauthorizedResponse();
  }

  const resolvedParams = await params;
  const questionId = resolvedParams.questionId;

  try {
    const record = await prisma.answerRecord.findUnique({
      where: {
        userId_questionId: {
          userId: user.userId,
          questionId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("Get answer record error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "获取答题记录失败",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return createUnauthorizedResponse();
  }

  const resolvedParams = await params;
  const questionId = resolvedParams.questionId;

  try {
    const existingRecord = await prisma.answerRecord.findUnique({
      where: {
        userId_questionId: {
          userId: user.userId,
          questionId,
        },
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        {
          success: false,
          message: "答题记录不存在",
        },
        { status: 404 }
      );
    }

    await prisma.answerRecord.delete({
      where: {
        id: existingRecord.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "答题记录已删除",
    });
  } catch (error) {
    console.error("Delete answer record error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "删除答题记录失败",
      },
      { status: 500 }
    );
  }
}
