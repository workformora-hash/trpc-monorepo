import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { oauthProviderEnum } from "../enums";
import { users } from "./user";
import { timestamps } from "../helpers";

export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    provider: oauthProviderEnum("provider").notNull(),
    providerAccountId: varchar("provider_account_id", { length: 256 }).notNull(),

    // Stored encrypted at application layer — never plaintext
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),

    ...timestamps,
  },
  (table) => ({
    // One provider account can only link to one user
    providerAccountUniqueIdx: uniqueIndex("oauth_provider_account_unique_idx")
      .on(table.provider, table.providerAccountId),

    userIdIdx: index("oauth_accounts_user_id_idx").on(table.userId),
  })
);

export const oauthAccountsRelations = relations(oauthAccounts, ({ one }) => ({
  user: one(users, {
    fields: [oauthAccounts.userId],
    references: [users.id],
  }),
}));

export type OauthAccount = typeof oauthAccounts.$inferSelect;
export type NewOauthAccount = typeof oauthAccounts.$inferInsert;