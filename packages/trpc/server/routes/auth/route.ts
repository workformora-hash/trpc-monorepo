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

const isProd = process.env.NODE_ENV === "production";
const cookieKey = isProd ? "__Host-session_token" : "session_token";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const rateLimiter = (ip: string, action: string, limit: number, windowMs: number): boolean => {
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
        if (!rateLimiter(ipAddress, "register", 5, 10 * 60 * 1000)) {
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
        if (!rateLimiter(ipAddress, "login", 10, 15 * 60 * 1000)) {
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
        if (!rateLimiter(ipAddress, "resend_verification", 3, 10 * 60 * 1000)) {
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
        if (!rateLimiter(ipAddress, "forgot_password", 3, 10 * 60 * 1000)) {
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
        if (!rateLimiter(ipAddress, "reset_password", 5, 15 * 60 * 1000)) {
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

      const result = await userService.getCurrentUser(sessionToken);
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
});
