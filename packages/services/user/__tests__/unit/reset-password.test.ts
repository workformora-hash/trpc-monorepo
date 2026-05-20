import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createPasswordResetToken, createUser } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import UserService from "../../auth.service";
import { db } from "@repo/database";

describe("UserService - Reset Password (Unit)", () => {
  let userService: UserService;
  let selectChain: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    userService = new UserService();
  });

  it("should successfully reset password with a valid token", async () => {
    const mockTokenRecord = createPasswordResetToken({
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
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
      }),
    };
    vi.mocked(db.transaction).mockImplementation((callback) => callback(mockTx as any));

    const result = await userService.resetPassword({ token: "valid-token", password: "NewPassword123!" });
    expect(result.success).toBe(true);
    expect(db.transaction).toHaveBeenCalled();
    expect(mockTx.update).toHaveBeenCalled();
    expect(mockTx.delete).toHaveBeenCalled(); // Should invalidate concurrent sessions
  });

  it("should fail password reset with an invalid or expired token", async () => {
    selectChain.limit.mockResolvedValueOnce([]); // token not found or expired

    await expect(
      userService.resetPassword({ token: "invalid-token", password: "NewPassword123!" })
    ).rejects.toThrow(/Invalid or expired password reset token/);
  });

  it("should fail password reset if the token is already used", async () => {
    // In the real database, the query filters by `isUsed = false`.
    // So an already used reset token will not be returned by the select query at all.
    selectChain.limit.mockResolvedValueOnce([]); // simulates token not found/expired

    await expect(
      userService.resetPassword({ token: "already-used-token", password: "NewPassword123!" })
    ).rejects.toThrow(/Invalid or expired password reset token/);
  });
});
