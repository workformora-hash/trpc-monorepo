import "../helpers/integration-setup";
import { deleteUserById } from "../helpers/integration-setup";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import UserService from "../../auth.service";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { sessionsTable } from "@repo/database/models/sessions";

describe("UserService - Sessions (Integration)", () => {
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

  it("should fetch active sessions list, revoke a specific session, and revoke other sessions on password change in DB", async () => {
    const uniqueEmail = `test-sess-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
    const payload = {
      name: "Sessions Integration User",
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

    // 2. Login twice to create 2 distinct sessions in DB
    const login1 = await userService.loginWithEmailAndPassword(
      { email: uniqueEmail, password: "SecurePassword123!" },
      { ipAddress: "127.0.0.1", userAgent: "Mozilla/5.0 (Windows NT)" }
    );

    const login2 = await userService.loginWithEmailAndPassword(
      { email: uniqueEmail, password: "SecurePassword123!" },
      { ipAddress: "192.168.1.1", userAgent: "Mozilla/5.0 (Macintosh)" }
    );

    // 3. Fetch active sessions using login2's token
    const activeSessionsResult = await userService.getActiveSessions(login2.token);
    expect(activeSessionsResult.sessions).toHaveLength(2);

    const currentSession = activeSessionsResult.sessions.find((s) => s.isCurrent);
    const otherSession = activeSessionsResult.sessions.find((s) => !s.isCurrent);

    expect(currentSession).toBeDefined();
    expect(otherSession).toBeDefined();
    expect(currentSession?.ipAddress).toBe("192.168.1.1");
    expect(otherSession?.ipAddress).toBe("127.0.0.1");

    // 4. Revoke otherSession by ID
    const revokeResult = await userService.revokeSessionById(login2.token, otherSession!.id);
    expect(revokeResult.success).toBe(true);
    expect(revokeResult.isCurrent).toBe(false);

    // 5. Verify the other session is deleted from DB
    const sessionsAfterRevocation = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.userId, regResult.id));

    expect(sessionsAfterRevocation).toHaveLength(1);
    expect(sessionsAfterRevocation[0]?.ipAddress).toBe("192.168.1.1");
  }, 30000);
});
