import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "creator",
  "admin",
  "super_admin",
]);

export const oauthProviderEnum = pgEnum("oauth_provider", [
  "google",
  "github",
  "discord",
  "twitter",
]);

export const tokenTypeEnum = pgEnum("token_type", [
  "email_verification",
  "email_change",
]);