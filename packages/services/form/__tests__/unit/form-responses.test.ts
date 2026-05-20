import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createForm, createSession, createUser, createFormField } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import FormService from "../../index";
import { db } from "@repo/database";

describe("FormService - Form Responses & Analytics (Unit)", () => {
  let formService: FormService;
  let selectChain: any;
  let insertChain: any;
  let deleteChain: any;

  const mockToken = "mock-session-token";
  const mockUserId = "user-123";
  const mockFormId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const mockFieldId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
  const mockResponseId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";

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
    isArchived: false,
  });

  const textFields = [
    { id: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", formId: mockFormId, label: "Name", type: "short_text" as const, required: true, orderIndex: 0, validation: { minLength: 3, maxLength: 10 } },
    { id: "f02ebc99-9c0b-4ef8-bb6d-6bb9bd380af2", formId: mockFormId, label: "Email", type: "email" as const, required: false, orderIndex: 1, validation: null },
    { id: "f03ebc99-9c0b-4ef8-bb6d-6bb9bd380af3", formId: mockFormId, label: "Age", type: "number" as const, required: false, orderIndex: 2, validation: { min: 18, max: 99 } },
    { id: "f04ebc99-9c0b-4ef8-bb6d-6bb9bd380af4", formId: mockFormId, label: "Launch Date", type: "date" as const, required: false, orderIndex: 3, validation: { minDate: "2026-01-01" } },
    { id: "f05ebc99-9c0b-4ef8-bb6d-6bb9bd380af5", formId: mockFormId, label: "Subscribed", type: "checkbox" as const, required: false, orderIndex: 4, validation: null },
    { id: "f06ebc99-9c0b-4ef8-bb6d-6bb9bd380af6", formId: mockFormId, label: "Choice", type: "single_select" as const, required: false, orderIndex: 5, validation: { options: ["Red", "Blue"] } },
    { id: "f07ebc99-9c0b-4ef8-bb6d-6bb9bd380af7", formId: mockFormId, label: "MultiChoice", type: "multi_select" as const, required: false, orderIndex: 6, validation: { options: ["X", "Y"] } },
    { id: "f08ebc99-9c0b-4ef8-bb6d-6bb9bd380af8", formId: mockFormId, label: "Rating", type: "rating" as const, required: false, orderIndex: 7, validation: { max: 5 } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    insertChain = mockDb.insertChain;
    deleteChain = mockDb.deleteChain;
    formService = new FormService();
  });

  describe("submitResponse & Dynamic Validation Loop", () => {
    it("should successfully accept a valid submission", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled)) // Form check
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve(textFields).then(onfulfilled)); // Fields list

      insertChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([{ id: mockResponseId }]).then(onfulfilled)
      );

      const result = await formService.submitResponse({
        formId: mockFormId,
        respondentEmail: "test@example.com",
        answers: [
          { fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "Alice" },
          { fieldId: "f02ebc99-9c0b-4ef8-bb6d-6bb9bd380af2", value: "alice@example.com" },
          { fieldId: "f03ebc99-9c0b-4ef8-bb6d-6bb9bd380af3", value: 25 },
          { fieldId: "f04ebc99-9c0b-4ef8-bb6d-6bb9bd380af4", value: "2026-05-20" },
          { fieldId: "f05ebc99-9c0b-4ef8-bb6d-6bb9bd380af5", value: true },
          { fieldId: "f06ebc99-9c0b-4ef8-bb6d-6bb9bd380af6", value: "Red" },
          { fieldId: "f07ebc99-9c0b-4ef8-bb6d-6bb9bd380af7", value: ["X", "Y"] },
          { fieldId: "f08ebc99-9c0b-4ef8-bb6d-6bb9bd380af8", value: 5 },
        ],
      }, "127.0.0.1");

      expect(result.success).toBe(true);
      expect(result.responseId).toBe(mockResponseId);
    });

    it("should throw error if form is archived", async () => {
      const archivedForm = { ...mockForm, isArchived: true };
      selectChain.then.mockImplementationOnce((onfulfilled: any) => Promise.resolve([archivedForm]).then(onfulfilled));

      await expect(
        formService.submitResponse({ formId: mockFormId, answers: [] }, null)
      ).rejects.toThrow("This form is archived and cannot accept responses");
    });

    it("should throw error if form is not published", async () => {
      const unpublishedForm = { ...mockForm, isPublished: false };
      selectChain.then.mockImplementationOnce((onfulfilled: any) => Promise.resolve([unpublishedForm]).then(onfulfilled));

      await expect(
        formService.submitResponse({ formId: mockFormId, answers: [] }, null)
      ).rejects.toThrow("This form is not published and cannot accept responses");
    });

    it("should throw error if form has expired", async () => {
      const expiredForm = { ...mockForm, expiresAt: new Date(Date.now() - 1000) };
      selectChain.then.mockImplementationOnce((onfulfilled: any) => Promise.resolve([expiredForm]).then(onfulfilled));

      await expect(
        formService.submitResponse({ formId: mockFormId, answers: [] }, null)
      ).rejects.toThrow("This form has expired");
    });

    it("should throw error if max response limit has been reached", async () => {
      const limitedForm = { ...mockForm, maxResponses: 10 };
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([limitedForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([{ count: 10 }]).then(onfulfilled));

      await expect(
        formService.submitResponse({ formId: mockFormId, answers: [] }, null)
      ).rejects.toThrow("This form has reached its maximum number of allowed responses");
    });

    it("should throw error if a required field is missing", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve(textFields).then(onfulfilled));

      await expect(
        formService.submitResponse({
          formId: mockFormId,
          answers: [
            { fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "" }, // required but empty
          ],
        }, null)
      ).rejects.toThrow('Question "Name" is required');
    });

    it("should throw error if short_text is shorter than minLength", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve(textFields).then(onfulfilled));

      await expect(
        formService.submitResponse({ formId: mockFormId, answers: [{ fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "Jo" }] }, null)
      ).rejects.toThrow("must be at least 3 characters");
    });

    it("should throw error if short_text is longer than maxLength", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve(textFields).then(onfulfilled));

      await expect(
        formService.submitResponse({ formId: mockFormId, answers: [{ fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "AliceSmithJones" }] }, null)
      ).rejects.toThrow("must be at most 10 characters");
    });

    it("should throw error if email format is invalid", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve(textFields).then(onfulfilled));

      await expect(
        formService.submitResponse({
          formId: mockFormId,
          answers: [{ fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "Alice" }, { fieldId: "f02ebc99-9c0b-4ef8-bb6d-6bb9bd380af2", value: "invalid-email" }],
        }, null)
      ).rejects.toThrow("must be a valid email format");
    });

    it("should throw error if number is smaller than min", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve(textFields).then(onfulfilled));

      await expect(
        formService.submitResponse({
          formId: mockFormId,
          answers: [{ fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "Alice" }, { fieldId: "f03ebc99-9c0b-4ef8-bb6d-6bb9bd380af3", value: 17 }],
        }, null)
      ).rejects.toThrow("must be at least 18");
    });

    it("should throw error if rating is higher than max", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve(textFields).then(onfulfilled));

      await expect(
        formService.submitResponse({
          formId: mockFormId,
          answers: [{ fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "Alice" }, { fieldId: "f08ebc99-9c0b-4ef8-bb6d-6bb9bd380af8", value: 6 }],
        }, null)
      ).rejects.toThrow("must be at most 5");
    });

    it("should throw error if single_select is invalid choice", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve(textFields).then(onfulfilled));

      await expect(
        formService.submitResponse({
          formId: mockFormId,
          answers: [{ fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "Alice" }, { fieldId: "f06ebc99-9c0b-4ef8-bb6d-6bb9bd380af6", value: "Green" }],
        }, null)
      ).rejects.toThrow("Selected option for \"Choice\" is invalid");
    });

    it("should throw error if multi_select contains invalid choice", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve(textFields).then(onfulfilled));

      await expect(
        formService.submitResponse({
          formId: mockFormId,
          answers: [{ fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "Alice" }, { fieldId: "f07ebc99-9c0b-4ef8-bb6d-6bb9bd380af7", value: ["X", "Z"] }],
        }, null)
      ).rejects.toThrow("Selected option \"Z\" for \"MultiChoice\" is invalid");
    });

    it("should throw error if date is earlier than minDate", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve(textFields).then(onfulfilled));

      await expect(
        formService.submitResponse({
          formId: mockFormId,
          answers: [{ fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "Alice" }, { fieldId: "f04ebc99-9c0b-4ef8-bb6d-6bb9bd380af4", value: "2025-12-31" }],
        }, null)
      ).rejects.toThrow("cannot be earlier than 2026-01-01");
    });
  });

  describe("listResponses", () => {
    it("should return a paginated list of responses with enriched answers", async () => {
      const mockResp = { id: mockResponseId, respondentEmail: "r@ex.com", ipAddress: "1.1.1.1", submittedAt: new Date() };
      const mockAnswer = { id: "ans-1", responseId: mockResponseId, fieldId: mockFieldId, value: { value: "Answer Content" } };

      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([{ count: 1 }]).then(onfulfilled)) // count
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockResp]).then(onfulfilled)) // responses list
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockAnswer]).then(onfulfilled)); // answers select

      const result = await formService.listResponses(mockToken, { formId: mockFormId, limit: 50, offset: 0 });

      expect(result.responses).toHaveLength(1);
      expect(result.responses![0]!.answers![0]!.value).toEqual({ value: "Answer Content" });
    });
  });

  describe("getFormAnalytics", () => {
    it("should return aggregated stats for each field", async () => {
      const fields = [
        { id: "f-select", label: "Color", type: "single_select" as const, validation: { options: ["Red", "Blue"] } },
        { id: "f-check", label: "Accept", type: "checkbox" as const },
        { id: "f-rating", label: "Stars", type: "rating" as const, validation: { max: 5 } },
        { id: "f-text", label: "Name", type: "short_text" as const },
      ];

      const answers = [
        { id: "a-1", responseId: "r-1", fieldId: "f-select", value: { value: "Red" } },
        { id: "a-2", responseId: "r-1", fieldId: "f-check", value: { value: true } },
        { id: "a-3", responseId: "r-1", fieldId: "f-rating", value: { value: 5 } },
        { id: "a-4", responseId: "r-1", fieldId: "f-text", value: { value: "Alice" } },
      ];

      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([{ count: 1 }]).then(onfulfilled)) // total
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve(fields).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve(answers).then(onfulfilled));

      const result = await formService.getFormAnalytics(mockToken, { formId: mockFormId });

      expect(result.totalResponses).toBe(1);
      expect(result.fieldAnalytics).toHaveLength(4);
      expect(result.fieldAnalytics![0]!.stats.choiceCounts).toEqual({ Red: 1, Blue: 0 });
      expect(result.fieldAnalytics![1]!.stats.trueCount).toBe(1);
      expect(result.fieldAnalytics![2]!.stats.averageRating).toBe(5);
      expect(result.fieldAnalytics![3]!.stats.recentAnswers).toEqual(["Alice"]);
    });
  });

  describe("deleteResponse", () => {
    it("should successfully delete the response", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([{ id: mockResponseId, formId: mockFormId, formUserId: mockUserId }]).then(onfulfilled));

      deleteChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([{ id: mockResponseId }]).then(onfulfilled)
      );

      const result = await formService.deleteResponse(mockToken, { responseId: mockResponseId });

      expect(result.success).toBe(true);
      expect(result.responseId).toBe(mockResponseId);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("clearFormResponses", () => {
    it("should successfully clear all responses of the form", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled));

      deleteChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([{ affectedRows: 5 }]).then(onfulfilled)
      );

      const result = await formService.clearFormResponses(mockToken, { id: mockFormId });

      expect(result.success).toBe(true);
      expect(result.formId).toBe(mockFormId);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("exportResponsesToCSV", () => {
    it("should generate valid CSV structure", async () => {
      const mockResp = { id: mockResponseId, respondentEmail: "r@ex.com", ipAddress: "1.1.1.1", submittedAt: new Date("2026-05-20T12:00:00Z") };
      const mockAnswer = { id: "ans-1", responseId: mockResponseId, fieldId: mockFieldId, value: { value: "Alice" } };

      const mockField = createFormField({ id: mockFieldId, formId: mockFormId, label: "Text Question" });

      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockField]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockResp]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockAnswer]).then(onfulfilled));

      const result = await formService.exportResponsesToCSV(mockToken, { formId: mockFormId });

      expect(result.success).toBe(true);
      expect(result.csv).toContain("Response ID,Submitted At,IP Address,Respondent Email,Text Question");
      expect(result.csv).toContain("Alice");
    });
  });

  describe("getResponseById", () => {
    it("should retrieve a response with enrichment", async () => {
      const mockRespJoin = {
        response: { id: mockResponseId, formId: mockFormId, respondentEmail: "r@ex.com", ipAddress: "1.1.1.1", submittedAt: new Date() },
        formUserId: mockUserId,
        formTitle: "Test Form",
      };
      const mockAnswer = { id: "ans-1", responseId: mockResponseId, fieldId: mockFieldId, value: { value: "Alice" } };

      const mockField = createFormField({ id: mockFieldId, formId: mockFormId, label: "Text Question" });

      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockRespJoin]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockField]).then(onfulfilled))
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockAnswer]).then(onfulfilled));

      const result = await formService.getResponseById(mockToken, { responseId: mockResponseId });

      expect(result.response.id).toBe(mockResponseId);
      expect(result.answers![0]!.label).toBe("Text Question");
      expect(result.answers![0]!.value).toEqual({ value: "Alice" });
    });
  });
});
