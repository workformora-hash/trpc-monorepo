import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createUser } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import UserService from "../../auth.service";
import { db } from "@repo/database";

describe("UserService - Register (Unit)", () => {
  let userService: UserService;
  let selectChain: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
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

    it("should reject commonly compromised passwords listed in our security blacklist", async () => {
      await expect(
        userService.createUserWithEmailAndPassword({
          name: "Alice Smith",
          email: "alice@example.com",
          password: "Password123!",
        })
      ).rejects.toThrow("This password is listed in databases of commonly compromised passwords");
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

    it("should purge stale soft-deleted users and allow successful re-registration", async () => {
      // Mock an existing soft-deleted user
      const softDeletedUser = createUser({
        id: "stale-user-id",
        email: "alice@example.com",
        deletedAt: new Date(),
        isActive: false,
      });

      selectChain.limit.mockResolvedValueOnce([softDeletedUser]);

      const mockTx = {
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([{ id: "new-user-id" }]),
        }),
      };
      vi.mocked(db.transaction).mockImplementation((callback) => callback(mockTx as any));

      const result = await userService.createUserWithEmailAndPassword({
        name: "Alice Smith",
        email: "alice@example.com",
        password: "SecurePassword123!",
      });

      expect(db.transaction).toHaveBeenCalled();
      expect(mockTx.delete).toHaveBeenCalled(); // Should purge soft-deleted user credentials/tokens/oauth/user
      expect(result).toEqual({ id: "new-user-id" });
    });

    it("should reject signup when active user already exists", async () => {
      selectChain.limit.mockResolvedValueOnce([
        createUser({ id: "existing-id", email: "alice@example.com", deletedAt: null, isActive: true }),
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
});
