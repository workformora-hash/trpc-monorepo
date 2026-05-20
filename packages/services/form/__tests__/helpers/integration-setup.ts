import { vi } from "vitest";

// SAFETY FIRST: Route all integration database traffic to a dedicated local/test Postgres database
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/dev";

import { db, eq, sql, inArray } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { credentialsTable } from "@repo/database/models/credentials";
import { sessionsTable } from "@repo/database/models/sessions";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formResponsesTable } from "@repo/database/models/form-response";
import { formFieldAnswersTable } from "@repo/database/models/form-field-answer";

// Mock the environment config module before any other files load
vi.mock("../../../env", () => {
  return {
    env: {
      GOOGLE_OAUTH_CLIENT_ID: "mock-client-id",
      GOOGLE_OAUTH_CLIENT_SECRET: "mock-client-secret",
      GOOGLE_OAUTH_REDIRECT_URI: "mock-redirect-uri",
      CLIENT_URL: "http://localhost:3000",
    },
  };
});

// Helper to safely clean up only a specific form by ID and all its cascade dependencies
export async function deleteFormById(formId: string) {
  try {
    // 1. Fetch form field IDs
    const fields = await db
      .select({ id: formFieldsTable.id })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId));
    
    const fieldIds = fields.map((f) => f.id);

    // 2. Delete answers
    if (fieldIds.length > 0) {
      await db.delete(formFieldAnswersTable).where(inArray(formFieldAnswersTable.fieldId, fieldIds));
    }

    // 3. Delete responses
    await db.delete(formResponsesTable).where(eq(formResponsesTable.formId, formId));

    // 4. Delete fields
    await db.delete(formFieldsTable).where(eq(formFieldsTable.formId, formId));

    // 5. Delete form
    await db.delete(formsTable).where(eq(formsTable.id, formId));
  } catch (err) {
    console.error(`Failed to delete form ID ${formId}:`, err);
  }
}

// Helper to safely clean up specific user by ID
export async function deleteUserById(userId: string) {
  try {
    await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
    await db.delete(credentialsTable).where(eq(credentialsTable.userId, userId));
    await db.delete(usersTable).where(eq(usersTable.id, userId));
  } catch (err) {
    console.error(`Failed to delete user ID ${userId}:`, err);
  }
}

// Global cleanup run once if needed
export async function cleanupIntegrationDb() {
  try {
    const testForms = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(sql`${formsTable.title} LIKE 'Test%' OR ${formsTable.title} LIKE 'Copy of%'`);

    for (const form of testForms) {
      await deleteFormById(form.id);
    }
  } catch (err) {
    console.error("Cleanup integration DB failed:", err);
  }
}
