import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createForm, createSession, createUser } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import FormService from "../../index";
import { db } from "@repo/database";
import bcrypt from "bcryptjs";

describe("FormService - Form Password Protection (Unit)", () => {
  let formService: FormService;
  let selectChain: any;
  let updateChain: any;

  const mockToken = "mock-session-token";
  const mockUserId = "user-123";
  const mockFormId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

  const mockSessionUser = {
    session: createSession({ id: "session-123", userId: mockUserId }),
    user: createUser({ id: mockUserId }),
  };

  const mockForm = createForm({
    id: mockFormId,
    userId: mockUserId,
    title: "Protected Form",
    slug: "protected-form",
    passwordHash: null,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    updateChain = mockDb.updateChain;
    formService = new FormService();
  });

  describe("setFormPassword", () => {
    it("should successfully set a password on an existing form", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled)) // session
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled)); // existing form

      const salt = await bcrypt.genSalt(10);
      const testHash = await bcrypt.hash("secret123", salt);
      const updatedForm = { ...mockForm, passwordHash: testHash };

      updateChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([updatedForm]).then(onfulfilled)
      );

      const result = await formService.setFormPassword(mockToken, {
        id: mockFormId,
        password: "secret123",
      });

      expect(result.success).toBe(true);
      expect(result.formId).toBe(mockFormId);
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw an error if the user does not own the form", async () => {
      const unauthorizedForm = { ...mockForm, userId: "another-user" };
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([unauthorizedForm]).then(onfulfilled));

      await expect(
        formService.setFormPassword(mockToken, {
          id: mockFormId,
          password: "secret123",
        })
      ).rejects.toThrow("You are not authorized to update this form");
    });
  });

  describe("removeFormPassword", () => {
    it("should successfully remove password protection from a form", async () => {
      const protectedForm = { ...mockForm, passwordHash: "already-hashed" };
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([protectedForm]).then(onfulfilled));

      const updatedForm = { ...mockForm, passwordHash: null };
      updateChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([updatedForm]).then(onfulfilled)
      );

      const result = await formService.removeFormPassword(mockToken, {
        id: mockFormId,
      });

      expect(result.success).toBe(true);
      expect(result.formId).toBe(mockFormId);
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("verifyFormPassword", () => {
    it("should successfully verify password and return the form fields", async () => {
      const salt = await bcrypt.genSalt(10);
      const testHash = await bcrypt.hash("unlock-me", salt);
      const protectedForm = { ...mockForm, passwordHash: testHash };

      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([protectedForm]).then(onfulfilled)) // get form
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([{ id: "field-1", label: "Q1" }]).then(onfulfilled)); // get fields

      const result = await formService.verifyFormPassword({
        slug: "protected-form",
        password: "unlock-me",
      });

      expect(result.success).toBe(true);
      expect(result.fields).toEqual([{ id: "field-1", label: "Q1" }]);
      expect(result.form.passwordHash).toBeUndefined();
    });

    it("should throw an error for incorrect password", async () => {
      const salt = await bcrypt.genSalt(10);
      const testHash = await bcrypt.hash("correct-pass", salt);
      const protectedForm = { ...mockForm, passwordHash: testHash };

      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([protectedForm]).then(onfulfilled));

      await expect(
        formService.verifyFormPassword({
          slug: "protected-form",
          password: "wrong-pass",
        })
      ).rejects.toThrow("Incorrect password");
    });

    it("should throw an error if the form is not protected", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled)); // no password hash

      await expect(
        formService.verifyFormPassword({
          slug: "protected-form",
          password: "some-password",
        })
      ).rejects.toThrow("This form is not password-protected");
    });
  });
});
