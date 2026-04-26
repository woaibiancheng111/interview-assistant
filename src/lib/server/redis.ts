import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redis: Redis | null = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

export async function getRedis(): Promise<Redis | null> {
  if (redis) {
    return redis;
  }

  if (isInitializing && initPromise) {
    await initPromise;
    return redis;
  }

  isInitializing = true;
  initPromise = new Promise<void>((resolve) => {
    try {
      const client = new Redis(REDIS_URL, {
        enableOfflineQueue: false,
        lazyConnect: true,
        connectTimeout: 5000,
        commandTimeout: 3000,
      });

      client.on("connect", () => {
        console.log("Redis connected successfully");
      });

      client.on("error", (err) => {
        console.warn("Redis connection warning:", err.message);
      });

      client.on("ready", () => {
        redis = client;
        resolve();
      });

      client.connect().catch((err) => {
        console.error("Failed to connect to Redis:", err.message);
        redis = null;
        resolve();
      });
    } catch (err) {
      console.error("Redis initialization failed:", err);
      redis = null;
      resolve();
    }
  });

  await initPromise;
  isInitializing = false;
  return redis;
}

export async function getRedisClient(): Promise<Redis | null> {
  return getRedis();
}

export async function safeRedisOperation<T>(
  operation: (client: Redis) => Promise<T>,
  fallback: T
): Promise<T> {
  const client = await getRedis();
  if (!client) {
    return fallback;
  }

  try {
    return await operation(client);
  } catch (err) {
    console.warn("Redis operation failed:", err);
    return fallback;
  }
}
