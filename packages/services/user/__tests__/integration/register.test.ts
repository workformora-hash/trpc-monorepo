import "../helpers/integration-setup";
import { deleteUserById } from "../helpers/integration-setup";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import UserService from "../../auth.service";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";

describe("UserService - Register (Integration)", () => {
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

  it("should successfully register a new user in the real database", async () => {
    const uniqueEmail = `test-register-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
    const payload = {
      name: "Integration Test User",
      email: uniqueEmail,
      password: "SecurePassword123!",
    };

    const result = await userService.createUserWithEmailAndPassword(payload);
    expect(result).toHaveProperty("id");
    createdUserIds.push(result.id);

    // Verify row was actually created in the DB
    const [userInDb] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .limit(1);

    expect(userInDb).toBeDefined();
    expect(userInDb?.email).toBe(uniqueEmail.toLowerCase());
    expect(userInDb?.isEmailVerified).toBe(false);
  });
});
