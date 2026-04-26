import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(REDIS_URL);
    
    redis.on("connect", () => {
      console.log("Redis connected successfully");
    });
    
    redis.on("error", (err) => {
      console.error("Redis connection error:", err);
    });
  }
  return redis;
}

export const redisClient = getRedis();
