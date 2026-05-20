import "../helpers/integration-setup";
import { deleteUserById } from "../helpers/integration-setup";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import UserService from "../../auth.service";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";

describe("UserService - Profile & Me (Integration)", () => {
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

  it("should successfully fetch profile, update profile details, and soft delete user in DB", async () => {
    const uniqueEmail = `test-me-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
    const payload = {
      name: "Me Integration User",
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

    // 2. Login to get token
    const loginResult = await userService.loginWithEmailAndPassword(
      { email: uniqueEmail, password: "SecurePassword123!" },
      { ipAddress: "127.0.0.1", userAgent: "Mozilla/5.0 (Windows NT)" }
    );

    // 3. Fetch profile (me)
    const meResult = await userService.getCurrentUser(loginResult.token, {
      userAgent: "Mozilla/5.0 (Windows NT)",
    });

    expect(meResult).not.toBeNull();
    expect(meResult?.user.id).toBe(regResult.id);

    // 4. Update Profile
    const updateResult = await userService.updateProfile(loginResult.token, {
      name: "New Integration Name",
    });
    expect(updateResult.success).toBe(true);
    expect(updateResult.user.name).toBe("New Integration Name");

    // 5. Soft Delete Account
    const deleteResult = await userService.deleteAccount(loginResult.token);
    expect(deleteResult.success).toBe(true);

    // 6. Verify user is soft-deleted in DB
    const [deletedUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, regResult.id))
      .limit(1);

    expect(deletedUser?.isActive).toBe(false);
    expect(deletedUser?.deletedAt).not.toBeNull();
  });
});
