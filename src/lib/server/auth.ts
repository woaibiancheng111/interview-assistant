import { NextRequest } from "next/server";
import { verifyToken, getTokenFromAuthorizationHeader } from "./jwt";
import { redisClient } from "./redis";

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get("Authorization");
  const token = getTokenFromAuthorizationHeader(authHeader);
  
  if (!token) {
    return null;
  }

  const isBlacklisted = await redisClient.get(`blacklist:${token}`);
  if (isBlacklisted) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    username: payload.username,
    email: payload.email,
  };
}

export function createUnauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({
      success: false,
      message: "Unauthorized",
    }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
