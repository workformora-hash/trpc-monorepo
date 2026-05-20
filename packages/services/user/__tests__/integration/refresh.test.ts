import "../helpers/integration-setup";
import { deleteUserById } from "../helpers/integration-setup";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import UserService from "../../auth.service";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { sessionsTable } from "@repo/database/models/sessions";

describe("UserService - Refresh (Integration)", () => {
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

  it("should successfully extend session expiration time in the database", async () => {
    const uniqueEmail = `test-refresh-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
    const payload = {
      name: "Refresh Integration User",
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

    // 2. Login to get session
    const loginResult = await userService.loginWithEmailAndPassword(
      { email: uniqueEmail, password: "SecurePassword123!" },
      { ipAddress: "127.0.0.1" }
    );

    // 3. Store old expiresAt
    const [initialSession] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.userId, regResult.id))
      .limit(1);

    expect(initialSession).toBeDefined();

    // 4. Refresh session
    const refreshResult = await userService.refreshSession(loginResult.token);
    expect(refreshResult.success).toBe(true);

    // 5. Fetch updated session and compare
    const [updatedSession] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.userId, regResult.id))
      .limit(1);

    expect(updatedSession).toBeDefined();
    expect(updatedSession?.expiresAt.getTime()).toBeGreaterThanOrEqual(initialSession!.expiresAt.getTime());
  });
});
