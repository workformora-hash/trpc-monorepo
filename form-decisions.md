# Form Schema — Design Decisions

---

### Why `theme` is a varchar on `forms` and not a separate table

Themes are just config objects in the app layer. A string key like `"default"` or `"anime"` maps to a config object in code. There is no data in a theme that needs to live in the database. A separate table would mean a join on every single form fetch for data that never changes at runtime.

---

### Why `validation` is jsonb on `form_fields`

Every field type needs different configuration.

- Text needs `minLength` and `maxLength`
- Select needs `options`
- Rating needs `max`
- Date needs `minDate` and `maxDate`

If these were flat columns, most of them would be NULL for most field types. That is ten nullable columns where only two are ever populated — messy, and every new field type needs a migration.

`jsonb` stores only what each field type actually needs. Adding a new field type with new config requires zero migrations.

Common fields that every field type always has — `label`, `type`, `required`, `orderIndex` — stay as proper columns because they are always present and always queried.

---

### Why `form_responses` and `form_field_answers` are two separate tables

`form_responses` is one row per submission. It records the act of submitting — when, who, from where.

`form_field_answers` is one row per field per submission. It records the actual data typed or selected for each question.

A form with 10 fields produces 1 row in `form_responses` and 10 rows in `form_field_answers`.

If we merged them and stored all answers as a jsonb blob on `form_responses`, querying across answers becomes painful. Something like "how many people selected option A on field 3" would require unpacking jsonb on every response row. With `form_field_answers` as its own table that is a simple indexed lookup.

---

### Why `value` is jsonb on `form_field_answers`

Every field type produces a different answer shape.

- Text and email → string
- Number and rating → number
- Checkbox → boolean
- Multi-select → array of strings

The alternative is separate nullable columns — `textValue`, `numberValue`, `booleanValue`, `arrayValue` — where only one is ever populated per row. That is four nullable columns to store one value.

`jsonb` stores whatever shape the field type produces. The field type is always known from `form_fields.type` so the app layer always knows how to read the value back correctly.

---

### Why there is a unique constraint on `(responseId, fieldId)` in `form_field_answers`

One response can only have one answer per field. Without a database constraint, a bug in the submission handler could silently write duplicate answers for the same field. The unique constraint makes that impossible at the database level — no application code can accidentally bypass it.

---

### Why `respondentEmail` and `ipAddress` are on `form_responses`

Respondents do not log in so we cannot attach a response to a user account. We store what we can passively — email if the form collected it, IP for rate limiting and abuse detection. The creator can filter and export responses by email. The IP helps spot suspicious submission patterns.
