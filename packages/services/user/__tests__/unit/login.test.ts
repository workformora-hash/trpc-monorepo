import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createUser, createCredentials, createOAuthAccount } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import UserService from "../../auth.service";
import { db } from "@repo/database";

describe("UserService - Login (Unit)", () => {
  let userService: UserService;
  let selectChain: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    userService = new UserService();
  });

  describe("Brute Force Lockout Check & Login Security Edge Cases", () => {
    it("should lock credentials after 5 consecutive failed attempts", async () => {
      selectChain.limit
        .mockResolvedValueOnce([createUser({ id: "user-id", email: "alice@example.com", deletedAt: null, isActive: true, isEmailVerified: true })])
        .mockResolvedValueOnce([createCredentials({ id: "cred-id", userId: "user-id", passwordHash: "$2b$10$abcdefghijklmnopqrstuv", failedAttempts: 4, lockedUntil: null })]);

      await expect(
        userService.loginWithEmailAndPassword(
          { email: "alice@example.com", password: "SecurePassword123!" },
          { ipAddress: "127.0.0.1" }
        )
      ).rejects.toThrow("Invalid email or password");

      expect(db.update).toHaveBeenCalled();
    });

    it("should reject logins immediately if lockedUntil timestamp is active", async () => {
      const futureDate = new Date(Date.now() + 15 * 60 * 1000);

      selectChain.limit
        .mockResolvedValueOnce([createUser({ id: "user-id", email: "alice@example.com", deletedAt: null, isActive: true, isEmailVerified: true })])
        .mockResolvedValueOnce([createCredentials({ id: "cred-id", userId: "user-id", failedAttempts: 5, lockedUntil: futureDate })]);

      await expect(
        userService.loginWithEmailAndPassword(
          { email: "alice@example.com", password: "SecurePassword123!" },
          { ipAddress: "127.0.0.1" }
        )
      ).rejects.toThrow(/temporarily locked/);
    });

    it("should reject credential login for accounts registered via Google OAuth only (no password)", async () => {
      selectChain.limit
        .mockResolvedValueOnce([createUser({ id: "user-id", email: "google-only@example.com", deletedAt: null, isActive: true, isEmailVerified: true })])
        .mockResolvedValueOnce([]); // no credentials row

      await expect(
        userService.loginWithEmailAndPassword(
          { email: "google-only@example.com", password: "SecurePassword123!" },
          { ipAddress: "127.0.0.1" }
        )
      ).rejects.toThrow(/configured for third-party sign-in/);
    });

    it("should reject login for inactive or suspended user accounts", async () => {
      // In the real database, the query filters by `isActive = true`.
      // So a suspended user will not be returned by the select query at all.
      selectChain.limit.mockResolvedValueOnce([]); // simulates query returning no active user

      await expect(
        userService.loginWithEmailAndPassword(
          { email: "suspended@example.com", password: "SecurePassword123!" },
          { ipAddress: "127.0.0.1" }
        )
      ).rejects.toThrow("Invalid email or password");
    });
  });

  describe("Google OAuth Authentication Flow", () => {
    it("should generate a valid Google Auth URL", () => {
      const result = userService.getGoogleAuthUrl();
      expect(result.provider).toBe("GOOGLE_OAUTH");
      expect(result.authUrl).toContain("https://accounts.google.com/o/oauth2/v2/auth");
    });

    it("should login an existing user who has a linked Google OAuth account", async () => {
      const mockUser = createUser({
        id: "existing-user-id",
        email: "google-user@example.com",
        name: "Google User",
        role: "user",
        deletedAt: null,
        isActive: true,
        isEmailVerified: true,
      });

      const mockOauthAccount = createOAuthAccount({
        id: "oauth-account-id",
        userId: "existing-user-id",
        provider: "google",
        providerAccountId: "google-provider-account-id",
      });

      // Mock DB calls:
      // 1. Check existing oauth account
      // 2. Check existing user
      selectChain.limit
        .mockResolvedValueOnce([mockOauthAccount])
        .mockResolvedValueOnce([mockUser]);

      const result = await userService.loginWithGoogle("valid-auth-code", {
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
      });

      expect(result.success).toBe(true);
      expect(result.user.email).toBe("google-user@example.com");
      expect(db.update).toHaveBeenCalled(); // Should update token credentials in db
      expect(db.insert).toHaveBeenCalled(); // Should create a new session
    });

    it("should link Google account and login an existing email user who does not have it linked", async () => {
      const mockUser = createUser({
        id: "existing-user-id",
        email: "google-user@example.com",
        name: "Google User",
        role: "user",
        deletedAt: null,
        isActive: true,
        isEmailVerified: false, // not verified yet
      });

      // Mock DB calls:
      // 1. Check existing oauth account -> None
      // 2. Check user by email -> Found
      selectChain.limit
        .mockResolvedValueOnce([]) // oauth account
        .mockResolvedValueOnce([mockUser]); // user by email

      const result = await userService.loginWithGoogle("valid-auth-code", {
        ipAddress: "127.0.0.1",
      });

      expect(result.success).toBe(true);
      expect(result.user.id).toBe("existing-user-id");
      expect(db.update).toHaveBeenCalled(); // Should auto-verify email
      expect(db.insert).toHaveBeenCalled(); // Should insert oauth-accounts row and sessions row
    });

    it("should register and login a brand new Google user", async () => {
      // Mock DB transaction to return new user
      const mockTx = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([createUser({ id: "new-google-user-id", name: "Google User", email: "google-user@example.com", role: "user" })]),
        }),
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
      };
      
      vi.mocked(db.transaction).mockImplementation((callback) => callback(mockTx as any));

      // Mock DB calls:
      // 1. Check existing oauth account -> None
      // 2. Check user by email -> None
      selectChain.limit
        .mockResolvedValueOnce([]) // oauth account
        .mockResolvedValueOnce(null); // user by email

      const result = await userService.loginWithGoogle("valid-auth-code", {
        ipAddress: "127.0.0.1",
      });

      expect(result.success).toBe(true);
      expect(result.user.id).toBe("new-google-user-id");
      expect(db.transaction).toHaveBeenCalled(); // Should create user and link oauth within tx
      expect(db.insert).toHaveBeenCalled(); // Should create session
    });
  });
});
