import {
  pgTable,
  uuid,
  varchar,
  boolean,
  integer,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { formsTable } from "./form";
import { formFieldAnswersTable } from "./form-field-answer";

export const fieldTypeEnum = pgEnum("field_type", [
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
  "rating",
  "date",
]);

export const formFieldsTable = pgTable(
  "form_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),

    label: varchar("label", { length: 512 }).notNull(),
    type: fieldTypeEnum("type").notNull(),
    required: boolean("required").notNull().default(false),
    orderIndex: integer("order_index").notNull(),

    // Field-type-specific config
    // short_text / long_text: { minLength?: number, maxLength?: number, placeholder?: string }
    // number:                 { min?: number, max?: number, placeholder?: string }
    // single_select / multi_select: { options: string[] }
    // rating:                 { max?: number }
    // date:                   { minDate?: string, maxDate?: string }
    // email / checkbox:       {}
    validation: jsonb("validation").$type<Record<string, unknown>>(),
  },
  (table) => ({
    formIdIdx: index("form_fields_form_id_idx").on(table.formId),
    formIdOrderIdx: index("form_fields_form_id_order_idx").on(
      table.formId,
      table.orderIndex
    ),
  })
);

export const formFieldsRelations = relations(formFieldsTable, ({ one, many }) => ({
  form: one(formsTable, {
    fields: [formFieldsTable.formId],
    references: [formsTable.id],
  }),
  answers: many(formFieldAnswersTable),
}));

export type FormField = typeof formFieldsTable.$inferSelect;
export type NewFormField = typeof formFieldsTable.$inferInsert;