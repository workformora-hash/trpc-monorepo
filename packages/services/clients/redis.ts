import Redis from "ioredis";

class RedisClient {
  private client: Redis | null = null;
  private isConnected = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

    // Only attempt connection if REDIS_URL or default local host is intended
    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          // Retry at most 3 times, then stop to avoid bottlenecking
          if (times > 3) return null;
          return Math.min(times * 100, 2000);
        },
      });

      this.client.on("connect", () => {
        this.isConnected = true;
        console.log("[REDIS] Successfully connected to memory store server.");
      });

      this.client.on("error", (err) => {
        this.isConnected = false;
        console.warn("[REDIS] Connection error or offline. Falling back to direct database query mode.", err.message);
      });
    } catch (err: any) {
      console.warn("[REDIS] Initialization failed. Running in direct database fallback mode.", err.message);
      this.client = null;
    }
  }

  /**
   * Retrieves deserialized object from cache
   */
  public async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err: any) {
      console.error(`[REDIS] GET failed for key "${key}":`, err.message);
      return null;
    }
  }

  /**
   * Caches serialized object
   */
  public async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      const serialized = JSON.stringify(value);
      await this.client.set(key, serialized, "EX", ttlSeconds);
    } catch (err: any) {
      console.error(`[REDIS] SET failed for key "${key}":`, err.message);
    }
  }

  /**
   * Deletes cached keys
   */
  public async del(key: string): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (err: any) {
      console.error(`[REDIS] DEL failed for key "${key}":`, err.message);
    }
  }

  /**
   * Sliding window rate limiting using Redis Sorted Sets (ZSET)
   * If Redis is down, we fail open (success: true) to prevent locking out users (production best-practice).
   */
  public async rateLimit(
    ip: string,
    key: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> {
    const defaultResponse = { success: true, limit, remaining: limit, resetTime: Date.now() + windowSeconds * 1000 };
    if (!this.client || !this.isConnected) return defaultResponse;

    const redisKey = `rate_limit:${ip}:${key}`;
    const now = Date.now();
    const clearBefore = now - windowSeconds * 1000;

    try {
      // Use multi transaction to perform atomic updates
      const multi = this.client.multi();
      multi.zremrangebyscore(redisKey, 0, clearBefore);
      multi.zcard(redisKey);
      multi.zadd(redisKey, now, String(now));
      multi.expire(redisKey, windowSeconds);

      const results = await multi.exec();
      if (!results || !results[1]) return defaultResponse;
      const countPair = results[1];
      if (!countPair || countPair[1] === undefined || countPair[1] === null) return defaultResponse;
      const currentCount = countPair[1] as number;

      if (currentCount >= limit) {
        // Over limit, delete the newly added score to keep ZSET accurate
        await this.client.zrem(redisKey, String(now));
        
        // Find the oldest request time to compute exact reset time
        const oldestArray = await this.client.zrange(redisKey, 0, 0, "WITHSCORES");
        const oldestTime = oldestArray.length > 1 ? parseInt(oldestArray[1]!) : now;
        const resetTime = oldestTime + windowSeconds * 1000;

        return {
          success: false,
          limit,
          remaining: 0,
          resetTime,
        };
      }

      return {
        success: true,
        limit,
        remaining: limit - currentCount - 1,
        resetTime: now + windowSeconds * 1000,
      };
    } catch (err: any) {
      console.error(`[REDIS] Rate limiting failed for key "${redisKey}":`, err.message);
      return defaultResponse;
    }
  }

  public isReady(): boolean {
    return this.client !== null && this.isConnected;
  }

  /**
   * Helper to invalidate form key
   */
  public async invalidateForm(slug: string): Promise<void> {
    await this.del(`form:slug:${slug}`);
  }
}

export const redis = new RedisClient();
