import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createForm, createSession, createUser } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import FormService from "../../index";

describe("FormService - Advanced Responses Analytics (Unit)", () => {
  let formService: FormService;
  let selectChain: any;

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
    title: "Analytics Form",
    slug: "analytics-form",
  });

  const mockField = {
    id: mockFieldId,
    formId: mockFormId,
    label: "How old are you?",
    type: "number",
    required: true,
    orderIndex: 0,
    validation: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    formService = new FormService();
  });

  describe("getQuestionDurationStats", () => {
    it("should successfully compute correct question-by-question speed averages", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled)) // session
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled)) // form
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockField]).then(onfulfilled)) // fields
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([{ id: "resp-1" }, { id: "resp-2" }]).then(onfulfilled)) // response IDs
        .mockImplementationOnce((onfulfilled: any) =>
          Promise.resolve([
            { fieldId: mockFieldId, responseId: "resp-1", value: { value: 25, durationMs: 4000 } },
            { fieldId: mockFieldId, responseId: "resp-2", value: { value: 30, durationMs: 6000 } },
          ]).then(onfulfilled)
        ); // answers

      const result = await formService.getQuestionDurationStats(mockToken, { formId: mockFormId });

      expect(result.formId).toBe(mockFormId);
      expect(result.stats.length).toBe(1);
      expect(result.stats[0]?.averageDurationMs).toBe(5000);
      expect(result.stats[0]?.totalDurationMs).toBe(10000);
      expect(result.stats[0]?.responseCount).toBe(2);
      expect(result.stats[0]?.responseWithDurationCount).toBe(2);
    });
  });

  describe("getResponseGeoDistribution", () => {
    it("should successfully parse and aggregate respondent location statistics", async () => {
      selectChain.then
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockSessionUser]).then(onfulfilled)) // session
        .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled)) // form
        .mockImplementationOnce((onfulfilled: any) =>
          Promise.resolve([
            { ipAddress: "127.0.0.1" },
            { ipAddress: "8.8.8.8" },
            { ipAddress: "8.8.8.8" },
          ]).then(onfulfilled)
        ); // responses IPs

      const result = await formService.getResponseGeoDistribution(mockToken, { formId: mockFormId });

      expect(result.formId).toBe(mockFormId);
      expect(result.totalResponses).toBe(3);
      expect(result.countries.length).toBeGreaterThan(0);
      expect(result.cities.length).toBeGreaterThan(0);

      // Verify sorting
      expect(result.countries[0]?.count).toBeGreaterThanOrEqual(result.countries[1]?.count || 0);
    });
  });
});
