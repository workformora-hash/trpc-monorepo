import z from "zod";

export const createFormInputModel = z.object({
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

export const createFormOutputModel = z.object({
  form: z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    slug: z.string(),
    isPublished: z.boolean(),
    visibility: z.enum(["public", "unlisted"]),
    theme: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
});

export const editFormInputModel = z.object({
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

export const editFormOutputModel = z.object({
  form: z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    slug: z.string(),
    isPublished: z.boolean(),
    visibility: z.enum(["public", "unlisted"]),
    theme: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
});

export const formFieldModel = z.object({
  id: z.string(),
  formId: z.string(),
  label: z.string(),
  type: z.enum([
    "short_text",
    "long_text",
    "email",
    "number",
    "single_select",
    "multi_select",
    "checkbox",
    "rating",
    "date",
  ]),
  required: z.boolean(),
  orderIndex: z.number(),
  validation: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const getFormBySlugPublicInputModel = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export const getFormBySlugPublicOutputModel = z.object({
  form: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    slug: z.string(),
    isPublished: z.boolean(),
    visibility: z.enum(["public", "unlisted"]),
    theme: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  fields: z.array(formFieldModel),
});

export const getFormByIdCreatorInputModel = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export const getFormByIdCreatorOutputModel = z.object({
  form: z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    slug: z.string(),
    isPublished: z.boolean(),
    visibility: z.enum(["public", "unlisted"]),
    theme: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  fields: z.array(formFieldModel),
});

export const listFormsCreatorInputModel = z.void();

export const listFormsCreatorOutputModel = z.object({
  forms: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      slug: z.string(),
      isPublished: z.boolean(),
      visibility: z.enum(["public", "unlisted"]),
      theme: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })
  )
});

export const deleteFormInputModel = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export const deleteFormOutputModel = z.object({
  success: z.boolean(),
  form: z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    deletedAt: z.date().nullable(),
  })
});



