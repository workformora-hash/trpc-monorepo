import { db, eq } from "@repo/database";
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
