import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/server/auth";
import prisma from "@/lib/server/prisma";

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
    const interview = await prisma.interviewRecord.findFirst({
      where: {
        id: interviewId,
        userId: user.userId,
      },
    });

    if (!interview) {
      return NextResponse.json(
        {
          success: false,
          message: "面试记录不存在",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error("Get interview error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "获取面试记录失败",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const body = await request.json();
    const { ...updates } = body;

    const existingInterview = await prisma.interviewRecord.findFirst({
      where: {
        id: interviewId,
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
        id: interviewId,
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
    const existingInterview = await prisma.interviewRecord.findFirst({
      where: {
        id: interviewId,
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

    await prisma.interviewRecord.delete({
      where: {
        id: interviewId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "面试记录已删除",
    });
  } catch (error) {
    console.error("Delete interview error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "删除面试记录失败",
      },
      { status: 500 }
    );
  }
}
