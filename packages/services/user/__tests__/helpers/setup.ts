import { vi } from "vitest";
import { db } from "@repo/database";

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
    sql: vi.fn((strings, ..._values) => strings.join("?")),
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

export interface MockDbChains {
  selectChain: {
    from: any;
    innerJoin: any;
    where: any;
    orderBy: any;
    limit: any;
  };
  insertChain: {
    values: any;
    returning: any;
  };
  updateChain: {
    set: any;
    where: any;
  };
  deleteChain: {
    where: any;
  };
}

export function setupMockDb(): MockDbChains {
  const selectChain = {
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
  };

  const insertChain = {
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
  };

  const updateChain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
  };

  const deleteChain = {
    where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
  };

  vi.mocked(db.select).mockReturnValue(selectChain as any);
  vi.mocked(db.insert).mockReturnValue(insertChain as any);
  vi.mocked(db.update).mockReturnValue(updateChain as any);
  vi.mocked(db.delete).mockReturnValue(deleteChain as any);

  return { selectChain, insertChain, updateChain, deleteChain };
}
