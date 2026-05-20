import { vi } from "vitest";

// Mock the environment config module before any other files load
vi.mock("../env", () => {
  return {
    env: {
      GOOGLE_OAUTH_CLIENT_ID: "mock-client-id",
      GOOGLE_OAUTH_CLIENT_SECRET: "mock-client-secret",
      GOOGLE_OAUTH_REDIRECT_URI: "mock-redirect-uri",
      CLIENT_URL: "http://localhost:3000",
    },
  };
});

// Auto-mock the database client module
vi.mock("@repo/database", () => {
  return {
    db: {
      transaction: vi.fn(),
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    eq: vi.fn(),
    and: vi.fn(),
    or: vi.fn(),
    gt: vi.fn(),
    lt: vi.fn(),
    inArray: vi.fn(),
    sql: vi.fn((strings, ...values) => strings.join("?")),
  };
});

import { describe, it, expect, beforeEach } from "vitest";
import FormService from "./index";
import { db } from "@repo/database";

describe("FormService API & Edge Case Tests", () => {
  let formService: FormService;
  let selectQueue: any[] = [];
  let insertResult: any[];
  let updateResult: any[];
  let deleteResult: any[];

  // Define valid UUID v4 mock inputs
  const mockToken = "mock-session-token";
  const mockUserId = "user-123";
  const mockFormId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const mockFieldId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
  const mockResponseId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";

  const mockSessionUser = {
    session: { id: "session-123", userId: mockUserId },
    user: { id: mockUserId, deletedAt: null, isActive: true },
  };

  const mockForm = {
    id: mockFormId,
    userId: mockUserId,
    title: "Test Form",
    description: "Form Description",
    slug: "test-form",
    isPublished: true,
    isArchived: false,
    visibility: "public" as const,
    theme: "default",
    expiresAt: null,
    maxResponses: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null as Date | null,
  };

  const mockField = {
    id: mockFieldId,
    formId: mockFormId,
    label: "Text Question",
    type: "short_text" as const,
    required: false,
    orderIndex: 0,
    validation: null as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    selectQueue = [];
    insertResult = [];
    updateResult = [];
    deleteResult = [];

    // Rebuild standard mocked Drizzle chains with queue-based responses
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation((onfulfilled) => {
        const result = selectQueue.length > 0 ? selectQueue.shift() : [];
        return Promise.resolve(result).then(onfulfilled);
      }),
    };

    const insertChain = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation((onfulfilled) => {
        return Promise.resolve(insertResult).then(onfulfilled);
      }),
    };

    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation((onfulfilled) => {
        return Promise.resolve(updateResult).then(onfulfilled);
      }),
    };

    const deleteChain = {
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation((onfulfilled) => {
        return Promise.resolve(deleteResult).then(onfulfilled);
      }),
    };

    vi.mocked(db.select).mockReturnValue(selectChain as any);
    vi.mocked(db.insert).mockReturnValue(insertChain as any);
    vi.mocked(db.update).mockReturnValue(updateChain as any);
    vi.mocked(db.delete).mockReturnValue(deleteChain as any);

    const mockTx = {
      select: vi.fn().mockReturnValue(selectChain as any),
      insert: vi.fn().mockReturnValue(insertChain as any),
      update: vi.fn().mockReturnValue(updateChain as any),
      delete: vi.fn().mockReturnValue(deleteChain as any),
    };
    vi.mocked(db.transaction).mockImplementation((callback) => callback(mockTx as any));

    formService = new FormService();
  });

  describe("Session Verification helper (getUserIdFromToken)", () => {
    it("should throw error if session is invalid or expired", async () => {
      selectQueue = [[]]; // empty array returned from sessions search
      await expect(
        formService.createForm(mockToken, { title: "New Form", visibility: "unlisted", theme: "default" })
      ).rejects.toThrow("Invalid or expired session");
    });
  });

  describe("createForm", () => {
    it("should successfully create a form with custom slug", async () => {
      selectQueue = [
        [mockSessionUser], // getUserIdFromToken select
        [],                // slug availability check -> slug is available
      ];
      insertResult = [mockForm];

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
      selectQueue = [
        [mockSessionUser],
        [mockForm], // slug availability check -> slug is taken
      ];

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
      selectQueue = [
        [mockSessionUser],
        [], // auto-generated slug check -> available
      ];
      insertResult = [{ ...mockForm, slug: "test-form-xyz" }];

      const result = await formService.createForm(mockToken, {
        title: "Test Form",
        visibility: "unlisted",
        theme: "default",
      });

      expect(result.slug).toContain("test-form-");
      expect(db.insert).toHaveBeenCalled();
    });

    it("should handle slug conflict and retry during auto-generation", async () => {
      selectQueue = [
        [mockSessionUser],
        [mockForm], // 1st attempt -> slug taken
        [],         // 2nd attempt -> slug available
      ];
      insertResult = [{ ...mockForm, slug: "test-form-retry" }];

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
      selectQueue = [
        [mockSessionUser],
        [mockForm], // existing form select
      ];
      updateResult = [{ ...mockForm, title: "Updated Title" }];

      const result = await formService.editForm(mockToken, {
        id: mockFormId,
        title: "Updated Title",
      });

      expect(result.title).toBe("Updated Title");
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw error if form does not exist", async () => {
      selectQueue = [
        [mockSessionUser],
        [], // existing form select -> empty
      ];

      await expect(
        formService.editForm(mockToken, {
          id: mockFormId,
          title: "Updated Title",
        })
      ).rejects.toThrow("Form not found");
    });

    it("should throw error if user is not authorized to edit", async () => {
      selectQueue = [
        [mockSessionUser],
        [{ ...mockForm, userId: "another-user" }],
      ];

      await expect(
        formService.editForm(mockToken, {
          id: mockFormId,
          title: "Updated Title",
        })
      ).rejects.toThrow("You are not authorized to edit this form");
    });

    it("should throw error if updating to an already taken custom slug", async () => {
      selectQueue = [
        [mockSessionUser],
        [mockForm], // existing form
        [mockForm], // slug conflict check select -> slug is taken by someone else
      ];

      await expect(
        formService.editForm(mockToken, {
          id: mockFormId,
          slug: "taken-slug",
        })
      ).rejects.toThrow("Slug is already in use");
    });

    it("should auto-regenerate slug from title if slug is explicitly nullified", async () => {
      selectQueue = [
        [mockSessionUser],
        [mockForm], // existing form
        [],         // slug availability select -> available
      ];
      updateResult = [{ ...mockForm, slug: "regenerated-slug" }];

      const result = await formService.editForm(mockToken, {
        id: mockFormId,
        slug: null,
      });

      expect(result.slug).toBe("regenerated-slug");
    });
  });

  describe("getFormBySlugPublic", () => {
    it("should fetch form and fields if form is published", async () => {
      selectQueue = [
        [mockForm], // form select
        [mockField], // fields select
      ];

      const result = await formService.getFormBySlugPublic({ slug: "test-form" });

      expect(result.form).toEqual(mockForm);
      expect(result.fields).toEqual([mockField]);
    });

    it("should throw error if public form is not found", async () => {
      selectQueue = [[]];

      await expect(
        formService.getFormBySlugPublic({ slug: "not-found" })
      ).rejects.toThrow("Form not found");
    });

    it("should throw error if form is archived", async () => {
      selectQueue = [[{ ...mockForm, isArchived: true }]];

      await expect(
        formService.getFormBySlugPublic({ slug: "test-form" })
      ).rejects.toThrow("This form has been archived and is no longer accepting responses");
    });

    it("should throw error if form is not published", async () => {
      selectQueue = [[{ ...mockForm, isPublished: false }]];

      await expect(
        formService.getFormBySlugPublic({ slug: "test-form" })
      ).rejects.toThrow("This form is not published yet");
    });
  });

  describe("getFormByIdCreator", () => {
    it("should fetch form and fields for authorized creator", async () => {
      selectQueue = [
        [mockSessionUser],
        [mockForm],
        [mockField],
      ];

      const result = await formService.getFormByIdCreator(mockToken, { id: mockFormId });

      expect(result.form).toEqual(mockForm);
      expect(result.fields).toEqual([mockField]);
    });

    it("should throw error if form does not exist", async () => {
      selectQueue = [
        [mockSessionUser],
        [],
      ];

      await expect(
        formService.getFormByIdCreator(mockToken, { id: mockFormId })
      ).rejects.toThrow("Form not found");
    });

    it("should throw error if user is not authorized to view the form", async () => {
      selectQueue = [
        [mockSessionUser],
        [{ ...mockForm, userId: "another-user" }],
      ];

      await expect(
        formService.getFormByIdCreator(mockToken, { id: mockFormId })
      ).rejects.toThrow("You are not authorized to view this form");
    });
  });

  describe("listFormsCreator", () => {
    it("should return a list of active forms for the creator", async () => {
      selectQueue = [
        [mockSessionUser],
        [mockForm],
      ];

      const result = await formService.listFormsCreator(mockToken);
      expect(result.forms).toEqual([mockForm]);
    });
  });

  describe("deleteForm", () => {
    it("should soft delete the form", async () => {
      selectQueue = [
        [mockSessionUser],
        [mockForm],
      ];
      updateResult = [{ ...mockForm, deletedAt: new Date() }];

      const result = await formService.deleteForm(mockToken, { id: mockFormId });
      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw error if form is not found", async () => {
      selectQueue = [
        [mockSessionUser],
        [],
      ];

      await expect(
        formService.deleteForm(mockToken, { id: mockFormId })
      ).rejects.toThrow("Form not found");
    });

    it("should throw error if not authorized", async () => {
      selectQueue = [
        [mockSessionUser],
        [{ ...mockForm, userId: "another-user" }],
      ];

      await expect(
        formService.deleteForm(mockToken, { id: mockFormId })
      ).rejects.toThrow("You are not authorized to delete this form");
    });
  });

  describe("duplicateForm", () => {
    it("should successfully duplicate form and its fields inside a transaction", async () => {
      selectQueue = [
        [mockSessionUser],
        [mockForm], // source form select
        [mockField], // source fields select
        [], // unique slug availability select -> available
      ];
      insertResult = [{ ...mockForm, id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99", title: "Copy of Test Form", slug: "test-form-copy-xyz" }];

      const result = await formService.duplicateForm(mockToken, { id: mockFormId });

      expect(result.id).toBe("c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99");
      expect(result.title).toBe("Copy of Test Form");
      expect(db.transaction).toHaveBeenCalled();
    });

    it("should throw error if source form is not found", async () => {
      selectQueue = [
        [mockSessionUser],
        [],
      ];

      await expect(
        formService.duplicateForm(mockToken, { id: mockFormId })
      ).rejects.toThrow("Form not found");
    });
  });

  describe("publishForm", () => {
    it("should successfully publish form containing at least one question", async () => {
      selectQueue = [
        [mockSessionUser],
        [{ ...mockForm, isPublished: false }],
        [mockField], // question select
      ];
      updateResult = [{ ...mockForm, isPublished: true }];

      const result = await formService.publishForm(mockToken, { id: mockFormId });

      expect(result.isPublished).toBe(true);
    });

    it("should throw error when trying to publish an empty form", async () => {
      selectQueue = [
        [mockSessionUser],
        [{ ...mockForm, isPublished: false }],
        [], // no fields returned
      ];

      await expect(
        formService.publishForm(mockToken, { id: mockFormId })
      ).rejects.toThrow("Cannot publish an empty form");
    });
  });

  describe("unpublishForm", () => {
    it("should successfully unpublish the form", async () => {
      selectQueue = [
        [mockSessionUser],
        [mockForm],
      ];
      updateResult = [{ ...mockForm, isPublished: false }];

      const result = await formService.unpublishForm(mockToken, { id: mockFormId });

      expect(result.isPublished).toBe(false);
    });
  });

  describe("checkSlugAvailability", () => {
    it("should return true if slug is available", async () => {
      selectQueue = [[]];
      const result = await formService.checkSlugAvailability({ slug: "available-slug" });
      expect(result.available).toBe(true);
    });

    it("should return false if slug is taken", async () => {
      selectQueue = [[mockForm]];
      const result = await formService.checkSlugAvailability({ slug: "taken-slug" });
      expect(result.available).toBe(false);
    });
  });

  describe("clearFormResponses", () => {
    it("should successfully clear all responses of the form", async () => {
      selectQueue = [
        [mockSessionUser],
        [mockForm],
      ];
      deleteResult = [{ affectedRows: 5 }];

      const result = await formService.clearFormResponses(mockToken, { id: mockFormId });

      expect(result.success).toBe(true);
      expect(result.formId).toBe(mockFormId);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("listFormThemes", () => {
    it("should return a list of themes", () => {
      const themes = formService.listFormThemes();
      expect(Array.isArray(themes)).toBe(true);
      expect(themes.length).toBeGreaterThan(0);
    });
  });

  describe("addFormField", () => {
    it("should successfully add form field and auto-calculate orderIndex", async () => {
      selectQueue = [
        [mockSessionUser],
        [mockForm],
        [{ maxOrder: 2 }], // COALESCE(MAX(orderIndex)) select
      ];
      insertResult = [{ ...mockField, orderIndex: 3 }];

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
      selectQueue = [
        [mockSessionUser],
        [{ field: mockField, form: mockForm }],
      ];
      updateResult = [{ ...mockField, label: "Updated Label" }];

      const result = await formService.editFormField(mockToken, {
        id: mockFieldId,
        label: "Updated Label",
      });

      expect(result.label).toBe("Updated Label");
      expect(db.update).toHaveBeenCalled();
    });

    it("should throw error if field is not found", async () => {
      selectQueue = [
        [mockSessionUser],
        [],
      ];

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
      selectQueue = [
        [mockSessionUser],
        [{ field: mockField, form: mockForm }],
      ];

      const result = await formService.deleteFormField(mockToken, { id: mockFieldId });

      expect(result.success).toBe(true);
      expect(result.id).toBe(mockFieldId);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("reorderFormFields", () => {
    it("should successfully bulk-reorder fields inside a transaction", async () => {
      selectQueue = [
        [mockSessionUser],
        [mockForm],
      ];

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

  describe("submitResponse & Dynamic Validation Loop", () => {
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

    it("should successfully accept a valid submission", async () => {
      selectQueue = [
        [mockForm],  // Form check select
        textFields,  // Fields list select
      ];
      insertResult = [{ id: mockResponseId }];

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
      selectQueue = [[{ ...mockForm, isArchived: true }]];

      await expect(
        formService.submitResponse({ formId: mockFormId, answers: [] }, null)
      ).rejects.toThrow("This form is archived and cannot accept responses");
    });

    it("should throw error if form is not published", async () => {
      selectQueue = [[{ ...mockForm, isPublished: false }]];

      await expect(
        formService.submitResponse({ formId: mockFormId, answers: [] }, null)
      ).rejects.toThrow("This form is not published and cannot accept responses");
    });

    it("should throw error if form has expired", async () => {
      selectQueue = [[{ ...mockForm, expiresAt: new Date(Date.now() - 1000) }]];

      await expect(
        formService.submitResponse({ formId: mockFormId, answers: [] }, null)
      ).rejects.toThrow("This form has expired");
    });

    it("should throw error if max response limit has been reached", async () => {
      selectQueue = [
        [{ ...mockForm, maxResponses: 10 }],
        [{ count: 10 }], // Responses count select
      ];

      await expect(
        formService.submitResponse({ formId: mockFormId, answers: [] }, null)
      ).rejects.toThrow("This form has reached its maximum number of allowed responses");
    });

    it("should throw error if a required field is missing", async () => {
      selectQueue = [
        [mockForm],
        textFields,
      ];

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
      selectQueue = [[mockForm], textFields];
      await expect(
        formService.submitResponse({ formId: mockFormId, answers: [{ fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "Jo" }] }, null)
      ).rejects.toThrow("must be at least 3 characters");
    });

    it("should throw error if short_text is longer than maxLength", async () => {
      selectQueue = [[mockForm], textFields];
      await expect(
        formService.submitResponse({ formId: mockFormId, answers: [{ fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "AliceSmithJones" }] }, null)
      ).rejects.toThrow("must be at most 10 characters");
    });

    it("should throw error if email format is invalid", async () => {
      selectQueue = [[mockForm], textFields];
      await expect(
        formService.submitResponse({
          formId: mockFormId,
          answers: [{ fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "Alice" }, { fieldId: "f02ebc99-9c0b-4ef8-bb6d-6bb9bd380af2", value: "invalid-email" }],
        }, null)
      ).rejects.toThrow("must be a valid email format");
    });

    it("should throw error if number is smaller than min", async () => {
      selectQueue = [[mockForm], textFields];
      await expect(
        formService.submitResponse({
          formId: mockFormId,
          answers: [{ fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "Alice" }, { fieldId: "f03ebc99-9c0b-4ef8-bb6d-6bb9bd380af3", value: 17 }],
        }, null)
      ).rejects.toThrow("must be at least 18");
    });

    it("should throw error if rating is higher than max", async () => {
      selectQueue = [[mockForm], textFields];
      await expect(
        formService.submitResponse({
          formId: mockFormId,
          answers: [{ fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "Alice" }, { fieldId: "f08ebc99-9c0b-4ef8-bb6d-6bb9bd380af8", value: 6 }],
        }, null)
      ).rejects.toThrow("must be at most 5");
    });

    it("should throw error if single_select is invalid choice", async () => {
      selectQueue = [[mockForm], textFields];
      await expect(
        formService.submitResponse({
          formId: mockFormId,
          answers: [{ fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "Alice" }, { fieldId: "f06ebc99-9c0b-4ef8-bb6d-6bb9bd380af6", value: "Green" }],
        }, null)
      ).rejects.toThrow("Selected option for \"Choice\" is invalid");
    });

    it("should throw error if multi_select contains invalid choice", async () => {
      selectQueue = [[mockForm], textFields];
      await expect(
        formService.submitResponse({
          formId: mockFormId,
          answers: [{ fieldId: "f01ebc99-9c0b-4ef8-bb6d-6bb9bd380af1", value: "Alice" }, { fieldId: "f07ebc99-9c0b-4ef8-bb6d-6bb9bd380af7", value: ["X", "Z"] }],
        }, null)
      ).rejects.toThrow("Selected option \"Z\" for \"MultiChoice\" is invalid");
    });

    it("should throw error if date is earlier than minDate", async () => {
      selectQueue = [[mockForm], textFields];
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

      selectQueue = [
        [mockSessionUser],
        [mockForm],
        [{ count: 1 }], // count result select
        [mockResp],     // responses list select
        [mockAnswer],   // answers select
      ];

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

      selectQueue = [
        [mockSessionUser],
        [mockForm],
        [{ count: 1 }], // total responses
        fields,         // fields select
        answers,        // answers select
      ];

      const result = await formService.getFormAnalytics(mockToken, { formId: mockFormId });

      expect(result.totalResponses).toBe(1);
      expect(result.fieldAnalytics).toHaveLength(4);
      // single_select check choice count
      expect(result.fieldAnalytics![0]!.stats.choiceCounts).toEqual({ Red: 1, Blue: 0 });
      // checkbox check counts
      expect(result.fieldAnalytics![1]!.stats.trueCount).toBe(1);
      // rating check average
      expect(result.fieldAnalytics![2]!.stats.averageRating).toBe(5);
      // short_text check recent answers list
      expect(result.fieldAnalytics![3]!.stats.recentAnswers).toEqual(["Alice"]);
    });
  });

  describe("deleteResponse", () => {
    it("should successfully delete the response", async () => {
      selectQueue = [
        [mockSessionUser],
        [{ id: mockResponseId, formId: mockFormId, formUserId: mockUserId }], // response & form join select
      ];
      deleteResult = [{ id: mockResponseId }];

      const result = await formService.deleteResponse(mockToken, { responseId: mockResponseId });

      expect(result.success).toBe(true);
      expect(result.responseId).toBe(mockResponseId);
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("listPublicForms", () => {
    it("should return a list of public, published forms", async () => {
      selectQueue = [[mockForm]];

      const result = await formService.listPublicForms({ limit: 50, offset: 0 });

      expect(result.forms).toEqual([mockForm]);
    });
  });

  describe("exportResponsesToCSV", () => {
    it("should generate valid CSV structure", async () => {
      const mockResp = { id: mockResponseId, respondentEmail: "r@ex.com", ipAddress: "1.1.1.1", submittedAt: new Date("2026-05-20T12:00:00Z") };
      const mockAnswer = { id: "ans-1", responseId: mockResponseId, fieldId: mockFieldId, value: { value: "Alice" } };

      selectQueue = [
        [mockSessionUser],
        [mockForm],
        [mockField],
        [mockResp],
        [mockAnswer],
      ];

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

      selectQueue = [
        [mockSessionUser],
        [mockRespJoin],
        [mockField],
        [mockAnswer],
      ];

      const result = await formService.getResponseById(mockToken, { responseId: mockResponseId });

      expect(result.response.id).toBe(mockResponseId);
      expect(result.answers![0]!.label).toBe("Text Question");
      expect(result.answers![0]!.value).toEqual({ value: "Alice" });
    });
  });

  describe("restoreDeletedForm", () => {
    it("should restore a soft-deleted form without slug conflict", async () => {
      selectQueue = [
        [mockSessionUser],
        [{ ...mockForm, deletedAt: new Date() }], // soft-deleted form select
        [], // slug availability check -> no active form has this slug
      ];
      updateResult = [mockForm];

      const result = await formService.restoreDeletedForm(mockToken, { id: mockFormId });

      expect(result.deletedAt).toBeNull();
      expect(result.slug).toBe(mockForm.slug);
      expect(db.update).toHaveBeenCalled();
    });

    it("should restore a soft-deleted form and resolve slug conflict if slug is taken", async () => {
      selectQueue = [
        [mockSessionUser],
        [{ ...mockForm, deletedAt: new Date(), slug: "my-slug" }], // soft-deleted form
        [{ id: "another-form" }], // slug conflict check -> slug taken by another active form
      ];
      updateResult = [{ ...mockForm, slug: "my-slug-restored-abc" }];

      const result = await formService.restoreDeletedForm(mockToken, { id: mockFormId });

      expect(result.slug).toContain("my-slug-restored-");
    });
  });

  describe("archiveForm", () => {
    it("should successfully archive and unpublish the form", async () => {
      selectQueue = [
        [mockSessionUser],
        [mockForm],
      ];
      updateResult = [{ ...mockForm, isArchived: true, isPublished: false }];

      const result = await formService.archiveForm(mockToken, { id: mockFormId });

      expect(result.isArchived).toBe(true);
      expect(result.isPublished).toBe(false);
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("unarchiveForm", () => {
    it("should successfully unarchive the form", async () => {
      selectQueue = [
        [mockSessionUser],
        [{ ...mockForm, isArchived: true }],
      ];
      updateResult = [{ ...mockForm, isArchived: false }];

      const result = await formService.unarchiveForm(mockToken, { id: mockFormId });

      expect(result.isArchived).toBe(false);
      expect(db.update).toHaveBeenCalled();
    });
  });
});
