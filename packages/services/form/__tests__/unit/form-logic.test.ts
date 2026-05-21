import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createForm, createSession, createUser } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import FormService from "../../index";
import { db } from "@repo/database";

describe("FormService - Form Skip-Logic Rules (Unit)", () => {
  let formService: FormService;
  let selectChain: any;
  let updateChain: any;

  const mockToken = "mock-session-token";
  const mockUserId = "user-123";
  const mockFormId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const mockFieldId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
  const mockTriggerFieldId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99";

  const mockSessionUser = {
    session: createSession({ id: "session-123", userId: mockUserId }),
    user: createUser({ id: mockUserId }),
  };

  const mockForm = createForm({
    id: mockFormId,
    userId: mockUserId,
    title: "Logic Form",
    slug: "logic-form",
  });

  const mockField = {
    id: mockFieldId,
    formId: mockFormId,
    label: "Q2: Are you sure?",
    type: "checkbox",
    required: true,
    orderIndex: 1,
    validation: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    updateChain = mockDb.updateChain;
    formService = new FormService();
  });

  describe("addFieldLogicRule", () => {
    it("should successfully attach a trigger condition to a form field's validation property", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled)) // session
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([{ field: mockField, form: mockForm }]).then(onfulfilled)); // field join form

      const updatedField = {
        ...mockField,
        validation: { logicRule: { triggerFieldId: mockTriggerFieldId, operator: "equals", value: "Yes" } },
      };

      updateChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([updatedField]).then(onfulfilled)
      );

      const result = await formService.addFieldLogicRule(mockToken, {
        fieldId: mockFieldId,
        rule: {
          triggerFieldId: mockTriggerFieldId,
          operator: "equals",
          value: "Yes",
        },
      });

      expect(result.success).toBe(true);
      expect(result.fieldId).toBe(mockFieldId);
      expect(result.validation.logicRule).toEqual({
        triggerFieldId: mockTriggerFieldId,
        operator: "equals",
        value: "Yes",
      });
      expect(db.update).toHaveBeenCalled();
    });

    it("should reject setting logic rule if user is unauthorized", async () => {
      const unauthorizedForm = { ...mockForm, userId: "another-user" };
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([{ field: mockField, form: unauthorizedForm }]).then(onfulfilled));

      await expect(
        formService.addFieldLogicRule(mockToken, {
          fieldId: mockFieldId,
          rule: {
            triggerFieldId: mockTriggerFieldId,
            operator: "equals",
            value: "Yes",
          },
        })
      ).rejects.toThrow("You are not authorized to edit fields for this form");
    });
  });

  describe("deleteFieldLogicRule", () => {
    it("should successfully purge the logic rule from the field validation JSON", async () => {
      const logicField = {
        ...mockField,
        validation: { logicRule: { triggerFieldId: mockTriggerFieldId, operator: "equals", value: "Yes" }, existingKey: 42 },
      };

      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([{ field: logicField, form: mockForm }]).then(onfulfilled));

      const updatedField = {
        ...mockField,
        validation: { existingKey: 42 },
      };

      updateChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([updatedField]).then(onfulfilled)
      );

      const result = await formService.deleteFieldLogicRule(mockToken, {
        fieldId: mockFieldId,
      });

      expect(result.success).toBe(true);
      expect(result.fieldId).toBe(mockFieldId);
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("getFormLogicTree", () => {
    it("should return the compiled logic dependency tree of all form fields", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled)) // form by slug
        .mockImplementationOnce((onfulfilled: any) =>
          Promise.resolve([
            { id: mockTriggerFieldId, label: "Q1", type: "short_text", validation: {} },
            {
              id: mockFieldId,
              label: "Q2",
              type: "checkbox",
              validation: { logicRule: { triggerFieldId: mockTriggerFieldId, operator: "equals", value: "ok" } },
            },
          ]).then(onfulfilled)
        ); // fields

      const result = await formService.getFormLogicTree({ slug: "logic-form" });

      expect(result.formId).toBe(mockFormId);
      expect(result.logicTree.length).toBe(2);
      expect(result.logicTree[0]?.logicRule).toBeNull();
      expect(result.logicTree[1]?.logicRule).toEqual({
        triggerFieldId: mockTriggerFieldId,
        operator: "equals",
        value: "ok",
      });
    });
  });
});
