import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/server/auth";
import prisma from "@/lib/server/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return createUnauthorizedResponse();
  }

  const resolvedParams = await params;
  const jobId = resolvedParams.jobId;

  try {
    const job = await prisma.jobApplication.findFirst({
      where: {
        id: jobId,
        userId: user.userId,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          message: "岗位不存在",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "获取岗位详情失败",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return createUnauthorizedResponse();
  }

  const resolvedParams = await params;
  const jobId = resolvedParams.jobId;

  try {
    const body = await request.json();
    const { ...updates } = body;

    const existingJob = await prisma.jobApplication.findFirst({
      where: {
        id: jobId,
        userId: user.userId,
      },
    });

    if (!existingJob) {
      return NextResponse.json(
        {
          success: false,
          message: "岗位不存在",
        },
        { status: 404 }
      );
    }

    const updatedJob = await prisma.jobApplication.update({
      where: {
        id: jobId,
      },
      data: {
        ...updates,
        lastUpdated: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "岗位已更新",
      data: updatedJob,
    });
  } catch (error) {
    console.error("Update job error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "更新岗位失败",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return createUnauthorizedResponse();
  }

  const resolvedParams = await params;
  const jobId = resolvedParams.jobId;

  try {
    const existingJob = await prisma.jobApplication.findFirst({
      where: {
        id: jobId,
        userId: user.userId,
      },
    });

    if (!existingJob) {
      return NextResponse.json(
        {
          success: false,
          message: "岗位不存在",
        },
        { status: 404 }
      );
    }

    await prisma.jobApplication.delete({
      where: {
        id: jobId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "岗位已删除",
    });
  } catch (error) {
    console.error("Delete job error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "删除岗位失败",
      },
      { status: 500 }
    );
  }
}
