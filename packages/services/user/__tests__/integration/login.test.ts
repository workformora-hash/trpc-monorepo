import "../helpers/integration-setup";
import { deleteUserById } from "../helpers/integration-setup";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import UserService from "../../auth.service";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { sessionsTable } from "@repo/database/models/sessions";

describe("UserService - Login (Integration)", () => {
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

  it("should allow a verified user to log in and create a database session", async () => {
    const uniqueEmail = `test-login-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
    const payload = {
      name: "Login Integration User",
      email: uniqueEmail,
      password: "SecurePassword123!",
    };

    // 1. Register user
    const regResult = await userService.createUserWithEmailAndPassword(payload);
    createdUserIds.push(regResult.id);

    // 2. Auto-verify their email to allow login
    await db
      .update(usersTable)
      .set({ isEmailVerified: true, emailVerifiedAt: new Date() })
      .where(eq(usersTable.id, regResult.id));

    // 3. Login
    const loginResult = await userService.loginWithEmailAndPassword(
      { email: uniqueEmail, password: "SecurePassword123!" },
      { ipAddress: "127.0.0.1", userAgent: "Mozilla/5.0 (Windows NT)" }
    );

    expect(loginResult.success).toBe(true);
    expect(loginResult.token).toBeDefined();

    // 4. Verify session exists in DB
    const [sessionInDb] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.userId, regResult.id))
      .limit(1);

    expect(sessionInDb).toBeDefined();
    expect(sessionInDb?.ipAddress).toBe("127.0.0.1");
  });
});
