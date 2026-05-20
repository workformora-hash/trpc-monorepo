import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  pgEnum,
  index,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./user";
import { formFieldsTable } from "./form-field";
import { formResponsesTable } from "./form-response";
import { timestamps, softDelete } from "../helpers";

export const formVisibilityEnum = pgEnum("form_visibility", [
  "public",
  "unlisted",
]);

export const formsTable = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    title: varchar("title", { length: 256 }).notNull(),
    description: text("description"),
    slug: varchar("slug", { length: 256 }).notNull().unique(),

    isPublished: boolean("is_published").notNull().default(false),
    visibility: formVisibilityEnum("visibility").notNull().default("unlisted"),

    theme: varchar("theme", { length: 64 }).notNull().default("default"),

    expiresAt: timestamp("expires_at", { withTimezone: true }),
    maxResponses: integer("max_responses"),
    isArchived: boolean("is_archived").notNull().default(false),

    ...timestamps,
    ...softDelete,
  },
  (table) => ({
    userIdIdx: index("forms_user_id_idx").on(table.userId),
    slugIdx: index("forms_slug_idx").on(table.slug),
    visibilityIdx: index("forms_visibility_idx").on(table.visibility),
    publishedIdx: index("forms_is_published_idx").on(table.isPublished),
  })
);

export const formsRelations = relations(formsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [formsTable.userId],
    references: [usersTable.id],
  }),
  fields: many(formFieldsTable),
  responses: many(formResponsesTable),
}));

export type Form = typeof formsTable.$inferSelect;
export type NewForm = typeof formsTable.$inferInsert;