import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { credentialsTable } from "@repo/database/models/credentials";
import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";
import { createUserWithEmailAndPasswordInput, GetAuthenticationMethodOutputSchema } from "./model";
import type { CreateUserWithEmailAndPasswordInputType } from "./model"
import bcrypt from 'bcryptjs';
class UserService {
  public async getAuthenticationMethods(): Promise<
    ReadonlyArray<GetAuthenticationMethodOutputSchema>
  > {
    const supportedAuthenticationProviders: GetAuthenticationMethodOutputSchema[] = [];

    const isGoogleConfigured = !!(env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET);

    if (isGoogleConfigured) {
      const url = googleOAuth2Client.generateAuthUrl();
      supportedAuthenticationProviders.push({
        provider: "GOOGLE_OAUTH",
        displayName: "Google",
        displayText: "Signin with Google",
        authUrl: url,
      });
    }

    return supportedAuthenticationProviders;
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

    return {
      id: createdUser.id
    }
  }
}

export default UserService;
