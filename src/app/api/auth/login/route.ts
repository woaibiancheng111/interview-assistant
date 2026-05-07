import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/server/prisma";
import { generateToken, getJwtExpiresInSeconds } from "@/lib/server/jwt";
import { rateLimit, getRateLimitHeaders } from "@/lib/server/rate-limit";
import { normalizeString } from "@/lib/server/validation";

const LOGIN_LIMIT = Number.parseInt(process.env.RATE_LIMIT_LOGIN || "5", 10);
const LOGIN_WINDOW_SECONDS = Number.parseInt(
  process.env.RATE_LIMIT_LOGIN_WINDOW || "60",
  10
);

export async function POST(request: NextRequest) {
  try {
    const rateResult = await rateLimit(request, {
      keyPrefix: "auth:login",
      limit: LOGIN_LIMIT,
      windowSeconds: LOGIN_WINDOW_SECONDS,
    });

    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "请求过于频繁，请稍后再试",
        },
        { status: 429, headers: getRateLimitHeaders(rateResult) }
      );
    }

    const body = await request.json().catch(() => ({}));
    const username = normalizeString(body.username);
    const password = normalizeString(body.password);

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "请填写用户名和密码",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "用户名或密码错误",
        },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "用户名或密码错误",
        },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      message: "登录成功",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getJwtExpiresInSeconds(),
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "登录失败，请稍后重试",
      },
      { status: 500 }
    );
  }
}
