import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./user";
import { refreshTokensTable } from "./refresh-tokens";

export const sessionsTable = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    // SHA-256 hash of the raw token — never store the raw value
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),

    ipAddress: varchar("ip_address", { length: 45 }), // supports IPv6
    userAgent: text("user_agent"),

    // Parsed from user_agent at login time — powers the active sessions UI
    metadata: jsonb("metadata").$type<{
      os?: string;
      browser?: string;
      deviceType?: "desktop" | "mobile" | "tablet";
    }>(),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }).defaultNow(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
    tokenHashIdx: index("sessions_token_hash_idx").on(table.tokenHash),
    expiresAtIdx: index("sessions_expires_at_idx").on(table.expiresAt),
  })
);

export const sessionsRelations = relations(sessionsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
  refreshTokens: many(refreshTokensTable),
}));

export type Session = typeof sessionsTable.$inferSelect;
export type NewSession = typeof sessionsTable.$inferInsert;