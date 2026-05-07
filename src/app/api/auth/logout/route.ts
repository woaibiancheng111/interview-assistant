import { NextRequest, NextResponse } from "next/server";
import { getTokenFromAuthorizationHeader } from "@/lib/server/jwt";
import { safeRedisOperation } from "@/lib/server/redis";
import { getJwtExpiresInSeconds } from "@/lib/server/jwt";

const JWT_EXPIRES_IN_SECONDS = getJwtExpiresInSeconds();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const cookieToken = request.cookies.get("auth_token")?.value;
    const token = cookieToken ?? getTokenFromAuthorizationHeader(authHeader);

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

    const response = NextResponse.json({
      success: true,
      message: "已登出",
    });

    response.cookies.set({
      name: "auth_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
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
