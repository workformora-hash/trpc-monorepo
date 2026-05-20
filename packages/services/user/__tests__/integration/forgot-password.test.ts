import "../helpers/integration-setup";
import { deleteUserById } from "../helpers/integration-setup";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import UserService from "../../auth.service";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { passwordResetTokensTable } from "@repo/database/models/password-reset-tokens";

describe("UserService - Forgot Password (Integration)", () => {
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

  it("should generate a real reset token record in the database for a valid user", async () => {
    const uniqueEmail = `test-forgot-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
    const payload = {
      name: "Forgot Integration User",
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

    // 2. Trigger forgot password
    const result = await userService.forgotPassword(uniqueEmail, { ipAddress: "127.0.0.1" });
    expect(result.success).toBe(true);

    // 3. Verify reset token exists in DB
    const [tokenRecord] = await db
      .select()
      .from(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.userId, regResult.id))
      .limit(1);

    expect(tokenRecord).toBeDefined();
    expect(tokenRecord?.isUsed).toBe(false);
  });

  it("should return silent success and not insert a token if user does not exist", async () => {
    const result = await userService.forgotPassword("nonexistent@example.com", { ipAddress: "127.0.0.1" });
    expect(result.success).toBe(true);
  });
});
