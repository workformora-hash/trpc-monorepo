import { formService, formEvents, redis } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import {
  createFormInputModel,
  createFormOutputModel,
  editFormInputModel,
  editFormOutputModel,
  getFormBySlugPublicInputModel,
  getFormBySlugPublicOutputModel,
  getFormByIdCreatorInputModel,
  getFormByIdCreatorOutputModel,
  listFormsCreatorInputModel,
  listFormsCreatorOutputModel,
  deleteFormInputModel,
  deleteFormOutputModel,
  duplicateFormInputModel,
  duplicateFormOutputModel,
  publishFormInputModel,
  publishFormOutputModel,
  unpublishFormInputModel,
  unpublishFormOutputModel,
  checkSlugAvailabilityInputModel,
  checkSlugAvailabilityOutputModel,
  clearFormResponsesInputModel,
  clearFormResponsesOutputModel,
  listFormThemesOutputModel,
  addFormFieldInputModel,
  addFormFieldOutputModel,
  editFormFieldInputModel,
  editFormFieldOutputModel,
  deleteFormFieldInputModel,
  deleteFormFieldOutputModel,
  reorderFormFieldsInputModel,
  reorderFormFieldsOutputModel,
  submitResponseInputModel,
  submitResponseOutputModel,
  listResponsesInputModel,
  listResponsesOutputModel,
  getFormAnalyticsInputModel,
  getFormAnalyticsOutputModel,
  deleteResponseInputModel,
  deleteResponseOutputModel,
  listPublicFormsInputModel,
  listPublicFormsOutputModel,
  exportResponsesToCSVInputModel,
  exportResponsesToCSVOutputModel,
  getResponseByIdInputModel,
  getResponseByIdOutputModel,
  restoreDeletedFormInputModel,
  restoreDeletedFormOutputModel,
  archiveFormInputModel,
  archiveFormOutputModel,
  unarchiveFormInputModel,
  unarchiveFormOutputModel,
  listFormTemplatesInputModel,
  listFormTemplatesOutputModel,
  createFormFromTemplateInputModel,
  createFormFromTemplateOutputModel,
  setFormPasswordInputModel,
  setFormPasswordOutputModel,
  removeFormPasswordInputModel,
  removeFormPasswordOutputModel,
  verifyFormPasswordInputModel,
  verifyFormPasswordOutputModel,
  addFieldLogicRuleInputModel,
  addFieldLogicRuleOutputModel,
  editFieldLogicRuleInputModel,
  editFieldLogicRuleOutputModel,
  deleteFieldLogicRuleInputModel,
  deleteFieldLogicRuleOutputModel,
  getFormLogicTreeInputModel,
  getFormLogicTreeOutputModel,
  listExploreFormsInputModel,
  listExploreFormsOutputModel,
  listTemplatesByCategoryInputModel,
  listTemplatesByCategoryOutputModel,
  getQuestionDurationStatsInputModel,
  getQuestionDurationStatsOutputModel,
  getResponseGeoDistributionInputModel,
  getResponseGeoDistributionOutputModel,
  onNewResponseInputModel,
  onNewResponseOutputModel,
  trackFormViewInputModel,
  trackFormViewOutputModel,
  duplicateFormFieldInputModel,
  duplicateFormFieldOutputModel,
  getCloudinarySignatureInputModel,
  getCloudinarySignatureOutputModel
} from "./model";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

const isProd = process.env.NODE_ENV === "production";
const cookieKey = isProd ? "__Host-session_token" : "session_token";

const getCookieValue = (cookieHeader?: string, name: string = "session_token"): string | undefined => {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return trimmed.substring(name.length + 1);
    }
  }
  return undefined;
};

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const rateLimiter = async (ip: string, action: string, limit: number, windowMs: number): Promise<boolean> => {
  if (redis.isReady()) {
    const result = await redis.rateLimit(ip, action, limit, windowMs / 1000);
    return result.success;
  }

  const key = `${ip}:${action}`;
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
};

const parseIpAddress = (req?: any): string | undefined => {
  if (!req) return undefined;
  const rawIp = (req.headers?.["x-forwarded-for"] as string) || req.ip;
  if (!rawIp) return undefined;
  return rawIp.split(",")[0].trim().substring(0, 45);
};

export const formRouter = router({
  createForm: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/create"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(createFormInputModel)
  .output(createFormOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a form",
        });
      }

      const form = await formService.createForm(sessionToken, input);

      return {
        form: {
          id: form.id,
          userId: form.userId,
          title: form.title,
          description: form.description,
          slug: form.slug,
          isPublished: form.isPublished,
          visibility: form.visibility,
          theme: form.theme,
          expiresAt: form.expiresAt,
          maxResponses: form.maxResponses,
          isArchived: form.isArchived,
          notifyCreator: form.notifyCreator,
          notifyRespondent: form.notifyRespondent,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
        }
      };
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      
      const isSessionError = error.message === "Invalid or expired session";
      throw new TRPCError({
        code: isSessionError ? "UNAUTHORIZED" : "BAD_REQUEST",
        message: error.message || "Failed to create form",
      });
    }
  }),

  editForm: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/edit"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(editFormInputModel)
  .output(editFormOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to edit a form",
        });
      }

      const form = await formService.editForm(sessionToken, input);

      return {
        form: {
          id: form.id,
          userId: form.userId,
          title: form.title,
          description: form.description,
          slug: form.slug,
          isPublished: form.isPublished,
          visibility: form.visibility,
          theme: form.theme,
          expiresAt: form.expiresAt,
          maxResponses: form.maxResponses,
          isArchived: form.isArchived,
          notifyCreator: form.notifyCreator,
          notifyRespondent: form.notifyRespondent,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
        }
      };
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      
      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to edit this form";
      const isNotFoundError = error.message === "Form not found";
      
      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to edit form",
      });
    }
  }),

  getFormBySlugPublic: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/public"),
      tags: TAGS,
    }
  })
  .input(getFormBySlugPublicInputModel)
  .output(getFormBySlugPublicOutputModel)
  .query(async ({ input }) => {
    try {
      const result = await formService.getFormBySlugPublic(input);
      return result;
    } catch (error: any) {
      const isNotFoundError = error.message === "Form not found";
      const isUnpublishedError = error.message === "This form is not published yet";

      throw new TRPCError({
        code: isNotFoundError ? "NOT_FOUND" : (isUnpublishedError ? "FORBIDDEN" : "BAD_REQUEST"),
        message: error.message || "Failed to fetch form",
      });
    }
  }),

  getFormByIdCreator: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/creator/details"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(getFormByIdCreatorInputModel)
  .output(getFormByIdCreatorOutputModel)
  .query(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view your form details",
        });
      }

      const result = await formService.getFormByIdCreator(sessionToken, input);
      return {
        form: {
          ...result.form,
          isPasswordProtected: !!result.form.passwordHash,
        },
        fields: result.fields,
      };
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to view this form";
      const isNotFoundError = error.message === "Form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to fetch form details",
      });
    }
  }),

  listFormsCreator: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/creator/list"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(listFormsCreatorInputModel)
  .output(listFormsCreatorOutputModel)
  .query(async ({ ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view your forms",
        });
      }

      const result = await formService.listFormsCreator(sessionToken);
      return result;
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      throw new TRPCError({
        code: isSessionError ? "UNAUTHORIZED" : "BAD_REQUEST",
        message: error.message || "Failed to list forms",
      });
    }
  }),

  deleteForm: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/delete"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(deleteFormInputModel)
  .output(deleteFormOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a form",
        });
      }

      const form = await formService.deleteForm(sessionToken, input);

      return {
        success: true,
        form: {
          id: form.id,
          userId: form.userId,
          title: form.title,
          deletedAt: form.deletedAt,
        }
      };
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to delete this form";
      const isNotFoundError = error.message === "Form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to delete form",
      });
    }
  }),

  duplicateForm: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/duplicate"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(duplicateFormInputModel)
  .output(duplicateFormOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to duplicate a form",
        });
      }

      const form = await formService.duplicateForm(sessionToken, input);

      return {
        success: true,
        form: {
          id: form.id,
          userId: form.userId,
          title: form.title,
          slug: form.slug,
          isPublished: form.isPublished,
          visibility: form.visibility,
          theme: form.theme,
          expiresAt: form.expiresAt,
          maxResponses: form.maxResponses,
          isArchived: form.isArchived,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
        }
      };
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to duplicate this form";
      const isNotFoundError = error.message === "Form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to duplicate form",
      });
    }
  }),

  publishForm: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/publish"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(publishFormInputModel)
  .output(publishFormOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to publish a form",
        });
      }

      const form = await formService.publishForm(sessionToken, input);

      return {
        success: true,
        form: {
          id: form.id,
          userId: form.userId,
          title: form.title,
          isPublished: form.isPublished,
        }
      };
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to publish this form";
      const isNotFoundError = error.message === "Form not found";
      const isEmptyError = error.message.includes("Cannot publish an empty form");

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" | "FORBIDDEN" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      } else if (isEmptyError) {
        errorCode = "FORBIDDEN";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to publish form",
      });
    }
  }),

  unpublishForm: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/unpublish"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(unpublishFormInputModel)
  .output(unpublishFormOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to unpublish a form",
        });
      }

      const form = await formService.unpublishForm(sessionToken, input);

      return {
        success: true,
        form: {
          id: form.id,
          userId: form.userId,
          title: form.title,
          isPublished: form.isPublished,
        }
      };
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to unpublish this form";
      const isNotFoundError = error.message === "Form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to unpublish form",
      });
    }
  }),

  checkSlugAvailability: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/check-slug"),
      tags: TAGS,
    }
  })
  .input(checkSlugAvailabilityInputModel)
  .output(checkSlugAvailabilityOutputModel)
  .query(async ({ input }) => {
    try {
      const result = await formService.checkSlugAvailability(input);
      return result;
    } catch (error: any) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Failed to check slug availability",
      });
    }
  }),

  clearFormResponses: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/clear-responses"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(clearFormResponsesInputModel)
  .output(clearFormResponsesOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to clear responses",
        });
      }

      const result = await formService.clearFormResponses(sessionToken, input);
      return result;
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to clear responses for this form";
      const isNotFoundError = error.message === "Form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to clear form responses",
      });
    }
  }),

  listFormThemes: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/themes"),
      tags: TAGS,
    }
  })
  .output(listFormThemesOutputModel)
  .query(async () => {
    try {
      const themes = formService.listFormThemes();
      return themes;
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Failed to list form themes",
      });
    }
  }),

  addFormField: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/fields/add"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(addFormFieldInputModel)
  .output(addFormFieldOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to add a form field",
        });
      }

      const field = await formService.addFormField(sessionToken, input);
      return { field };
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to add fields to this form";
      const isNotFoundError = error.message === "Form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to add form field",
      });
    }
  }),

  editFormField: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/fields/edit"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(editFormFieldInputModel)
  .output(editFormFieldOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to edit a form field",
        });
      }

      const field = await formService.editFormField(sessionToken, input);
      return { field };
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to edit fields for this form";
      const isNotFoundError = error.message === "Form field not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to edit form field",
      });
    }
  }),

  deleteFormField: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/fields/delete"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(deleteFormFieldInputModel)
  .output(deleteFormFieldOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a form field",
        });
      }

      const result = await formService.deleteFormField(sessionToken, input);
      return result;
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to delete fields from this form";
      const isNotFoundError = error.message === "Form field not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to delete form field",
      });
    }
  }),

  reorderFormFields: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/fields/reorder"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(reorderFormFieldsInputModel)
  .output(reorderFormFieldsOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to reorder form fields",
        });
      }

      const result = await formService.reorderFormFields(sessionToken, input);
      return result;
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to reorder fields in this form";
      const isNotFoundError = error.message === "Form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to reorder form fields",
      });
    }
  }),

  submitResponse: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/submit"),
      tags: TAGS,
    }
  })
  .input(submitResponseInputModel)
  .output(submitResponseOutputModel)
    .mutation(async ({ input, ctx }) => {
      try {
        const ipAddress = parseIpAddress(ctx.req) || "unknown_ip";
        if (!(await rateLimiter(ipAddress, "submit_response", 10, 60 * 1000))) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many response submissions. Please try again in a minute.",
          });
        }

        const result = await formService.submitResponse(input, ipAddress === "unknown_ip" ? null : ipAddress);
        return result;
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isNotFoundError = error.message === "Form not found";

      let errorCode: "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to submit response",
      });
    }
  }),

  listResponses: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/responses/list"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(listResponsesInputModel)
  .output(listResponsesOutputModel)
  .query(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view responses",
        });
      }

      const result = await formService.listResponses(sessionToken, input);
      return result;
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to view responses for this form";
      const isNotFoundError = error.message === "Form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to retrieve form responses",
      });
    }
  }),

  getFormAnalytics: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/analytics"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(getFormAnalyticsInputModel)
  .output(getFormAnalyticsOutputModel)
  .query(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view analytics",
        });
      }

      const result = await formService.getFormAnalytics(sessionToken, input);
      return result;
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to view analytics for this form";
      const isNotFoundError = error.message === "Form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to retrieve form analytics",
      });
    }
  }),

  deleteResponse: publicProcedure.meta({
    openapi: {
      method: "DELETE",
      path: getPath("/responses/delete"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(deleteResponseInputModel)
  .output(deleteResponseOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete responses",
        });
      }

      const result = await formService.deleteResponse(sessionToken, input);
      return result;
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to delete this response";
      const isNotFoundError = error.message === "Response not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to delete response",
      });
    }
  }),

  listPublicForms: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/public/list"),
      tags: TAGS,
    }
  })
  .input(listPublicFormsInputModel)
  .output(listPublicFormsOutputModel)
  .query(async ({ input }) => {
    try {
      const result = await formService.listPublicForms(input);
      return result;
    } catch (error: any) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Failed to list public forms",
      });
    }
  }),

  exportResponsesToCSV: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/responses/export"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(exportResponsesToCSVInputModel)
  .output(exportResponsesToCSVOutputModel)
  .query(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to export responses",
        });
      }

      const result = await formService.exportResponsesToCSV(sessionToken, input);
      return result;
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to export responses for this form";
      const isNotFoundError = error.message === "Form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to export responses",
      });
    }
  }),

  getResponseById: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/responses/detail"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(getResponseByIdInputModel)
  .output(getResponseByIdOutputModel)
  .query(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view response details",
        });
      }

      const result = await formService.getResponseById(sessionToken, input);
      return result;
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to view this response";
      const isNotFoundError = error.message === "Response not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to fetch response details",
      });
    }
  }),

  restoreDeletedForm: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/restore"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(restoreDeletedFormInputModel)
  .output(restoreDeletedFormOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to restore a form",
        });
      }

      const form = await formService.restoreDeletedForm(sessionToken, input);
      return form;
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to restore this form";
      const isNotFoundError = error.message === "Deleted form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to restore form",
      });
    }
  }),

  archiveForm: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/archive"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(archiveFormInputModel)
  .output(archiveFormOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to archive a form",
        });
      }

      const form = await formService.archiveForm(sessionToken, input);
      return {
        success: true,
        form,
      };
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to archive this form";
      const isNotFoundError = error.message === "Form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to archive form",
      });
    }
  }),

  unarchiveForm: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/unarchive"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(unarchiveFormInputModel)
  .output(unarchiveFormOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to unarchive a form",
        });
      }

      const form = await formService.unarchiveForm(sessionToken, input);
      return {
        success: true,
        form,
      };
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to unarchive this form";
      const isNotFoundError = error.message === "Form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to unarchive form",
      });
    }
  }),

  listFormTemplates: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/templates"),
      tags: TAGS,
    }
  })
  .input(listFormTemplatesInputModel)
  .output(listFormTemplatesOutputModel)
  .query(async () => {
    try {
      return formService.listFormTemplates();
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Failed to list templates",
      });
    }
  }),

  createFormFromTemplate: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/templates/clone"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(createFormFromTemplateInputModel)
  .output(createFormFromTemplateOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a form from a template",
        });
      }

      const form = await formService.createFormFromTemplate(sessionToken, input);
      return {
        success: true,
        form: {
          id: form.id,
          userId: form.userId,
          title: form.title,
          slug: form.slug,
          isPublished: form.isPublished,
          visibility: form.visibility,
          theme: form.theme,
          expiresAt: form.expiresAt,
          maxResponses: form.maxResponses,
          isArchived: form.isArchived,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
        }
      };
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;

      const isSessionError = error.message === "Invalid or expired session";
      const isNotFoundError = error.message === "Template not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }

      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to create form from template",
      });
    }
  }),

  setFormPassword: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/password/set"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(setFormPasswordInputModel)
  .output(setFormPasswordOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);
      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to set a password",
        });
      }
      return await formService.setFormPassword(sessionToken, input);
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to update this form";
      const isNotFoundError = error.message === "Form not found";
      
      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }
      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to set password",
      });
    }
  }),

  removeFormPassword: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/password/remove"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(removeFormPasswordInputModel)
  .output(removeFormPasswordOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);
      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to remove a password",
        });
      }
      return await formService.removeFormPassword(sessionToken, input);
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to update this form";
      const isNotFoundError = error.message === "Form not found";
      
      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }
      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to remove password",
      });
    }
  }),

  verifyFormPassword: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/password/verify"),
      tags: TAGS,
    }
  })
  .input(verifyFormPasswordInputModel)
  .output(verifyFormPasswordOutputModel)
  .mutation(async ({ input }) => {
    try {
      return await formService.verifyFormPassword(input);
    } catch (error: any) {
      const isNotFoundError = error.message === "Form not found";
      const isIncorrect = error.message === "Incorrect password";
      throw new TRPCError({
        code: isNotFoundError ? "NOT_FOUND" : (isIncorrect ? "UNAUTHORIZED" : "BAD_REQUEST"),
        message: error.message || "Failed to verify password",
      });
    }
  }),

  addFieldLogicRule: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/logic/add"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(addFieldLogicRuleInputModel)
  .output(addFieldLogicRuleOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);
      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to modify logic rules",
        });
      }
      return await formService.addFieldLogicRule(sessionToken, input);
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to edit fields for this form";
      const isNotFoundError = error.message === "Form field not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }
      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to add logic rule",
      });
    }
  }),

  editFieldLogicRule: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/logic/edit"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(editFieldLogicRuleInputModel)
  .output(editFieldLogicRuleOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);
      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to modify logic rules",
        });
      }
      return await formService.editFieldLogicRule(sessionToken, input);
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to edit fields for this form";
      const isNotFoundError = error.message === "Form field not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }
      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to edit logic rule",
      });
    }
  }),

  deleteFieldLogicRule: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/logic/delete"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(deleteFieldLogicRuleInputModel)
  .output(deleteFieldLogicRuleOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);
      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete logic rules",
        });
      }
      return await formService.deleteFieldLogicRule(sessionToken, input);
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to edit fields for this form";
      const isNotFoundError = error.message === "Form field not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }
      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to delete logic rule",
      });
    }
  }),

  getFormLogicTree: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/logic/tree"),
      tags: TAGS,
    }
  })
  .input(getFormLogicTreeInputModel)
  .output(getFormLogicTreeOutputModel)
  .query(async ({ input }) => {
    try {
      return await formService.getFormLogicTree(input);
    } catch (error: any) {
      const isNotFoundError = error.message === "Form not found";
      throw new TRPCError({
        code: isNotFoundError ? "NOT_FOUND" : "BAD_REQUEST",
        message: error.message || "Failed to fetch logic tree",
      });
    }
  }),

  listExploreForms: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/explore"),
      tags: TAGS,
    }
  })
  .input(listExploreFormsInputModel)
  .output(listExploreFormsOutputModel)
  .query(async ({ input }) => {
    try {
      return await formService.listExploreForms(input);
    } catch (error: any) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Failed to search public explore forms",
      });
    }
  }),

  listTemplatesByCategory: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/templates/category"),
      tags: TAGS,
    }
  })
  .input(listTemplatesByCategoryInputModel)
  .output(listTemplatesByCategoryOutputModel)
  .query(async ({ input }) => {
    try {
      return await formService.listTemplatesByCategory(input);
    } catch (error: any) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Failed to filter templates",
      });
    }
  }),

  getQuestionDurationStats: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/analytics/duration"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(getQuestionDurationStatsInputModel)
  .output(getQuestionDurationStatsOutputModel)
  .query(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);
      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view analytics",
        });
      }
      return await formService.getQuestionDurationStats(sessionToken, input);
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to view stats for this form";
      const isNotFoundError = error.message === "Form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }
      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to fetch question duration stats",
      });
    }
  }),

  getResponseGeoDistribution: publicProcedure.meta({
    openapi: {
      method: "GET",
      path: getPath("/analytics/geo"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(getResponseGeoDistributionInputModel)
  .output(getResponseGeoDistributionOutputModel)
  .query(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);
      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view analytics",
        });
      }
      return await formService.getResponseGeoDistribution(sessionToken, input);
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to view stats for this form";
      const isNotFoundError = error.message === "Form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }
      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to fetch geographic distribution stats",
      });
    }
  }),

  onNewResponse: publicProcedure
    .input(onNewResponseInputModel)
    .subscription(({ input }) => {
      return observable<{
        formId: string;
        responseId: string;
        respondentEmail?: string | null;
        ipAddress?: string | null;
        submittedAt: Date;
      }>((emit) => {
        const onResponse = (data: {
          formId: string;
          responseId: string;
          respondentEmail?: string | null;
          ipAddress?: string | null;
          submittedAt: Date;
        }) => {
          if (data.formId === input.formId) {
            emit.next(data);
          }
        };

        formEvents.on("response", onResponse);

        return () => {
          formEvents.off("response", onResponse);
        };
      });
    }),

  trackFormView: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/public/view"),
      tags: TAGS,
    }
  })
  .input(trackFormViewInputModel)
  .output(trackFormViewOutputModel)
  .mutation(async ({ input }) => {
    try {
      return await formService.trackFormView(input);
    } catch (error: any) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Failed to track form view",
      });
    }
  }),

  duplicateFormField: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/fields/duplicate"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(duplicateFormFieldInputModel)
  .output(duplicateFormFieldOutputModel)
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);
      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to duplicate form fields",
        });
      }
      return await formService.duplicateFormField(sessionToken, input);
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      const isSessionError = error.message === "Invalid or expired session";
      const isAuthError = error.message === "You are not authorized to duplicate fields on this form";
      const isNotFoundError = error.message === "Field not found" || error.message === "Form not found";

      let errorCode: "UNAUTHORIZED" | "NOT_FOUND" | "BAD_REQUEST" = "BAD_REQUEST";
      if (isSessionError || isAuthError) {
        errorCode = "UNAUTHORIZED";
      } else if (isNotFoundError) {
        errorCode = "NOT_FOUND";
      }
      throw new TRPCError({
        code: errorCode,
        message: error.message || "Failed to duplicate form field",
      });
    }
  }),

  getCloudinarySignature: publicProcedure.meta({
    openapi: {
      method: "POST",
      path: getPath("/upload/signature"),
      tags: TAGS,
      protect: true,
    }
  })
  .input(getCloudinarySignatureInputModel)
  .output(getCloudinarySignatureOutputModel)
  .mutation(async ({ ctx }) => {
    try {
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);
      if (!sessionToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to upload assets",
        });
      }

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dfq6joxe8';
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!apiKey || !apiSecret) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Cloudinary is not configured on the backend server",
        });
      }

      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = 'formora';
      
      const paramsToSign = {
        folder,
        timestamp,
      };

      const sortedKeys = Object.keys(paramsToSign).sort() as (keyof typeof paramsToSign)[];
      const signatureString = sortedKeys
        .map(key => `${key}=${paramsToSign[key]}`)
        .join('&') + apiSecret;
      
      const crypto = await import('crypto');
      const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

      return {
        signature,
        timestamp,
        folder,
        apiKey,
        cloudName,
      };
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Failed to generate upload signature",
      });
    }
  }),
});
