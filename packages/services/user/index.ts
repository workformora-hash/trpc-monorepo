import { db, eq, and, gt, sql } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { credentialsTable } from "@repo/database/models/credentials";
import { emailVerificationTokensTable } from "@repo/database/models/email-verification-tokens";
import { sessionsTable } from "@repo/database/models/sessions";
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

    // Update user's email verification status
    await db
      .update(usersTable)
      .set({
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      })
      .where(eq(usersTable.id, tokenRecord.userId));

    // Mark token as used
    await db
      .update(emailVerificationTokensTable)
      .set({
        isUsed: true,
        usedAt: new Date(),
      })
      .where(eq(emailVerificationTokensTable.id, tokenRecord.id));

    return { success: true };
  }

  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email))
    if (!result || result.length === 0) {
      return null;
    }
    return result[0];
  }
  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    const { name, email, password } = await createUserWithEmailAndPasswordInput.parseAsync(payload);
    // check if user exist already or not
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userInsertResult = await db.insert(usersTable).values({
      name: name,
      email: email,
    }).returning({
      id: usersTable.id
    })
    const createdUser = userInsertResult?.[0];
    if (!createdUser) {
      throw new Error("Failed to create user");
    }

    const credentialsInsertResult = await db.insert(credentialsTable).values({
      userId: createdUser.id,
      passwordHash: hashedPassword,
    }).returning({
      id: credentialsTable.id
    })

    if (!credentialsInsertResult || credentialsInsertResult.length === 0) {
      throw new Error("Failed to create user credentials");
    }
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await db.insert(emailVerificationTokensTable).values({
      userId: createdUser.id,
      tokenHash,
      type: "email_verification",
      expiresAt,
    });

    const baseUrl = env.CLIENT_URL;
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    emailService.sendVerificationEmail(email, name, verificationLink)
      .catch((err) => console.error("Failed to send verification email:", err));

    return {
      id: createdUser.id
    }
  }

  public async loginWithEmailAndPassword(
    payload: LoginWithEmailAndPasswordInputType,
    context: { ipAddress?: string; userAgent?: string }
  ) {
    const { email, password } = await loginWithEmailAndPasswordInput.parseAsync(payload);

    // 1. Retrieve the user, ensuring they are not soft-deleted
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.email, email),
          sql`${usersTable.deletedAt} IS NULL`
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

      await db
        .update(credentialsTable)
        .set({
          failedAttempts,
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
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.isEmailVerified) {
      throw new Error("Email is already verified");
    }

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
}

export default UserService;
