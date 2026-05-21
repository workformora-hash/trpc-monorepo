import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createForm } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import FormService from "../../index";
import { redis } from "../../../clients/redis";

// Mock the Redis client methods
vi.mock("../../../clients/redis", () => {
  const store = new Map<string, string>();
  return {
    redis: {
      get: vi.fn(async (key: string) => {
        const val = store.get(key);
        return val ? JSON.parse(val) : null;
      }),
      set: vi.fn(async (key: string, value: any) => {
        store.set(key, JSON.stringify(value));
      }),
      del: vi.fn(async (key: string) => {
        store.delete(key);
      }),
      invalidateForm: vi.fn(async (slug: string) => {
        store.delete(`form:slug:${slug}`);
      }),
    },
  };
});

describe("FormService - Resilient Redis Caching (Unit)", () => {
  let formService: FormService;
  let selectChain: any;

  const mockFormId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const mockForm = createForm({
    id: mockFormId,
    userId: "user-123",
    title: "Cache Form",
    slug: "cache-form",
    isPublished: true,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    formService = new FormService();
  });

  it("should return cached result on Redis cache hit without querying database", async () => {
    const cachedPayload = {
      form: mockForm,
      fields: [],
      isPasswordProtected: false,
    };

    // Prime the mock cache
    await redis.set("form:slug:cache-form", cachedPayload);
    vi.mocked(redis.get).mockResolvedValueOnce(cachedPayload);

    const result = await formService.getFormBySlugPublic({ slug: "cache-form" });

    expect(result.form.title).toBe("Cache Form");
    expect(redis.get).toHaveBeenCalledWith("form:slug:cache-form");
    // Verify database was NOT queried
    expect(selectChain.from).not.toHaveBeenCalled();
  });

  it("should query database and write to Redis on cache miss", async () => {
    vi.mocked(redis.get).mockResolvedValueOnce(null); // Cache miss

    selectChain.then
      .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled)) // form check
      .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled)); // fields list

    const result = await formService.getFormBySlugPublic({ slug: "cache-form" });

    expect(result.form.title).toBe("Cache Form");
    expect(redis.get).toHaveBeenCalledWith("form:slug:cache-form");
    expect(redis.set).toHaveBeenCalledWith(
      "form:slug:cache-form",
      expect.objectContaining({ isPasswordProtected: false }),
      300
    );
  });
});
