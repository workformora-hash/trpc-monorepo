import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createForm, createSession, createUser, createFormField } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import FormService from "../../index";
import { db } from "@repo/database";

describe("FormService - Extended Fields & Views (Unit)", () => {
  let formService: FormService;
  let selectChain: any;
  let insertChain: any;
  let updateChain: any;

  const mockToken = "mock-session-token";
  const mockUserId = "user-123";
  const mockFormId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const mockFieldId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

  const mockSessionUser = {
    session: createSession({ id: "session-123", userId: mockUserId }),
    user: createUser({ id: mockUserId }),
  };

  const mockForm = createForm({
    id: mockFormId,
    userId: mockUserId,
    title: "Views Form",
    slug: "views-form",
    views: 12,
  });

  const mockField = createFormField({
    id: mockFieldId,
    formId: mockFormId,
    label: "Duplicate Me",
    type: "rating",
    required: true,
    orderIndex: 2,
    validation: { min: 1, max: 10 },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    insertChain = mockDb.insertChain;
    updateChain = mockDb.updateChain;
    formService = new FormService();
  });

  describe("trackFormView", () => {
    it("should increment form views", async () => {
      selectChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([mockForm]).then(onfulfilled)
      );

      updateChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([{ id: mockFormId }]).then(onfulfilled)
      );

      const result = await formService.trackFormView({ slug: "views-form" });

      expect(result.success).toBe(true);
      expect(result.views).toBe(13);
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw error if form does not exist", async () => {
      selectChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([]).then(onfulfilled)
      );

      await expect(
        formService.trackFormView({ slug: "unknown-slug" })
      ).rejects.toThrow("Form not found");
    });
  });

  describe("duplicateFormField", () => {
    it("should successfully clone and reorder a field", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockField]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled));

      const clonedField = {
        ...mockField,
        id: "new-cloned-id",
        label: "Duplicate Me (Copy)",
        orderIndex: 3,
      };

      insertChain.returning.mockImplementationOnce(() => Promise.resolve([clonedField]));

      const result = await formService.duplicateFormField(mockToken, {
        fieldId: mockFieldId,
      });

      expect(result.label).toBe("Duplicate Me (Copy)");
      expect(result.orderIndex).toBe(3);
      expect(result.required).toBe(true);
      expect(db.transaction).toHaveBeenCalled();
    });

    it("should enforce user ownership", async () => {
      const anotherSessionUser = {
        session: createSession({ id: "session-abc", userId: "attacker-user" }),
        user: createUser({ id: "attacker-user" }),
      };

      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([anotherSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockField]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled));

      await expect(
        formService.duplicateFormField(mockToken, { fieldId: mockFieldId })
      ).rejects.toThrow("You are not authorized to duplicate fields on this form");
    });
  });
});
