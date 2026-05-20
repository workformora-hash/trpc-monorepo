import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { describe, it, expect, beforeEach, vi } from "vitest";
import UserService from "../../auth.service";

describe("UserService - Forgot Password (Unit)", () => {
  let userService: UserService;
  let selectChain: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    userService = new UserService();
  });

  describe("Silent User Enumeration Defenses", () => {
    it("should return silent success for forgotPassword requests if user does not exist", async () => {
      selectChain.limit.mockResolvedValueOnce([]);

      const result = await userService.forgotPassword("nonexistent@example.com", {});
      expect(result).toEqual({ success: true });
    });
  });
});
