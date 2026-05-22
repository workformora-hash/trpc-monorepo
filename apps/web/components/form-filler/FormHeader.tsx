"use client";

import type { FormData, ThemeStyles } from "./types";

interface FormHeaderProps {
  form: FormData;
  currentIndex: number;
  totalFields: number;
  styles: ThemeStyles;
}

export function FormHeader({
  form,
  currentIndex,
  totalFields,
  styles,
}: FormHeaderProps) {
  return (
    <header
      className="h-14 px-6 flex items-center justify-between shrink-0"
      style={{ color: styles.textColor }}
    >
      <span className="text-xs font-bold uppercase tracking-widest opacity-60 truncate max-w-[60%]">
        {form.title}
      </span>

      {currentIndex >= 0 && totalFields > 0 && (
        <span className="text-[10px] font-mono font-bold opacity-50 shrink-0">
          {currentIndex + 1} / {totalFields}
        </span>
      )}
    </header>
  );
}
