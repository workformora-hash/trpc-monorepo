"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import type { FormData, ThemeStyles } from "./types";

interface FormWelcomeSlideProps {
  form: FormData;
  styles: ThemeStyles;
  onStart: () => void;
}

export function FormWelcomeSlide({ form, styles, onStart }: FormWelcomeSlideProps) {
  return (
    <div className="w-full space-y-6 text-left">
      <div className="space-y-3">
        {form.theme !== "default" && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-neutral-500/10 border border-neutral-500/20">
            <Sparkles className="h-3 w-3" />
            {form.theme} theme
          </span>
        )}

        <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
          {form.title}
        </h1>

        {form.description && (
          <p className="text-sm opacity-75 max-w-md leading-relaxed">
            {form.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={onStart}
          className="py-3 px-6 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-opacity hover:opacity-90 shadow-md"
          style={{
            backgroundColor: styles.buttonBgColor,
            color: styles.buttonTextColor,
          }}
        >
          Start
          <ArrowRight className="h-4 w-4" />
        </button>

        <span className="text-[10px] opacity-40 font-semibold hidden md:flex items-center gap-1">
          or press
          <kbd className="border px-1.5 py-0.5 rounded text-[9px] font-mono">
            Enter ↵
          </kbd>
        </span>
      </div>
    </div>
  );
}
