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

  expiresAt: z.coerce.date().optional().nullable()
    .describe("Date and time when the form should stop accepting responses"),

  maxResponses: z.number().int().min(1).optional().nullable()
    .describe("Maximum number of responses the form can accept"),

  notifyCreator: z.boolean().optional().default(false)
    .describe("Email the form creator when a new response is submitted"),

  notifyRespondent: z.boolean().optional().default(false)
    .describe("Email the respondent a copy of their submission"),
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
    expiresAt: z.date().nullable(),
    maxResponses: z.number().nullable(),
    isArchived: z.boolean(),
    notifyCreator: z.boolean(),
    notifyRespondent: z.boolean(),
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

  expiresAt: z.coerce.date().optional().nullable()
    .describe("Date and time when the form should stop accepting responses"),

  maxResponses: z.number().int().min(1).optional().nullable()
    .describe("Maximum number of responses the form can accept"),

  notifyCreator: z.boolean().optional()
    .describe("Email the form creator when a new response is submitted"),

  notifyRespondent: z.boolean().optional()
    .describe("Email the respondent a copy of their submission"),
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
    expiresAt: z.date().nullable(),
    maxResponses: z.number().nullable(),
    isArchived: z.boolean(),
    notifyCreator: z.boolean(),
    notifyRespondent: z.boolean(),
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
    "contact_info",
    "address",
    "website",
    "dropdown",
    "yes_no",
    "ranking",
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
    expiresAt: z.date().nullable(),
    maxResponses: z.number().nullable(),
    isArchived: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  fields: z.array(formFieldModel),
  isPasswordProtected: z.boolean(),
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
    expiresAt: z.date().nullable(),
    maxResponses: z.number().nullable(),
    isArchived: z.boolean(),
    notifyCreator: z.boolean(),
    notifyRespondent: z.boolean(),
    isPasswordProtected: z.boolean().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  fields: z.array(formFieldModel),
});

export const listFormsCreatorInputModel = z.object({}).optional();

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
      expiresAt: z.date().nullable(),
      maxResponses: z.number().nullable(),
      isArchived: z.boolean(),
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
    expiresAt: z.date().nullable(),
    maxResponses: z.number().nullable(),
    isArchived: z.boolean(),
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
  label: z.string().min(0).max(512, "Label must be at most 512 characters long").optional().default(""),
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
    "contact_info",
    "address",
    "website",
    "dropdown",
    "yes_no",
    "ranking",
  ]),
  required: z.boolean().default(false),
  validation: z.record(z.string(), z.unknown()).optional(),
});

export const addFormFieldOutputModel = z.object({
  field: formFieldModel,
});

export const editFormFieldInputModel = z.object({
  id: z.string().uuid("Invalid field ID format"),
  label: z.string().min(0).max(512, "Label must be at most 512 characters long").optional(),
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
    "contact_info",
    "address",
    "website",
    "dropdown",
    "yes_no",
    "ranking",
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
  respondentEmail: z.string().optional().nullable(),
  ipAddress: z.string().optional().nullable(),
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
      expiresAt: z.date().nullable(),
      maxResponses: z.number().nullable(),
      isArchived: z.boolean(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })
  ),
});

export const exportResponsesToCSVInputModel = z.object({
  formId: z.string().uuid("Invalid form ID format"),
});

export const exportResponsesToCSVOutputModel = z.object({
  success: z.boolean(),
  csv: z.string(),
});

export const getResponseByIdInputModel = z.object({
  responseId: z.string().uuid("Invalid response ID format"),
});

export const getResponseByIdOutputModel = z.object({
  response: z.object({
    id: z.string(),
    formId: z.string(),
    formTitle: z.string(),
    respondentEmail: z.string().nullable(),
    ipAddress: z.string().nullable(),
    submittedAt: z.date(),
  }),
  answers: z.array(
    z.object({
      fieldId: z.string(),
      label: z.string(),
      type: z.string(),
      value: z.unknown(),
    })
  ),
});

export const restoreDeletedFormInputModel = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export const restoreDeletedFormOutputModel = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  slug: z.string(),
  isPublished: z.boolean(),
  visibility: z.string(),
  theme: z.string(),
  expiresAt: z.date().nullable(),
  maxResponses: z.number().nullable(),
  isArchived: z.boolean(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const archiveFormInputModel = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export const archiveFormOutputModel = z.object({
  success: z.boolean(),
  form: z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    slug: z.string(),
    isPublished: z.boolean(),
    visibility: z.string(),
    theme: z.string(),
    expiresAt: z.date().nullable(),
    maxResponses: z.number().nullable(),
    isArchived: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
});

export const unarchiveFormInputModel = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export const unarchiveFormOutputModel = z.object({
  success: z.boolean(),
  form: z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    slug: z.string(),
    isPublished: z.boolean(),
    visibility: z.string(),
    theme: z.string(),
    expiresAt: z.date().nullable(),
    maxResponses: z.number().nullable(),
    isArchived: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
});

export const listFormTemplatesInputModel = z.object({}).optional();

export const listFormTemplatesOutputModel = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    theme: z.string(),
    fields: z.array(
      z.object({
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
          "contact_info",
          "address",
          "website",
          "dropdown",
          "yes_no",
          "ranking",
        ]),
        required: z.boolean(),
        validation: z.record(z.string(), z.unknown()).nullable().optional(),
      })
    ),
  })
);

export const createFormFromTemplateInputModel = z.object({
  templateId: z.string(),
});

export const createFormFromTemplateOutputModel = z.object({
  success: z.boolean(),
  form: z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    slug: z.string(),
    isPublished: z.boolean(),
    visibility: z.enum(["public", "unlisted"]),
    theme: z.string(),
    expiresAt: z.date().nullable(),
    maxResponses: z.number().nullable(),
    isArchived: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
});

export const setFormPasswordInputModel = z.object({
  id: z.string().uuid("Invalid form ID format"),
  password: z.string().min(4, "Password must be at least 4 characters").max(128, "Password too long"),
});

export const setFormPasswordOutputModel = z.object({
  success: z.boolean(),
  formId: z.string(),
});

export const removeFormPasswordInputModel = z.object({
  id: z.string().uuid("Invalid form ID format"),
});

export const removeFormPasswordOutputModel = z.object({
  success: z.boolean(),
  formId: z.string(),
});

export const verifyFormPasswordInputModel = z.object({
  slug: z.string().min(1, "Slug is required"),
  password: z.string().min(1, "Password is required"),
});

export const verifyFormPasswordOutputModel = z.object({
  success: z.boolean(),
  form: z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    slug: z.string(),
    isPublished: z.boolean(),
    visibility: z.string(),
    theme: z.string(),
    expiresAt: z.date().nullable(),
    maxResponses: z.number().nullable(),
    isArchived: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  fields: z.array(formFieldModel),
});

export const logicRuleSchema = z.object({
  triggerFieldId: z.string().uuid("Invalid trigger field ID format"),
  operator: z.enum(["equals", "not_equals", "greater_than", "less_than"]),
  value: z.unknown(),
});

export const addFieldLogicRuleInputModel = z.object({
  fieldId: z.string().uuid("Invalid field ID format"),
  rule: logicRuleSchema,
});

export const addFieldLogicRuleOutputModel = z.object({
  success: z.boolean(),
  fieldId: z.string(),
  validation: z.record(z.string(), z.unknown()),
});

export const editFieldLogicRuleInputModel = z.object({
  fieldId: z.string().uuid("Invalid field ID format"),
  rule: logicRuleSchema,
});

export const editFieldLogicRuleOutputModel = z.object({
  success: z.boolean(),
  fieldId: z.string(),
  validation: z.record(z.string(), z.unknown()),
});

export const deleteFieldLogicRuleInputModel = z.object({
  fieldId: z.string().uuid("Invalid field ID format"),
});

export const deleteFieldLogicRuleOutputModel = z.object({
  success: z.boolean(),
  fieldId: z.string(),
});

export const getFormLogicTreeInputModel = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export const getFormLogicTreeOutputModel = z.object({
  formId: z.string(),
  title: z.string(),
  logicTree: z.array(
    z.object({
      fieldId: z.string(),
      label: z.string(),
      type: z.string(),
      logicRule: logicRuleSchema.nullable(),
    })
  ),
});

export const listExploreFormsInputModel = z.object({
  search: z.string().optional(),
  theme: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

export const listExploreFormsOutputModel = z.object({
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
      expiresAt: z.date().nullable(),
      maxResponses: z.number().nullable(),
      isArchived: z.boolean(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })
  ),
  limit: z.number(),
  offset: z.number(),
});

export const listTemplatesByCategoryInputModel = z.object({
  category: z.string().optional(),
});

export const templateFieldModel = z.object({
  label: z.string(),
  type: z.string(),
  required: z.boolean(),
  validation: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const listTemplatesByCategoryOutputModel = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.string(),
    theme: z.string(),
    fields: z.array(templateFieldModel),
  })
);

export const getQuestionDurationStatsInputModel = z.object({
  formId: z.string().uuid("Invalid form ID format"),
});

export const getQuestionDurationStatsOutputModel = z.object({
  formId: z.string(),
  stats: z.array(
    z.object({
      fieldId: z.string(),
      label: z.string(),
      type: z.string(),
      averageDurationMs: z.number(),
      totalDurationMs: z.number(),
      responseCount: z.number(),
      responseWithDurationCount: z.number(),
    })
  ),
});

export const getResponseGeoDistributionInputModel = z.object({
  formId: z.string().uuid("Invalid form ID format"),
});

export const getResponseGeoDistributionOutputModel = z.object({
  formId: z.string(),
  countries: z.array(
    z.object({
      country: z.string(),
      count: z.number(),
    })
  ),
  cities: z.array(
    z.object({
      city: z.string(),
      count: z.number(),
    })
  ),
  totalResponses: z.number(),
});

export const onNewResponseInputModel = z.object({
  formId: z.string().uuid("Invalid form ID format"),
});

export const onNewResponseOutputModel = z.object({
  formId: z.string(),
  responseId: z.string(),
  respondentEmail: z.string().optional().nullable(),
  ipAddress: z.string().optional().nullable(),
  submittedAt: z.date(),
});

export const trackFormViewInputModel = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export const trackFormViewOutputModel = z.object({
  success: z.boolean(),
  formId: z.string(),
  views: z.number(),
});

export const duplicateFormFieldInputModel = z.object({
  fieldId: z.string().uuid("Invalid field ID format"),
});

export const duplicateFormFieldOutputModel = formFieldModel;
















