import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createEmailVerificationToken, createUser } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import UserService from "../../auth.service";
import { db } from "@repo/database";

describe("UserService - Verify Email (Unit)", () => {
  let userService: UserService;
  let selectChain: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    userService = new UserService();
  });

  it("should successfully verify an email address with a valid token", async () => {
    const mockTokenRecord = createEmailVerificationToken({
      id: "token-id",
      userId: "user-id",
      isUsed: false,
      expiresAt: new Date(Date.now() + 3600000),
    });

    selectChain.limit
      .mockResolvedValueOnce([mockTokenRecord])
      .mockResolvedValueOnce([createUser({ id: "user-id" })]);

    const mockTx = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
      }),
    };
    vi.mocked(db.transaction).mockImplementation((callback) => callback(mockTx as any));

    const result = await userService.verifyEmail("valid-token");
    expect(result.success).toBe(true);
    expect(db.transaction).toHaveBeenCalled();
    expect(mockTx.update).toHaveBeenCalled();
  });

  it("should fail email verification with an invalid or expired token", async () => {
    selectChain.limit.mockResolvedValueOnce([]); // token not found or expired

    await expect(
      userService.verifyEmail("invalid-token")
    ).rejects.toThrow(/Invalid or expired token/);
  });

  it("should fail email verification if the verification token has already been used", async () => {
    // In the real database, the query filters by `isUsed = false`.
    // So an already used verification token will not be returned by the select query.
    selectChain.limit.mockResolvedValueOnce([]); // simulates token not found/expired

    await expect(
      userService.verifyEmail("already-used-token")
    ).rejects.toThrow(/Invalid or expired token/);
  });

  it("should return success and skip email sending if the user is already verified", async () => {
    selectChain.limit.mockResolvedValueOnce([
      createUser({ id: "user-id", email: "verified@example.com", isEmailVerified: true }),
    ]);

    const result = await userService.resendVerificationEmail("verified@example.com");
    expect(result).toEqual({ success: true });
    expect(db.insert).not.toHaveBeenCalled(); // Should not create a new verification token row
  });

  it("should enforce cooldown block if verification email was requested within 60 seconds", async () => {
    const recentRequest = new Date(Date.now() - 30 * 1000);

    selectChain.limit
      .mockResolvedValueOnce([createUser({ id: "user-id", email: "alice@example.com", isEmailVerified: false })])
      .mockResolvedValueOnce([createEmailVerificationToken({ id: "token-id", createdAt: recentRequest })]);

    await expect(
      userService.resendVerificationEmail("alice@example.com")
    ).rejects.toThrow(/wait at least 60 seconds/);
  });

  it("should return silent success for verification resends if user does not exist", async () => {
    selectChain.limit.mockResolvedValueOnce([]);

    const result = await userService.resendVerificationEmail("nonexistent@example.com");
    expect(result).toEqual({ success: true });
  });
});
