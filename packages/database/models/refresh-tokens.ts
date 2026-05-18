import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sessions } from "./sessions";

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),

    // SHA-256 hash of the raw token — never store the raw value
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),

    isRevoked: boolean("is_revoked").notNull().default(false),
    revokeReason: varchar("revoke_reason", { length: 64 }), // "logout" | "rotation" | "suspicious"

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    sessionIdIdx: index("refresh_tokens_session_id_idx").on(table.sessionId),
    tokenHashIdx: index("refresh_tokens_token_hash_idx").on(table.tokenHash),
    expiresAtIdx: index("refresh_tokens_expires_at_idx").on(table.expiresAt),
  })
);

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  session: one(sessions, {
    fields: [refreshTokens.sessionId],
    references: [sessions.id],
  }),
}));

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;