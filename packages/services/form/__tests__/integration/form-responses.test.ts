import "../helpers/integration-setup";
import { deleteFormById, deleteUserById } from "../helpers/integration-setup";
import { describe, it, expect, afterEach } from "vitest";
import FormService from "../../index";
import { db } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { sessionsTable } from "@repo/database/models/sessions";
import crypto from "crypto";

describe("FormService - Form Responses & Analytics (Integration)", () => {
  const formService = new FormService();
  const createdUserIds: string[] = [];
  const createdFormIds: string[] = [];

  afterEach(async () => {
    console.log("[afterEach] Cleanup started");
    for (const formId of createdFormIds) {
      await deleteFormById(formId);
    }
    for (const userId of createdUserIds) {
      await deleteUserById(userId);
    }
    console.log("[afterEach] Cleanup done");
  });

  async function createTestUserAndSession() {
    console.log("[createTestUserAndSession] Creating user...");
    const email = `test-form-responses-${Date.now()}@example.com`;
    const [user] = await db
      .insert(usersTable)
      .values({
        name: "Responses User",
        email,
        isEmailVerified: true,
      })
      .returning();

    createdUserIds.push(user.id);
    console.log("[createTestUserAndSession] User created:", user.id);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    console.log("[createTestUserAndSession] Creating session...");
    await db.insert(sessionsTable).values({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 3600000),
    });
    console.log("[createTestUserAndSession] Session created");

    return { userId: user.id, token: rawToken };
  }

  it("should successfully submit responses, fetch lists, retrieve analytics, export to CSV, and clear responses", async () => {
    console.log("[test] Step 1: Create user and session...");
    const { token } = await createTestUserAndSession();

    console.log("[test] Step 2: Create form...");
    const form = await formService.createForm(token, {
      title: "Test Form for Responses",
      slug: `test-resp-slug-${Date.now()}`,
      visibility: "public",
      theme: "default",
    });

    createdFormIds.push(form.id);
    console.log("[test] Form created:", form.id);

    console.log("[test] Step 3: Add short text field...");
    const textField = await formService.addFormField(token, {
      formId: form.id,
      label: "What is your name?",
      type: "short_text",
      required: true,
      validation: { minLength: 3, maxLength: 50 },
    });
    console.log("[test] Short text field added:", textField.id);

    console.log("[test] Step 4: Add rating field...");
    const ratingField = await formService.addFormField(token, {
      formId: form.id,
      label: "Rate our service",
      type: "rating",
      required: false,
      validation: { max: 5 },
    });
    console.log("[test] Rating field added:", ratingField.id);

    console.log("[test] Step 5: Publish form...");
    await formService.publishForm(token, {
      id: form.id,
    });
    console.log("[test] Form published");

    console.log("[test] Step 6: Submit response...");
    const submission = await formService.submitResponse({
      formId: form.id,
      respondentEmail: "respondent@example.com",
      answers: [
        { fieldId: textField.id, value: "Bob Vance" },
        { fieldId: ratingField.id, value: 5 },
      ],
    }, "127.0.0.1");

    expect(submission.success).toBe(true);
    expect(submission.responseId).toBeDefined();
    console.log("[test] Response submitted:", submission.responseId);

    console.log("[test] Step 7: List responses...");
    const listResult = await formService.listResponses(token, {
      formId: form.id,
      limit: 10,
      offset: 0,
    });

    expect(listResult.responses).toHaveLength(1);
    expect(listResult.responses![0]!.respondentEmail).toBe("respondent@example.com");
    console.log("[test] List responses success");

    console.log("[test] Step 8: Get response by ID...");
    const responseDetail = await formService.getResponseById(token, {
      responseId: submission.responseId!,
    });

    expect(responseDetail.response.id).toBe(submission.responseId);
    expect(responseDetail.answers![0]!.value).toEqual({ value: "Bob Vance" });
    console.log("[test] Get response by ID success");

    console.log("[test] Step 9: Get analytics...");
    const analytics = await formService.getFormAnalytics(token, {
      formId: form.id,
    });

    expect(analytics.totalResponses).toBe(1);
    expect(analytics.fieldAnalytics).toHaveLength(2);
    const textAnalytic = analytics.fieldAnalytics!.find((a) => a.fieldId === textField.id);
    expect(textAnalytic?.stats.recentAnswers).toContain("Bob Vance");
    const ratingAnalytic = analytics.fieldAnalytics!.find((a) => a.fieldId === ratingField.id);
    expect(ratingAnalytic?.stats.averageRating).toBe(5);
    console.log("[test] Get analytics success");

    console.log("[test] Step 10: Export to CSV...");
    const csvExport = await formService.exportResponsesToCSV(token, {
      formId: form.id,
    });

    expect(csvExport.success).toBe(true);
    expect(csvExport.csv).toContain("Response ID,Submitted At,IP Address,Respondent Email");
    expect(csvExport.csv).toContain("Bob Vance");
    console.log("[test] Export to CSV success");

    console.log("[test] Step 11: Clear responses...");
    const clearResult = await formService.clearFormResponses(token, {
      id: form.id,
    });

    expect(clearResult.success).toBe(true);
    expect(clearResult.formId).toBe(form.id);
    console.log("[test] Clear responses success");

    console.log("[test] Step 12: List responses after clear...");
    const listAfterClear = await formService.listResponses(token, {
      formId: form.id,
    });
    expect(listAfterClear.responses).toHaveLength(0);
    console.log("[test] List responses after clear success");
  }, 30000);
});
