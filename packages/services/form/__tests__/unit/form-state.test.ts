import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createForm, createSession, createUser, createFormField } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import FormService from "../../index";

describe("FormService - Form State & Retrieval (Unit)", () => {
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
    title: "Test Form",
    slug: "test-form",
    isPublished: true,
  });

  const mockField = createFormField({
    id: "field-1",
    formId: mockFormId,
    label: "Question 1",
  });

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    updateChain = mockDb.updateChain;
    formService = new FormService();
  });

  describe("getFormBySlugPublic", () => {
    it("should fetch form and fields if form is published", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled)) // form
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockField]).then(onfulfilled)); // fields

      const result = await formService.getFormBySlugPublic({ slug: "test-form" });

      expect(result.form).toEqual(mockForm);
      expect(result.fields).toEqual([mockField]);
    });

    it("should throw error if public form is not found", async () => {
      selectChain.then.mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled));

      await expect(
        formService.getFormBySlugPublic({ slug: "not-found" })
      ).rejects.toThrow("Form not found");
    });

    it("should throw error if form is archived", async () => {
      const archivedForm = { ...mockForm, isArchived: true };
      selectChain.then.mockImplementationOnce((onfulfilled: any) => Promise.resolve([archivedForm]).then(onfulfilled));

      await expect(
        formService.getFormBySlugPublic({ slug: "test-form" })
      ).rejects.toThrow("This form has been archived and is no longer accepting responses");
    });

    it("should throw error if form is not published", async () => {
      const draftForm = { ...mockForm, isPublished: false };
      selectChain.then.mockImplementationOnce((onfulfilled: any) => Promise.resolve([draftForm]).then(onfulfilled));

      await expect(
        formService.getFormBySlugPublic({ slug: "test-form" })
      ).rejects.toThrow("This form is not published yet");
    });
  });

  describe("getFormByIdCreator", () => {
    it("should fetch form and fields for authorized creator", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockField]).then(onfulfilled));

      const result = await formService.getFormByIdCreator(mockToken, { id: mockFormId });

      expect(result.form).toEqual(mockForm);
      expect(result.fields).toEqual([mockField]);
    });

    it("should throw error if form does not exist for creator", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled));

      await expect(
        formService.getFormByIdCreator(mockToken, { id: mockFormId })
      ).rejects.toThrow("Form not found");
    });

    it("should throw error if creator query is unauthorized", async () => {
      const unauthorizedForm = { ...mockForm, userId: "another-user" };
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([unauthorizedForm]).then(onfulfilled));

      await expect(
        formService.getFormByIdCreator(mockToken, { id: mockFormId })
      ).rejects.toThrow("You are not authorized to view this form");
    });
  });

  describe("listFormsCreator", () => {
    it("should return a list of active forms for the creator", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled));

      const result = await formService.listFormsCreator(mockToken);
      expect(result.forms).toEqual([mockForm]);
    });
  });

  describe("publishForm", () => {
    it("should successfully publish form containing at least one question", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([{ ...mockForm, isPublished: false }]).then(onfulfilled)) // draft
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockField]).then(onfulfilled)); // has a question

      const publishedForm = { ...mockForm, isPublished: true };
      updateChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([publishedForm]).then(onfulfilled)
      );

      const result = await formService.publishForm(mockToken, { id: mockFormId });

      expect(result.isPublished).toBe(true);
    });

    it("should throw error when trying to publish an empty form", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([{ ...mockForm, isPublished: false }]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled)); // no fields

      await expect(
        formService.publishForm(mockToken, { id: mockFormId })
      ).rejects.toThrow("Cannot publish an empty form");
    });
  });

  describe("unpublishForm", () => {
    it("should successfully unpublish the form", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled));

      const unpublishedForm = { ...mockForm, isPublished: false };
      updateChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([unpublishedForm]).then(onfulfilled)
      );

      const result = await formService.unpublishForm(mockToken, { id: mockFormId });

      expect(result.isPublished).toBe(false);
    });
  });

  describe("checkSlugAvailability", () => {
    it("should return true if slug is available", async () => {
      selectChain.then.mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled));
      const result = await formService.checkSlugAvailability({ slug: "available-slug" });
      expect(result.available).toBe(true);
    });

    it("should return false if slug is taken", async () => {
      selectChain.then.mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled));
      const result = await formService.checkSlugAvailability({ slug: "taken-slug" });
      expect(result.available).toBe(false);
    });
  });

  describe("listPublicForms", () => {
    it("should return a list of public, published forms", async () => {
      selectChain.then.mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled));

      const result = await formService.listPublicForms({ limit: 50, offset: 0 });

      expect(result.forms).toEqual([mockForm]);
    });
  });

  describe("archiveForm", () => {
    it("should successfully archive and unpublish the form", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled));

      const archivedForm = { ...mockForm, isArchived: true, isPublished: false };
      updateChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([archivedForm]).then(onfulfilled)
      );

      const result = await formService.archiveForm(mockToken, { id: mockFormId });

      expect(result.isArchived).toBe(true);
      expect(result.isPublished).toBe(false);
    });
  });

  describe("unarchiveForm", () => {
    it("should successfully unarchive the form", async () => {
      const archivedForm = { ...mockForm, isArchived: true };
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([archivedForm]).then(onfulfilled));

      const unarchivedForm = { ...mockForm, isArchived: false };
      updateChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([unarchivedForm]).then(onfulfilled)
      );

      const result = await formService.unarchiveForm(mockToken, { id: mockFormId });

      expect(result.isArchived).toBe(false);
    });
  });
});
