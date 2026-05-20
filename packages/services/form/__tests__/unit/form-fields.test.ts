import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createForm, createSession, createUser, createFormField } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import FormService from "../../index";
import { db } from "@repo/database";

describe("FormService - Form Fields (Unit)", () => {
  let formService: FormService;
  let selectChain: any;
  let insertChain: any;
  let updateChain: any;
  let deleteChain: any;

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
    title: "Test Form",
  });

  const mockField = createFormField({
    id: mockFieldId,
    formId: mockFormId,
    label: "Question Label",
    type: "short_text",
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

  describe("addFormField", () => {
    it("should successfully add form field and auto-calculate orderIndex", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([{ maxOrder: 2 }]).then(onfulfilled)); // COALESCE(MAX(orderIndex))

      const newField = { ...mockField, orderIndex: 3 };
      insertChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([newField]).then(onfulfilled)
      );

      const result = await formService.addFormField(mockToken, {
        formId: mockFormId,
        label: "Next Question",
        type: "short_text",
        required: true,
      });

      expect(result.orderIndex).toBe(3);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe("editFormField", () => {
    it("should successfully edit a form field's values", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([{ field: mockField, form: mockForm }]).then(onfulfilled));

      const updatedField = { ...mockField, label: "Updated Label" };
      updateChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([updatedField]).then(onfulfilled)
      );

      const result = await formService.editFormField(mockToken, {
        id: mockFieldId,
        label: "Updated Label",
      });

      expect(result.label).toBe("Updated Label");
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw error if field is not found", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled));

      await expect(
        formService.editFormField(mockToken, {
          id: mockFieldId,
          label: "Updated Label",
        })
      ).rejects.toThrow("Form field not found");
    });
  });

  describe("deleteFormField", () => {
    it("should successfully delete a form field", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([{ field: mockField, form: mockForm }]).then(onfulfilled));

      deleteChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([{ id: mockFieldId }]).then(onfulfilled)
      );

      const result = await formService.deleteFormField(mockToken, { id: mockFieldId });

      expect(result.success).toBe(true);
      expect(result.id).toBe(mockFieldId);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("reorderFormFields", () => {
    it("should successfully bulk-reorder fields inside a transaction", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled));

      const result = await formService.reorderFormFields(mockToken, {
        formId: mockFormId,
        fields: [
          { id: "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380ad1", orderIndex: 1 },
          { id: "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380ad2", orderIndex: 0 },
        ],
      });

      expect(result.success).toBe(true);
      expect(db.transaction).toHaveBeenCalled();
    });
  });
});
