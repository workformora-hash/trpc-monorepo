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
    inArray: vi.fn(),
    sql: vi.fn((strings, ..._values) => strings.join("?")),
  };
});

export interface MockDbChains {
  selectChain: {
    from: any;
    innerJoin: any;
    where: any;
    orderBy: any;
    limit: any;
    offset: any;
    then: any;
  };
  insertChain: {
    values: any;
    returning: any;
    then: any;
  };
  updateChain: {
    set: any;
    where: any;
    returning: any;
    then: any;
  };
  deleteChain: {
    where: any;
    returning: any;
    then: any;
  };
}

export function setupMockDb(): MockDbChains {
  const selectChain = {
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(function (this: any, onfulfilled) {
      return Promise.resolve([]).then(onfulfilled);
    }),
  };

  const insertChain = {
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(function (this: any, onfulfilled) {
      return Promise.resolve([]).then(onfulfilled);
    }),
  };

  const updateChain = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(function (this: any, onfulfilled) {
      return Promise.resolve([]).then(onfulfilled);
    }),
  };

  const deleteChain = {
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(function (this: any, onfulfilled) {
      return Promise.resolve([]).then(onfulfilled);
    }),
  };

  vi.mocked(db.select).mockReturnValue(selectChain as any);
  vi.mocked(db.insert).mockReturnValue(insertChain as any);
  vi.mocked(db.update).mockReturnValue(updateChain as any);
  vi.mocked(db.delete).mockReturnValue(deleteChain as any);

  const mockTx = {
    select: vi.fn().mockReturnValue(selectChain as any),
    insert: vi.fn().mockReturnValue(insertChain as any),
    update: vi.fn().mockReturnValue(updateChain as any),
    delete: vi.fn().mockReturnValue(deleteChain as any),
  };
  vi.mocked(db.transaction).mockImplementation((callback) => callback(mockTx as any));

  return { selectChain, insertChain, updateChain, deleteChain };
}
