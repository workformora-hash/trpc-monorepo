import { z } from "zod";

export const createFormInput = z.object({
  title: z.string()
    .describe("Title of the Form")
    .min(1, "Title is required")
    .max(256, "Title must be at most 256 characters long"),
  
  description: z.string()
    .describe("Description of the Form")
    .max(2048, "Description must be at most 2048 characters long")
    .optional()
    .nullable(),

  slug: z.string()
    .describe("Custom slug for the form. If not provided, one will be generated from the title.")
    .max(256, "Slug must be at most 256 characters long")
    .optional()
    .nullable()
    .refine((val) => !val || /^[a-z0-9-_]+$/.test(val), {
      message: "Slug must contain only lowercase letters, numbers, hyphens, and underscores",
    }),

  visibility: z.enum(["public", "unlisted"])
    .describe("Visibility of the Form")
    .default("unlisted"),

  theme: z.string()
    .describe("Theme name for the form")
    .max(64, "Theme name must be at most 64 characters long")
    .default("default"),

  expiresAt: z.coerce.date().optional().nullable()
    .describe("Date and time when the form should stop accepting responses"),

  maxResponses: z.number().int().min(1).optional().nullable()
    .describe("Maximum number of responses the form can accept"),

  notifyCreator: z.boolean().optional().default(false)
    .describe("Whether to email the creator on submission"),

  notifyRespondent: z.boolean().optional().default(false)
    .describe("Whether to email the respondent on submission"),
});

export type CreateFormInputType = z.input<typeof createFormInput>;

export const editFormInput = z.object({
  id: z.string().uuid("Invalid form ID format"),
  
  title: z.string()
    .describe("Title of the Form")
    .min(1, "Title must be at least 1 character long")
    .max(256, "Title must be at most 256 characters long")
    .optional(),
  
  description: z.string()
    .describe("Description of the Form")
    .max(2048, "Description must be at most 2048 characters long")
    .optional()
    .nullable(),

  slug: z.string()
    .describe("Custom slug for the form. If provided, it must be unique.")
    .max(256, "Slug must be at most 256 characters long")
    .optional()
    .nullable()
    .refine((val) => !val || /^[a-z0-9-_]+$/.test(val), {
      message: "Slug must contain only lowercase letters, numbers, hyphens, and underscores",
    }),

  isPublished: z.boolean()
    .describe("Whether the Form is published and accepting responses")
    .optional(),

  visibility: z.enum(["public", "unlisted"])
    .describe("Visibility of the Form")
    .optional(),

  theme: z.string()
    .describe("Theme name for the form")
    .max(64, "Theme name must be at most 64 characters long")
    .optional(),

  expiresAt: z.coerce.date().optional().nullable()
    .describe("Date and time when the form should stop accepting responses"),

  maxResponses: z.number().int().min(1).optional().nullable()
    .describe("Maximum number of responses the form can accept"),

  notifyCreator: z.boolean().optional()
    .describe("Whether to email the creator on submission"),

  notifyRespondent: z.boolean().optional()
    .describe("Whether to email the respondent on submission"),

  password: z.string().min(4, "Password must be at least 4 characters").max(128).optional().nullable()
    .describe("Set a password to protect the form. Pass null to remove protection."),
});

export type EditFormInputType = z.infer<typeof editFormInput>;

export const getFormBySlugPublicInput = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export const getFormByIdCreatorInput = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export type GetFormBySlugPublicInputType = z.infer<typeof getFormBySlugPublicInput>;
export type GetFormByIdCreatorInputType = z.infer<typeof getFormByIdCreatorInput>;

export const deleteFormInput = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export type DeleteFormInputType = z.infer<typeof deleteFormInput>;

export const duplicateFormInput = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export type DuplicateFormInputType = z.infer<typeof duplicateFormInput>;

export const publishFormInput = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export const unpublishFormInput = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export type PublishFormInputType = z.infer<typeof publishFormInput>;
export type UnpublishFormInputType = z.infer<typeof unpublishFormInput>;

export const checkSlugAvailabilityInput = z.object({
  slug: z.string().min(1, "Slug is required").max(256, "Slug must be at most 256 characters long"),
});

export type CheckSlugAvailabilityInputType = z.infer<typeof checkSlugAvailabilityInput>;

export const clearFormResponsesInput = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export type ClearFormResponsesInputType = z.infer<typeof clearFormResponsesInput>;

export const fieldTypeSchema = z.enum([
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
  "rating",
  "date"
]);

export const addFormFieldInput = z.object({
  formId: z.string().uuid("Invalid form ID format"),
  label: z.string().min(0).max(512, "Label must be at most 512 characters long").optional().default(""),
  type: fieldTypeSchema,
  required: z.boolean().default(false),
  validation: z.record(z.string(), z.unknown()).optional(),
});

export type AddFormFieldInputType = z.infer<typeof addFormFieldInput>;

export const editFormFieldInput = z.object({
  id: z.string().uuid("Invalid field ID format"),
  label: z.string().min(0).max(512, "Label must be at most 512 characters long").optional(),
  type: fieldTypeSchema.optional(),
  required: z.boolean().optional(),
  validation: z.record(z.string(), z.unknown()).optional(),
});

export type EditFormFieldInputType = z.infer<typeof editFormFieldInput>;

export const deleteFormFieldInput = z.object({
  id: z.string().uuid("Invalid field ID format"),
});

export type DeleteFormFieldInputType = z.infer<typeof deleteFormFieldInput>;

export const reorderFormFieldsInput = z.object({
  formId: z.string().uuid("Invalid form ID format"),
  fields: z.array(
    z.object({
      id: z.string().uuid("Invalid field ID format"),
      orderIndex: z.number().int("Order index must be an integer"),
    })
  ),
});

export type ReorderFormFieldsInputType = z.infer<typeof reorderFormFieldsInput>;

export const submitResponseInput = z.object({
  formId: z.string().uuid("Invalid form ID format"),
  respondentEmail: z.string().email("Invalid email format").optional().nullable(),
  answers: z.array(
    z.object({
      fieldId: z.string().uuid("Invalid field ID format"),
      value: z.unknown(),
      durationMs: z.number().int().nonnegative().optional(),
    })
  ),
});

export type SubmitResponseInputType = z.infer<typeof submitResponseInput>;

export const listResponsesInput = z.object({
  formId: z.string().uuid("Invalid form ID format"),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
  respondentEmail: z.string().optional().nullable(),
  ipAddress: z.string().optional().nullable(),
});

export type ListResponsesInputType = z.infer<typeof listResponsesInput>;

export const getFormAnalyticsInput = z.object({
  formId: z.string().uuid("Invalid form ID format"),
});

export type GetFormAnalyticsInputType = z.infer<typeof getFormAnalyticsInput>;

export const deleteResponseInput = z.object({
  responseId: z.string().uuid("Invalid response ID format"),
});

export type DeleteResponseInputType = z.infer<typeof deleteResponseInput>;

export const listPublicFormsInput = z.object({
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

export type ListPublicFormsInputType = z.infer<typeof listPublicFormsInput>;

export const exportResponsesToCSVInput = z.object({
  formId: z.string().uuid("Invalid form ID format"),
});

export type ExportResponsesToCSVInputType = z.infer<typeof exportResponsesToCSVInput>;

export const getResponseByIdInput = z.object({
  responseId: z.string().uuid("Invalid response ID format"),
});

export type GetResponseByIdInputType = z.infer<typeof getResponseByIdInput>;

export const restoreDeletedFormInput = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export type RestoreDeletedFormInputType = z.infer<typeof restoreDeletedFormInput>;

export const archiveFormInput = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export type ArchiveFormInputType = z.infer<typeof archiveFormInput>;

export const unarchiveFormInput = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export type UnarchiveFormInputType = z.infer<typeof unarchiveFormInput>;

export const setFormPasswordInput = z.object({
  id: z.string().uuid("Invalid form ID format"),
  password: z.string().min(4, "Password must be at least 4 characters").max(128, "Password too long"),
});

export type SetFormPasswordInputType = z.infer<typeof setFormPasswordInput>;

export const removeFormPasswordInput = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export type RemoveFormPasswordInputType = z.infer<typeof removeFormPasswordInput>;

export const verifyFormPasswordInput = z.object({
  slug: z.string().min(1, "Slug is required"),
  password: z.string().min(1, "Password is required"),
});

export type VerifyFormPasswordInputType = z.infer<typeof verifyFormPasswordInput>;

export const logicRuleSchema = z.object({
  triggerFieldId: z.string().uuid("Invalid trigger field ID format"),
  operator: z.enum(["equals", "not_equals", "greater_than", "less_than"]),
  value: z.unknown(),
});

export const addFieldLogicRuleInput = z.object({
  fieldId: z.string().uuid("Invalid field ID format"),
  rule: logicRuleSchema,
});

export type AddFieldLogicRuleInputType = z.infer<typeof addFieldLogicRuleInput>;

export const editFieldLogicRuleInput = z.object({
  fieldId: z.string().uuid("Invalid field ID format"),
  rule: logicRuleSchema,
});

export type EditFieldLogicRuleInputType = z.infer<typeof editFieldLogicRuleInput>;

export const deleteFieldLogicRuleInput = z.object({
  fieldId: z.string().uuid("Invalid field ID format"),
});

export type DeleteFieldLogicRuleInputType = z.infer<typeof deleteFieldLogicRuleInput>;

export const getFormLogicTreeInput = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export type GetFormLogicTreeInputType = z.infer<typeof getFormLogicTreeInput>;

export const listExploreFormsInput = z.object({
  search: z.string().optional(),
  theme: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

export type ListExploreFormsInputType = z.infer<typeof listExploreFormsInput>;

export const listTemplatesByCategoryInput = z.object({
  category: z.string().optional(),
});

export type ListTemplatesByCategoryInputType = z.infer<typeof listTemplatesByCategoryInput>;

export const trackFormViewInput = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export type TrackFormViewInputType = z.infer<typeof trackFormViewInput>;

export const duplicateFormFieldInput = z.object({
  fieldId: z.string().uuid("Invalid field ID format"),
});

export type DuplicateFormFieldInputType = z.infer<typeof duplicateFormFieldInput>;
