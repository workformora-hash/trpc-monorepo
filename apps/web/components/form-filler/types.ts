export interface ThemeStyles {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  fontFamily: string;
  cardBgColor: string;
  inputBgColor: string;
  inputBorderColor: string;
  /** Semi-transparent primary for selected state backgrounds */
  glow: string;
}

export interface FormField {
  id: string;
  label: string;
  type:
    | "short_text"
    | "long_text"
    | "email"
    | "number"
    | "single_select"
    | "multi_select"
    | "checkbox"
    | "rating"
    | "date";
  required: boolean;
  orderIndex: number;
  validation?: Record<string, unknown> | null;
}

export interface FormData {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  theme: string;
  isPublished: boolean;
  visibility: "public" | "unlisted";
}

export interface LogicRule {
  triggerFieldId: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than";
  value: string;
}

export interface LogicTreeItem {
  fieldId: string;
  label: string;
  type: string;
  logicRule: LogicRule | null;
}

/** Answers keyed by field ID. Values are intentionally `unknown` — validated before submission. */
export type AnswersMap = Record<string, unknown>;
