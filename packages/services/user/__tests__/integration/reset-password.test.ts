import "../helpers/integration-setup";
import { deleteUserById } from "../helpers/integration-setup";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import UserService from "../../auth.service";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { passwordResetTokensTable } from "@repo/database/models/password-reset-tokens";
import crypto from "crypto";

describe("UserService - Reset Password (Integration)", () => {
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

  it("should successfully reset a password when using a valid, active token", async () => {
    const uniqueEmail = `test-reset-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
    const payload = {
      name: "Reset Integration User",
      email: uniqueEmail,
      password: "OldPassword123!",
    };

    // 1. Register & Verify User
    const regResult = await userService.createUserWithEmailAndPassword(payload);
    createdUserIds.push(regResult.id);

    await db
      .update(usersTable)
      .set({ isEmailVerified: true, emailVerifiedAt: new Date() })
      .where(eq(usersTable.id, regResult.id));

    // 2. Generate a token via crypto manually since forgotPassword hashes it before inserting
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await db.insert(passwordResetTokensTable).values({
      userId: regResult.id,
      tokenHash,
      ipAddress: "127.0.0.1",
      expiresAt,
    });

    // 3. Reset password
    const result = await userService.resetPassword({
      token: rawToken,
      password: "NewPassword123!",
    });
    expect(result.success).toBe(true);

    // 4. Verify token is marked as used
    const [tokenRecord] = await db
      .select()
      .from(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.userId, regResult.id))
      .limit(1);

    expect(tokenRecord?.isUsed).toBe(true);

    // 5. Try logging in with the new password
    const loginResult = await userService.loginWithEmailAndPassword(
      { email: uniqueEmail, password: "NewPassword123!" },
      { ipAddress: "127.0.0.1" }
    );
    expect(loginResult.success).toBe(true);
  });
});
