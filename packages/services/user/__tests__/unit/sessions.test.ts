import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createUser, createSession, createCredentials } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import UserService from "../../auth.service";
import bcrypt from "bcryptjs";
import { db } from "@repo/database";

describe("UserService - Sessions (Unit)", () => {
  let userService: UserService;
  let selectChain: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    userService = new UserService();
  });

  it("should fetch all active unexpired sessions for the user and flag the current session", async () => {
    const mockCurrentSession = createSession({
      id: "active-session-id",
      userId: "user-id",
      tokenHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // sha256 of empty token ""
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0",
      metadata: { os: "Windows", browser: "Chrome", deviceType: "desktop" },
      expiresAt: new Date(Date.now() + 1000 * 3600),
    });

    const mockOtherSession = createSession({
      id: "other-session-id",
      userId: "user-id",
      tokenHash: "other-hash",
      ipAddress: "192.168.1.1",
      userAgent: "Safari",
      metadata: { os: "iOS", browser: "Safari", deviceType: "mobile" },
      expiresAt: new Date(Date.now() + 1000 * 3600),
    });

    selectChain.limit.mockResolvedValueOnce([mockCurrentSession]);
    selectChain.orderBy.mockResolvedValueOnce([mockCurrentSession, mockOtherSession]);

    const result = await userService.getActiveSessions("");

    expect(result.sessions).toHaveLength(2);
    expect(result.sessions![0]!.id).toBe("active-session-id");
    expect(result.sessions![0]!.isCurrent).toBe(true);
    expect(result.sessions![1]!.id).toBe("other-session-id");
    expect(result.sessions![1]!.isCurrent).toBe(false);
  });

  it("should revoke a session by ID if it belongs to the user", async () => {
    const mockCurrentSession = createSession({
      id: "active-session-id",
      userId: "user-id",
      tokenHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    });

    const mockRevokedSession = createSession({
      id: "session-to-revoke-id",
      userId: "user-id",
      tokenHash: "revoked-hash",
    });

    selectChain.limit
      .mockResolvedValueOnce([mockCurrentSession])
      .mockResolvedValueOnce([mockRevokedSession]);

    const result = await userService.revokeSessionById("", "session-to-revoke-id");

    expect(result.success).toBe(true);
    expect(result.isCurrent).toBe(false);
    expect(db.delete).toHaveBeenCalled();
  });

  it("should reject revoking a session that belongs to a different user", async () => {
    const mockCurrentSession = createSession({
      id: "active-session-id",
      userId: "user-id",
      tokenHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    });

    const mockDifferentUserSession = createSession({
      id: "other-user-session-id",
      userId: "attacker-user-id", // different user owner
      tokenHash: "other-hash",
    });

    selectChain.limit
      .mockResolvedValueOnce([mockCurrentSession])
      .mockResolvedValueOnce([]); // simulates database query returning no session (due to different userId filter)

    await expect(
      userService.revokeSessionById("", "other-user-session-id")
    ).rejects.toThrow(/Session not found or unauthorized/);

    expect(db.delete).not.toHaveBeenCalled();
  });

  it("should allow a logged-in user to change their password", async () => {
    const mockCurrentSession = createSession({
      id: "active-session-id",
      userId: "user-id",
      tokenHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    });

    const currentPasswordHash = await bcrypt.hash("current-password", 10);
    const mockCredentials = createCredentials({
      id: "cred-id",
      userId: "user-id",
      passwordHash: currentPasswordHash,
    });

    selectChain.limit
      .mockResolvedValueOnce([mockCurrentSession])
      .mockResolvedValueOnce([mockCredentials]);

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

    const result = await userService.changePassword("", {
      currentPassword: "current-password",
      newPassword: "NewSecurePassword123!",
    });

    expect(result.success).toBe(true);
    expect(db.transaction).toHaveBeenCalled();
    expect(mockTx.update).toHaveBeenCalled();
    expect(mockTx.delete).toHaveBeenCalled(); // Should revoke other sessions
  });

  it("should reject password change if current password is incorrect", async () => {
    const mockCurrentSession = createSession({
      id: "active-session-id",
      userId: "user-id",
      tokenHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    });

    const currentPasswordHash = await bcrypt.hash("correct-password", 10);
    const mockCredentials = createCredentials({
      id: "cred-id",
      userId: "user-id",
      passwordHash: currentPasswordHash,
    });

    selectChain.limit
      .mockResolvedValueOnce([mockCurrentSession])
      .mockResolvedValueOnce([mockCredentials]);

    await expect(
      userService.changePassword("", {
        currentPassword: "wrong-password",
        newPassword: "NewSecurePassword123!",
      })
    ).rejects.toThrow("Incorrect current password");

    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("should validate password strength rules during password change", async () => {
    const mockCurrentSession = createSession({
      id: "active-session-id",
      userId: "user-id",
      tokenHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    });

    const currentPasswordHash = await bcrypt.hash("current-password", 10);
    const mockCredentials = createCredentials({
      id: "cred-id",
      userId: "user-id",
      passwordHash: currentPasswordHash,
    });

    selectChain.limit
      .mockResolvedValueOnce([mockCurrentSession])
      .mockResolvedValueOnce([mockCredentials]);

    await expect(
      userService.changePassword("", {
        currentPassword: "current-password",
        newPassword: "weakpassword", // weak password (longer than 8 chars, but misses uppercase/digit/special)
      })
    ).rejects.toThrow(/Password must contain at least one uppercase letter/);

    expect(db.transaction).not.toHaveBeenCalled();
  });
});
