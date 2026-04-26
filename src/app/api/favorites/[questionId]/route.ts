import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/server/auth";
import prisma from "@/lib/server/prisma";

export async function POST(
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
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_questionId: {
          userId: user.userId,
          questionId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "已取消收藏",
        data: { isFavorite: false },
      });
    } else {
      await prisma.favorite.create({
        data: {
          userId: user.userId,
          questionId,
        },
      });

      return NextResponse.json({
        success: true,
        message: "已添加收藏",
        data: { isFavorite: true },
      });
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "操作收藏失败",
      },
      { status: 500 }
    );
  }
}

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
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_questionId: {
          userId: user.userId,
          questionId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        isFavorite: !!favorite,
      },
    });
  } catch (error) {
    console.error("Check favorite error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "检查收藏状态失败",
      },
      { status: 500 }
    );
  }
}
