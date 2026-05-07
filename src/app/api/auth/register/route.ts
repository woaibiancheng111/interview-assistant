import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/server/prisma";
import { rateLimit, getRateLimitHeaders } from "@/lib/server/rate-limit";
import { normalizeString, isValidEmail, isStrongEnoughPassword } from "@/lib/server/validation";

const REGISTER_LIMIT = Number.parseInt(process.env.RATE_LIMIT_REGISTER || "3", 10);
const REGISTER_WINDOW_SECONDS = Number.parseInt(
  process.env.RATE_LIMIT_REGISTER_WINDOW || "300",
  10
);

export async function POST(request: NextRequest) {
  try {
    const rateResult = await rateLimit(request, {
      keyPrefix: "auth:register",
      limit: REGISTER_LIMIT,
      windowSeconds: REGISTER_WINDOW_SECONDS,
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
    const email = normalizeString(body.email);
    const password = normalizeString(body.password);

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "请填写所有必填字段",
        },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "用户名至少需要 3 个字符",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "邮箱格式不正确",
        },
        { status: 400 }
      );
    }

    if (!isStrongEnoughPassword(password, 6)) {
      return NextResponse.json(
        {
          success: false,
          message: "密码至少需要 6 个字符",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json(
          {
            success: false,
            message: "用户名已被使用",
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: "邮箱已被使用",
        },
        { status: 400 }
      );
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "注册成功",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "注册失败，请稍后重试",
      },
      { status: 500 }
    );
  }
}
