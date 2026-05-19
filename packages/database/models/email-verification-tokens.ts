import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tokenTypeEnum } from "../enums";
import { usersTable } from "./user";

export const emailVerificationTokensTable = pgTable(
  "email_verification_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    type: tokenTypeEnum("type").notNull().default("email_verification"),

    // Only populated for email_change type — holds the new email pending confirmation
    newEmail: varchar("new_email", { length: 320 }),

    isUsed: boolean("is_used").notNull().default(false),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("email_verification_tokens_user_id_idx").on(table.userId),
    tokenHashIdx: index("email_verification_tokens_token_hash_idx").on(table.tokenHash),
    expiresAtIdx: index("email_verification_tokens_expires_at_idx").on(table.expiresAt),
  })
);

export const emailVerificationTokensRelations = relations(
  emailVerificationTokensTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [emailVerificationTokensTable.userId],
      references: [usersTable.id],
    }),
  })
);

export type EmailVerificationToken = typeof emailVerificationTokensTable.$inferSelect;
export type NewEmailVerificationToken = typeof emailVerificationTokensTable.$inferInsert;