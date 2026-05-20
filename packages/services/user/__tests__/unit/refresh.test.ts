import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { describe, it, expect, beforeEach, vi } from "vitest";
import UserService from "../../auth.service";
import { db } from "@repo/database";

describe("UserService - Session Refresh (Unit)", () => {
  let userService: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockDb();
    userService = new UserService();
  });

  it("should refresh an active session by extending its expiresAt", async () => {
    // Mock db.update().set().where().returning()
    const mockSession = { id: "session-id", expiresAt: new Date() };
    const returningMock = vi.fn().mockResolvedValue([mockSession]);
    const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
    const setMock = vi.fn().mockReturnValue({ where: whereMock });
    const updateMock = vi.fn().mockReturnValue({ set: setMock });
    
    const originalUpdate = db.update;
    db.update = updateMock as any;

    try {
      const result = await userService.refreshSession("");
      expect(result.success).toBe(true);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(updateMock).toHaveBeenCalled();
    } finally {
      db.update = originalUpdate;
    }
  });
});
