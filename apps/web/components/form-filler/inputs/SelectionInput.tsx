'use client';

import React, { memo } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { FieldInputProps, FormField } from "../types";

function getChoices(field: FormField): string[] {
  const v = field.validation as Record<string, unknown> | null | undefined;
  if (!v) return [];
  return Array.isArray(v.choices) ? (v.choices as string[]) : [];
}

export const SelectionInput = memo(({ field, value, styles, onChange }: FieldInputProps) => {
  const choices = getChoices(field);
  const isMulti = field.type === 'multi_select';
  const selected: string[] = Array.isArray(value) ? (value as string[]) : (typeof value === 'string' ? [value] : []);

  function toggle(choice: string) {
    if (isMulti) {
      if (selected.includes(choice)) {
        onChange(selected.filter((c) => c !== choice));
      } else {
        onChange([...selected, choice]);
      }
    } else {
      onChange(choice);
    }
  }

  if (field.type === 'dropdown') {
    return (
      <div className="py-4 max-w-md">
        <select
          value={typeof value === 'string' ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 rounded-xl border-2 px-4 focus:outline-none appearance-none cursor-pointer"
          style={{
            borderColor: styles.inputBorderColor,
            backgroundColor: styles.inputBgColor,
            color: styles.textColor,
            fontFamily: styles.fontFamily,
          }}
        >
          <option value="" disabled>Select an option...</option>
          {choices.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {choices.map((choice, idx) => {
        const isSelected = isMulti ? selected.includes(choice) : value === choice;
        const letter = String.fromCharCode(65 + idx);

        return (
          <button
            key={choice}
            type="button"
            onClick={() => toggle(choice)}
            className="w-full text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-all text-xs font-semibold group"
            style={{
              borderColor: isSelected ? styles.primaryColor : styles.inputBorderColor,
              backgroundColor: isSelected ? styles.glow : undefined,
              color: styles.textColor,
            }}
          >
            <div className="flex items-center gap-3">
              <kbd
                className="text-[10px] font-mono border rounded px-1.5 py-0.5 transition-transform group-hover:scale-105"
                style={{
                  borderColor: isSelected ? styles.primaryColor : styles.inputBorderColor,
                }}
              >
                {letter}
              </kbd>
              <span style={{ 
                fontFamily: styles.fontFamily,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight as any,
              }}>{choice}</span>
            </div>
            {isSelected && (
              <Check className="h-4 w-4 shrink-0" style={{ color: styles.primaryColor }} />
            )}
          </button>
        );
      })}
    </div>
  );
});

SelectionInput.displayName = 'SelectionInput';
