import { userService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { TRPCError } from "@trpc/server";
import { 
  createUserWithEmailAndPasswordInputModel, 
  createUserwithEmailAndPasswordOutputModel,
  verifyEmailInputModel,
  verifyEmailOutputModel,
  loginWithEmailAndPasswordInputModel,
  loginWithEmailAndPasswordOutputModel,
  resendVerificationEmailInputModel,
  resendVerificationEmailOutputModel,
  forgotPasswordInputModel,
  forgotPasswordOutputModel,
  resetPasswordInputModel,
  resetPasswordOutputModel,
  logoutInputModel,
  logoutOutputModel,
  getCurrentUserInputModel,
  getCurrentUserOutputModel
} from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  createUserwithEmailAndPassword: publicProcedure.meta(
    {
      openapi:
      {
        method: "POST",
        path: getPath("/createUserwithEmailAndPassword"),
        tags: TAGS
      }
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserwithEmailAndPasswordOutputModel)
    .mutation(async ({ input }) => {
      const { name, email, password } = input;
      const { id } = await userService.createUserWithEmailAndPassword({
        name,
        email,
        password
      });
      return {
        id
      }
    }),

  verifyEmail: publicProcedure.meta(
    {
      openapi:
      {
        method: "POST",
        path: getPath("/verifyEmail"),
        tags: TAGS
      }
    })
    .input(verifyEmailInputModel)
    .output(verifyEmailOutputModel)
    .mutation(async ({ input }) => {
      const { token } = input;
      const { success } = await userService.verifyEmail(token);
      return {
        success
      }
    }),

  loginWithEmailAndPassword: publicProcedure.meta(
    {
      openapi:
      {
        method: "POST",
        path: getPath("/loginWithEmailAndPassword"),
        tags: TAGS
      }
    })
    .input(loginWithEmailAndPasswordInputModel)
    .output(loginWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      try {
        const ipAddress = ctx.req?.ip || (ctx.req?.headers["x-forwarded-for"] as string) || undefined;
        const userAgent = ctx.req?.headers["user-agent"] || undefined;

        const result = await userService.loginWithEmailAndPassword(input, {
          ipAddress,
          userAgent,
        });

        // Set httpOnly cookie securely if response object is available in context
        if (ctx.res) {
          ctx.res.cookie("session_token", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: result.session.expiresAt,
          });
        }

        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error.message || "Invalid email or password",
        });
      }
    }),

  resendVerificationEmail: publicProcedure.meta(
    {
      openapi:
      {
        method: "POST",
        path: getPath("/resendVerificationEmail"),
        tags: TAGS
      }
    })
    .input(resendVerificationEmailInputModel)
    .output(resendVerificationEmailOutputModel)
    .mutation(async ({ input }) => {
      try {
        const { email } = input;
        return await userService.resendVerificationEmail(email);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to resend verification email",
        });
      }
    }),

  forgotPassword: publicProcedure.meta(
    {
      openapi:
      {
        method: "POST",
        path: getPath("/forgotPassword"),
        tags: TAGS
      }
    })
    .input(forgotPasswordInputModel)
    .output(forgotPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      try {
        const { email } = input;
        const ipAddress = ctx.req?.ip || (ctx.req?.headers["x-forwarded-for"] as string) || undefined;
        return await userService.forgotPassword(email, { ipAddress });
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to process forgot password request",
        });
      }
    }),

  resetPassword: publicProcedure.meta(
    {
      openapi:
      {
        method: "POST",
        path: getPath("/resetPassword"),
        tags: TAGS
      }
    })
    .input(resetPasswordInputModel)
    .output(resetPasswordOutputModel)
    .mutation(async ({ input }) => {
      try {
        return await userService.resetPassword(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to reset password",
        });
      }
    }),

  logout: publicProcedure.meta(
    {
      openapi:
      {
        method: "POST",
        path: getPath("/logout"),
        tags: TAGS
      }
    })
    .input(logoutInputModel)
    .output(logoutOutputModel)
    .mutation(async ({ ctx }) => {
      const cookieHeader = ctx.req?.headers?.cookie;
      let sessionToken: string | undefined;
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split(";").map((c: string) => {
            const parts = c.trim().split("=");
            return [parts[0], parts.slice(1).join("=")];
          })
        );
        sessionToken = cookies["session_token"];
      }

      if (sessionToken) {
        await userService.logout(sessionToken).catch((err) => {
          console.error("Failed to revoke session on logout:", err);
        });
      }

      if (ctx.res) {
        ctx.res.clearCookie("session_token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
      }

      return { success: true };
    }),

  getCurrentUser: publicProcedure.meta(
    {
      openapi:
      {
        method: "GET",
        path: getPath("/getCurrentUser"),
        tags: TAGS
      }
    })
    .input(getCurrentUserInputModel)
    .output(getCurrentUserOutputModel)
    .query(async ({ ctx }) => {
      const cookieHeader = ctx.req?.headers?.cookie;
      let sessionToken: string | undefined;
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split(";").map((c: string) => {
            const parts = c.trim().split("=");
            return [parts[0], parts.slice(1).join("=")];
          })
        );
        sessionToken = cookies["session_token"];
      }

      if (!sessionToken) {
        return null;
      }

      const result = await userService.getCurrentUser(sessionToken);
      if (!result) {
        // Clear invalid/expired cookie
        if (ctx.res) {
          ctx.res.clearCookie("session_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
        }
        return null;
      }

      return {
        user: result.user,
      };
    }),
});
