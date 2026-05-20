import { vi } from "vitest";

// Mock the environment config module before any other files load
vi.mock("../env", () => {
  return {
    env: {
      GOOGLE_OAUTH_CLIENT_ID: "mock-client-id",
      GOOGLE_OAUTH_CLIENT_SECRET: "mock-client-secret",
      GOOGLE_OAUTH_REDIRECT_URI: "mock-redirect-uri",
      CLIENT_URL: "http://localhost:3000",
    },
  };
});

// Auto-mock the database client module
vi.mock("@repo/database", () => {
  return {
    db: {
      transaction: vi.fn(),
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    eq: vi.fn(),
    and: vi.fn(),
    or: vi.fn(),
    gt: vi.fn(),
    lt: vi.fn(),
    sql: vi.fn((strings, ...values) => strings.join("?")),
  };
});

// Mock the email service
vi.mock("@repo/email", () => {
  return {
    emailService: {
      sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
      sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
    },
  };
});

// Mock the Google OAuth client
vi.mock("../clients/google-oauth", () => {
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

import { describe, it, expect, beforeEach } from "vitest";
import UserService from "./index";
import { db } from "@repo/database";
import bcrypt from "bcryptjs";

describe("UserService Authentication Tests", () => {
  let userService: UserService;
  let selectChain: any;
  let insertChain: any;
  let updateChain: any;
  let deleteChain: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Rebuild standard mocked chains for each test to guarantee complete isolation
    selectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };

    insertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
    };

    updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
    };

    deleteChain = {
      where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
    };

    vi.mocked(db.select).mockReturnValue(selectChain as any);
    vi.mocked(db.insert).mockReturnValue(insertChain as any);
    vi.mocked(db.update).mockReturnValue(updateChain as any);
    vi.mocked(db.delete).mockReturnValue(deleteChain as any);

    userService = new UserService();
  });

  describe("Password Policy Refinement Validation", () => {
    it("should reject weak passwords lacking uppercase letters", async () => {
      await expect(
        userService.createUserWithEmailAndPassword({
          name: "Alice Smith",
          email: "alice@example.com",
          password: "password123!",
        })
      ).rejects.toThrow("Password must contain at least one uppercase letter");
    });

    it("should reject weak passwords lacking lowercase letters", async () => {
      await expect(
        userService.createUserWithEmailAndPassword({
          name: "Alice Smith",
          email: "alice@example.com",
          password: "PASSWORD123!",
        })
      ).rejects.toThrow("Password must contain at least one lowercase letter");
    });

    it("should reject weak passwords lacking numbers", async () => {
      await expect(
        userService.createUserWithEmailAndPassword({
          name: "Alice Smith",
          email: "alice@example.com",
          password: "PasswordSafe!",
        })
      ).rejects.toThrow("Password must contain at least one number");
    });

    it("should reject weak passwords lacking special characters", async () => {
      await expect(
        userService.createUserWithEmailAndPassword({
          name: "Alice Smith",
          email: "alice@example.com",
          password: "Password1234",
        })
      ).rejects.toThrow("Password must contain at least one special character");
    });
  });

  describe("User Registration", () => {
    it("should enforce transaction integrity during user signup", async () => {
      const mockTx = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([{ id: "new-user-id" }]),
        }),
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
      };
      
      vi.mocked(db.transaction).mockImplementation((callback) => callback(mockTx as any));
      selectChain.limit.mockResolvedValueOnce([]); // mock user not found during validation

      const result = await userService.createUserWithEmailAndPassword({
        name: "Alice Smith",
        email: "ALICE@EXAMPLE.COM",
        password: "SecurePassword123!",
      });

      expect(db.transaction).toHaveBeenCalled();
      expect(result).toEqual({ id: "new-user-id" });
    });

    it("should reject signup when active user already exists", async () => {
      selectChain.limit.mockResolvedValueOnce([
        { id: "existing-id", email: "alice@example.com", deletedAt: null, isActive: true },
      ]);

      await expect(
        userService.createUserWithEmailAndPassword({
          name: "Alice Smith",
          email: "alice@example.com",
          password: "SecurePassword123!",
        })
      ).rejects.toThrow("User already exists");
    });
  });

  describe("Brute Force Lockout Check", () => {
    it("should lock credentials after 5 consecutive failed attempts", async () => {
      selectChain.limit
        .mockResolvedValueOnce([{ id: "user-id", email: "alice@example.com", deletedAt: null, isActive: true, isEmailVerified: true }])
        .mockResolvedValueOnce([{ id: "cred-id", userId: "user-id", passwordHash: "$2b$10$abcdefghijklmnopqrstuv", failedAttempts: 4, lockedUntil: null }]);

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
        .mockResolvedValueOnce([{ id: "user-id", email: "alice@example.com", deletedAt: null, isActive: true, isEmailVerified: true }])
        .mockResolvedValueOnce([{ id: "cred-id", userId: "user-id", failedAttempts: 5, lockedUntil: futureDate }]);

      await expect(
        userService.loginWithEmailAndPassword(
          { email: "alice@example.com", password: "SecurePassword123!" },
          { ipAddress: "127.0.0.1" }
        )
      ).rejects.toThrow(/temporarily locked/);
    });
  });

  describe("Silent User Enumeration Defenses", () => {
    it("should return silent success for verification resends if user does not exist", async () => {
      selectChain.limit.mockResolvedValueOnce([]);

      const result = await userService.resendVerificationEmail("nonexistent@example.com");
      expect(result).toEqual({ success: true });
    });

    it("should return silent success for forgotPassword requests if user does not exist", async () => {
      selectChain.limit.mockResolvedValueOnce([]);

      const result = await userService.forgotPassword("nonexistent@example.com", {});
      expect(result).toEqual({ success: true });
    });
  });

  describe("Token Rate-limiting Cooldown Blocks", () => {
    it("should enforce cooldown block if verification email was requested within 60 seconds", async () => {
      const recentRequest = new Date(Date.now() - 30 * 1000);

      selectChain.limit
        .mockResolvedValueOnce([{ id: "user-id", email: "alice@example.com", isEmailVerified: false }])
        .mockResolvedValueOnce([{ id: "token-id", createdAt: recentRequest }]);

      await expect(
        userService.resendVerificationEmail("alice@example.com")
      ).rejects.toThrow(/wait at least 60 seconds/);
    });
  });

  describe("Google OAuth Authentication Flow", () => {
    it("should generate a valid Google Auth URL", () => {
      const result = userService.getGoogleAuthUrl();
      expect(result.provider).toBe("GOOGLE_OAUTH");
      expect(result.authUrl).toContain("https://accounts.google.com/o/oauth2/v2/auth");
    });

    it("should login an existing user who has a linked Google OAuth account", async () => {
      const mockUser = {
        id: "existing-user-id",
        email: "google-user@example.com",
        name: "Google User",
        role: "user",
        deletedAt: null,
        isActive: true,
        isEmailVerified: true,
      };

      const mockOauthAccount = {
        id: "oauth-account-id",
        userId: "existing-user-id",
        provider: "google",
        providerAccountId: "google-provider-account-id",
      };

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
      const mockUser = {
        id: "existing-user-id",
        email: "google-user@example.com",
        name: "Google User",
        role: "user",
        deletedAt: null,
        isActive: true,
        isEmailVerified: false, // not verified yet
      };

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
          returning: vi.fn().mockResolvedValue([{ id: "new-google-user-id", name: "Google User", email: "google-user@example.com", role: "user" }]),
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

  describe("Active Sessions Management Flow", () => {
    it("should fetch all active unexpired sessions for the user and flag the current session", async () => {
      const mockCurrentSession = {
        id: "active-session-id",
        userId: "user-id",
        tokenHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // sha256 of empty token ""
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
        metadata: { os: "Windows", browser: "Chrome", deviceType: "desktop" },
        expiresAt: new Date(Date.now() + 1000 * 3600),
        lastActiveAt: new Date(),
      };

      const mockOtherSession = {
        id: "other-session-id",
        userId: "user-id",
        tokenHash: "other-hash",
        ipAddress: "192.168.1.1",
        userAgent: "Safari",
        metadata: { os: "iOS", browser: "Safari", deviceType: "mobile" },
        expiresAt: new Date(Date.now() + 1000 * 3600),
        lastActiveAt: new Date(),
      };

      // Mock database queries:
      // 1. Get the current active session from the token -> mockCurrentSession
      // 2. Get all unexpired sessions for this user -> [mockCurrentSession, mockOtherSession]
      selectChain.limit.mockResolvedValueOnce([mockCurrentSession]);
      selectChain.orderBy.mockResolvedValueOnce([mockCurrentSession, mockOtherSession]);

      const result = await userService.getActiveSessions("");

      expect(result.sessions).toHaveLength(2);
      expect(result.sessions[0].id).toBe("active-session-id");
      expect(result.sessions[0].isCurrent).toBe(true);
      expect(result.sessions[1].id).toBe("other-session-id");
      expect(result.sessions[1].isCurrent).toBe(false);
    });

    it("should revoke a session by ID if it belongs to the user", async () => {
      const mockCurrentSession = {
        id: "active-session-id",
        userId: "user-id",
        tokenHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      };

      const mockRevokedSession = {
        id: "session-to-revoke-id",
        userId: "user-id",
        tokenHash: "revoked-hash",
      };

      // Mock DB:
      // 1. Get current session -> mockCurrentSession
      // 2. Get session to revoke -> mockRevokedSession
      selectChain.limit
        .mockResolvedValueOnce([mockCurrentSession])
        .mockResolvedValueOnce([mockRevokedSession]);

      const result = await userService.revokeSessionById("", "session-to-revoke-id");

      expect(result.success).toBe(true);
      expect(result.isCurrent).toBe(false);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("Expanded Authentication Features Flow", () => {
    it("should refresh an active session by extending its expiresAt", async () => {
      // Mock db.update().set().where().returning()
      const mockSession = { id: "session-id", expiresAt: new Date() };
      const returningMock = vi.fn().mockResolvedValue([mockSession]);
      const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      const updateMock = vi.fn().mockReturnValue({ set: setMock });
      
      const originalUpdate = db.update;
      db.update = updateMock as any;

      try {
        const result = await userService.refreshSession("");
        expect(result.success).toBe(true);
        expect(result.expiresAt).toBeInstanceOf(Date);
        expect(updateMock).toHaveBeenCalled();
      } finally {
        db.update = originalUpdate;
      }
    });

    it("should allow a logged-in user to change their password", async () => {
      const mockCurrentSession = {
        id: "active-session-id",
        userId: "user-id",
        tokenHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      };

      // Mock bcrypt hash of "current-password"
      const currentPasswordHash = await bcrypt.hash("current-password", 10);
      const mockCredentials = {
        id: "cred-id",
        userId: "user-id",
        passwordHash: currentPasswordHash,
      };

      // Mock DB:
      // 1. Get current active session
      // 2. Get credentials
      selectChain.limit
        .mockResolvedValueOnce([mockCurrentSession])
        .mockResolvedValueOnce([mockCredentials]);

      // Mock Drizzle Transaction
      const mockTx = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
        }),
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
        }),
      };
      vi.mocked(db.transaction).mockImplementation((callback) => callback(mockTx as any));

      const result = await userService.changePassword("", {
        currentPassword: "current-password",
        newPassword: "NewSecurePassword123!",
      });

      expect(result.success).toBe(true);
      expect(db.transaction).toHaveBeenCalled();
      expect(mockTx.update).toHaveBeenCalled();
      expect(mockTx.delete).toHaveBeenCalled(); // Should revoke other sessions
    });

    it("should soft delete user account and delete all active sessions", async () => {
      const mockCurrentSession = {
        id: "active-session-id",
        userId: "user-id",
        tokenHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      };

      selectChain.limit.mockResolvedValueOnce([mockCurrentSession]);

      const mockTx = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
        }),
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
        }),
      };
      vi.mocked(db.transaction).mockImplementation((callback) => callback(mockTx as any));

      const result = await userService.deleteAccount("");

      expect(result.success).toBe(true);
      expect(db.transaction).toHaveBeenCalled();
      expect(mockTx.update).toHaveBeenCalled(); // Should soft-delete
      expect(mockTx.delete).toHaveBeenCalled(); // Should delete all sessions
    });

    it("should update user profile details", async () => {
      const mockCurrentSession = {
        id: "active-session-id",
        userId: "user-id",
        tokenHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      };

      const mockUpdatedUser = {
        id: "user-id",
        name: "New Display Name",
        email: "user@example.com",
      };

      selectChain.limit.mockResolvedValueOnce([mockCurrentSession]);

      // Mock update().set().where().returning()
      const returningMock = vi.fn().mockResolvedValue([mockUpdatedUser]);
      const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      const updateMock = vi.fn().mockReturnValue({ set: setMock });

      const originalUpdate = db.update;
      db.update = updateMock as any;

      try {
        const result = await userService.updateProfile("", { name: "New Display Name" });
        expect(result.success).toBe(true);
        expect(result.user.name).toBe("New Display Name");
        expect(updateMock).toHaveBeenCalled();
      } finally {
        db.update = originalUpdate;
      }
    });
  });
});
