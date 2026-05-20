import { db, eq, and, gt, sql } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { sessionsTable } from "@repo/database/models/sessions";
import { usersTable } from "@repo/database/models/user";
import { formFieldsTable } from "@repo/database/models/form-field";
import crypto from "crypto";
import { createFormInput, editFormInput, getFormBySlugPublicInput, getFormByIdCreatorInput } from "./model";
import type { CreateFormInputType, EditFormInputType, GetFormBySlugPublicInputType, GetFormByIdCreatorInputType } from "./model";

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
}

export default FormService;
