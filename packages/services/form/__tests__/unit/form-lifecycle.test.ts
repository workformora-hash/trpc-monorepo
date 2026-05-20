import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createForm, createSession, createUser } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import FormService from "../../index";
import { db } from "@repo/database";

describe("FormService - Form Lifecycle (Unit)", () => {
  let formService: FormService;
  let selectChain: any;
  let insertChain: any;
  let updateChain: any;
  let deleteChain: any;

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
    title: "Test Form",
    slug: "test-form",
  });

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    insertChain = mockDb.insertChain;
    updateChain = mockDb.updateChain;
    deleteChain = mockDb.deleteChain;
    formService = new FormService();
  });

  describe("Session Verification", () => {
    it("should throw error if session is invalid or expired", async () => {
      selectChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([]).then(onfulfilled)
      );

      await expect(
        formService.createForm(mockToken, { title: "New Form", visibility: "unlisted", theme: "default" })
      ).rejects.toThrow("Invalid or expired session");
    });
  });

  describe("createForm", () => {
    it("should successfully create a form with custom slug", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled)); // slug available

      insertChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([mockForm]).then(onfulfilled)
      );

      const result = await formService.createForm(mockToken, {
        title: "Test Form",
        slug: "test-form",
        visibility: "unlisted",
        theme: "default",
      });

      expect(result).toEqual(mockForm);
      expect(db.insert).toHaveBeenCalled();
    });

    it("should throw error if custom slug is already taken", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled)); // slug taken

      await expect(
        formService.createForm(mockToken, {
          title: "Test Form",
          slug: "test-form",
          visibility: "unlisted",
          theme: "default",
        })
      ).rejects.toThrow("Slug is already in use");
    });

    it("should auto-generate a unique slug if not provided", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled)); // generated slug available

      const autoSlugForm = { ...mockForm, slug: "test-form-xyz" };
      insertChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([autoSlugForm]).then(onfulfilled)
      );

      const result = await formService.createForm(mockToken, {
        title: "Test Form",
        visibility: "unlisted",
        theme: "default",
      });

      expect(result.slug).toContain("test-form-");
      expect(db.insert).toHaveBeenCalled();
    });

    it("should handle slug conflict and retry during auto-generation", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled)) // 1st taken
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled)); // 2nd available

      const retrySlugForm = { ...mockForm, slug: "test-form-retry" };
      insertChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([retrySlugForm]).then(onfulfilled)
      );

      const result = await formService.createForm(mockToken, {
        title: "Test Form",
        visibility: "unlisted",
        theme: "default",
      });

      expect(result.slug).toBe("test-form-retry");
    });
  });

  describe("editForm", () => {
    it("should successfully update form details", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled)); // existing form

      updateChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([{ ...mockForm, title: "Updated Title" }]).then(onfulfilled)
      );

      const result = await formService.editForm(mockToken, {
        id: mockFormId,
        title: "Updated Title",
      });

      expect(result.title).toBe("Updated Title");
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw error if form does not exist", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled)); // form not found

      await expect(
        formService.editForm(mockToken, {
          id: mockFormId,
          title: "Updated Title",
        })
      ).rejects.toThrow("Form not found");
    });

    it("should throw error if user is not authorized to edit", async () => {
      const unauthorizedForm = { ...mockForm, userId: "another-user" };
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([unauthorizedForm]).then(onfulfilled));

      await expect(
        formService.editForm(mockToken, {
          id: mockFormId,
          title: "Updated Title",
        })
      ).rejects.toThrow("You are not authorized to edit this form");
    });

    it("should throw error if updating to an already taken custom slug", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled)) // existing
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled)); // slug taken

      await expect(
        formService.editForm(mockToken, {
          id: mockFormId,
          slug: "taken-slug",
        })
      ).rejects.toThrow("Slug is already in use");
    });

    it("should auto-regenerate slug from title if slug is explicitly nullified", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled)); // slug available

      const regeneratedForm = { ...mockForm, slug: "regenerated-slug" };
      updateChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([regeneratedForm]).then(onfulfilled)
      );

      const result = await formService.editForm(mockToken, {
        id: mockFormId,
        slug: null,
      });

      expect(result.slug).toBe("regenerated-slug");
    });
  });

  describe("deleteForm", () => {
    it("should soft delete the form", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled));

      const deletedForm = { ...mockForm, deletedAt: new Date() };
      updateChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([deletedForm]).then(onfulfilled)
      );

      const result = await formService.deleteForm(mockToken, { id: mockFormId });
      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw error if form is not found during delete", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled));

      await expect(
        formService.deleteForm(mockToken, { id: mockFormId })
      ).rejects.toThrow("Form not found");
    });

    it("should throw error if delete is unauthorized", async () => {
      const unauthorizedForm = { ...mockForm, userId: "another-user" };
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([unauthorizedForm]).then(onfulfilled));

      await expect(
        formService.deleteForm(mockToken, { id: mockFormId })
      ).rejects.toThrow("You are not authorized to delete this form");
    });
  });

  describe("restoreDeletedForm", () => {
    it("should restore a soft-deleted form without slug conflict", async () => {
      const softDeletedForm = { ...mockForm, deletedAt: new Date() };
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([softDeletedForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled)); // slug available

      updateChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([mockForm]).then(onfulfilled)
      );

      const result = await formService.restoreDeletedForm(mockToken, { id: mockFormId });

      expect(result.deletedAt).toBeNull();
      expect(result.slug).toBe(mockForm.slug);
      expect(db.update).toHaveBeenCalled();
    });

    it("should restore a soft-deleted form and resolve slug conflict if slug is taken", async () => {
      const softDeletedForm = { ...mockForm, deletedAt: new Date(), slug: "my-slug" };
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([softDeletedForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([{ id: "another-form" }]).then(onfulfilled)); // slug taken

      const resolvedSlugForm = { ...mockForm, slug: "my-slug-restored-abc" };
      updateChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([resolvedSlugForm]).then(onfulfilled)
      );

      const result = await formService.restoreDeletedForm(mockToken, { id: mockFormId });

      expect(result.slug).toContain("my-slug-restored-");
    });
  });

  describe("duplicateForm", () => {
    it("should successfully duplicate form and its fields inside a transaction", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled)) // source form
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled)) // fields
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled)); // slug available

      const duplicateFormResult = {
        ...mockForm,
        id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99",
        title: "Copy of Test Form",
        slug: "test-form-copy-xyz",
      };
      insertChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([duplicateFormResult]).then(onfulfilled)
      );

      const result = await formService.duplicateForm(mockToken, { id: mockFormId });

      expect(result.id).toBe("c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99");
      expect(result.title).toBe("Copy of Test Form");
      expect(db.transaction).toHaveBeenCalled();
    });

    it("should throw error if source form is not found for duplication", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled));

      await expect(
        formService.duplicateForm(mockToken, { id: mockFormId })
      ).rejects.toThrow("Form not found");
    });
  });

  describe("listFormTemplates", () => {
    it("should return the list of form templates", () => {
      const result = formService.listFormTemplates();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("fields");
    });
  });

  describe("createFormFromTemplate", () => {
    it("should successfully clone template and its fields inside a transaction", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled));

      const clonedFormResult = {
        ...mockForm,
        id: "cloned-form-id",
        title: "Customer Satisfaction Survey",
        slug: "customer-feedback-copy-xyz",
      };
      insertChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([clonedFormResult]).then(onfulfilled)
      );

      const result = await formService.createFormFromTemplate(mockToken, { templateId: "customer-feedback" });

      expect(result.id).toBe("cloned-form-id");
      expect(result.title).toBe("Customer Satisfaction Survey");
      expect(db.transaction).toHaveBeenCalled();
    });

    it("should throw error if template is not found", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled));

      await expect(
        formService.createFormFromTemplate(mockToken, { templateId: "invalid-template" })
      ).rejects.toThrow("Template not found");
    });
  });
});
