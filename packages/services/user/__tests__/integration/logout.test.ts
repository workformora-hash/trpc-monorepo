import "../helpers/integration-setup";
import { deleteUserById } from "../helpers/integration-setup";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import UserService from "../../auth.service";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { sessionsTable } from "@repo/database/models/sessions";

describe("UserService - Logout (Integration)", () => {
  let userService: UserService;
  let createdUserIds: string[] = [];

  beforeEach(async () => {
    userService = new UserService();
    createdUserIds = [];
  });

  afterEach(async () => {
    for (const userId of createdUserIds) {
      await deleteUserById(userId);
    }
  });

  it("should successfully log out a user and remove the session record from the database", async () => {
    const uniqueEmail = `test-logout-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
    const payload = {
      name: "Logout Integration User",
      email: uniqueEmail,
      password: "SecurePassword123!",
    };

    // 1. Register & Verify User
    const regResult = await userService.createUserWithEmailAndPassword(payload);
    createdUserIds.push(regResult.id);

    await db
      .update(usersTable)
      .set({ isEmailVerified: true, emailVerifiedAt: new Date() })
      .where(eq(usersTable.id, regResult.id));

    // 2. Login to get a valid session token
    const loginResult = await userService.loginWithEmailAndPassword(
      { email: uniqueEmail, password: "SecurePassword123!" },
      { ipAddress: "127.0.0.1", userAgent: "Mozilla/5.0 (Windows NT)" }
    );

    // 3. Logout
    const logoutResult = await userService.logout(loginResult.token);
    expect(logoutResult.success).toBe(true);

    // 4. Verify no session exists in DB for this user
    const sessionsInDb = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.userId, regResult.id));

    expect(sessionsInDb).toHaveLength(0);
  });
});
