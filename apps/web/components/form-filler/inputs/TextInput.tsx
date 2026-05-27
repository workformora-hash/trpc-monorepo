'use client';

import React, { memo } from "react";
import type { FieldInputProps } from "../types";

export const TextInput = memo(({ field, value, styles, onChange }: FieldInputProps) => {
  const commonProps = {
    value: typeof value === "string" ? value : "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    className: "w-full bg-transparent border-b text-lg py-2 focus:outline-none transition-colors placeholder:opacity-30",
    style: { 
      borderBottomColor: styles.inputBorderColor, 
      color: styles.textColor,
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight as any,
    },
  };

  if (field.type === 'long_text') {
    return (
      <textarea
        {...commonProps}
        rows={4}
        className={`${commonProps.className} text-sm resize-none`}
        placeholder="Type your answer…"
      />
    );
  }

  return (
    <input
      {...commonProps}
      type={field.type === 'email' ? 'email' : 'text'}
      placeholder={field.type === 'email' ? 'name@example.com' : 'Type your answer…'}
    />
  );
});

TextInput.displayName = 'TextInput';

export const NumberInput = memo(({ value, styles, onChange }: FieldInputProps) => {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
      onChange={(e) => {
        const cleaned = e.target.value.replace(/[^0-9.-]/g, "");
        onChange(cleaned);
      }}
      placeholder="0"
      className="w-full bg-transparent border-b text-lg py-2 focus:outline-none transition-colors placeholder:opacity-30"
      style={{ 
        borderBottomColor: styles.inputBorderColor, 
        color: styles.textColor,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight as any,
      }}
    />
  );
});

NumberInput.displayName = 'NumberInput';
