import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { redis } from "../../../clients/redis";

describe("Redis - Sliding Window Rate Limiter (Unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockDb();
  });

  it("should fail open gracefully when Redis client is not initialized or offline", async () => {
    // Force isReady to be false by mocking its return value
    vi.spyOn(redis, "isReady").mockReturnValue(false);

    const result = await redis.rateLimit("192.168.1.1", "test_action", 5, 60);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(5);
  });

  it("should enforce limits correctly under active Redis connections", async () => {
    // Force isReady to be true and mock multi transactions to mimic normal behavior
    vi.spyOn(redis, "isReady").mockReturnValue(true);

    const mockMulti = {
      zremrangebyscore: vi.fn().mockReturnThis(),
      zcard: vi.fn().mockReturnThis(),
      zadd: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([[null, 0], [null, 2], [null, 1], [null, true]]),
    };

    // Mock internal Redis client
    (redis as any).client = {
      multi: () => mockMulti,
      zrem: vi.fn().mockResolvedValue(1),
      zrange: vi.fn().mockResolvedValue([]),
    };
    (redis as any).isConnected = true;

    // First request should be successful since currentCount is 2 (under limit of 5)
    const result = await redis.rateLimit("192.168.1.1", "test_action", 5, 60);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2); // 5 - 2 - 1 = 2
  });

  it("should block request when sliding window limit is exceeded", async () => {
    vi.spyOn(redis, "isReady").mockReturnValue(true);

    const mockMulti = {
      zremrangebyscore: vi.fn().mockReturnThis(),
      zcard: vi.fn().mockReturnThis(),
      zadd: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([[null, 0], [null, 6], [null, 1], [null, true]]), // 6 requests > 5 limit
    };

    (redis as any).client = {
      multi: () => mockMulti,
      zrem: vi.fn().mockResolvedValue(1),
      zrange: vi.fn().mockResolvedValue(["member", String(Date.now() - 30000)]), // oldest score 30 seconds ago
    };
    (redis as any).isConnected = true;

    const result = await redis.rateLimit("192.168.1.1", "test_action", 5, 60);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });
});
