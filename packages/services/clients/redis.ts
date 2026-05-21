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
   * Helper to invalidate form key
   */
  public async invalidateForm(slug: string): Promise<void> {
    await this.del(`form:slug:${slug}`);
  }
}

export const redis = new RedisClient();
