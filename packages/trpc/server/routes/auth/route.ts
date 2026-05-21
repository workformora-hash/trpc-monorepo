import { userService, redis } from "../../services";
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
  getCurrentUserOutputModel,
  getGoogleAuthUrlInputModel,
  getGoogleAuthUrlOutputModel,
  loginWithGoogleInputModel,
  loginWithGoogleOutputModel,
  getActiveSessionsInputModel,
  getActiveSessionsOutputModel,
  revokeSessionByIdInputModel,
  revokeSessionByIdOutputModel,
  refreshSessionInputModel,
  refreshSessionOutputModel,
  changePasswordInputModel,
  changePasswordOutputModel,
  deleteAccountInputModel,
  deleteAccountOutputModel,
  updateProfileInputModel,
  updateProfileOutputModel
} from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

const isProd = process.env.NODE_ENV === "production";
const cookieKey = isProd ? "__Host-session_token" : "session_token";

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
    .mutation(async ({ input, ctx }) => {
      try {
        const ipAddress = parseIpAddress(ctx.req) || "unknown_ip";
        if (!(await rateLimiter(ipAddress, "register", 5, 10 * 60 * 1000))) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many registration attempts. Please try again after 10 minutes.",
          });
        }
        const { name, email, password } = input;
        const { id } = await userService.createUserWithEmailAndPassword({
          name,
          email,
          password
        });
        return {
          id
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to create user",
        });
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
        const ipAddress = parseIpAddress(ctx.req) || "unknown_ip";
        if (!(await rateLimiter(ipAddress, "login", 10, 15 * 60 * 1000))) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many login attempts. Please try again after 15 minutes.",
          });
        }
        const userAgent = ctx.req?.headers["user-agent"] || undefined;

        const result = await userService.loginWithEmailAndPassword(input, {
          ipAddress: ipAddress === "unknown_ip" ? undefined : ipAddress,
          userAgent,
        });

        // Set httpOnly cookie securely if response object is available in context
        if (ctx.res) {
          ctx.res.cookie(cookieKey, result.token, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
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
    .mutation(async ({ input, ctx }) => {
      try {
        const ipAddress = parseIpAddress(ctx.req) || "unknown_ip";
        if (!(await rateLimiter(ipAddress, "resend_verification", 3, 10 * 60 * 1000))) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests. Please try again after 10 minutes.",
          });
        }
        const { email } = input;
        return await userService.resendVerificationEmail(email);
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
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
        const ipAddress = parseIpAddress(ctx.req) || "unknown_ip";
        if (!(await rateLimiter(ipAddress, "forgot_password", 3, 10 * 60 * 1000))) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests. Please try again after 10 minutes.",
          });
        }
        const { email } = input;
        return await userService.forgotPassword(email, { 
          ipAddress: ipAddress === "unknown_ip" ? undefined : ipAddress 
        });
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
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
    .mutation(async ({ input, ctx }) => {
      try {
        const ipAddress = parseIpAddress(ctx.req) || "unknown_ip";
        if (!(await rateLimiter(ipAddress, "reset_password", 5, 15 * 60 * 1000))) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests. Please try again after 15 minutes.",
          });
        }
        return await userService.resetPassword(input);
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
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
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (sessionToken) {
        await userService.logout(sessionToken).catch((err) => {
          console.error("Failed to revoke session on logout:", err);
        });
      }

      if (ctx.res) {
        ctx.res.clearCookie(cookieKey, {
          httpOnly: true,
          secure: isProd,
          sameSite: "lax",
          path: "/",
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
      const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);

      if (!sessionToken) {
        return null;
      }

      const userAgent = ctx.req?.headers["user-agent"] || undefined;
      const ipAddress = parseIpAddress(ctx.req) || undefined;

      const result = await userService.getCurrentUser(sessionToken, {
        ipAddress,
        userAgent,
      });
      if (!result) {
        // Clear invalid/expired cookie
        if (ctx.res) {
          ctx.res.clearCookie(cookieKey, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
          });
        }
        return null;
      }

      return {
        user: result.user,
      };
    }),

  getGoogleAuthUrl: publicProcedure.meta(
    {
      openapi:
      {
        method: "GET",
        path: getPath("/getGoogleAuthUrl"),
        tags: TAGS
      }
    })
    .input(getGoogleAuthUrlInputModel)
    .output(getGoogleAuthUrlOutputModel)
    .query(async () => {
      try {
        return userService.getGoogleAuthUrl();
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to generate Google Auth URL",
        });
      }
    }),

  loginWithGoogle: publicProcedure.meta(
    {
      openapi:
      {
        method: "POST",
        path: getPath("/loginWithGoogle"),
        tags: TAGS
      }
    })
    .input(loginWithGoogleInputModel)
    .output(loginWithGoogleOutputModel)
    .mutation(async ({ input, ctx }) => {
      try {
        const ipAddress = parseIpAddress(ctx.req) || "unknown_ip";
        if (!(await rateLimiter(ipAddress, "google_login", 20, 15 * 60 * 1000))) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many login attempts. Please try again after 15 minutes.",
          });
        }
        const userAgent = ctx.req?.headers["user-agent"] || undefined;

        const result = await userService.loginWithGoogle(input.code, {
          ipAddress: ipAddress === "unknown_ip" ? undefined : ipAddress,
          userAgent,
        });

        // Set httpOnly cookie securely if response object is available in context
        if (ctx.res) {
          ctx.res.cookie(cookieKey, result.token, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
            expires: result.session.expiresAt,
          });
        }

        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error.message || "Failed to authenticate with Google",
        });
      }
    }),

  getActiveSessions: publicProcedure.meta(
    {
      openapi:
      {
        method: "GET",
        path: getPath("/getActiveSessions"),
        tags: TAGS
      }
    })
    .input(getActiveSessionsInputModel)
    .output(getActiveSessionsOutputModel)
    .query(async ({ ctx }) => {
      try {
        const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);
        if (!sessionToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to view active sessions",
          });
        }
        return await userService.getActiveSessions(sessionToken);
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch active sessions",
        });
      }
    }),

  revokeSessionById: publicProcedure.meta(
    {
      openapi:
      {
        method: "POST",
        path: getPath("/revokeSessionById"),
        tags: TAGS
      }
    })
    .input(revokeSessionByIdInputModel)
    .output(revokeSessionByIdOutputModel)
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);
        if (!sessionToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to revoke sessions",
          });
        }
        
        const result = await userService.revokeSessionById(sessionToken, input.sessionId);

        // If the revoked session was the current one, clear the cookie!
        if (result.isCurrent && ctx.res) {
          ctx.res.clearCookie(cookieKey, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
          });
        }

        return { success: result.success };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to revoke session",
        });
      }
    }),

  refreshSession: publicProcedure.meta(
    {
      openapi:
      {
        method: "POST",
        path: getPath("/refreshSession"),
        tags: TAGS
      }
    })
    .input(refreshSessionInputModel)
    .output(refreshSessionOutputModel)
    .mutation(async ({ ctx }) => {
      try {
        const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);
        if (!sessionToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to refresh your session",
          });
        }

        const result = await userService.refreshSession(sessionToken);

        // Reset the cookie with the updated expiration date!
        if (ctx.res) {
          ctx.res.cookie(cookieKey, sessionToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
            expires: result.expiresAt,
          });
        }

        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to refresh session",
        });
      }
    }),

  changePassword: publicProcedure.meta(
    {
      openapi:
      {
        method: "POST",
        path: getPath("/changePassword"),
        tags: TAGS
      }
    })
    .input(changePasswordInputModel)
    .output(changePasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);
        if (!sessionToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to change your password",
          });
        }

        return await userService.changePassword(sessionToken, input);
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to change password",
        });
      }
    }),

  deleteAccount: publicProcedure.meta(
    {
      openapi:
      {
        method: "POST",
        path: getPath("/deleteAccount"),
        tags: TAGS
      }
    })
    .input(deleteAccountInputModel)
    .output(deleteAccountOutputModel)
    .mutation(async ({ ctx }) => {
      try {
        const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);
        if (!sessionToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to delete your account",
          });
        }

        const result = await userService.deleteAccount(sessionToken);

        // Clear the cookie upon account deletion!
        if (ctx.res) {
          ctx.res.clearCookie(cookieKey, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
          });
        }

        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to delete account",
        });
      }
    }),

  updateProfile: publicProcedure.meta(
    {
      openapi:
      {
        method: "POST",
        path: getPath("/updateProfile"),
        tags: TAGS
      }
    })
    .input(updateProfileInputModel)
    .output(updateProfileOutputModel)
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionToken = getCookieValue(ctx.req?.headers?.cookie, cookieKey);
        if (!sessionToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to update your profile",
          });
        }

        return await userService.updateProfile(sessionToken, input);
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to update profile",
        });
      }
    }),
});
