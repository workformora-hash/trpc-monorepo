import {
  pgTable,
  uuid,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { formResponsesTable } from "./form-response";
import { formFieldsTable } from "./form-field";

export const formFieldAnswersTable = pgTable(
  "form_field_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    responseId: uuid("response_id")
      .notNull()
      .references(() => formResponsesTable.id, { onDelete: "cascade" }),
    fieldId: uuid("field_id")
      .notNull()
      .references(() => formFieldsTable.id, { onDelete: "cascade" }),

    // short_text / long_text / email: { value: string }
    // number / rating:                { value: number }
    // single_select:                  { value: string }
    // multi_select:                   { value: string[] }
    // checkbox:                       { value: boolean }
    // date:                           { value: string } ISO 8601
    value: jsonb("value").notNull(),
  },
  (table) => ({
    responseIdIdx: index("form_field_answers_response_id_idx").on(table.responseId),
    responseFieldUniqueIdx: uniqueIndex("form_field_answers_response_field_unique_idx").on(
      table.responseId,
      table.fieldId
    ),
  })
);

export const formFieldAnswersRelations = relations(formFieldAnswersTable, ({ one }) => ({
  response: one(formResponsesTable, {
    fields: [formFieldAnswersTable.responseId],
    references: [formResponsesTable.id],
  }),
  field: one(formFieldsTable, {
    fields: [formFieldAnswersTable.fieldId],
    references: [formFieldsTable.id],
  }),
}));

export type FormFieldAnswer = typeof formFieldAnswersTable.$inferSelect;
export type NewFormFieldAnswer = typeof formFieldAnswersTable.$inferInsert;