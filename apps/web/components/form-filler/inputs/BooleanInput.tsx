'use client';

import React, { memo } from "react";
import type { FieldInputProps } from "../types";

export const BooleanInput = memo(({ field, value, styles, onChange }: FieldInputProps) => {
  return (
    <div className="flex gap-4 py-4 w-full max-w-md">
      {[
        { label: "YES", val: true },
        { label: "NO", val: false },
      ].map((opt) => {
        const selected = value === opt.val;
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(opt.val)}
            className="flex-1 h-24 rounded-2xl border-2 flex items-center justify-center text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              borderColor: selected ? styles.primaryColor : styles.inputBorderColor,
              backgroundColor: selected ? styles.glow : undefined,
              color: styles.textColor,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
});

BooleanInput.displayName = 'BooleanInput';
