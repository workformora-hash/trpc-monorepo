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
