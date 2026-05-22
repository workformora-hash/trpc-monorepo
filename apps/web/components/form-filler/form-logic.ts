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
  if (field.required) {
    if (value === undefined || value === null || String(value).trim() === "")
      return "This question is required.";
    if (Array.isArray(value) && value.length === 0)
      return "Please choose at least one option.";
    if (field.type === "checkbox" && value !== true)
      return "You must check this box to continue.";
  }

  if (value !== undefined && value !== null && String(value).trim() !== "") {
    if (field.type === "email") {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
      if (!ok) return "Please enter a valid email address.";
    }
    if (field.type === "number" && isNaN(Number(value))) {
      return "Please enter a valid number.";
    }
  }

  return null;
}
