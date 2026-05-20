import { formService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { TRPCError } from "@trpc/server";
import { createFormInputModel, createFormOutputModel } from "./model";

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
});
