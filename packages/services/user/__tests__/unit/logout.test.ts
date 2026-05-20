import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { describe, it, expect, beforeEach, vi } from "vitest";
import UserService from "../../auth.service";
import { db } from "@repo/database";

describe("UserService - Logout (Unit)", () => {
  let userService: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockDb();
    userService = new UserService();
  });

  it("should successfully log out a user by deleting their active session", async () => {
    const result = await userService.logout("active-token");
    expect(result.success).toBe(true);
    expect(db.delete).toHaveBeenCalled();
  });
});
