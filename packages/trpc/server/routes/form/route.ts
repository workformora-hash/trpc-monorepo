import { formService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { TRPCError } from "@trpc/server";
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
  clearFormResponsesOutputModel
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
      return result;
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
});
