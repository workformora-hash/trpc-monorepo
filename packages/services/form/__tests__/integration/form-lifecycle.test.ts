import "../helpers/integration-setup";
import { deleteFormById, deleteUserById } from "../helpers/integration-setup";
import { describe, it, expect, afterEach } from "vitest";
import FormService from "../../index";
import { db } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { sessionsTable } from "@repo/database/models/sessions";
import { formsTable } from "@repo/database/models/form";
import crypto from "crypto";

describe("FormService - Form Lifecycle (Integration)", () => {
  const formService = new FormService();
  const createdUserIds: string[] = [];
  const createdFormIds: string[] = [];

  afterEach(async () => {
    // Isolated cleanup of generated test entities
    for (const formId of createdFormIds) {
      await deleteFormById(formId);
    }
    for (const userId of createdUserIds) {
      await deleteUserById(userId);
    }
  });

  async function createTestUserAndSession() {
    const email = `test-form-lifecycle-${Date.now()}@example.com`;
    const [user] = await db
      .insert(usersTable)
      .values({
        name: "Lifecycle User",
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
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    });

    return { userId: user.id, token: rawToken };
  }

  it("should successfully create, edit, duplicate, soft-delete, and restore a form in the real DB", async () => {
    const { token } = await createTestUserAndSession();

    // 1. Create Form
    const createdForm = await formService.createForm(token, {
      title: "Test Form Integration",
      slug: `test-lifecycle-slug-${Date.now()}`,
      visibility: "public",
      theme: "default",
    });

    createdFormIds.push(createdForm.id);
    expect(createdForm.id).toBeDefined();
    expect(createdForm.title).toBe("Test Form Integration");

    // 2. Edit Form
    const editedForm = await formService.editForm(token, {
      id: createdForm.id,
      title: "Updated Lifecycle Title",
      description: "Integration edit description",
    });

    expect(editedForm.title).toBe("Updated Lifecycle Title");
    expect(editedForm.description).toBe("Integration edit description");

    // 3. Duplicate Form
    const duplicatedForm = await formService.duplicateForm(token, {
      id: createdForm.id,
    });

    createdFormIds.push(duplicatedForm.id);
    expect(duplicatedForm.id).not.toBe(createdForm.id);
    expect(duplicatedForm.title).toBe("Copy of Updated Lifecycle Title");

    // 4. Soft-delete Form
    const deletedForm = await formService.deleteForm(token, {
      id: createdForm.id,
    });

    expect(deletedForm.deletedAt).toBeInstanceOf(Date);

    // 5. Restore soft-deleted Form
    const restoredForm = await formService.restoreDeletedForm(token, {
      id: createdForm.id,
    });

    expect(restoredForm.deletedAt).toBeNull();
  }, 30000);
});
