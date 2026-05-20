import { db, eq, and, gt, sql } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { sessionsTable } from "@repo/database/models/sessions";
import { usersTable } from "@repo/database/models/user";
import crypto from "crypto";
import { createFormInput } from "./model";
import type { CreateFormInputType } from "./model";

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
}

export default FormService;
