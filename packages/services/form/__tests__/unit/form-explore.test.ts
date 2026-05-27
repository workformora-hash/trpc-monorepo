import "../helpers/setup";
import { setupMockDb } from "../helpers/setup";
import { createForm } from "../helpers/factories";
import { describe, it, expect, beforeEach, vi } from "vitest";
import FormService from "../../index";

describe("FormService - Explore & Templates Gallery Filtering (Unit)", () => {
  let formService: FormService;
  let selectChain: any;

  const mockFormId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const mockUserId = "user-123";

  const mockForm = createForm({
    id: mockFormId,
    userId: mockUserId,
    title: "Public Fun Form",
    slug: "public-fun-form",
    visibility: "public",
    isPublished: true,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    const mockDb = setupMockDb();
    selectChain = mockDb.selectChain;
    formService = new FormService();
  });

  describe("listExploreForms", () => {
    it("should successfully retrieve paginated and filtered public forms", async () => {
      selectChain.then.mockImplementationOnce((onfulfilled: any) =>
        Promise.resolve([mockForm]).then(onfulfilled)
      );

      const result = await formService.listExploreForms({
        search: "Fun",
        theme: "default",
        limit: 5,
        offset: 0,
      });

      expect(result.forms.length).toBe(1);
      expect(result.forms[0]?.slug).toBe("public-fun-form");
      expect(result.limit).toBe(5);
      expect(result.offset).toBe(0);
    });
  });

  describe("listTemplatesByCategory", () => {
    it("should return filtered templates when a category is specified", async () => {
      const result = await formService.listTemplatesByCategory({ category: "Feedback" });
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((t) => t.category === "Feedback")).toBe(true);
    });

    it("should return all templates when no category is specified", async () => {
      const result = await formService.listTemplatesByCategory({});
      
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
