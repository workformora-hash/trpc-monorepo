import { db, eq, and, gt } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { credentialsTable } from "@repo/database/models/credentials";
import { emailVerificationTokensTable } from "@repo/database/models/email-verification-tokens";
import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";
import { createUserWithEmailAndPasswordInput, GetAuthenticationMethodOutputSchema } from "./model";
import type { CreateUserWithEmailAndPasswordInputType } from "./model"
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import { emailService } from "@repo/email";

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
}

export default UserService;
