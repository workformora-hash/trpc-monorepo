import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./user";
import { timestamps } from "../helpers";

export const credentials = pgTable(
  "credentials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(), // 1-to-1 with users

    passwordHash: varchar("password_hash", { length: 256 }).notNull(),

    // Brute-force protection
    failedAttempts: integer("failed_attempts").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    lastPasswordChange: timestamp("last_password_change", {
      withTimezone: true,
    }).defaultNow(),

    ...timestamps,
  },
  (table) => ({
    userIdIdx: index("credentials_user_id_idx").on(table.userId),
  })
);

export const credentialsRelations = relations(credentials, ({ one }) => ({
  user: one(users, {
    fields: [credentials.userId],
    references: [users.id],
  }),
}));

export type Credential = typeof credentials.$inferSelect;
export type NewCredential = typeof credentials.$inferInsert;