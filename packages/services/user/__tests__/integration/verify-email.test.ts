import "../helpers/integration-setup";
import { deleteUserById } from "../helpers/integration-setup";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import UserService from "../../auth.service";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { emailVerificationTokensTable } from "@repo/database/models/email-verification-tokens";
import crypto from "crypto";

describe("UserService - Verify Email (Integration)", () => {
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

  it("should successfully verify the user email using a valid token in the database", async () => {
    const uniqueEmail = `test-verify-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
    const payload = {
      name: "Verify Integration User",
      email: uniqueEmail,
      password: "SecurePassword123!",
    };

    // 1. Register User (creates an inactive unverified user)
    const regResult = await userService.createUserWithEmailAndPassword(payload);
    createdUserIds.push(regResult.id);

    // 2. Generate and insert an verification token manually for testing
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 86400000); // 24 hours

    await db.insert(emailVerificationTokensTable).values({
      userId: regResult.id,
      tokenHash,
      type: "email_verification",
      expiresAt,
    });

    // 3. Verify Email
    const result = await userService.verifyEmail(rawToken);
    expect(result.success).toBe(true);

    // 4. Check DB changes
    const [userInDb] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, regResult.id))
      .limit(1);

    expect(userInDb?.isEmailVerified).toBe(true);
    expect(userInDb?.emailVerifiedAt).not.toBeNull();
  });
});
