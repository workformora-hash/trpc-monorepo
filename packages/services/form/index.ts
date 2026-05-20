import { db, eq, and, gt, sql } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { sessionsTable } from "@repo/database/models/sessions";
import { usersTable } from "@repo/database/models/user";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formResponsesTable } from "@repo/database/models/form-response";
import { SYSTEM_THEMES } from "./themes";
import crypto from "crypto";
import { createFormInput, editFormInput, getFormBySlugPublicInput, getFormByIdCreatorInput, deleteFormInput, duplicateFormInput, publishFormInput, unpublishFormInput, checkSlugAvailabilityInput, clearFormResponsesInput, addFormFieldInput, editFormFieldInput, deleteFormFieldInput, reorderFormFieldsInput } from "./model";
import type { CreateFormInputType, EditFormInputType, GetFormBySlugPublicInputType, GetFormByIdCreatorInputType, DeleteFormInputType, DuplicateFormInputType, PublishFormInputType, UnpublishFormInputType, CheckSlugAvailabilityInputType, ClearFormResponsesInputType, AddFormFieldInputType, EditFormFieldInputType, DeleteFormFieldInputType, ReorderFormFieldsInputType } from "./model";

class FormService {
  private async getUserIdFromToken(token: string): Promise<string> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const [sessionWithUser] = await db
      .select({
        session: sessionsTable,
        user: usersTable,
      })
      .from(sessionsTable)
      .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
      .where(
        and(
          eq(sessionsTable.tokenHash, tokenHash),
          gt(sessionsTable.expiresAt, new Date()),
          sql`${usersTable.deletedAt} IS NULL`,
          eq(usersTable.isActive, true)
        )
      )
      .limit(1);

    if (!sessionWithUser) {
      throw new Error("Invalid or expired session");
    }

    return sessionWithUser.user.id;
  }

  public async createForm(token: string, payload: CreateFormInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await createFormInput.parseAsync(payload);

    let slug = validated.slug;
    if (slug) {
      const normalizedSlug = slug.toLowerCase().trim();
      // Check if custom slug is already taken
      const [existingForm] = await db
        .select()
        .from(formsTable)
        .where(eq(formsTable.slug, normalizedSlug))
        .limit(1);

      if (existingForm) {
        throw new Error("Slug is already in use. Please choose a different custom URL.");
      }
      slug = normalizedSlug;
    } else {
      // Generate a unique slug based on title + random suffix
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 5) {
        let slugBase = validated.title
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^\w\-]+/g, "")
          .replace(/\-\-+/g, "-")
          .replace(/^-+/, "")
          .replace(/-+$/, "");

        if (!slugBase) {
          slugBase = "form";
        }

        const randomSuffix = crypto.randomBytes(3).toString("hex"); // 6 chars
        const candidateSlug = `${slugBase}-${randomSuffix}`;

        const [existingForm] = await db
          .select()
          .from(formsTable)
          .where(eq(formsTable.slug, candidateSlug))
          .limit(1);

        if (!existingForm) {
          slug = candidateSlug;
          isUnique = true;
        }
        attempts++;
      }

      if (!slug) {
        // Fallback: use a pure random UUID
        slug = crypto.randomUUID();
      }
    }

    const [newForm] = await db
      .insert(formsTable)
      .values({
        userId,
        title: validated.title,
        description: validated.description || null,
        slug,
        visibility: validated.visibility,
        theme: validated.theme,
        isPublished: false, // forms start unpublished
      })
      .returning();

    if (!newForm) {
      throw new Error("Failed to create form");
    }

    return newForm;
  }

  public async editForm(token: string, payload: EditFormInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await editFormInput.parseAsync(payload);

    // 1. Fetch form first to ensure it exists and belongs to this user
    const [existingForm] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, validated.id),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!existingForm) {
      throw new Error("Form not found");
    }

    if (existingForm.userId !== userId) {
      throw new Error("You are not authorized to edit this form");
    }

    const updateData: Partial<typeof formsTable.$inferInsert> & { updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (validated.title !== undefined) {
      updateData.title = validated.title;
    }

    if (validated.description !== undefined) {
      updateData.description = validated.description;
    }

    if (validated.isPublished !== undefined) {
      updateData.isPublished = validated.isPublished;
    }

    if (validated.visibility !== undefined) {
      updateData.visibility = validated.visibility;
    }

    if (validated.theme !== undefined) {
      updateData.theme = validated.theme;
    }

    if (validated.slug !== undefined && validated.slug !== existingForm.slug) {
      if (validated.slug) {
        const normalizedSlug = validated.slug.toLowerCase().trim();
        // Check if custom slug is already taken by a different form
        const [slugOwner] = await db
          .select()
          .from(formsTable)
          .where(
            and(
              eq(formsTable.slug, normalizedSlug),
              sql`${formsTable.id} <> ${existingForm.id}`
            )
          )
          .limit(1);

        if (slugOwner) {
          throw new Error("Slug is already in use. Please choose a different custom URL.");
        }
        updateData.slug = normalizedSlug;
      } else {
        // If they explicitly nullified the custom slug, we can regenerate a unique slug from title
        const titleToUse = validated.title || existingForm.title;
        let slug = "";
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 5) {
          let slugBase = titleToUse
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "")
            .replace(/\-\-+/g, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, "");

          if (!slugBase) {
            slugBase = "form";
          }

          const randomSuffix = crypto.randomBytes(3).toString("hex");
          const candidateSlug = `${slugBase}-${randomSuffix}`;

          const [duplicateForm] = await db
            .select()
            .from(formsTable)
            .where(
              and(
                eq(formsTable.slug, candidateSlug),
                sql`${formsTable.id} <> ${existingForm.id}`
              )
            )
            .limit(1);

          if (!duplicateForm) {
            slug = candidateSlug;
            isUnique = true;
          }
          attempts++;
        }

        if (!slug) {
          slug = crypto.randomUUID();
        }
        updateData.slug = slug;
      }
    }

    const [updatedForm] = await db
      .update(formsTable)
      .set(updateData)
      .where(eq(formsTable.id, existingForm.id))
      .returning();

    if (!updatedForm) {
      throw new Error("Failed to update form");
    }

    return updatedForm;
  }

  public async getFormBySlugPublic(payload: GetFormBySlugPublicInputType) {
    const validated = await getFormBySlugPublicInput.parseAsync(payload);

    const [form] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.slug, validated.slug),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!form) {
      throw new Error("Form not found");
    }

    if (!form.isPublished) {
      throw new Error("This form is not published yet");
    }

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, form.id))
      .orderBy(sql`${formFieldsTable.orderIndex} ASC`);

    return {
      form,
      fields,
    };
  }

  public async getFormByIdCreator(token: string, payload: GetFormByIdCreatorInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await getFormByIdCreatorInput.parseAsync(payload);

    const [form] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, validated.id),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!form) {
      throw new Error("Form not found");
    }

    if (form.userId !== userId) {
      throw new Error("You are not authorized to view this form");
    }

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, form.id))
      .orderBy(sql`${formFieldsTable.orderIndex} ASC`);

    return {
      form,
      fields,
    };
  }

  public async listFormsCreator(token: string) {
    const userId = await this.getUserIdFromToken(token);

    const forms = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.userId, userId),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .orderBy(sql`${formsTable.createdAt} DESC`);

    return {
      forms,
    };
  }

  public async deleteForm(token: string, payload: DeleteFormInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await deleteFormInput.parseAsync(payload);

    // 1. Fetch form first to ensure it exists and belongs to this user
    const [existingForm] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, validated.id),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!existingForm) {
      throw new Error("Form not found");
    }

    if (existingForm.userId !== userId) {
      throw new Error("You are not authorized to delete this form");
    }

    // 2. Perform soft-deletion by setting deletedAt
    const [deletedForm] = await db
      .update(formsTable)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(formsTable.id, existingForm.id))
      .returning();

    if (!deletedForm) {
      throw new Error("Failed to delete form");
    }

    return deletedForm;
  }

  public async duplicateForm(token: string, payload: DuplicateFormInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await duplicateFormInput.parseAsync(payload);

    // 1. Fetch form first to ensure it exists and belongs to this user
    const [existingForm] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, validated.id),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!existingForm) {
      throw new Error("Form not found");
    }

    if (existingForm.userId !== userId) {
      throw new Error("You are not authorized to duplicate this form");
    }

    // 2. Fetch all fields belonging to this form
    const sourceFields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, existingForm.id))
      .orderBy(sql`${formFieldsTable.orderIndex} ASC`);

    // 3. Generate unique slug for duplicated form
    let duplicateSlug = "";
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      const randomSuffix = crypto.randomBytes(3).toString("hex");
      const candidateSlug = `${existingForm.slug}-copy-${randomSuffix}`;

      const [slugOwner] = await db
        .select()
        .from(formsTable)
        .where(eq(formsTable.slug, candidateSlug))
        .limit(1);

      if (!slugOwner) {
        duplicateSlug = candidateSlug;
        isUnique = true;
      }
      attempts++;
    }

    if (!duplicateSlug) {
      duplicateSlug = `${existingForm.slug}-copy-${crypto.randomUUID()}`;
    }

    // 4. Perform insertion inside a transaction to ensure atomicity
    const clonedForm = await db.transaction(async (tx) => {
      // 4a. Insert cloned form
      const [newForm] = await tx
        .insert(formsTable)
        .values({
          userId,
          title: `Copy of ${existingForm.title}`,
          description: existingForm.description,
          slug: duplicateSlug,
          isPublished: false, // Start unpublished
          visibility: existingForm.visibility,
          theme: existingForm.theme,
        })
        .returning();

      if (!newForm) {
        throw new Error("Failed to insert duplicated form record");
      }

      // 4b. Clone fields linked to the new form ID
      if (sourceFields.length > 0) {
        await tx.insert(formFieldsTable).values(
          sourceFields.map((field) => ({
            formId: newForm.id,
            label: field.label,
            type: field.type,
            required: field.required,
            orderIndex: field.orderIndex,
            validation: field.validation,
          }))
        );
      }

      return newForm;
    });

    return clonedForm;
  }

  public async publishForm(token: string, payload: PublishFormInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await publishFormInput.parseAsync(payload);

    // 1. Fetch form to verify it exists and is owned by this user
    const [existingForm] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, validated.id),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!existingForm) {
      throw new Error("Form not found");
    }

    if (existingForm.userId !== userId) {
      throw new Error("You are not authorized to publish this form");
    }

    // 2. Business validation: Verify that the form is not empty
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, existingForm.id))
      .limit(1);

    if (fields.length === 0) {
      throw new Error("Cannot publish an empty form. Please add at least one question first.");
    }

    // 3. Update isPublished
    const [updatedForm] = await db
      .update(formsTable)
      .set({
        isPublished: true,
        updatedAt: new Date(),
      })
      .where(eq(formsTable.id, existingForm.id))
      .returning();

    if (!updatedForm) {
      throw new Error("Failed to publish form");
    }

    return updatedForm;
  }

  public async unpublishForm(token: string, payload: UnpublishFormInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await unpublishFormInput.parseAsync(payload);

    // 1. Fetch form to verify it exists and is owned by this user
    const [existingForm] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, validated.id),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!existingForm) {
      throw new Error("Form not found");
    }

    if (existingForm.userId !== userId) {
      throw new Error("You are not authorized to unpublish this form");
    }

    // 2. Update isPublished to false
    const [updatedForm] = await db
      .update(formsTable)
      .set({
        isPublished: false,
        updatedAt: new Date(),
      })
      .where(eq(formsTable.id, existingForm.id))
      .returning();

    if (!updatedForm) {
      throw new Error("Failed to unpublish form");
    }

    return updatedForm;
  }

  public async checkSlugAvailability(payload: CheckSlugAvailabilityInputType) {
    const validated = await checkSlugAvailabilityInput.parseAsync(payload);

    const [existingForm] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.slug, validated.slug),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    return {
      available: !existingForm,
    };
  }

  public async clearFormResponses(token: string, payload: ClearFormResponsesInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await clearFormResponsesInput.parseAsync(payload);

    // 1. Fetch form to verify it exists and is owned by this user
    const [existingForm] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, validated.id),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!existingForm) {
      throw new Error("Form not found");
    }

    if (existingForm.userId !== userId) {
      throw new Error("You are not authorized to clear responses for this form");
    }

    // 2. Perform deletion of all responses (cascades to delete answers)
    await db
      .delete(formResponsesTable)
      .where(eq(formResponsesTable.formId, existingForm.id));

    return {
      success: true,
      formId: existingForm.id,
    };
  }

  public listFormThemes() {
    return SYSTEM_THEMES;
  }

  public async addFormField(token: string, payload: AddFormFieldInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await addFormFieldInput.parseAsync(payload);

    // 1. Verify form exists and is owned by the creator
    const [existingForm] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, validated.formId),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!existingForm) {
      throw new Error("Form not found");
    }

    if (existingForm.userId !== userId) {
      throw new Error("You are not authorized to add fields to this form");
    }

    // 2. Query for the current max order index to automatically calculate the next index
    const [maxOrderResult] = await db
      .select({
        maxOrder: sql<number>`COALESCE(MAX(${formFieldsTable.orderIndex}), -1)`,
      })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, validated.formId));

    const nextOrderIndex = (maxOrderResult?.maxOrder ?? -1) + 1;

    // 3. Insert the new field
    const [newField] = await db
      .insert(formFieldsTable)
      .values({
        formId: validated.formId,
        label: validated.label,
        type: validated.type,
        required: validated.required,
        orderIndex: nextOrderIndex,
        validation: validated.validation ?? null,
      })
      .returning();

    if (!newField) {
      throw new Error("Failed to add form field");
    }

    return newField;
  }

  public async editFormField(token: string, payload: EditFormFieldInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await editFormFieldInput.parseAsync(payload);

    // 1. Fetch the form field and join it with the form table to verify ownership
    const [fieldWithForm] = await db
      .select({
        field: formFieldsTable,
        form: formsTable,
      })
      .from(formFieldsTable)
      .innerJoin(formsTable, eq(formFieldsTable.formId, formsTable.id))
      .where(
        and(
          eq(formFieldsTable.id, validated.id),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!fieldWithForm) {
      throw new Error("Form field not found");
    }

    if (fieldWithForm.form.userId !== userId) {
      throw new Error("You are not authorized to edit fields for this form");
    }

    // 2. Update properties
    const updateValues: Partial<typeof formFieldsTable.$inferInsert> = {};
    if (validated.label !== undefined) updateValues.label = validated.label;
    if (validated.type !== undefined) updateValues.type = validated.type;
    if (validated.required !== undefined) updateValues.required = validated.required;
    if (validated.validation !== undefined) updateValues.validation = validated.validation;

    const [updatedField] = await db
      .update(formFieldsTable)
      .set(updateValues)
      .where(eq(formFieldsTable.id, validated.id))
      .returning();

    if (!updatedField) {
      throw new Error("Failed to edit form field");
    }

    return updatedField;
  }

  public async deleteFormField(token: string, payload: DeleteFormFieldInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await deleteFormFieldInput.parseAsync(payload);

    // 1. Fetch form field to verify ownership
    const [fieldWithForm] = await db
      .select({
        field: formFieldsTable,
        form: formsTable,
      })
      .from(formFieldsTable)
      .innerJoin(formsTable, eq(formFieldsTable.formId, formsTable.id))
      .where(
        and(
          eq(formFieldsTable.id, validated.id),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!fieldWithForm) {
      throw new Error("Form field not found");
    }

    if (fieldWithForm.form.userId !== userId) {
      throw new Error("You are not authorized to delete fields from this form");
    }

    // 2. Delete field
    await db
      .delete(formFieldsTable)
      .where(eq(formFieldsTable.id, validated.id));

    return {
      success: true,
      id: validated.id,
    };
  }

  public async reorderFormFields(token: string, payload: ReorderFormFieldsInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await reorderFormFieldsInput.parseAsync(payload);

    // 1. Verify form exists and is owned by the creator
    const [existingForm] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, validated.formId),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!existingForm) {
      throw new Error("Form not found");
    }

    if (existingForm.userId !== userId) {
      throw new Error("You are not authorized to reorder fields in this form");
    }

    // 2. Execute bulk update in database transaction to prevent any half-state glitches
    await db.transaction(async (tx) => {
      for (const fieldOrder of validated.fields) {
        await tx
          .update(formFieldsTable)
          .set({ orderIndex: fieldOrder.orderIndex })
          .where(
            and(
              eq(formFieldsTable.id, fieldOrder.id),
              eq(formFieldsTable.formId, validated.formId)
            )
          );
      }
    });

    return {
      success: true,
    };
  }
}

export default FormService;
