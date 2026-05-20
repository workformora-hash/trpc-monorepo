import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formResponsesTable } from "@repo/database/models/form-response";
import { formFieldAnswersTable } from "@repo/database/models/form-field-answer";
import { usersTable } from "@repo/database/models/user";
import { sessionsTable } from "@repo/database/models/sessions";

export type FormSelect = typeof formsTable.$inferSelect;
export type FormFieldSelect = typeof formFieldsTable.$inferSelect;
export type FormResponseSelect = typeof formResponsesTable.$inferSelect;
export type FormFieldAnswerSelect = typeof formFieldAnswersTable.$inferSelect;
export type UserSelect = typeof usersTable.$inferSelect;
export type SessionSelect = typeof sessionsTable.$inferSelect;

export function createUser(overrides: Partial<UserSelect> = {}): UserSelect {
  const now = new Date();
  return {
    id: `user-${Math.random().toString(36).substring(2, 9)}`,
    name: "Alice Smith",
    email: `user-${Math.random().toString(36).substring(2, 9)}@example.com`,
    isEmailVerified: true,
    emailVerifiedAt: now,
    avatarUrl: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

export function createSession(overrides: Partial<SessionSelect> = {}): SessionSelect {
  const now = new Date();
  return {
    id: `session-${Math.random().toString(36).substring(2, 9)}`,
    userId: "user-123",
    tokenHash: "token-hash",
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla/5.0",
    metadata: null,
    expiresAt: new Date(now.getTime() + 24 * 3600 * 1000), // 24 hours
    lastActiveAt: now,
    createdAt: now,
    ...overrides,
  };
}

export function createForm(overrides: Partial<FormSelect> = {}): FormSelect {
  const now = new Date();
  return {
    id: `form-${Math.random().toString(36).substring(2, 9)}`,
    userId: "user-123",
    title: "Untitled Form",
    description: null,
    slug: `form-${Math.random().toString(36).substring(2, 9)}`,
    isPublished: false,
    isArchived: false,
    visibility: "public",
    theme: "default",
    expiresAt: null,
    maxResponses: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

export function createFormField(overrides: Partial<FormFieldSelect> = {}): FormFieldSelect {
  return {
    id: `field-${Math.random().toString(36).substring(2, 9)}`,
    formId: "form-123",
    label: "Question Label",
    type: "short_text",
    required: false,
    orderIndex: 0,
    validation: null,
    ...overrides,
  };
}

export function createFormResponse(overrides: Partial<FormResponseSelect> = {}): FormResponseSelect {
  const now = new Date();
  return {
    id: `resp-${Math.random().toString(36).substring(2, 9)}`,
    formId: "form-123",
    respondentEmail: null,
    ipAddress: null,
    userAgent: null,
    submittedAt: now,
    ...overrides,
  };
}

export function createFormFieldAnswer(overrides: Partial<FormFieldAnswerSelect> = {}): FormFieldAnswerSelect {
  return {
    id: `ans-${Math.random().toString(36).substring(2, 9)}`,
    responseId: "resp-123",
    fieldId: "field-123",
    value: { value: "mock answer" },
    ...overrides,
  };
}
