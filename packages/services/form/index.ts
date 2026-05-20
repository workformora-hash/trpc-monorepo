import { db, eq, and, gt, sql, inArray } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { sessionsTable } from "@repo/database/models/sessions";
import { usersTable } from "@repo/database/models/user";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formResponsesTable } from "@repo/database/models/form-response";
import { formFieldAnswersTable } from "@repo/database/models/form-field-answer";
import { SYSTEM_THEMES } from "./themes";
import crypto from "crypto";
import { createFormInput, editFormInput, getFormBySlugPublicInput, getFormByIdCreatorInput, deleteFormInput, duplicateFormInput, publishFormInput, unpublishFormInput, checkSlugAvailabilityInput, clearFormResponsesInput, addFormFieldInput, editFormFieldInput, deleteFormFieldInput, reorderFormFieldsInput, submitResponseInput, listResponsesInput, getFormAnalyticsInput, deleteResponseInput, listPublicFormsInput, exportResponsesToCSVInput, getResponseByIdInput, restoreDeletedFormInput, archiveFormInput, unarchiveFormInput } from "./model";
import type { CreateFormInputType, EditFormInputType, GetFormBySlugPublicInputType, GetFormByIdCreatorInputType, DeleteFormInputType, DuplicateFormInputType, PublishFormInputType, UnpublishFormInputType, CheckSlugAvailabilityInputType, ClearFormResponsesInputType, AddFormFieldInputType, EditFormFieldInputType, DeleteFormFieldInputType, ReorderFormFieldsInputType, SubmitResponseInputType, ListResponsesInputType, GetFormAnalyticsInputType, DeleteResponseInputType, ListPublicFormsInputType, ExportResponsesToCSVInputType, GetResponseByIdInputType, RestoreDeletedFormInputType, ArchiveFormInputType, UnarchiveFormInputType } from "./model";

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
        expiresAt: validated.expiresAt ?? null,
        maxResponses: validated.maxResponses ?? null,
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

    if (validated.expiresAt !== undefined) {
      updateData.expiresAt = validated.expiresAt;
    }

    if (validated.maxResponses !== undefined) {
      updateData.maxResponses = validated.maxResponses;
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

    if (form.isArchived) {
      throw new Error("This form has been archived and is no longer accepting responses");
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

  public async submitResponse(payload: SubmitResponseInputType, ipAddress: string | null) {
    const validated = await submitResponseInput.parseAsync(payload);

    // 1. Fetch form to verify it is published and exists
    const [form] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, validated.formId),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!form) {
      throw new Error("Form not found");
    }

    if (form.isArchived) {
      throw new Error("This form is archived and cannot accept responses");
    }

    if (!form.isPublished) {
      throw new Error("This form is not published and cannot accept responses");
    }

    if (form.expiresAt && new Date() > form.expiresAt) {
      throw new Error("This form has expired and is no longer accepting responses");
    }

    if (form.maxResponses !== null && form.maxResponses !== undefined) {
      const [countResult] = await db
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(formResponsesTable)
        .where(eq(formResponsesTable.formId, form.id));

      const totalResponses = Number(countResult?.count ?? 0);
      if (totalResponses >= form.maxResponses) {
        throw new Error("This form has reached its maximum number of allowed responses");
      }
    }

    // 2. Fetch all fields for this form
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, validated.formId));

    const preparedAnswers: { fieldId: string; value: unknown }[] = [];

    // 3. Dynamic Field Validation Loop
    for (const field of fields) {
      const answer = validated.answers.find((a) => a.fieldId === field.id);
      const hasValue =
        answer !== undefined &&
        answer.value !== null &&
        answer.value !== undefined &&
        answer.value !== "";

      // Check Required Constraint
      if (field.required && !hasValue) {
        throw new Error(`Question "${field.label}" is required.`);
      }

      if (!hasValue) {
        continue;
      }

      const val = answer.value;
      const config = (field.validation as Record<string, any>) || {};

      switch (field.type) {
        case "short_text":
        case "long_text": {
          if (typeof val !== "string") {
            throw new Error(`Answer for "${field.label}" must be a text string.`);
          }
          if (config.minLength !== undefined && val.length < config.minLength) {
            throw new Error(`Answer for "${field.label}" must be at least ${config.minLength} characters.`);
          }
          if (config.maxLength !== undefined && val.length > config.maxLength) {
            throw new Error(`Answer for "${field.label}" must be at most ${config.maxLength} characters.`);
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "email": {
          if (typeof val !== "string") {
            throw new Error(`Answer for "${field.label}" must be an email address.`);
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            throw new Error(`Answer for "${field.label}" must be a valid email format.`);
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "number": {
          if (typeof val !== "number" || isNaN(val)) {
            throw new Error(`Answer for "${field.label}" must be a valid number.`);
          }
          if (config.min !== undefined && val < config.min) {
            throw new Error(`Answer for "${field.label}" must be at least ${config.min}.`);
          }
          if (config.max !== undefined && val > config.max) {
            throw new Error(`Answer for "${field.label}" must be at most ${config.max}.`);
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "rating": {
          if (typeof val !== "number" || !Number.isInteger(val) || val < 1) {
            throw new Error(`Answer for "${field.label}" must be an integer starting from 1.`);
          }
          if (config.max !== undefined && val > config.max) {
            throw new Error(`Answer for "${field.label}" must be at most ${config.max}.`);
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "checkbox": {
          if (typeof val !== "boolean") {
            throw new Error(`Answer for "${field.label}" must be a true/false value.`);
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "single_select": {
          if (typeof val !== "string") {
            throw new Error(`Answer for "${field.label}" must be a choice selection.`);
          }
          const options = config.options || [];
          if (!options.includes(val)) {
            throw new Error(`Selected option for "${field.label}" is invalid.`);
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "multi_select": {
          if (!Array.isArray(val)) {
            throw new Error(`Answer for "${field.label}" must be a list of selection choices.`);
          }
          const options = config.options || [];
          for (const item of val) {
            if (typeof item !== "string") {
              throw new Error(`All selected options for "${field.label}" must be text.`);
            }
            if (!options.includes(item)) {
              throw new Error(`Selected option "${item}" for "${field.label}" is invalid.`);
            }
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "date": {
          if (typeof val !== "string") {
            throw new Error(`Answer for "${field.label}" must be a date string.`);
          }
          const parsedDate = Date.parse(val);
          if (isNaN(parsedDate)) {
            throw new Error(`Answer for "${field.label}" must be a valid date format.`);
          }
          if (config.minDate !== undefined && parsedDate < Date.parse(config.minDate)) {
            throw new Error(`Answer for "${field.label}" cannot be earlier than ${config.minDate}.`);
          }
          if (config.maxDate !== undefined && parsedDate > Date.parse(config.maxDate)) {
            throw new Error(`Answer for "${field.label}" cannot be later than ${config.maxDate}.`);
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        default: {
          throw new Error(`Unsupported field type: ${field.type}`);
        }
      }
    }

    // 4. Save Response and Field Answers Atomically
    const result = await db.transaction(async (tx) => {
      const [newResponse] = await tx
        .insert(formResponsesTable)
        .values({
          formId: validated.formId,
          respondentEmail: validated.respondentEmail ?? null,
          ipAddress: ipAddress ?? null,
        })
        .returning();

      if (!newResponse) {
        throw new Error("Failed to register form response record");
      }

      if (preparedAnswers.length > 0) {
        await tx.insert(formFieldAnswersTable).values(
          preparedAnswers.map((ans) => ({
            responseId: newResponse.id,
            fieldId: ans.fieldId,
            value: ans.value,
          }))
        );
      }

      return newResponse;
    });

    return {
      success: true,
      responseId: result.id,
    };
  }

  public async listResponses(token: string, payload: ListResponsesInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await listResponsesInput.parseAsync(payload);

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
      throw new Error("You are not authorized to view responses for this form");
    }

    // 2. Query total responses count for pagination metadata
    const conditions = [eq(formResponsesTable.formId, validated.formId)];

    if (validated.respondentEmail) {
      conditions.push(sql`${formResponsesTable.respondentEmail} ILIKE ${'%' + validated.respondentEmail + '%'}`);
    }

    if (validated.ipAddress) {
      conditions.push(eq(formResponsesTable.ipAddress, validated.ipAddress));
    }

    const [countResult] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(formResponsesTable)
      .where(and(...conditions));

    const total = Number(countResult?.count ?? 0);

    // 3. Query paginated list of responses
    const responses = await db
      .select()
      .from(formResponsesTable)
      .where(and(...conditions))
      .orderBy(sql`${formResponsesTable.submittedAt} DESC`)
      .limit(validated.limit ?? 50)
      .offset(validated.offset ?? 0);

    if (responses.length === 0) {
      return {
        responses: [],
        total,
        limit: validated.limit ?? 50,
        offset: validated.offset ?? 0,
      };
    }

    // 4. Query answers linked to all returned responses
    const responseIds = responses.map((r) => r.id);
    const answers = await db
      .select()
      .from(formFieldAnswersTable)
      .where(inArray(formFieldAnswersTable.responseId, responseIds));

    // Map answers into their parent response records
    const mappedResponses = responses.map((resp) => {
      const respAnswers = answers
        .filter((ans) => ans.responseId === resp.id)
        .map((ans) => ({
          id: ans.id,
          fieldId: ans.fieldId,
          value: ans.value,
        }));

      return {
        id: resp.id,
        respondentEmail: resp.respondentEmail,
        ipAddress: resp.ipAddress,
        submittedAt: resp.submittedAt,
        answers: respAnswers,
      };
    });

    return {
      responses: mappedResponses,
      total,
      limit: validated.limit ?? 50,
      offset: validated.offset ?? 0,
    };
  }

  public async getFormAnalytics(token: string, payload: GetFormAnalyticsInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await getFormAnalyticsInput.parseAsync(payload);

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
      throw new Error("You are not authorized to view analytics for this form");
    }

    // 2. Query total response count
    const [countResult] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, validated.formId));

    const totalResponses = Number(countResult?.count ?? 0);

    // 3. Fetch all fields for this form
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, validated.formId))
      .orderBy(sql`${formFieldsTable.orderIndex} ASC`);

    if (fields.length === 0) {
      return {
        totalResponses,
        fieldAnalytics: [],
      };
    }

    // 4. Fetch all answers for all fields of this form
    const fieldIds = fields.map((f) => f.id);
    const answers = await db
      .select({
        id: formFieldAnswersTable.id,
        responseId: formFieldAnswersTable.responseId,
        fieldId: formFieldAnswersTable.fieldId,
        value: formFieldAnswersTable.value,
        submittedAt: formResponsesTable.submittedAt,
      })
      .from(formFieldAnswersTable)
      .innerJoin(formResponsesTable, eq(formFieldAnswersTable.responseId, formResponsesTable.id))
      .where(inArray(formFieldAnswersTable.fieldId, fieldIds))
      .orderBy(sql`${formResponsesTable.submittedAt} DESC`);

    // 5. Aggregate Analytics per Field
    const fieldAnalyticsList = fields.map((field) => {
      const fieldAnswers = answers.filter((ans) => ans.fieldId === field.id);
      const totalAnswers = fieldAnswers.length;

      // Extract raw values
      const rawValues = fieldAnswers.map((ans) => {
        const valObj = ans.value as { value?: unknown };
        return valObj?.value;
      }).filter((v) => v !== undefined && v !== null && v !== "");

      let stats: Record<string, any> = {};

      switch (field.type) {
        case "single_select":
        case "multi_select": {
          const choiceCounts: Record<string, number> = {};
          // Initialize defined options with zero count
          const config = (field.validation as Record<string, any>) || {};
          const options = config.options || [];
          for (const opt of options) {
            choiceCounts[opt] = 0;
          }

          for (const val of rawValues) {
            if (Array.isArray(val)) {
              for (const item of val) {
                if (typeof item === "string") {
                  choiceCounts[item] = (choiceCounts[item] ?? 0) + 1;
                }
              }
            } else if (typeof val === "string") {
              choiceCounts[val] = (choiceCounts[val] ?? 0) + 1;
            }
          }
          stats = { choiceCounts };
          break;
        }

        case "checkbox": {
          let trueCount = 0;
          let falseCount = 0;
          for (const val of rawValues) {
            if (val === true) trueCount++;
            if (val === false) falseCount++;
          }
          stats = { trueCount, falseCount };
          break;
        }

        case "rating": {
          const ratingCounts: Record<number, number> = {};
          let ratingSum = 0;
          let ratingCount = 0;

          for (const val of rawValues) {
            const num = Number(val);
            if (!isNaN(num)) {
              ratingCounts[num] = (ratingCounts[num] ?? 0) + 1;
              ratingSum += num;
              ratingCount++;
            }
          }

          const averageRating = ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(2)) : 0;
          stats = { averageRating, ratingCounts };
          break;
        }

        case "short_text":
        case "long_text":
        case "email":
        case "date": {
          // Take the 5 most recent answers
          const recentAnswers = rawValues
            .filter((v): v is string => typeof v === "string")
            .slice(0, 5);
          stats = { recentAnswers };
          break;
        }

        default:
          stats = {};
      }

      return {
        fieldId: field.id,
        label: field.label,
        type: field.type,
        totalAnswers,
        stats,
      };
    });

    return {
      totalResponses,
      fieldAnalytics: fieldAnalyticsList,
    };
  }

  public async deleteResponse(token: string, payload: DeleteResponseInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await deleteResponseInput.parseAsync(payload);

    // 1. Fetch response and verify form ownership
    const [existingResponse] = await db
      .select({
        id: formResponsesTable.id,
        formId: formResponsesTable.formId,
        formUserId: formsTable.userId,
      })
      .from(formResponsesTable)
      .innerJoin(formsTable, eq(formResponsesTable.formId, formsTable.id))
      .where(
        and(
          eq(formResponsesTable.id, validated.responseId),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!existingResponse) {
      throw new Error("Response not found");
    }

    if (existingResponse.formUserId !== userId) {
      throw new Error("You are not authorized to delete this response");
    }

    // 2. Delete the response (foreign keys cascade to answers table)
    const [deleted] = await db
      .delete(formResponsesTable)
      .where(eq(formResponsesTable.id, validated.responseId))
      .returning();

    if (!deleted) {
      throw new Error("Failed to delete response");
    }

    return {
      success: true,
      responseId: deleted.id,
    };
  }

  public async listPublicForms(payload: ListPublicFormsInputType) {
    const validated = await listPublicFormsInput.parseAsync(payload);

    const forms = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.visibility, "public"),
          eq(formsTable.isPublished, true),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .orderBy(sql`${formsTable.createdAt} DESC`)
      .limit(validated.limit ?? 50)
      .offset(validated.offset ?? 0);

    return {
      forms,
    };
  }

  public async exportResponsesToCSV(token: string, payload: ExportResponsesToCSVInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await exportResponsesToCSVInput.parseAsync(payload);

    // 1. Fetch form and verify ownership
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
      throw new Error("You are not authorized to export responses for this form");
    }

    // 2. Fetch form fields
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, existingForm.id))
      .orderBy(sql`${formFieldsTable.orderIndex} ASC`);

    // 3. Fetch form responses
    const responses = await db
      .select()
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, existingForm.id))
      .orderBy(sql`${formResponsesTable.submittedAt} DESC`);

    // 4. Fetch answers in a single batch
    let answers: typeof formFieldAnswersTable.$inferSelect[] = [];
    if (responses.length > 0) {
      const responseIds = responses.map((r) => r.id);
      answers = await db
        .select()
        .from(formFieldAnswersTable)
        .where(inArray(formFieldAnswersTable.responseId, responseIds));
    }

    const answersByResponseId = new Map<string, typeof formFieldAnswersTable.$inferSelect[]>();
    for (const ans of answers) {
      if (!answersByResponseId.has(ans.responseId)) {
        answersByResponseId.set(ans.responseId, []);
      }
      answersByResponseId.get(ans.responseId)!.push(ans);
    }

    const escapeCSV = (val: unknown): string => {
      if (val === null || val === undefined) return "";
      let str = "";
      if (Array.isArray(val)) {
        str = val.join("; ");
      } else if (typeof val === "object") {
        str = JSON.stringify(val);
      } else {
        str = String(val);
      }
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // 5. Build CSV structure
    const headers = [
      "Response ID",
      "Submitted At",
      "IP Address",
      "Respondent Email",
      ...fields.map((f) => f.label || `Field ${f.id}`),
    ];

    const csvRows: string[] = [headers.map((h) => escapeCSV(h)).join(",")];

    for (const resp of responses) {
      const respAnswers = answersByResponseId.get(resp.id) || [];
      const answersByFieldId = new Map<string, unknown>();
      for (const ans of respAnswers) {
        answersByFieldId.set(ans.fieldId, ans.value);
      }

      const row = [
        resp.id,
        resp.submittedAt.toISOString(),
        resp.ipAddress || "",
        resp.respondentEmail || "",
        ...fields.map((f) => answersByFieldId.get(f.id)),
      ];

      csvRows.push(row.map((val) => escapeCSV(val)).join(","));
    }

    return {
      success: true,
      csv: csvRows.join("\n"),
    };
  }

  public async getResponseById(token: string, payload: GetResponseByIdInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await getResponseByIdInput.parseAsync(payload);

    // 1. Fetch response and verify form ownership via join
    const [responseWithForm] = await db
      .select({
        response: formResponsesTable,
        formUserId: formsTable.userId,
        formTitle: formsTable.title,
      })
      .from(formResponsesTable)
      .innerJoin(formsTable, eq(formResponsesTable.formId, formsTable.id))
      .where(
        and(
          eq(formResponsesTable.id, validated.responseId),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!responseWithForm) {
      throw new Error("Response not found");
    }

    if (responseWithForm.formUserId !== userId) {
      throw new Error("You are not authorized to view this response");
    }

    // 2. Fetch fields for context labels
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, responseWithForm.response.formId))
      .orderBy(sql`${formFieldsTable.orderIndex} ASC`);

    // 3. Fetch answers for this response
    const answers = await db
      .select()
      .from(formFieldAnswersTable)
      .where(eq(formFieldAnswersTable.responseId, validated.responseId));

    // 4. Map answers to their field labels
    const fieldMap = new Map(fields.map((f) => [f.id, f]));
    const enrichedAnswers = answers.map((ans) => {
      const field = fieldMap.get(ans.fieldId);
      return {
        fieldId: ans.fieldId,
        label: field?.label ?? "Unknown Field",
        type: field?.type ?? "unknown",
        value: ans.value,
      };
    });

    return {
      response: {
        id: responseWithForm.response.id,
        formId: responseWithForm.response.formId,
        formTitle: responseWithForm.formTitle,
        respondentEmail: responseWithForm.response.respondentEmail,
        ipAddress: responseWithForm.response.ipAddress,
        submittedAt: responseWithForm.response.submittedAt,
      },
      answers: enrichedAnswers,
    };
  }

  public async restoreDeletedForm(token: string, payload: RestoreDeletedFormInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await restoreDeletedFormInput.parseAsync(payload);

    // 1. Fetch the soft-deleted form
    const [deletedForm] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, validated.id),
          sql`${formsTable.deletedAt} IS NOT NULL`
        )
      )
      .limit(1);

    if (!deletedForm) {
      throw new Error("Deleted form not found");
    }

    if (deletedForm.userId !== userId) {
      throw new Error("You are not authorized to restore this form");
    }

    // 2. Check if the slug is still available (another form may have claimed it)
    const [slugConflict] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.slug, deletedForm.slug),
          sql`${formsTable.deletedAt} IS NULL`,
          sql`${formsTable.id} <> ${deletedForm.id}`
        )
      )
      .limit(1);

    let newSlug = deletedForm.slug;
    if (slugConflict) {
      // Generate a new unique slug
      const randomSuffix = crypto.randomBytes(3).toString("hex");
      newSlug = `${deletedForm.slug}-restored-${randomSuffix}`;
    }

    // 3. Restore by clearing deletedAt
    const [restoredForm] = await db
      .update(formsTable)
      .set({
        deletedAt: null,
        slug: newSlug,
        isPublished: false, // Restored forms start unpublished for safety
        updatedAt: new Date(),
      })
      .where(eq(formsTable.id, deletedForm.id))
      .returning();

    if (!restoredForm) {
      throw new Error("Failed to restore form");
    }

    return restoredForm;
  }

  public async archiveForm(token: string, payload: ArchiveFormInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await archiveFormInput.parseAsync(payload);

    // 1. Fetch form to verify ownership
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
      throw new Error("You are not authorized to archive this form");
    }

    // 2. Mark as archived and also unpublish it for response safety
    const [archivedForm] = await db
      .update(formsTable)
      .set({
        isArchived: true,
        isPublished: false,
        updatedAt: new Date(),
      })
      .where(eq(formsTable.id, existingForm.id))
      .returning();

    if (!archivedForm) {
      throw new Error("Failed to archive form");
    }

    return archivedForm;
  }

  public async unarchiveForm(token: string, payload: UnarchiveFormInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await unarchiveFormInput.parseAsync(payload);

    // 1. Fetch form to verify ownership
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
      throw new Error("You are not authorized to unarchive this form");
    }

    // 2. Mark as not archived
    const [unarchivedForm] = await db
      .update(formsTable)
      .set({
        isArchived: false,
        updatedAt: new Date(),
      })
      .where(eq(formsTable.id, existingForm.id))
      .returning();

    if (!unarchivedForm) {
      throw new Error("Failed to unarchive form");
    }

    return unarchivedForm;
  }
}

export default FormService;
