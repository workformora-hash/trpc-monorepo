import { db, eq, and, gt, sql, inArray } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { sessionsTable } from "@repo/database/models/sessions";
import { usersTable } from "@repo/database/models/user";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formResponsesTable } from "@repo/database/models/form-response";
import { formFieldAnswersTable } from "@repo/database/models/form-field-answer";
import { SYSTEM_THEMES } from "./themes";
import { formEvents } from "./events";
import { redis } from "../clients/redis";
import crypto from "crypto";
import { createFormInput, editFormInput, getFormBySlugPublicInput, getFormByIdCreatorInput, deleteFormInput, duplicateFormInput, publishFormInput, unpublishFormInput, checkSlugAvailabilityInput, clearFormResponsesInput, addFormFieldInput, editFormFieldInput, deleteFormFieldInput, reorderFormFieldsInput, submitResponseInput, listResponsesInput, getFormAnalyticsInput, deleteResponseInput, listPublicFormsInput, exportResponsesToCSVInput, getResponseByIdInput, restoreDeletedFormInput, archiveFormInput, unarchiveFormInput, setFormPasswordInput, removeFormPasswordInput, verifyFormPasswordInput, addFieldLogicRuleInput, editFieldLogicRuleInput, deleteFieldLogicRuleInput, getFormLogicTreeInput, listExploreFormsInput, listTemplatesByCategoryInput, trackFormViewInput, duplicateFormFieldInput } from "./model";
import type { CreateFormInputType, EditFormInputType, GetFormBySlugPublicInputType, GetFormByIdCreatorInputType, DeleteFormInputType, DuplicateFormInputType, PublishFormInputType, UnpublishFormInputType, CheckSlugAvailabilityInputType, ClearFormResponsesInputType, AddFormFieldInputType, EditFormFieldInputType, DeleteFormFieldInputType, ReorderFormFieldsInputType, SubmitResponseInputType, ListResponsesInputType, GetFormAnalyticsInputType, DeleteResponseInputType, ListPublicFormsInputType, ExportResponsesToCSVInputType, GetResponseByIdInputType, RestoreDeletedFormInputType, ArchiveFormInputType, UnarchiveFormInputType, SetFormPasswordInputType, RemoveFormPasswordInputType, VerifyFormPasswordInputType, AddFieldLogicRuleInputType, EditFieldLogicRuleInputType, DeleteFieldLogicRuleInputType, GetFormLogicTreeInputType, ListExploreFormsInputType, ListTemplatesByCategoryInputType, TrackFormViewInputType, DuplicateFormFieldInputType } from "./model";
import type { EmailService } from "@repo/email";
import bcrypt from "bcryptjs";

class FormService {
  private emailService?: EmailService;

  constructor(emailService?: EmailService) {
    this.emailService = emailService;
  }

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

    const newForm = await db.transaction(async (tx) => {
      const [form] = await tx
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
          notifyCreator: validated.notifyCreator ?? false,
          notifyRespondent: validated.notifyRespondent ?? false,
        })
        .returning();

      if (!form) {
        throw new Error("Failed to create form");
      }

      // Add a single beautiful Welcome Screen field by default
      await tx.insert(formFieldsTable).values({
        formId: form.id,
        label: "Welcome to our form",
        type: "welcome",
        required: false,
        orderIndex: 0,
        validation: {
          description: "We are excited to hear from you. Please click Start to begin!",
          buttonText: "Start Survey",
          buttonBgColor: "#10b981",
          buttonTextColor: "#ffffff",
          showStatsBadge: true,
          statsTime: "2 mins",
          socialProof: [
            { name: "Stripe", logo: "https://img.icons8.com/color/48/stripe.png" },
            { name: "Google", logo: "https://img.icons8.com/color/48/google-logo.png" },
            { name: "Slack", logo: "https://img.icons8.com/color/48/slack-new.png" },
            { name: "Airbnb", logo: "https://img.icons8.com/color/48/airbnb.png" }
          ],
          creatorProfile: {
            name: "Sarah Chen",
            role: "Product Director",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
            quote: "\"Your feedback directly shapes our product journey. Thank you for building the future with us!\""
          },
          features: [
            "Takes less than 2 minutes to complete",
            "100% anonymous & secure feedback",
            "Get a premium reward code at the end"
          ]
        },
      });

      // Add a single beautiful Ending Screen field by default
      await tx.insert(formFieldsTable).values({
        formId: form.id,
        label: "Response Submitted!",
        type: "thank_you",
        required: false,
        orderIndex: 1,
        validation: {
          description: "Thank you so much! Your answers have been successfully recorded and our team is already reviewing them.",
          buttonText: "Visit our website",
          buttonBgColor: "#6366f1",
          buttonTextColor: "#ffffff",
          redirectUrl: "https://google.com",
          socialShare: true,
          promoCard: {
            title: "Claim Your Reward! 🎁",
            description: "As a thank you, use code WELCOME10 at checkout for 10% off your next purchase.",
            linkText: "Claim Reward",
            linkUrl: "https://stripe.com"
          }
        },
      });

      return form;
    });

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

    if (validated.notifyCreator !== undefined) {
      updateData.notifyCreator = validated.notifyCreator;
    }

    if (validated.notifyRespondent !== undefined) {
      updateData.notifyRespondent = validated.notifyRespondent;
    }

    // Handle password protection
    if (validated.password !== undefined) {
      if (validated.password === null) {
        // Remove password protection
        updateData.passwordHash = null;
      } else {
        // Set or update password
        const salt = await bcrypt.genSalt(10);
        updateData.passwordHash = await bcrypt.hash(validated.password, salt);
      }
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

    await redis.invalidateForm(existingForm.slug);
    if (updatedForm.slug !== existingForm.slug) {
      await redis.invalidateForm(updatedForm.slug);
    }

    return updatedForm;
  }

  public async getFormBySlugPublic(payload: GetFormBySlugPublicInputType) {
    const validated = await getFormBySlugPublicInput.parseAsync(payload);

    const cacheKey = `form:slug:${validated.slug}`;
    const cached = await redis.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

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

    // If form is password-protected, return metadata only (no fields)
    const isPasswordProtected = !!form.passwordHash;
    if (isPasswordProtected) {
      const responsePayload = {
        form: { ...form, passwordHash: undefined },
        fields: [], // withhold fields until password is verified
        isPasswordProtected: true,
      };
      await redis.set(cacheKey, responsePayload, 300);
      return responsePayload;
    }

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, form.id))
      .orderBy(sql`${formFieldsTable.orderIndex} ASC`);

    const responsePayload = {
      form,
      fields,
      isPasswordProtected: false,
    };
    await redis.set(cacheKey, responsePayload, 300);

    return responsePayload;
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

    await this.invalidateFormCache(deletedForm.id);

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

    await this.invalidateFormCache(updatedForm.id);

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

    await this.invalidateFormCache(updatedForm.id);

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

    // Invalidate cache for public form
    await redis.invalidateForm(existingForm.slug);

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

    // Invalidate cache for public form
    await redis.invalidateForm(fieldWithForm.form.slug);

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

    // Invalidate cache for public form
    await redis.invalidateForm(fieldWithForm.form.slug);

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

    // Invalidate cache for public form
    await redis.invalidateForm(existingForm.slug);

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
          if (config.minLength !== undefined && config.minLength !== null && val.length < config.minLength) {
            throw new Error(`Answer for "${field.label}" must be at least ${config.minLength} characters.`);
          }
          if (config.maxLength !== undefined && config.maxLength !== null && val.length > config.maxLength) {
            throw new Error(`Answer for "${field.label}" must be at most ${config.maxLength} characters.`);
          }
          if (config.pattern !== undefined && config.pattern !== null && config.pattern !== "") {
            try {
              const regex = new RegExp(config.pattern);
              if (!regex.test(val)) {
                throw new Error(config.patternMessage || `Answer for "${field.label}" does not match the required format.`);
              }
            } catch (e) {}
          }
          if (config.format === "url" && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(val)) {
            throw new Error(`Answer for "${field.label}" must be a valid URL.`);
          }
          if (config.format === "alpha" && !/^[a-zA-Z]+$/.test(val)) {
            throw new Error(`Answer for "${field.label}" must contain letters only.`);
          }
          if (config.format === "alphanumeric" && !/^[a-zA-Z0-9]+$/.test(val)) {
            throw new Error(`Answer for "${field.label}" must contain letters and numbers only.`);
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
          if (config.blockFreeEmails) {
            const freeProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com"];
            const domain = val.split("@")[1]?.toLowerCase();
            if (domain && freeProviders.includes(domain)) {
              throw new Error(`Answer for "${field.label}" must be a business/corporate email address.`);
            }
          }
          if (config.allowedDomains) {
            const domains = config.allowedDomains.split(",").map((d: string) => d.trim().toLowerCase());
            const domain = val.split("@")[1]?.toLowerCase();
            if (domain && !domains.includes(domain)) {
              throw new Error(`Answer for "${field.label}" must belong to one of these domains: ${config.allowedDomains}`);
            }
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "number": {
          if (typeof val !== "number" || isNaN(val)) {
            throw new Error(`Answer for "${field.label}" must be a valid number.`);
          }
          if (config.min !== undefined && config.min !== null && val < config.min) {
            throw new Error(`Answer for "${field.label}" must be at least ${config.min}.`);
          }
          if (config.max !== undefined && config.max !== null && val > config.max) {
            throw new Error(`Answer for "${field.label}" must be at most ${config.max}.`);
          }
          if (config.integerOnly && !Number.isInteger(val)) {
            throw new Error(`Answer for "${field.label}" must be a whole integer.`);
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "rating": {
          if (typeof val !== "number" || !Number.isInteger(val) || val < 1) {
            throw new Error(`Answer for "${field.label}" must be an integer starting from 1.`);
          }
          const maxStars = config.maxStars || config.max || 5;
          if (val > maxStars) {
            throw new Error(`Answer for "${field.label}" must be at most ${maxStars}.`);
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "checkbox": {
          if (typeof val !== "boolean") {
            throw new Error(`Answer for "${field.label}" must be a true/false value.`);
          }
          if (config.mustBeChecked && !val) {
            throw new Error(`You must accept/check the field "${field.label}".`);
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
          if (config.minChoices !== undefined && config.minChoices !== null && val.length < config.minChoices) {
            throw new Error(`Please select at least ${config.minChoices} options for "${field.label}".`);
          }
          if (config.maxChoices !== undefined && config.maxChoices !== null && val.length > config.maxChoices) {
            throw new Error(`Please select at most ${config.maxChoices} options for "${field.label}".`);
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
          if (config.minDate !== undefined && config.minDate !== null && config.minDate !== "" && parsedDate < Date.parse(config.minDate)) {
            throw new Error(`Answer for "${field.label}" cannot be earlier than ${config.minDate}.`);
          }
          if (config.maxDate !== undefined && config.maxDate !== null && config.maxDate !== "" && parsedDate > Date.parse(config.maxDate)) {
            throw new Error(`Answer for "${field.label}" cannot be later than ${config.maxDate}.`);
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "contact_info": {
          if (typeof val !== "object" || val === null) {
            throw new Error(`Answer for "${field.label}" must be a contact info object.`);
          }
          const contact = val as Record<string, any>;
          if (!contact.name || typeof contact.name !== "string" || contact.name.trim() === "") {
            throw new Error(`Name is required in contact info for "${field.label}".`);
          }
          if (config.requirePhone && (!contact.phone || typeof contact.phone !== "string" || contact.phone.trim() === "")) {
            throw new Error(`Phone number is required in contact info for "${field.label}".`);
          }
          if (config.requireCompany && (!contact.company || typeof contact.company !== "string" || contact.company.trim() === "")) {
            throw new Error(`Company is required in contact info for "${field.label}".`);
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "address": {
          if (typeof val !== "object" || val === null) {
            throw new Error(`Answer for "${field.label}" must be an address object.`);
          }
          const addr = val as Record<string, any>;
          if (!addr.street || typeof addr.street !== "string" || addr.street.trim() === "") {
            throw new Error(`Street address is required for "${field.label}".`);
          }
          if (!addr.city || typeof addr.city !== "string" || addr.city.trim() === "") {
            throw new Error(`City is required for "${field.label}".`);
          }
          if (config.requireZip && (!addr.zip || typeof addr.zip !== "string" || addr.zip.trim() === "")) {
            throw new Error(`Zip/Postal code is required for "${field.label}".`);
          }
          if (config.requireCountry && (!addr.country || typeof addr.country !== "string" || addr.country.trim() === "")) {
            throw new Error(`Country is required for "${field.label}".`);
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "website": {
          if (typeof val !== "string") {
            throw new Error(`Answer for "${field.label}" must be a website URL string.`);
          }
          const isUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(val);
          if (!isUrl) {
            throw new Error(`Answer for "${field.label}" must be a valid website URL.`);
          }
          if (config.requireSecure && !val.startsWith("https://")) {
            throw new Error(`Website URL for "${field.label}" must be secure (https://).`);
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "dropdown": {
          if (typeof val !== "string") {
            throw new Error(`Answer for "${field.label}" must be a dropdown selection.`);
          }
          const options = config.options || [];
          if (!options.includes(val)) {
            throw new Error(`Selected option for "${field.label}" is invalid.`);
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "yes_no": {
          if (typeof val !== "boolean") {
            throw new Error(`Answer for "${field.label}" must be a Yes/No (boolean) choice.`);
          }
          preparedAnswers.push({ fieldId: field.id, value: { value: val } });
          break;
        }

        case "ranking": {
          if (!Array.isArray(val)) {
            throw new Error(`Answer for "${field.label}" must be an ordered list of ranked items.`);
          }
          const options = config.options || [];
          for (const item of val) {
            if (typeof item !== "string" || !options.includes(item)) {
              throw new Error(`Invalid ranked choice "${item}" for "${field.label}".`);
            }
          }
          if (config.mustRankAll && val.length !== options.length) {
            throw new Error(`You must rank all ${options.length} choices for "${field.label}".`);
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
          preparedAnswers.map((ans) => {
            const originalAnswer = validated.answers.find((a) => a.fieldId === ans.fieldId);
            return {
              responseId: newResponse.id,
              fieldId: ans.fieldId,
              value: {
                ...(ans.value as Record<string, unknown>),
                durationMs: originalAnswer?.durationMs,
              },
            };
          })
        );
      }

      return newResponse;
    });

    // 5. Fire notification emails (non-blocking, best-effort)
    try {
      if (form.notifyCreator) {
        // Fetch creator email
        const [creator] = await db
          .select({ email: usersTable.email, name: usersTable.name })
          .from(usersTable)
          .where(eq(usersTable.id, form.userId))
          .limit(1);

        if (creator?.email) {
          this.emailService?.sendEmail({
            to: creator.email,
            subject: `New response on "${form.title}"`,
            text: `Hi ${creator.name || "there"},\n\nYour form "${form.title}" just received a new response.\n\nLog in to your dashboard to view the details.`,
          }).catch((err: any) => console.error("[FormService] Creator notification email failed:", err));
        }
      }

      if (form.notifyRespondent && validated.respondentEmail) {
        const answerSummary = preparedAnswers.map((ans) => {
          const field = fields.find((f) => f.id === ans.fieldId);
          const val = (ans.value as any)?.value;
          return `• ${field?.label || ans.fieldId}: ${Array.isArray(val) ? val.join(", ") : val}`;
        }).join("\n");

        this.emailService?.sendEmail({
          to: validated.respondentEmail,
          subject: `Your submission to "${form.title}"`,
          text: `Thank you for your response!\n\nHere's a copy of your submission:\n\n${answerSummary}`,
        }).catch((err: any) => console.error("[FormService] Respondent confirmation email failed:", err));
      }
    } catch (emailErr: any) {
      // Never let email failures break the submission flow
      console.error("[FormService] Email notification error:", emailErr);
    }

    formEvents.emit("response", {
      formId: result.formId,
      responseId: result.id,
      respondentEmail: result.respondentEmail,
      ipAddress: result.ipAddress,
      submittedAt: result.submittedAt,
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

  public listFormTemplates() {
    return FORM_TEMPLATES;
  }

  public async createFormFromTemplate(token: string, payload: { templateId: string }) {
    const userId = await this.getUserIdFromToken(token);
    const template = FORM_TEMPLATES.find((t) => t.id === payload.templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    // 1. Generate unique slug for cloned form
    let duplicateSlug = "";
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      const randomSuffix = crypto.randomBytes(3).toString("hex");
      const candidateSlug = `${template.id}-copy-${randomSuffix}`;

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
      duplicateSlug = `${template.id}-copy-${crypto.randomUUID()}`;
    }

    // 2. Perform insertion inside a transaction to ensure atomicity
    const clonedForm = await db.transaction(async (tx) => {
      // 2a. Insert new form
      const [newForm] = await tx
        .insert(formsTable)
        .values({
          userId,
          title: template.name,
          description: template.description,
          slug: duplicateSlug,
          isPublished: false, // Start unpublished
          visibility: "unlisted",
          theme: template.theme,
        })
        .returning();

      if (!newForm) {
        throw new Error("Failed to insert form from template");
      }

      // 2b. Add template fields with prepended Welcome Screen and appended Ending Screen
      const fieldsToInsert = [
        // Prepend Welcome Screen
        {
          formId: newForm.id,
          label: "Welcome to our form",
          type: "welcome" as const,
          required: false,
          orderIndex: 0,
          validation: {
            description: `Thank you for taking the time to fill out the ${template.name}. Click Start to begin!`,
            buttonText: "Start Survey",
            buttonBgColor: "#10b981",
            buttonTextColor: "#ffffff",
            showStatsBadge: true,
            statsTime: "2 mins",
            socialProof: [
              { name: "Stripe", logo: "https://img.icons8.com/color/48/stripe.png" },
              { name: "Google", logo: "https://img.icons8.com/color/48/google-logo.png" },
              { name: "Slack", logo: "https://img.icons8.com/color/48/slack-new.png" },
              { name: "Airbnb", logo: "https://img.icons8.com/color/48/airbnb.png" }
            ],
            creatorProfile: {
              name: "Sarah Chen",
              role: "Product Director",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
              quote: "\"Your feedback directly shapes our product journey. Thank you for building the future with us!\""
            },
            features: [
              "Takes less than 2 minutes to complete",
              "100% anonymous & secure feedback",
              "Get a premium reward code at the end"
            ]
          },
        },
        // Mapped template questions (shifted orderIndex by 1)
        ...template.fields.map((field, index) => ({
          formId: newForm.id,
          label: field.label,
          type: field.type,
          required: field.required,
          orderIndex: index + 1,
          validation: field.validation || null,
        })),
        // Append Ending Screen
        {
          formId: newForm.id,
          label: "Response Submitted!",
          type: "thank_you" as const,
          required: false,
          orderIndex: template.fields.length + 1,
          validation: {
            description: "Thank you so much! Your answers have been successfully recorded and our team is already reviewing them.",
            buttonText: "Visit our website",
            buttonBgColor: "#6366f1",
            buttonTextColor: "#ffffff",
            redirectUrl: "https://google.com",
            socialShare: true,
            promoCard: {
              title: "Claim Your Reward! 🎁",
              description: "As a thank you, use code WELCOME10 at checkout for 10% off your next purchase.",
              linkText: "Claim Reward",
              linkUrl: "https://stripe.com"
            }
          },
        }
      ];

      await tx.insert(formFieldsTable).values(fieldsToInsert);

      return newForm;
    });

    return clonedForm;
  }

  public async setFormPassword(token: string, payload: SetFormPasswordInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await setFormPasswordInput.parseAsync(payload);

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
      throw new Error("You are not authorized to update this form");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    const [updatedForm] = await db
      .update(formsTable)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(formsTable.id, existingForm.id))
      .returning();

    if (!updatedForm) {
      throw new Error("Failed to update form");
    }

    return {
      success: true,
      formId: updatedForm.id,
    };
  }

  public async removeFormPassword(token: string, payload: RemoveFormPasswordInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await removeFormPasswordInput.parseAsync(payload);

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
      throw new Error("You are not authorized to update this form");
    }

    const [updatedForm] = await db
      .update(formsTable)
      .set({
        passwordHash: null,
        updatedAt: new Date(),
      })
      .where(eq(formsTable.id, existingForm.id))
      .returning();

    if (!updatedForm) {
      throw new Error("Failed to update form");
    }

    return {
      success: true,
      formId: updatedForm.id,
    };
  }

  public async verifyFormPassword(payload: VerifyFormPasswordInputType) {
    const validated = await verifyFormPasswordInput.parseAsync(payload);

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

    if (!form.passwordHash) {
      throw new Error("This form is not password-protected");
    }

    const isMatch = await bcrypt.compare(validated.password, form.passwordHash);
    if (!isMatch) {
      throw new Error("Incorrect password");
    }

    // Retrieve the form fields now that password is correct
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, form.id))
      .orderBy(sql`${formFieldsTable.orderIndex} ASC`);

    return {
      success: true,
      form: { ...form, passwordHash: undefined },
      fields: fields,
    };
  }

  public async addFieldLogicRule(token: string, payload: AddFieldLogicRuleInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await addFieldLogicRuleInput.parseAsync(payload);

    const [fieldWithForm] = await db
      .select({
        field: formFieldsTable,
        form: formsTable,
      })
      .from(formFieldsTable)
      .innerJoin(formsTable, eq(formFieldsTable.formId, formsTable.id))
      .where(
        and(
          eq(formFieldsTable.id, validated.fieldId),
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

    const currentValidation = fieldWithForm.field.validation || {};
    const updatedValidation = {
      ...currentValidation,
      logicRule: validated.rule,
    };

    const [updatedField] = await db
      .update(formFieldsTable)
      .set({
        validation: updatedValidation,
      })
      .where(eq(formFieldsTable.id, validated.fieldId))
      .returning();

    if (!updatedField) {
      throw new Error("Failed to add logic rule");
    }

    return {
      success: true,
      fieldId: updatedField.id,
      validation: updatedField.validation as Record<string, unknown>,
    };
  }

  public async editFieldLogicRule(token: string, payload: EditFieldLogicRuleInputType) {
    return this.addFieldLogicRule(token, payload);
  }

  public async deleteFieldLogicRule(token: string, payload: DeleteFieldLogicRuleInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await deleteFieldLogicRuleInput.parseAsync(payload);

    const [fieldWithForm] = await db
      .select({
        field: formFieldsTable,
        form: formsTable,
      })
      .from(formFieldsTable)
      .innerJoin(formsTable, eq(formFieldsTable.formId, formsTable.id))
      .where(
        and(
          eq(formFieldsTable.id, validated.fieldId),
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

    const currentValidation = fieldWithForm.field.validation || {};
    const { logicRule, ...restValidation } = currentValidation;

    const [updatedField] = await db
      .update(formFieldsTable)
      .set({
        validation: restValidation,
      })
      .where(eq(formFieldsTable.id, validated.fieldId))
      .returning();

    if (!updatedField) {
      throw new Error("Failed to delete logic rule");
    }

    return {
      success: true,
      fieldId: updatedField.id,
    };
  }

  public async getFormLogicTree(payload: GetFormLogicTreeInputType) {
    const validated = await getFormLogicTreeInput.parseAsync(payload);

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

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, form.id))
      .orderBy(sql`${formFieldsTable.orderIndex} ASC`);

    const logicTree = fields.map((field) => {
      const validation = field.validation || {};
      const logicRule = validation.logicRule || null;
      return {
        fieldId: field.id,
        label: field.label,
        type: field.type,
        logicRule: logicRule as any,
      };
    });

    return {
      formId: form.id,
      title: form.title,
      logicTree,
    };
  }

  public async listExploreForms(payload: ListExploreFormsInputType) {
    const validated = await listExploreFormsInput.parseAsync(payload);
    const search = validated.search;
    const theme = validated.theme;
    const limit = validated.limit ?? 10;
    const offset = validated.offset ?? 0;

    let queryConditions = and(
      eq(formsTable.visibility, "public"),
      eq(formsTable.isPublished, true),
      eq(formsTable.isArchived, false),
      sql`${formsTable.deletedAt} IS NULL`
    );

    if (search) {
      queryConditions = and(
        queryConditions,
        sql`(${formsTable.title} ILIKE ${`%${search}%`} OR ${formsTable.description} ILIKE ${`%${search}%`})`
      );
    }

    if (theme) {
      queryConditions = and(
        queryConditions,
        eq(formsTable.theme, theme)
      );
    }

    const forms = await db
      .select()
      .from(formsTable)
      .where(queryConditions)
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${formsTable.createdAt} DESC`);

    return {
      forms,
      limit,
      offset,
    };
  }

  public async listTemplatesByCategory(payload: ListTemplatesByCategoryInputType) {
    const validated = await listTemplatesByCategoryInput.parseAsync(payload);
    const category = validated.category;
    if (category) {
      return FORM_TEMPLATES.filter((t) => t.category?.toLowerCase() === category.toLowerCase());
    }
    return FORM_TEMPLATES;
  }

  public async getQuestionDurationStats(token: string, payload: { formId: string }) {
    const userId = await this.getUserIdFromToken(token);
    
    // 1. Fetch form to verify ownership
    const [form] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, payload.formId),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!form) {
      throw new Error("Form not found");
    }

    if (form.userId !== userId) {
      throw new Error("You are not authorized to view stats for this form");
    }

    // 2. Fetch all fields
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, form.id))
      .orderBy(sql`${formFieldsTable.orderIndex} ASC`);

    // 3. Fetch all response IDs for this form
    const responses = await db
      .select({ id: formResponsesTable.id })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, form.id));

    const stats = [];

    if (responses.length > 0) {
      const responseIds = responses.map((r) => r.id);
      
      // 4. Fetch all answers for these responses
      const answers = await db
        .select()
        .from(formFieldAnswersTable)
        .where(inArray(formFieldAnswersTable.responseId, responseIds));

      for (const field of fields) {
        const fieldAnswers = answers.filter((a) => a.fieldId === field.id);
        let totalDurationMs = 0;
        let countWithDuration = 0;

        for (const ans of fieldAnswers) {
          const valObj = ans.value as any;
          if (valObj && typeof valObj.durationMs === "number") {
            totalDurationMs += valObj.durationMs;
            countWithDuration++;
          }
        }

        const averageDurationMs = countWithDuration > 0 ? Math.round(totalDurationMs / countWithDuration) : 0;

        stats.push({
          fieldId: field.id,
          label: field.label,
          type: field.type,
          averageDurationMs,
          totalDurationMs,
          responseCount: fieldAnswers.length,
          responseWithDurationCount: countWithDuration,
        });
      }
    } else {
      for (const field of fields) {
        stats.push({
          fieldId: field.id,
          label: field.label,
          type: field.type,
          averageDurationMs: 0,
          totalDurationMs: 0,
          responseCount: 0,
          responseWithDurationCount: 0,
        });
      }
    }

    return {
      formId: form.id,
      stats,
    };
  }

  public async getResponseGeoDistribution(token: string, payload: { formId: string }) {
    const userId = await this.getUserIdFromToken(token);
    
    // 1. Fetch form to verify ownership
    const [form] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, payload.formId),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!form) {
      throw new Error("Form not found");
    }

    if (form.userId !== userId) {
      throw new Error("You are not authorized to view stats for this form");
    }

    // 2. Fetch all responses with IP addresses
    const responses = await db
      .select({ ipAddress: formResponsesTable.ipAddress })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, form.id));

    const mockIpGeoLookup = (ip: string | null) => {
      if (!ip) return { country: "Unknown", city: "Unknown" };
      if (ip === "127.0.0.1" || ip === "::1" || ip.toLowerCase().startsWith("localhost")) {
        return { country: "Local Development", city: "Localhost" };
      }
      // Deterministic mapping for testing/geo fallbacks
      const charSum = ip.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const countries = [
        { country: "United States", city: "San Francisco" },
        { country: "India", city: "Bengaluru" },
        { country: "Germany", city: "Berlin" },
        { country: "United Kingdom", city: "London" },
        { country: "Japan", city: "Tokyo" },
        { country: "Canada", city: "Toronto" },
      ];
      return countries[charSum % countries.length]!;
    };

    const countryCounts: Record<string, number> = {};
    const cityCounts: Record<string, number> = {};

    for (const resp of responses) {
      const geo = mockIpGeoLookup(resp.ipAddress);
      countryCounts[geo.country] = (countryCounts[geo.country] || 0) + 1;
      cityCounts[`${geo.city}, ${geo.country}`] = (cityCounts[`${geo.city}, ${geo.country}`] || 0) + 1;
    }

    const countries = Object.entries(countryCounts).map(([country, count]) => ({
      country,
      count,
    })).sort((a, b) => b.count - a.count);

    const cities = Object.entries(cityCounts).map(([city, count]) => ({
      city,
      count,
    })).sort((a, b) => b.count - a.count);

    return {
      formId: form.id,
      countries,
      cities,
      totalResponses: responses.length,
    };
  }

  public async trackFormView(payload: TrackFormViewInputType) {
    const validated = await trackFormViewInput.parseAsync(payload);

    // 1. Fetch form to ensure it exists and is not deleted
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

    // 2. Increment view count
    await db
      .update(formsTable)
      .set({ views: sql`${formsTable.views} + 1` })
      .where(eq(formsTable.id, form.id));

    return {
      success: true,
      formId: form.id,
      views: form.views + 1,
    };
  }

  public async duplicateFormField(token: string, payload: DuplicateFormFieldInputType) {
    const userId = await this.getUserIdFromToken(token);
    const validated = await duplicateFormFieldInput.parseAsync(payload);

    // 1. Fetch original field
    const [originalField] = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.id, validated.fieldId))
      .limit(1);

    if (!originalField) {
      throw new Error("Field not found");
    }

    // 2. Fetch parent form and verify creator ownership
    const [form] = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.id, originalField.formId),
          sql`${formsTable.deletedAt} IS NULL`
        )
      )
      .limit(1);

    if (!form) {
      throw new Error("Form not found");
    }

    if (form.userId !== userId) {
      throw new Error("You are not authorized to duplicate fields on this form");
    }

    // 3. Atomically increment subsequent order indexes and insert duplicated field
    const newField = await db.transaction(async (tx) => {
      await tx
        .update(formFieldsTable)
        .set({ orderIndex: sql`${formFieldsTable.orderIndex} + 1` })
        .where(
          and(
            eq(formFieldsTable.formId, form.id),
            gt(formFieldsTable.orderIndex, originalField.orderIndex)
          )
        );

      const [inserted] = await tx
        .insert(formFieldsTable)
        .values({
          formId: form.id,
          label: `${originalField.label} (Copy)`,
          type: originalField.type,
          required: originalField.required,
          orderIndex: originalField.orderIndex + 1,
          validation: originalField.validation,
        })
        .returning();

      return inserted;
    });

    if (!newField) {
      throw new Error("Failed to duplicate form field");
    }

    return newField;
  }

  private async invalidateFormCache(formId: string) {
    try {
      const [form] = await db
        .select()
        .from(formsTable)
        .where(eq(formsTable.id, formId))
        .limit(1);
      if (form) {
        await redis.invalidateForm(form.slug);
      }
    } catch (err: any) {
      console.error("[FormService] Invalidate form cache failed:", err.message);
    }
  }
}

export interface TemplateField {
  label: string;
  type: "short_text" | "long_text" | "email" | "number" | "single_select" | "multi_select" | "checkbox" | "rating" | "date";
  required: boolean;
  validation?: Record<string, any> | null;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  theme: string;
  fields: TemplateField[];
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "startup-feedback",
    name: "Startup Feedback Form",
    description: "Gather feedback from your users to improve your startup product or service.",
    category: "Feedback",
    theme: "default",
    fields: [
      { label: "What is your full name?", type: "short_text", required: true },
      { label: "What is your work email address?", type: "email", required: true },
      { label: "What is the name of your startup or company?", type: "short_text", required: true },
      {
        label: "What industry best describes your company?",
        type: "single_select",
        required: true,
        validation: { options: ["SaaS", "E-commerce", "AI / ML", "Web3 / Crypto", "Fintech", "Healthtech", "Agency / Consulting", "Other"] },
      },
      {
        label: "How did you first hear about our product?",
        type: "single_select",
        required: true,
        validation: { options: ["Twitter / X", "LinkedIn", "Product Hunt", "Friend referral", "Search engine", "Online Advertisement"] },
      },
      {
        label: "How long have you been using our platform?",
        type: "single_select",
        required: true,
        validation: { options: ["Less than a week", "1-4 weeks", "1-3 months", "More than 3 months"] },
      },
      {
        label: "How likely are you to recommend us to a friend or colleague?",
        type: "rating",
        required: true,
        validation: { max: 5 },
      },
      { label: "What is the single biggest benefit or value you get from using our product?", type: "long_text", required: true },
      {
        label: "Which area needs the most improvement?",
        type: "single_select",
        required: true,
        validation: { options: ["Performance & Speed", "Customer Support", "User Interface & Usability", "Pricing Plans", "Missing Core Features"] },
      },
      { label: "Please share any additional feedback, feature requests, or suggestions.", type: "long_text", required: false },
    ],
  },
  {
    id: "anime-fan-survey",
    name: "⭐ Anime Fan Survey",
    description: "Connect with the community and share your thoughts on favorite anime series and genres.",
    category: "Entertainment",
    theme: "cyberpunk",
    fields: [
      { label: "What is your nickname or fan handle?", type: "short_text", required: true },
      { label: "What is your email address?", type: "email", required: false },
      { label: "Who is your absolute favorite anime character of all time?", type: "short_text", required: true },
      {
        label: "What are your favorite genres of anime?",
        type: "multi_select",
        required: true,
        validation: { options: ["Shonen", "Shojo", "Seinen", "Isekai", "Slice of Life", "Mecha", "Fantasy", "Sci-Fi", "Psychological"] },
      },
      { label: "How many anime series have you watched completely?", type: "number", required: true, validation: { min: 0 } },
      {
        label: "How would you rate the current season's anime releases overall?",
        type: "rating",
        required: true,
        validation: { max: 5 },
      },
      {
        label: "Do you read Manga or Light Novels in addition to watching anime?",
        type: "single_select",
        required: true,
        validation: { options: ["Yes - both manga and light novels", "Yes - manga only", "Yes - light novels only", "No - anime only"] },
      },
      {
        label: "Have you ever attended an anime convention or dressed up in cosplay?",
        type: "single_select",
        required: true,
        validation: { options: ["Yes - both convention and cosplay", "Yes - attended conventions only", "Yes - cosplayed only", "No - neither"] },
      },
      { label: "Tell us about the first anime that got you hooked on the medium.", type: "long_text", required: true },
      {
        label: "Which streaming platform do you use most frequently to watch anime?",
        type: "single_select",
        required: true,
        validation: { options: ["Crunchyroll", "Netflix", "Hulu", "Prime Video", "YouTube", "Physical Media / Blu-ray"] },
      },
    ],
  },
  {
    id: "gaming-tournament",
    name: "⭐ Gaming Tournament Registration",
    description: "Register players, collect gamertags, ranks, and contact info for competitive esports tournaments.",
    category: "Esports",
    theme: "cyberpunk",
    fields: [
      { label: "What is your full name?", type: "short_text", required: true },
      { label: "What is your primary contact email?", type: "email", required: true },
      { label: "What is your in-game name (IGN) or Gamertag?", type: "short_text", required: true },
      { label: "What is your Discord username (for tournament updates and coordination)?", type: "short_text", required: true },
      {
        label: "Which platform do you play on?",
        type: "single_select",
        required: true,
        validation: { options: ["PC", "PlayStation 5", "Xbox Series X/S", "Nintendo Switch", "Mobile"] },
      },
      {
        label: "What is your current competitive rank?",
        type: "single_select",
        required: true,
        validation: { options: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master / Challenger"] },
      },
      {
        label: "What is your primary gaming input method?",
        type: "single_select",
        required: true,
        validation: { options: ["Keyboard & Mouse", "Controller", "Touch Screen", "Specialized Input Device"] },
      },
      { label: "How many hours do you play per week on average?", type: "number", required: true, validation: { min: 0, max: 168 } },
      {
        label: "Have you participated in esports tournaments before?",
        type: "single_select",
        required: true,
        validation: { options: ["Yes - amateur tournaments", "Yes - professional tournaments", "No - this is my first tournament"] },
      },
      { label: "I agree to follow the tournament rules, anti-cheat policy, and fair play guidelines.", type: "checkbox", required: true },
    ],
  },
  {
    id: "ai-product-waitlist",
    name: "⭐ AI Product Waitlist",
    description: "Launch your next generative AI tool with a high-converting waitlist capture form.",
    category: "Startup",
    theme: "sunset",
    fields: [
      { label: "What is your full name?", type: "short_text", required: true },
      { label: "What is your email address?", type: "email", required: true },
      {
        label: "What is your primary role or occupation?",
        type: "single_select",
        required: true,
        validation: { options: ["Software Engineer", "Founder / Executive", "Product Manager", "Designer / Creator", "Marketer", "Researcher", "Student", "Other"] },
      },
      {
        label: "Which upcoming AI feature are you most excited to try first?",
        type: "single_select",
        required: true,
        validation: { options: ["Real-time Voice Agents", "AI Code Generation", "Advanced Analytics", "Multi-modal Image Agents", "Workflow Automation"] },
      },
      {
        label: "What is your primary use case?",
        type: "single_select",
        required: true,
        validation: { options: ["Personal productivity", "Startup / Small Business", "Enterprise / Corporate"] },
      },
      { label: "How many members are in your team?", type: "number", required: true, validation: { min: 1, max: 100 } },
      {
        label: "Are you currently using any other generative AI tools in your workflow?",
        type: "multi_select",
        required: true,
        validation: { options: ["ChatGPT Plus", "Claude Pro", "Gemini Advanced", "Midjourney", "Cursor / GitHub Copilot", "None"] },
      },
      {
        label: "How likely are you to pay for a premium subscription if the tool solves your needs?",
        type: "rating",
        required: true,
        validation: { max: 5 },
      },
      { label: "Tell us briefly about the specific workflow you hope this AI tool will automate for you.", type: "long_text", required: false },
    ],
  },
  {
    id: "developer-survey",
    name: "⭐ Developer Survey",
    description: "Poll software engineers about preferred languages, tooling, and developer experience satisfaction.",
    category: "Developer",
    theme: "retro",
    fields: [
      {
        label: "What is your primary programming language?",
        type: "single_select",
        required: true,
        validation: { options: ["TypeScript / JavaScript", "Python", "Go", "Rust", "Java", "C++", "C#", "Ruby", "PHP", "Swift"] },
      },
      {
        label: "What is your secondary programming language?",
        type: "single_select",
        required: true,
        validation: { options: ["TypeScript / JavaScript", "Python", "Go", "Rust", "Java", "C++", "C#", "Ruby", "PHP", "Swift", "None"] },
      },
      { label: "How many years of professional coding experience do you have?", type: "number", required: true, validation: { min: 0 } },
      {
        label: "Which editor or IDE do you use most frequently?",
        type: "single_select",
        required: true,
        validation: { options: ["VS Code", "Cursor", "Neovim", "IntelliJ IDEA / WebStorm", "Xcode", "Vim / Emacs"] },
      },
      {
        label: "Which OS is your primary development machine?",
        type: "single_select",
        required: true,
        validation: { options: ["macOS", "Linux", "Windows (WSL)", "Windows (Native)"] },
      },
      {
        label: "What is your preferred state management paradigm?",
        type: "single_select",
        required: true,
        validation: { options: ["Redux / Zustand", "React Context API", "MobX / Signals", "State Machines (XState)", "Prop Drilling / None"] },
      },
      {
        label: "Rate your current developer experience (DX) when building full-stack web applications",
        type: "rating",
        required: true,
        validation: { max: 5 },
      },
      {
        label: "How do you feel about writing tests for your codebase?",
        type: "single_select",
        required: true,
        validation: { options: ["I love it - absolute necessity", "I write them because I have to", "I only write unit tests", "I avoid writing tests if possible"] },
      },
      { label: "What is the single biggest friction point in your current software development lifecycle?", type: "long_text", required: true },
    ],
  },
  {
    id: "hackathon-registration",
    name: "⭐ Hackathon Registration Form",
    description: "Gather team details, hacker skill sets, and project ideas for standard hackathons.",
    category: "Registration",
    theme: "retro",
    fields: [
      { label: "What is your full name?", type: "short_text", required: true },
      { label: "What is your contact email address?", type: "email", required: true },
      {
        label: "What is your primary role in a hackathon team?",
        type: "single_select",
        required: true,
        validation: { options: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "UI/UX Designer", "Product Manager", "Data Scientist"] },
      },
      {
        label: "What is your level of experience in software development?",
        type: "single_select",
        required: true,
        validation: { options: ["Beginner / Student", "Intermediate / Hobbyist", "Advanced / Industry Professional"] },
      },
      {
        label: "Do you have an existing team or are you looking for one?",
        type: "single_select",
        required: true,
        validation: { options: ["I already have a full team", "I want to find a team during team matching"] },
      },
      { label: "Link to your GitHub profile, portfolio, or LinkedIn", type: "short_text", required: true },
      {
        label: "Any dietary restrictions or requirements?",
        type: "multi_select",
        required: true,
        validation: { options: ["Vegetarian", "Vegan", "Gluten-Free", "Nut-Free", "Halal", "Kosher", "None"] },
      },
      {
        label: "What shirt size should we prepare for your swag bag?",
        type: "single_select",
        required: true,
        validation: { options: ["XS", "S", "M", "L", "XL", "XXL"] },
      },
      { label: "Please share any abstract project ideas or themes you are excited to build.", type: "long_text", required: false },
      { label: "I agree to follow the hackathon code of conduct and safety regulations.", type: "checkbox", required: true },
    ],
  },
  {
    id: "customer-satisfaction",
    name: "⭐ Customer Satisfaction Survey",
    description: "Gather detailed user feedback and Net Promoter Scores to improve product quality.",
    category: "Feedback",
    theme: "default",
    fields: [
      { label: "What is your full name?", type: "short_text", required: true },
      { label: "What is your email address?", type: "email", required: true },
      {
        label: "How would you rate your overall experience with our service?",
        type: "rating",
        required: true,
        validation: { max: 5 },
      },
      {
        label: "Which area needs the most improvement?",
        type: "single_select",
        required: true,
        validation: { options: ["Product Speed & Performance", "Customer Support Response", "User Interface & Usability", "Pricing Plans", "Feature Requests"] },
      },
      {
        label: "How often do you use our product?",
        type: "single_select",
        required: true,
        validation: { options: ["Daily", "Several times a week", "Once a week", "Monthly", "Rarely"] },
      },
      {
        label: "Were you able to find what you were looking for on our platform?",
        type: "single_select",
        required: true,
        validation: { options: ["Yes - easily", "Yes - with some effort", "No - had to contact support"] },
      },
      {
        label: "How would you rate the quality of our customer support?",
        type: "rating",
        required: false,
        validation: { max: 5 },
      },
      { label: "Please share any additional comments, suggestions, or feature requests.", type: "long_text", required: false },
    ],
  },
  {
    id: "event-registration-rsvp",
    name: "⭐ Event Registration Form",
    description: "Collect sign-ups, RSVPs, dietary options, and guest counts for in-person and virtual events.",
    category: "Registration",
    theme: "sunset",
    fields: [
      { label: "Attendee Full Name", type: "short_text", required: true },
      { label: "Contact Email", type: "email", required: true },
      { label: "Phone Number (for urgent event updates)", type: "short_text", required: false },
      {
        label: "Will you be attending in person or virtually?",
        type: "single_select",
        required: true,
        validation: { options: ["In-Person Attendance", "Virtual Streaming / RSVP Only"] },
      },
      {
        label: "Any dietary restrictions or requirements?",
        type: "multi_select",
        required: true,
        validation: { options: ["Vegetarian", "Vegan", "Gluten-Free", "Nut-Free", "Halal", "Kosher", "None"] },
      },
      { label: "How many guests will you be bringing with you?", type: "number", required: true, validation: { min: 0, max: 5 } },
      {
        label: "How did you hear about this event?",
        type: "single_select",
        required: true,
        validation: { options: ["Social Media", "Newsletter / Email", "Friend / Word of mouth", "Meetup.com", "Other"] },
      },
      { label: "Would you like to receive notifications about future events?", type: "checkbox", required: false },
    ],
  },
  {
    id: "bug-report",
    name: "⭐ Bug Report Form",
    description: "Create an organized workflow for QA, testers, and users to submit software bug reports.",
    category: "Developer",
    theme: "retro",
    fields: [
      { label: "Provide a short, descriptive title of the bug", type: "short_text", required: true },
      {
        label: "What is the severity of this issue?",
        type: "single_select",
        required: true,
        validation: { options: ["Low (Visual/Text issue)", "Medium (Workaround exists)", "High (Core feature broken)", "Critical (Blocker/Crash)"] },
      },
      {
        label: "What environment did this occur in?",
        type: "single_select",
        required: true,
        validation: { options: ["Production", "Staging / UAT", "Local Development"] },
      },
      { label: "Steps to reproduce the bug", type: "long_text", required: true },
      { label: "Expected behavior description", type: "long_text", required: true },
      { label: "Actual behavior description", type: "long_text", required: true },
      { label: "What operating system and version were you using?", type: "short_text", required: true },
      { label: "What web browser and version were you using?", type: "short_text", required: true },
      {
        label: "Is this bug consistently reproducible?",
        type: "single_select",
        required: true,
        validation: { options: ["Yes - every time", "Yes - intermittently", "No - only happened once"] },
      },
    ],
  },
  {
    id: "discord-community-app",
    name: "⭐ Discord Community Application",
    description: "Process moderator applications and acceptances for highly-curated Discord servers.",
    category: "Registration",
    theme: "default",
    fields: [
      { label: "What is your Discord username?", type: "short_text", required: true },
      { label: "How old are you?", type: "number", required: true, validation: { min: 13 } },
      { label: "Why would you like to join or moderate our community?", type: "long_text", required: true },
      {
        label: "What skills or value do you hope to bring to the community?",
        type: "multi_select",
        required: true,
        validation: { options: ["Coding / Development", "Art / Design", "Writing / Content", "Moderation", "Event Hosting", "Networking / Chatting"] },
      },
      {
        label: "How did you hear about our community?",
        type: "single_select",
        required: true,
        validation: { options: ["Twitter / X", "YouTube", "GitHub", "Friend referral", "Search Engine"] },
      },
      { label: "I agree to follow the community rules and code of conduct", type: "checkbox", required: true },
    ],
  },
  {
    id: "product-market-fit",
    name: "Product Market Fit (PMF) Survey",
    description: "Measure the PMF score of your startup using the standard Sean Ellis question template.",
    category: "Marketing",
    theme: "forest",
    fields: [
      {
        label: "How would you feel if you could no longer use this product?",
        type: "single_select",
        required: true,
        validation: { options: ["Very disappointed", "Somewhat disappointed", "Not disappointed", "I no longer use it"] },
      },
      { label: "What is the primary benefit you receive from using our product?", type: "long_text", required: true },
      { label: "What type of person do you think would benefit most from our product?", type: "long_text", required: false },
      { label: "How can we improve this product for you?", type: "long_text", required: false },
    ],
  },
];

export default FormService;
export { formEvents };

