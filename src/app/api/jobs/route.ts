import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/server/auth";
import prisma from "@/lib/server/prisma";
import { JobStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return createUnauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as JobStatus | null;
    const search = searchParams.get("search");

    let where: Record<string, unknown> = {
      userId: user.userId,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { position: { contains: search } },
        { location: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    const jobs = await prisma.jobApplication.findMany({
      where,
      orderBy: {
        lastUpdated: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "获取岗位列表失败",
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
      companyName,
      position,
      status,
      salary,
      location,
      jobUrl,
      notes,
      appliedDate,
    } = body;

    if (!companyName || !position) {
      return NextResponse.json(
        {
          success: false,
          message: "公司名称和职位是必填字段",
        },
        { status: 400 }
      );
    }

    const validStatuses: JobStatus[] = ["applied", "interviewing", "offered", "rejected"];
    if (status && !validStatuses.includes(status as JobStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "无效的状态值",
        },
        { status: 400 }
      );
    }

    const job = await prisma.jobApplication.create({
      data: {
        userId: user.userId,
        companyName,
        position,
        status: (status as JobStatus) ?? "applied",
        salary: salary ?? "",
        location: location ?? "",
        jobUrl: jobUrl ?? "",
        notes: notes ?? "",
        appliedDate: appliedDate ?? new Date().toISOString().split("T")[0],
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "岗位已添加",
        data: job,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "创建岗位失败",
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
          message: "岗位 ID 是必填字段",
        },
        { status: 400 }
      );
    }

    const existingJob = await prisma.jobApplication.findFirst({
      where: {
        id,
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
        id,
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
