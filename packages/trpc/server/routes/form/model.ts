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

export const duplicateFormInputModel = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export const duplicateFormOutputModel = z.object({
  success: z.boolean(),
  form: z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    slug: z.string(),
    isPublished: z.boolean(),
    visibility: z.enum(["public", "unlisted"]),
    theme: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
});

export const publishFormInputModel = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export const publishFormOutputModel = z.object({
  success: z.boolean(),
  form: z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    isPublished: z.boolean(),
  })
});

export const unpublishFormInputModel = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export const unpublishFormOutputModel = z.object({
  success: z.boolean(),
  form: z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    isPublished: z.boolean(),
  })
});

export const checkSlugAvailabilityInputModel = z.object({
  slug: z.string().min(1, "Slug is required").max(256, "Slug must be at most 256 characters long"),
});

export const checkSlugAvailabilityOutputModel = z.object({
  available: z.boolean(),
});

export const clearFormResponsesInputModel = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export const clearFormResponsesOutputModel = z.object({
  success: z.boolean(),
  formId: z.string(),
});

export const listFormThemesOutputModel = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    styles: z.object({
      backgroundColor: z.string(),
      textColor: z.string(),
      primaryColor: z.string(),
      buttonBgColor: z.string(),
      buttonTextColor: z.string(),
      fontFamily: z.string(),
      cardBgColor: z.string(),
      inputBgColor: z.string(),
      inputBorderColor: z.string(),
    }),
  })
);

export const addFormFieldInputModel = z.object({
  formId: z.string().uuid("Invalid form ID format"),
  label: z.string().min(1, "Label is required").max(512, "Label must be at most 512 characters long"),
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
  required: z.boolean().default(false),
  validation: z.record(z.string(), z.unknown()).optional(),
});

export const addFormFieldOutputModel = z.object({
  field: formFieldModel,
});

export const editFormFieldInputModel = z.object({
  id: z.string().uuid("Invalid field ID format"),
  label: z.string().min(1, "Label is required").max(512, "Label must be at most 512 characters long").optional(),
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
  ]).optional(),
  required: z.boolean().optional(),
  validation: z.record(z.string(), z.unknown()).optional(),
});

export const editFormFieldOutputModel = z.object({
  field: formFieldModel,
});

export const deleteFormFieldInputModel = z.object({
  id: z.string().uuid("Invalid field ID format"),
});

export const deleteFormFieldOutputModel = z.object({
  success: z.boolean(),
  id: z.string(),
});

export const reorderFormFieldsInputModel = z.object({
  formId: z.string().uuid("Invalid form ID format"),
  fields: z.array(
    z.object({
      id: z.string().uuid("Invalid field ID format"),
      orderIndex: z.number().int("Order index must be an integer"),
    })
  ),
});

export const reorderFormFieldsOutputModel = z.object({
  success: z.boolean(),
});

export const submitResponseInputModel = z.object({
  formId: z.string().uuid("Invalid form ID format"),
  respondentEmail: z.string().email("Invalid email format").optional().nullable(),
  answers: z.array(
    z.object({
      fieldId: z.string().uuid("Invalid field ID format"),
      value: z.unknown(),
    })
  ),
});

export const submitResponseOutputModel = z.object({
  success: z.boolean(),
  responseId: z.string(),
});

export const listResponsesInputModel = z.object({
  formId: z.string().uuid("Invalid form ID format"),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

export const listResponsesOutputModel = z.object({
  responses: z.array(
    z.object({
      id: z.string(),
      respondentEmail: z.string().nullable(),
      ipAddress: z.string().nullable(),
      submittedAt: z.date(),
      answers: z.array(
        z.object({
          id: z.string(),
          fieldId: z.string(),
          value: z.unknown(),
        })
      ),
    })
  ),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export const getFormAnalyticsInputModel = z.object({
  formId: z.string().uuid("Invalid form ID format"),
});

export const getFormAnalyticsOutputModel = z.object({
  totalResponses: z.number(),
  fieldAnalytics: z.array(
    z.object({
      fieldId: z.string(),
      label: z.string(),
      type: z.string(),
      totalAnswers: z.number(),
      stats: z.record(z.string(), z.unknown()),
    })
  ),
});

export const deleteResponseInputModel = z.object({
  responseId: z.string().uuid("Invalid response ID format"),
});

export const deleteResponseOutputModel = z.object({
  success: z.boolean(),
  responseId: z.string(),
});

export const listPublicFormsInputModel = z.object({
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

export const listPublicFormsOutputModel = z.object({
  forms: z.array(
    z.object({
      id: z.string(),
      userId: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      slug: z.string(),
      isPublished: z.boolean(),
      visibility: z.string(),
      theme: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })
  ),
});














