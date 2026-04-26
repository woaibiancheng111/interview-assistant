import { NextRequest, NextResponse } from "next/server";
import { getTokenFromAuthorizationHeader } from "@/lib/server/jwt";
import { safeRedisOperation } from "@/lib/server/redis";

const JWT_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = getTokenFromAuthorizationHeader(authHeader);

    if (token) {
      await safeRedisOperation(
        (client) =>
          client.setex(
            `blacklist:${token}`,
            JWT_EXPIRES_IN_SECONDS,
            "true"
          ),
        "OK" as const
      );
    }

    return NextResponse.json({
      success: true,
      message: "已登出",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "登出失败，请稍后重试",
      },
      { status: 500 }
    );
  }
}
