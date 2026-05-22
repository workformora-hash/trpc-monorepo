import type { AnswersMap, FormField, LogicTreeItem } from "./types";

function evaluateRule(
  rule: LogicTreeItem["logicRule"],
  answers: AnswersMap
): boolean {
  if (!rule) return true; // no rule → always show
  const triggerValue = answers[rule.triggerFieldId];
  if (triggerValue === undefined) return false; // trigger not answered → skip

  const trigger = String(triggerValue).toLowerCase();
  const target = String(rule.value).toLowerCase();

  switch (rule.operator) {
    case "equals":
      return trigger === target;
    case "not_equals":
      return trigger !== target;
    case "greater_than":
      return Number(triggerValue) > Number(rule.value);
    case "less_than":
      return Number(triggerValue) < Number(rule.value);
    default:
      return true;
  }
}

export function getNextIndex(
  currentIndex: number,
  fields: FormField[],
  logicTree: LogicTreeItem[],
  answers: AnswersMap
): number {
  let next = currentIndex + 1;
  while (next < fields.length) {
    const field = fields[next]!;
    const item = logicTree.find((l) => l.fieldId === field.id);
    if (!item?.logicRule || evaluateRule(item.logicRule, answers)) {
      return next;
    }
    next++;
  }
  return next; // past the end → submit
}

export function getPrevIndex(
  currentIndex: number,
  fields: FormField[],
  logicTree: LogicTreeItem[],
  answers: AnswersMap
): number {
  let prev = currentIndex - 1;
  while (prev >= 0) {
    const field = fields[prev]!;
    const item = logicTree.find((l) => l.fieldId === field.id);
    if (!item?.logicRule || evaluateRule(item.logicRule, answers)) {
      return prev;
    }
    prev--;
  }
  return -1; // back to welcome
}

/** Returns a human-readable validation error string, or null if valid. */
export function validateField(
  field: FormField,
  value: unknown
): string | null {
  const config = (field.validation as Record<string, any>) || {};

  // Check required fields
  if (field.required) {
    if (value === undefined || value === null || String(value).trim() === "")
      return "This question is required.";
    if (Array.isArray(value) && value.length === 0)
      return "Please choose at least one option.";
    if (field.type === "checkbox" && value !== true)
      return "You must check this box to continue.";
  }

  // If answer is provided, validate custom advanced rules
  if (value !== undefined && value !== null && String(value).trim() !== "") {
    switch (field.type) {
      case "short_text":
      case "long_text": {
        const strVal = String(value);
        if (config.minLength !== undefined && config.minLength !== null && strVal.length < config.minLength) {
          return `Answer must be at least ${config.minLength} characters.`;
        }
        if (config.maxLength !== undefined && config.maxLength !== null && strVal.length > config.maxLength) {
          return `Answer must be at most ${config.maxLength} characters.`;
        }
        if (config.format === "url" && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(strVal)) {
          return "Please enter a valid URL (e.g. https://example.com).";
        }
        if (config.format === "alpha" && !/^[a-zA-Z]+$/.test(strVal)) {
          return "Answer must contain letters only.";
        }
        if (config.format === "alphanumeric" && !/^[a-zA-Z0-9]+$/.test(strVal)) {
          return "Answer must contain letters and numbers only.";
        }
        if (config.pattern !== undefined && config.pattern !== null && config.pattern !== "") {
          try {
            const regex = new RegExp(config.pattern);
            if (!regex.test(strVal)) {
              return config.patternMessage || "Format is invalid.";
            }
          } catch (e) {}
        }
        break;
      }

      case "email": {
        const strVal = String(value);
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strVal);
        if (!ok) return "Please enter a valid email address.";

        if (config.blockFreeEmails) {
          const freeProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com"];
          const domain = strVal.split("@")[1]?.toLowerCase();
          if (domain && freeProviders.includes(domain)) {
            return "Free email addresses are not allowed. Please use a business email.";
          }
        }

        if (config.allowedDomains) {
          const domains = config.allowedDomains.split(",").map((d: string) => d.trim().toLowerCase());
          const domain = strVal.split("@")[1]?.toLowerCase();
          if (domain && !domains.includes(domain)) {
            return `Email domain must be one of: ${config.allowedDomains}`;
          }
        }
        break;
      }

      case "number": {
        const numVal = Number(value);
        if (isNaN(numVal)) {
          return "Please enter a valid number.";
        }
        if (config.min !== undefined && config.min !== null && numVal < config.min) {
          return `Value must be at least ${config.min}.`;
        }
        if (config.max !== undefined && config.max !== null && numVal > config.max) {
          return `Value must be at most ${config.max}.`;
        }
        if (config.integerOnly && !Number.isInteger(numVal)) {
          return "Answer must be a whole integer.";
        }
        break;
      }

      case "rating": {
        const numVal = Number(value);
        const maxStars = config.maxStars || config.max || 5;
        if (numVal > maxStars) {
          return `Rating cannot exceed ${maxStars} stars.`;
        }
        break;
      }

      case "checkbox": {
        if (config.mustBeChecked && value !== true) {
          return "You must accept/check this field to continue.";
        }
        break;
      }

      case "multi_select": {
        if (Array.isArray(value)) {
          if (config.minChoices !== undefined && config.minChoices !== null && value.length < config.minChoices) {
            return `Please select at least ${config.minChoices} options.`;
          }
          if (config.maxChoices !== undefined && config.maxChoices !== null && value.length > config.maxChoices) {
            return `Please select at most ${config.maxChoices} options.`;
          }
        }
        break;
      }

      case "date": {
        const dateStr = String(value);
        const parsedDate = Date.parse(dateStr);
        if (isNaN(parsedDate)) {
          return "Please select a valid date.";
        }
        if (config.minDate !== undefined && config.minDate !== null && config.minDate !== "" && parsedDate < Date.parse(config.minDate)) {
          return `Date cannot be earlier than ${config.minDate}.`;
        }
        if (config.maxDate !== undefined && config.maxDate !== null && config.maxDate !== "" && parsedDate > Date.parse(config.maxDate)) {
          return `Date cannot be later than ${config.maxDate}.`;
        }
        break;
      }
    }
  }

  return null;
}
