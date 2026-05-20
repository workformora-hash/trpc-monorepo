import "../helpers/integration-setup";
import { deleteFormById, deleteUserById } from "../helpers/integration-setup";
import { describe, it, expect, afterEach } from "vitest";
import FormService from "../../index";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { sessionsTable } from "@repo/database/models/sessions";
import { formFieldsTable } from "@repo/database/models/form-field";
import crypto from "crypto";

describe("FormService - Form Fields (Integration)", () => {
  const formService = new FormService();
  const createdUserIds: string[] = [];
  const createdFormIds: string[] = [];

  afterEach(async () => {
    for (const formId of createdFormIds) {
      await deleteFormById(formId);
    }
    for (const userId of createdUserIds) {
      await deleteUserById(userId);
    }
  });

  async function createTestUserAndSession() {
    const email = `test-form-fields-${Date.now()}@example.com`;
    const [user] = await db
      .insert(usersTable)
      .values({
        name: "Fields User",
        email,
        isEmailVerified: true,
      })
      .returning();

    createdUserIds.push(user.id);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await db.insert(sessionsTable).values({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 3600000),
    });

    return { userId: user.id, token: rawToken };
  }

  it("should successfully add, edit, reorder, and delete form fields in the database", async () => {
    const { token } = await createTestUserAndSession();

    // 1. Create a parent form
    const form = await formService.createForm(token, {
      title: "Test Form for Fields",
      slug: `test-fields-slug-${Date.now()}`,
      visibility: "unlisted",
      theme: "default",
    });

    createdFormIds.push(form.id);

    // 2. Add Field 1
    const field1 = await formService.addFormField(token, {
      formId: form.id,
      label: "First Question",
      type: "short_text",
      required: true,
    });

    expect(field1.id).toBeDefined();
    expect(field1.orderIndex).toBe(0);

    // 3. Add Field 2 (should auto-increment orderIndex to 1)
    const field2 = await formService.addFormField(token, {
      formId: form.id,
      label: "Second Question",
      type: "number",
      required: false,
    });

    expect(field2.orderIndex).toBe(1);

    // 4. Edit Field 1 properties (make it unrequired and change label)
    const editedField1 = await formService.editFormField(token, {
      id: field1.id,
      label: "Modified Question 1",
      required: false,
    });

    expect(editedField1.label).toBe("Modified Question 1");
    expect(editedField1.required).toBe(false);

    // 5. Reorder fields (swap field1 and field2)
    const reorderResult = await formService.reorderFormFields(token, {
      formId: form.id,
      fields: [
        { id: field1.id, orderIndex: 1 },
        { id: field2.id, orderIndex: 0 },
      ],
    });

    expect(reorderResult.success).toBe(true);

    // Verify order in database
    const dbFields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, form.id));

    const f1InDb = dbFields.find((f) => f.id === field1.id);
    const f2InDb = dbFields.find((f) => f.id === field2.id);

    expect(f1InDb?.orderIndex).toBe(1);
    expect(f2InDb?.orderIndex).toBe(0);

    // 6. Delete Field 1
    const deleteResult = await formService.deleteFormField(token, {
      id: field1.id,
    });

    expect(deleteResult.success).toBe(true);
    expect(deleteResult.id).toBe(field1.id);
  }, 30000);
});
