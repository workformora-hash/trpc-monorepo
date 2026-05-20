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
});

export type CreateFormInputType = z.infer<typeof createFormInput>;

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





