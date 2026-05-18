import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  index,
  uniqueIndex,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { userRoleEnum } from "../enums";
import { timestamps, softDelete } from "../helpers";
import { credentials } from "./credentials";
import { oauthAccounts } from "./oauth-accounts";
import { sessions } from "./sessions";
import { emailVerificationTokens } from "./email-verification-tokens";
import { passwordResetTokens } from "./password-reset-tokens";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    email: varchar("email", { length: 320 }).notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),

    name: varchar("name", { length: 128 }).notNull(),
    avatarUrl: text("avatar_url"),

    role: userRoleEnum("role").notNull().default("user"),

    isActive: boolean("is_active").notNull().default(true),
    isEmailVerified: boolean("is_email_verified").notNull().default(false),

    ...timestamps,
    ...softDelete,
  },
  (table) => ({
    // Partial unique — allows re-registration after soft delete
    emailUniqueIdx: uniqueIndex("users_email_unique_idx")
      .on(table.email)
      .where(sql`${table.deletedAt} IS NULL`),

    roleIdx: index("users_role_idx").on(table.role),
    activeIdx: index("users_is_active_idx").on(table.isActive),
    createdAtIdx: index("users_created_at_idx").on(table.createdAt),
  })
);

export const usersRelations = relations(users, ({ one, many }) => ({
  credentials: one(credentials, {
    fields: [users.id],
    references: [credentials.userId],
  }),
  oauthAccounts: many(oauthAccounts),
  sessions: many(sessions),
  emailVerificationTokens: many(emailVerificationTokens),
  passwordResetTokens: many(passwordResetTokens),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;