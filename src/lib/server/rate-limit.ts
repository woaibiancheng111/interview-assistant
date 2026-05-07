import { NextRequest } from "next/server";
import { safeRedisOperation } from "./redis";

export interface RateLimitOptions {
  keyPrefix: string;
  limit: number;
  windowSeconds: number;
  keySuffix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter: number;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}

export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const keySuffix = options.keySuffix ?? getClientIp(request);
  const key = `${options.keyPrefix}:${keySuffix}`;

  const result = await safeRedisOperation(async (client) => {
    const current = await client.incr(key);
    if (current === 1) {
      await client.expire(key, options.windowSeconds);
    }
    const ttl = await client.ttl(key);
    return { current, ttl };
  }, null as { current: number; ttl: number } | null);

  if (!result) {
    return {
      allowed: true,
      limit: options.limit,
      remaining: options.limit,
      reset: options.windowSeconds,
      retryAfter: 0,
    };
  }

  const remaining = Math.max(0, options.limit - result.current);
  const reset = result.ttl > 0 ? result.ttl : options.windowSeconds;
  const allowed = result.current <= options.limit;

  return {
    allowed,
    limit: options.limit,
    remaining,
    reset,
    retryAfter: allowed ? 0 : reset,
  };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
    ...(result.retryAfter > 0 ? { "Retry-After": result.retryAfter.toString() } : {}),
  };
}
