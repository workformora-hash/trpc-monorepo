export interface ThemeStyles {
  backgroundColor: string;
  backgroundImage?: string;
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
  fontSize?: string;
  fontWeight?: string | number;
}

export interface FieldInputProps {
  field: FormField;
  value: unknown;
  styles: ThemeStyles;
  onChange: (value: unknown) => void;
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
    | "date"
    | "contact_info"
    | "address"
    | "website"
    | "dropdown"
    | "yes_no"
    | "ranking"
    | "welcome"
    | "thank_you"
    | "statement";
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
  visibility: "public" | "unlisted" | string;
  expiresAt?: string | Date | null;
  maxResponses?: number | null;
  isArchived?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
