import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { formsTable } from "./form";
import { formFieldAnswersTable } from "./form-field-answer";

export const formResponsesTable = pgTable(
  "form_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),

    respondentEmail: varchar("respondent_email", { length: 320 }),
    ipAddress: varchar("ip_address", { length: 45 }),

    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    formIdIdx: index("form_responses_form_id_idx").on(table.formId),
    submittedAtIdx: index("form_responses_submitted_at_idx").on(table.submittedAt),
    formIdSubmittedAtIdx: index("form_responses_form_id_submitted_at_idx").on(
      table.formId,
      table.submittedAt
    ),
  })
);

export const formResponsesRelations = relations(formResponsesTable, ({ one, many }) => ({
  form: one(formsTable, {
    fields: [formResponsesTable.formId],
    references: [formsTable.id],
  }),
  answers: many(formFieldAnswersTable),
}));

export type FormResponse = typeof formResponsesTable.$inferSelect;
export type NewFormResponse = typeof formResponsesTable.$inferInsert;