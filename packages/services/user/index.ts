import { db, eq, and, gt, sql, or, lt } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { credentialsTable } from "@repo/database/models/credentials";
import { emailVerificationTokensTable } from "@repo/database/models/email-verification-tokens";
import { sessionsTable } from "@repo/database/models/sessions";
import { passwordResetTokensTable } from "@repo/database/models/password-reset-tokens";
import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";
import { 
  createUserWithEmailAndPasswordInput, 
  loginWithEmailAndPasswordInput,
  GetAuthenticationMethodOutputSchema 
} from "./model";
import type { 
  CreateUserWithEmailAndPasswordInputType,
  LoginWithEmailAndPasswordInputType
} from "./model";
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import { emailService } from "@repo/email";


function parseUserAgent(ua?: string): {
  os?: string;
  browser?: string;
  deviceType?: "desktop" | "mobile" | "tablet";
} {
  if (!ua) {
    return { os: "Unknown", browser: "Unknown", deviceType: "desktop" };
  }

  let os = "Unknown";
  let browser = "Unknown";
  let deviceType: "desktop" | "mobile" | "tablet" = "desktop";

  const uaLower = ua.toLowerCase();

  // Detect OS
  if (uaLower.includes("windows")) os = "Windows";
  else if (uaLower.includes("macintosh") || uaLower.includes("mac os x")) os = "macOS";
  else if (uaLower.includes("iphone") || uaLower.includes("ipad") || uaLower.includes("ipod")) os = "iOS";
  else if (uaLower.includes("android")) os = "Android";
  else if (uaLower.includes("linux")) os = "Linux";

  // Detect Browser
  if (uaLower.includes("edg/")) browser = "Edge";
  else if (uaLower.includes("chrome") && !uaLower.includes("chromium")) browser = "Chrome";
  else if (uaLower.includes("firefox")) browser = "Firefox";
  else if (uaLower.includes("safari") && !uaLower.includes("chrome")) browser = "Safari";

  // Detect Device Type
  if (uaLower.includes("ipad") || (uaLower.includes("android") && !uaLower.includes("mobile"))) {
    deviceType = "tablet";
  } else if (uaLower.includes("iphone") || uaLower.includes("mobile")) {
    deviceType = "mobile";
  } else {
    deviceType = "desktop";
  }

  return { os, browser, deviceType };
}

class UserService {
  private async getUserByEmail(email: string, includeDeleted = false) {
    const normalizedEmail = email.toLowerCase().trim();
    const query = db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.email, normalizedEmail),
          includeDeleted ? sql`1=1` : sql`${usersTable.deletedAt} IS NULL`
        )
      )
      .limit(1);
    const result = await query;
    if (!result || result.length === 0) {
      return null;
    }
    return result[0];
  }

  public async verifyEmail(token: string) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const [tokenRecord] = await db
      .select()
      .from(emailVerificationTokensTable)
      .where(
        and(
          eq(emailVerificationTokensTable.tokenHash, tokenHash),
          eq(emailVerificationTokensTable.isUsed, false),
          eq(emailVerificationTokensTable.type, "email_verification"),
          gt(emailVerificationTokensTable.expiresAt, new Date()), // Token should not be expired
        )
      )
      .limit(1);

    if (!tokenRecord) {
      throw new Error("Invalid or expired token.");
    }

    // Verify user is active and not soft-deleted
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.id, tokenRecord.userId),
          sql`${usersTable.deletedAt} IS NULL`,
          eq(usersTable.isActive, true)
        )
      )
      .limit(1);

    if (!user) {
      throw new Error("User account is inactive or not found");
    }

    await db.transaction(async (tx) => {
      // Update user's email verification status
      await tx
        .update(usersTable)
        .set({
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        })
        .where(eq(usersTable.id, tokenRecord.userId));

      // Mark token as used
      await tx
        .update(emailVerificationTokensTable)
        .set({
          isUsed: true,
          usedAt: new Date(),
        })
        .where(eq(emailVerificationTokensTable.id, tokenRecord.id));
    });

    return { success: true };
  }

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    const { name, email, password } = await createUserWithEmailAndPasswordInput.parseAsync(payload);
    const normalizedEmail = email.toLowerCase().trim();

    // check if user exist already or not (excluding soft-deleted users so they can re-register)
    const existingUser = await this.getUserByEmail(normalizedEmail, false);
    if (existingUser) {
      throw new Error("User already exists");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const userId = await db.transaction(async (tx) => {
      const userInsertResult = await tx.insert(usersTable).values({
        name: name,
        email: normalizedEmail,
      }).returning({
        id: usersTable.id
      });
      const createdUser = userInsertResult?.[0];
      if (!createdUser) {
        throw new Error("Failed to create user");
      }

      const credentialsInsertResult = await tx.insert(credentialsTable).values({
        userId: createdUser.id,
        passwordHash: hashedPassword,
      }).returning({
        id: credentialsTable.id
      });

      if (!credentialsInsertResult || credentialsInsertResult.length === 0) {
        throw new Error("Failed to create user credentials");
      }

      await tx.insert(emailVerificationTokensTable).values({
        userId: createdUser.id,
        tokenHash,
        type: "email_verification",
        expiresAt,
      });

      return createdUser.id;
    });

    const baseUrl = env.CLIENT_URL;
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    emailService.sendVerificationEmail(normalizedEmail, name, verificationLink)
      .catch((err) => console.error("Failed to send verification email:", err));

    // Non-blocking auto-purge of stale tokens
    this.purgeExpiredTokens().catch((err) => console.error("Automatic background token purge failed:", err));

    return {
      id: userId
    };
  }

  public async loginWithEmailAndPassword(
    payload: LoginWithEmailAndPasswordInputType,
    context: { ipAddress?: string; userAgent?: string }
  ) {
    const { email, password } = await loginWithEmailAndPasswordInput.parseAsync(payload);
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Retrieve the user, ensuring they are not soft-deleted and are active
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.email, normalizedEmail),
          sql`${usersTable.deletedAt} IS NULL`,
          eq(usersTable.isActive, true)
        )
      )
      .limit(1);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // 2. Enforce email verification
    if (!user.isEmailVerified) {
      throw new Error("Please verify your email address to log in.");
    }

    // 3. Retrieve user credentials
    const [credentials] = await db
      .select()
      .from(credentialsTable)
      .where(eq(credentialsTable.userId, user.id))
      .limit(1);

    // If credentials row does not exist, this account must be OAuth-only
    if (!credentials) {
      throw new Error("This account is configured for third-party sign-in (like Google or GitHub). Please sign in using your provider.");
    }

    // 4. Check account lockout
    if (credentials.lockedUntil && credentials.lockedUntil > new Date()) {
      const remainingMs = credentials.lockedUntil.getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      throw new Error(
        `This account is temporarily locked due to too many failed attempts. Please try again in ${remainingMinutes} minute(s) or reset your password.`
      );
    }

    // 5. Verify the password
    const isPasswordValid = await bcrypt.compare(password, credentials.passwordHash);

    if (!isPasswordValid) {
      const failedAttempts = credentials.failedAttempts + 1;
      let lockedUntil: Date | null = null;

      // Lock account for 15 minutes if failed attempts hit 5 or multiples of 5
      if (failedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }

      // Atomically update the failed attempts count using Drizzle's sql template
      await db
        .update(credentialsTable)
        .set({
          failedAttempts: sql`${credentialsTable.failedAttempts} + 1`,
          lockedUntil,
        })
        .where(eq(credentialsTable.id, credentials.id));

      if (failedAttempts >= 5) {
        throw new Error("Invalid email or password. Your account has been temporarily locked for 15 minutes.");
      } else {
        const attemptsRemaining = 5 - failedAttempts;
        throw new Error(`Invalid email or password. You have ${attemptsRemaining} attempt(s) remaining before your account is locked.`);
      }
    }

    // 6. Login successful: Reset lockout parameters
    await db
      .update(credentialsTable)
      .set({
        failedAttempts: 0,
        lockedUntil: null,
      })
      .where(eq(credentialsTable.id, credentials.id));

    // 7. Create user session
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(sessionToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30-day session

    // Parse user agent metadata
    const metadata = parseUserAgent(context.userAgent);

    await db.insert(sessionsTable).values({
      userId: user.id,
      tokenHash,
      ipAddress: context.ipAddress || null,
      userAgent: context.userAgent || null,
      metadata,
      expiresAt,
    }); 

    // Non-blocking auto-purge of stale tokens
    this.purgeExpiredTokens().catch((err) => console.error("Automatic background token purge failed:", err));

    return {
      success: true,
      token: sessionToken,
      session: {
        id: tokenHash,
        expiresAt,
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  public async resendVerificationEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.getUserByEmail(normalizedEmail);
    
    // Silent success to prevent user enumeration
    if (!user || user.isEmailVerified) {
      return { success: true };
    }

    // Enforce 60-second cooldown on sending verification emails
    const [latestToken] = await db
      .select()
      .from(emailVerificationTokensTable)
      .where(
        and(
          eq(emailVerificationTokensTable.userId, user.id),
          eq(emailVerificationTokensTable.type, "email_verification")
        )
      )
      .orderBy(sql`${emailVerificationTokensTable.createdAt} DESC`)
      .limit(1);

    if (latestToken && Date.now() - latestToken.createdAt.getTime() < 60 * 1000) {
      throw new Error("Please wait at least 60 seconds before requesting another verification email.");
    }

    // Revoke any existing active verification tokens for this user
    await db
      .update(emailVerificationTokensTable)
      .set({ isUsed: true })
      .where(
        and(
          eq(emailVerificationTokensTable.userId, user.id),
          eq(emailVerificationTokensTable.type, "email_verification"),
          eq(emailVerificationTokensTable.isUsed, false)
        )
      );

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(emailVerificationTokensTable).values({
      userId: user.id,
      tokenHash,
      type: "email_verification",
      expiresAt,
    });

    const baseUrl = env.CLIENT_URL;
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    emailService.sendVerificationEmail(user.email, user.name, verificationLink)
      .catch((err) => console.error("Failed to send verification email:", err));

    return { success: true };
  }

  public async forgotPassword(email: string, context: { ipAddress?: string }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.getUserByEmail(normalizedEmail);
    
    // Silent return for security to prevent user enumeration
    if (!user) {
      return { success: true };
    }

    // Cooldown check for password reset (60 seconds) to prevent spamming
    const [latestResetToken] = await db
      .select()
      .from(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.userId, user.id))
      .orderBy(sql`${passwordResetTokensTable.createdAt} DESC`)
      .limit(1);

    if (latestResetToken && Date.now() - latestResetToken.createdAt.getTime() < 60 * 1000) {
      return { success: true }; // Silent return to prevent spamming/enumeration
    }

    // Revoke any existing active password reset tokens
    await db
      .update(passwordResetTokensTable)
      .set({ isUsed: true })
      .where(
        and(
          eq(passwordResetTokensTable.userId, user.id),
          eq(passwordResetTokensTable.isUsed, false)
        )
      );

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResetTokensTable).values({
      userId: user.id,
      tokenHash,
      ipAddress: context.ipAddress || null,
      expiresAt,
    });

    const baseUrl = env.CLIENT_URL;
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    emailService.sendPasswordResetEmail(user.email, user.name, resetLink)
      .catch((err) => console.error("Failed to send password reset email:", err));

    return { success: true };
  }

  public async resetPassword(payload: { token: string; password: string }) {
    const { token, password } = payload;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const [tokenRecord] = await db
      .select()
      .from(passwordResetTokensTable)
      .where(
        and(
          eq(passwordResetTokensTable.tokenHash, tokenHash),
          eq(passwordResetTokensTable.isUsed, false),
          gt(passwordResetTokensTable.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!tokenRecord) {
      throw new Error("Invalid or expired password reset token");
    }

    // Ensure the user account is active and not soft-deleted
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.id, tokenRecord.userId),
          sql`${usersTable.deletedAt} IS NULL`,
          eq(usersTable.isActive, true)
        )
      )
      .limit(1);

    if (!user) {
      throw new Error("User account is inactive or not found");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.transaction(async (tx) => {
      // 1. Update credentials
      await tx
        .update(credentialsTable)
        .set({
          passwordHash: hashedPassword,
          failedAttempts: 0,
          lockedUntil: null,
        })
        .where(eq(credentialsTable.userId, tokenRecord.userId));

      // 2. Mark token as used
      await tx
        .update(passwordResetTokensTable)
        .set({
          isUsed: true,
          usedAt: new Date(),
        })
        .where(eq(passwordResetTokensTable.id, tokenRecord.id));

      // 3. Mark email as verified since they completed password reset via verification link in their email
      await tx
        .update(usersTable)
        .set({
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        })
        .where(eq(usersTable.id, tokenRecord.userId));

      // 4. Revoke all active sessions for security
      await tx
        .delete(sessionsTable)
        .where(eq(sessionsTable.userId, tokenRecord.userId));
    });

    return { success: true };
  }

  public async logout(token: string) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.tokenHash, tokenHash));

    return { success: true };
  }

  public async getCurrentUser(token: string) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const [sessionWithUser] = await db
      .select({
        session: sessionsTable,
        user: usersTable,
      })
      .from(sessionsTable)
      .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
      .where(
        and(
          eq(sessionsTable.tokenHash, tokenHash),
          gt(sessionsTable.expiresAt, new Date()),
          sql`${usersTable.deletedAt} IS NULL`,
          eq(usersTable.isActive, true) // Enforce active status
        )
      )
      .limit(1);

    if (!sessionWithUser) {
      return null;
    }

    // Update lastActiveAt periodically if it has been > 5 mins and renew rolling session if necessary
    const now = new Date();
    const lastActive = sessionWithUser.session.lastActiveAt;
    if (
      !lastActive ||
      now.getTime() - lastActive.getTime() > 5 * 60 * 1000
    ) {
      const updateData: { lastActiveAt: Date; expiresAt?: Date } = {
        lastActiveAt: now,
      };

      // Rolling session: If session has less than 15 days remaining, extend by 30 days
      const fifteenDaysMs = 15 * 24 * 60 * 60 * 1000;
      if (sessionWithUser.session.expiresAt.getTime() - now.getTime() < fifteenDaysMs) {
        updateData.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }

      await db
        .update(sessionsTable)
        .set(updateData)
        .where(eq(sessionsTable.id, sessionWithUser.session.id))
        .catch((err) => console.error("Failed to update lastActiveAt or extend session:", err));

      if (updateData.expiresAt) {
        sessionWithUser.session.expiresAt = updateData.expiresAt;
      }
    }

    return {
      session: {
        id: sessionWithUser.session.id,
        expiresAt: sessionWithUser.session.expiresAt,
      },
      user: {
        id: sessionWithUser.user.id,
        name: sessionWithUser.user.name,
        email: sessionWithUser.user.email,
        role: sessionWithUser.user.role,
      },
    };
  }

  public async purgeExpiredTokens() {
    const now = new Date();
    
    // Purge expired or used email verification tokens
    await db
      .delete(emailVerificationTokensTable)
      .where(
        or(
          eq(emailVerificationTokensTable.isUsed, true),
          lt(emailVerificationTokensTable.expiresAt, now)
        )
      )
      .catch((err) => console.error("Failed to purge verification tokens:", err));

    // Purge expired or used password reset tokens
    await db
      .delete(passwordResetTokensTable)
      .where(
        or(
          eq(passwordResetTokensTable.isUsed, true),
          lt(passwordResetTokensTable.expiresAt, now)
        )
      )
      .catch((err) => console.error("Failed to purge password reset tokens:", err));

    // Purge expired sessions
    await db
      .delete(sessionsTable)
      .where(lt(sessionsTable.expiresAt, now))
      .catch((err) => console.error("Failed to purge expired sessions:", err));

    return { success: true };
  }
}

export default UserService;
