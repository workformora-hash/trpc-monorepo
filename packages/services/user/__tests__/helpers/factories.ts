import { usersTable } from "@repo/database/models/user";
import { credentialsTable } from "@repo/database/models/credentials";
import { emailVerificationTokensTable } from "@repo/database/models/email-verification-tokens";
import { sessionsTable } from "@repo/database/models/sessions";
import { passwordResetTokensTable } from "@repo/database/models/password-reset-tokens";
import { oauthAccountsTable } from "@repo/database/models/oauth-accounts";

export function createUser(overrides: Partial<typeof usersTable.$inferSelect> = {}): typeof usersTable.$inferSelect {
  return {
    id: "user-id",
    name: "Test User",
    email: "test@example.com",
    avatarUrl: null,
    role: "user",
    isEmailVerified: true,
    emailVerifiedAt: new Date(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

export function createCredentials(overrides: Partial<typeof credentialsTable.$inferSelect> = {}): typeof credentialsTable.$inferSelect {
  return {
    id: "cred-id",
    userId: "user-id",
    passwordHash: "$2b$10$abcdefghijklmnopqrstuv", // placeholder bcrypt hash
    failedAttempts: 0,
    lockedUntil: null,
    lastPasswordChange: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createSession(overrides: Partial<typeof sessionsTable.$inferSelect> = {}): typeof sessionsTable.$inferSelect {
  return {
    id: "session-id",
    userId: "user-id",
    tokenHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // sha256 of empty string
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0 (Windows NT)",
    metadata: { os: "Windows", browser: "Chrome", deviceType: "desktop" },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    lastActiveAt: new Date(),
    createdAt: new Date(),
    ...overrides,
  };
}

export function createEmailVerificationToken(
  overrides: Partial<typeof emailVerificationTokensTable.$inferSelect> = {}
): typeof emailVerificationTokensTable.$inferSelect {
  return {
    id: "token-id",
    userId: "user-id",
    tokenHash: "token-hash",
    type: "email_verification",
    newEmail: null,
    isUsed: false,
    usedAt: null,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    createdAt: new Date(),
    ...overrides,
  };
}

export function createPasswordResetToken(
  overrides: Partial<typeof passwordResetTokensTable.$inferSelect> = {}
): typeof passwordResetTokensTable.$inferSelect {
  return {
    id: "reset-token-id",
    userId: "user-id",
    tokenHash: "reset-token-hash",
    isUsed: false,
    usedAt: null,
    ipAddress: "127.0.0.1",
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    createdAt: new Date(),
    ...overrides,
  };
}

export function createOAuthAccount(
  overrides: Partial<typeof oauthAccountsTable.$inferSelect> = {}
): typeof oauthAccountsTable.$inferSelect {
  return {
    id: "oauth-account-id",
    userId: "user-id",
    provider: "google",
    providerAccountId: "google-provider-account-id",
    accessToken: "encrypted-access-token",
    refreshToken: "encrypted-refresh-token",
    tokenExpiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
