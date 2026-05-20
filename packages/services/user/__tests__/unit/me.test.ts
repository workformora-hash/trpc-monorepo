import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createUser, createSession } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import UserService from "../../auth.service";
import { db } from "@repo/database";

describe("UserService - Profile & Me (Unit)", () => {
  let userService: UserService;
  let selectChain: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    userService = new UserService();
  });

  it("should successfully retrieve the current user for a valid unexpired session", async () => {
    const mockSession = createSession({
      id: "session-id",
      userId: "user-id",
      expiresAt: new Date(Date.now() + 3600000),
    });

    const mockUser = createUser({
      id: "user-id",
      name: "Test User",
      email: "test@example.com",
      role: "user",
    });

    // Mock innerJoin select structure
    selectChain.limit.mockResolvedValueOnce([{
      session: mockSession,
      user: mockUser,
    }]);

    const result = await userService.getCurrentUser("valid-token", {
      userAgent: "Mozilla/5.0 (Windows NT)",
    });

    expect(result).not.toBeNull();
    expect(result?.user.id).toBe("user-id");
  });

  it("should return null if the session token is invalid or does not exist", async () => {
    selectChain.limit.mockResolvedValueOnce([]); // no session found

    const result = await userService.getCurrentUser("invalid-token", {
      userAgent: "Mozilla/5.0",
    });

    expect(result).toBeNull();
  });

  it("should throttle session activity updates to prevent excessive database writes", async () => {
    const recentLastActive = new Date(Date.now() - 30 * 1000); // 30 seconds ago (< 60s throttle limit)
    const mockSession = createSession({
      id: "session-id",
      userId: "user-id",
      userAgent: "Mozilla/5.0 (Windows NT)",
      expiresAt: new Date(Date.now() + 3600000),
      lastActiveAt: recentLastActive,
    });

    const mockUser = createUser({ id: "user-id" });

    selectChain.limit.mockResolvedValueOnce([{
      session: mockSession,
      user: mockUser,
    }]);

    await userService.getCurrentUser("valid-token", {
      userAgent: "Mozilla/5.0 (Windows NT)",
    });

    // Since the last update was 30 seconds ago, it should not trigger db.update() to throttle writes
    expect(db.update).not.toHaveBeenCalled();
  });

  it("should revoke the session and return null if User-Agent mismatch is detected (Session Hijack Prevention)", async () => {
    const mockSession = createSession({
      id: "session-id",
      userId: "user-id",
      userAgent: "Mozilla/5.0 (Windows NT)",
      expiresAt: new Date(Date.now() + 3600000),
    });

    const mockUser = createUser({
      id: "user-id",
      name: "Test User",
      email: "test@example.com",
      role: "user",
    });

    // Mock innerJoin select
    selectChain.limit.mockResolvedValueOnce([{
      session: mockSession,
      user: mockUser,
    }]);

    // Execute: incoming User-Agent is Safari on iPhone, differing from original Windows PC UA
    const result = await userService.getCurrentUser("valid-token", {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS)",
    });

    expect(result).toBeNull();
    expect(db.delete).toHaveBeenCalled(); // Session should be deleted for hijacking protection
  });

  it("should update user profile details", async () => {
    const mockCurrentSession = createSession({
      id: "active-session-id",
      userId: "user-id",
    });

    const mockUpdatedUser = createUser({
      id: "user-id",
      name: "New Display Name",
      email: "user@example.com",
    });

    selectChain.limit.mockResolvedValueOnce([mockCurrentSession]);

    // Mock update().set().where().returning()
    const returningMock = vi.fn().mockResolvedValue([mockUpdatedUser]);
    const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
    const setMock = vi.fn().mockReturnValue({ where: whereMock });
    const updateMock = vi.fn().mockReturnValue({ set: setMock });

    const originalUpdate = db.update;
    db.update = updateMock as any;

    try {
      const result = await userService.updateProfile("", { name: "New Display Name" });
      expect(result.success).toBe(true);
      expect(result.user.name).toBe("New Display Name");
      expect(updateMock).toHaveBeenCalled();
    } finally {
      db.update = originalUpdate;
    }
  });

  it("should soft delete user account and delete all active sessions", async () => {
    const mockCurrentSession = createSession({
      id: "active-session-id",
      userId: "user-id",
    });

    selectChain.limit.mockResolvedValueOnce([mockCurrentSession]);

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

    const result = await userService.deleteAccount("");

    expect(result.success).toBe(true);
    expect(db.transaction).toHaveBeenCalled();
    expect(mockTx.update).toHaveBeenCalled(); // Should soft-delete
    expect(mockTx.delete).toHaveBeenCalled(); // Should delete all sessions
  });
});
