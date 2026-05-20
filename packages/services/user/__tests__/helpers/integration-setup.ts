import { vi } from "vitest";

// SAFETY FIRST: Route all integration database traffic to a dedicated local/test Postgres database
// This ensures we NEVER touch or pollute the remote Neon development/production database.
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/dev";

import { db, eq, sql } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { credentialsTable } from "@repo/database/models/credentials";
import { emailVerificationTokensTable } from "@repo/database/models/email-verification-tokens";
import { sessionsTable } from "@repo/database/models/sessions";
import { passwordResetTokensTable } from "@repo/database/models/password-reset-tokens";
import { oauthAccountsTable } from "@repo/database/models/oauth-accounts";

// Mock the environment config module before any other files load
vi.mock("../../../env", () => {
  return {
    env: {
      GOOGLE_OAUTH_CLIENT_ID: "mock-client-id",
      GOOGLE_OAUTH_CLIENT_SECRET: "mock-client-secret",
      GOOGLE_OAUTH_REDIRECT_URI: "mock-redirect-uri",
      CLIENT_URL: "http://localhost:3000",
    },
  };
});

// Mock the email service so we don't send real emails
vi.mock("@repo/email", () => {
  return {
    emailService: {
      sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
      sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
    },
  };
});

// Mock the Google OAuth client so we don't make network calls
vi.mock("../../../clients/google-oauth", () => {
  return {
    googleOAuth2Client: {
      generateAuthUrl: vi.fn().mockReturnValue("https://accounts.google.com/o/oauth2/v2/auth?mocked=true"),
      getToken: vi.fn().mockResolvedValue({
        tokens: {
          access_token: "mock-access-token",
          refresh_token: "mock-refresh-token",
          expiry_date: Date.now() + 3600 * 1000,
          id_token: "mock-id-token",
        },
      }),
      verifyIdToken: vi.fn().mockResolvedValue({
        getPayload: () => ({
          email: "google-user@example.com",
          name: "Google User",
          picture: "http://example.com/avatar.png",
          sub: "google-provider-account-id",
          email_verified: true,
        }),
      }),
    },
  };
});

// Helper to safely clean up only specific user by ID (targets specific test resources)
export async function deleteUserById(userId: string) {
  try {
    await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
    await db.delete(emailVerificationTokensTable).where(eq(emailVerificationTokensTable.userId, userId));
    await db.delete(passwordResetTokensTable).where(eq(passwordResetTokensTable.userId, userId));
    await db.delete(oauthAccountsTable).where(eq(oauthAccountsTable.userId, userId));
    await db.delete(credentialsTable).where(eq(credentialsTable.userId, userId));
    await db.delete(usersTable).where(eq(usersTable.id, userId));
  } catch (err) {
    console.error(`Failed to delete user ID ${userId}:`, err);
  }
}

// Global cleanup run once if needed, but not in beforeEach of concurrent tests
export async function cleanupIntegrationDb() {
  try {
    const testUsers = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(sql`${usersTable.email} LIKE 'test-%@example.com'`);

    const testUserIds = testUsers.map((u) => u.id);

    if (testUserIds.length > 0) {
      for (const userId of testUserIds) {
        await deleteUserById(userId);
      }
    }
  } catch (err) {
    console.error("Cleanup integration DB failed:", err);
  }
}

// STUB OUT BACKGROUND WORKERS FOR PREDICTABLE INTEGRATION TESTS:
// Prevents background async tasks from running purgeExpiredTokens() and racing/deleting used tokens 
// or expired test records concurrently from under active assertions in integration tests.
import UserService from "../../auth.service";
vi.spyOn(UserService.prototype, "purgeExpiredTokens").mockResolvedValue({ success: true });
