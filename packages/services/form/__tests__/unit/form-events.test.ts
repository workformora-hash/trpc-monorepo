import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createForm } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import FormService, { formEvents } from "../../index";

describe("FormService - Real-Time Response Subscriptions (Unit)", () => {
  let formService: FormService;
  let selectChain: any;
  let insertChain: any;

  const mockFormId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const mockUserId = "user-123";

  const mockForm = createForm({
    id: mockFormId,
    userId: mockUserId,
    title: "Real-Time Form",
    slug: "real-time-form",
    isPublished: true,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    insertChain = mockDb.insertChain;
    formService = new FormService();
  });

  it("should emit a response event upon successful submission", async () => {
    selectChain.then
      .mockImplementationOnce((onfulfilled: any) => Promise.resolve([mockForm]).then(onfulfilled)) // form check
      .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled)) // count check
      .mockImplementationOnce((onfulfilled: any) => Promise.resolve([]).then(onfulfilled)); // fields check

    const mockResponseRow = {
      id: "resp-xyz",
      formId: mockFormId,
      respondentEmail: "jane@example.com",
      ipAddress: "1.1.1.1",
      submittedAt: new Date(),
    };

    insertChain.returning.mockImplementationOnce(() => Promise.resolve([mockResponseRow]));

    const eventPromise = new Promise<any>((resolve) => {
      formEvents.once("response", (data) => {
        resolve(data);
      });
    });

    await formService.submitResponse({
      formId: mockFormId,
      respondentEmail: "jane@example.com",
      answers: [],
    }, "1.1.1.1");

    const emittedData = await eventPromise;

    expect(emittedData.formId).toBe(mockFormId);
    expect(emittedData.responseId).toBe("resp-xyz");
    expect(emittedData.respondentEmail).toBe("jane@example.com");
    expect(emittedData.ipAddress).toBe("1.1.1.1");
    expect(emittedData.submittedAt).toBeInstanceOf(Date);
  });
});
