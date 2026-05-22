"use client";

import { Check, Star, AlertCircle, Loader2 } from "lucide-react";
import type { FormField, ThemeStyles } from "./types";

// ─── Shared props ─────────────────────────────────────────────────────────────

interface FieldInputProps {
  field: FormField;
  value: unknown;
  styles: ThemeStyles;
  onChange: (value: unknown) => void;
}

// ─── Individual field controls ────────────────────────────────────────────────

function ShortTextInput({ field, value, styles, onChange }: FieldInputProps) {
  return (
    <input
      type="text"
      autoFocus
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer…"
      className="w-full bg-transparent border-b text-lg py-2 focus:outline-none transition-colors placeholder:opacity-30"
      style={{ borderBottomColor: styles.inputBorderColor, color: styles.textColor }}
    />
  );
}

function LongTextInput({ field, value, styles, onChange }: FieldInputProps) {
  return (
    <textarea
      autoFocus
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer…"
      rows={4}
      className="w-full bg-transparent border-b text-sm py-2 focus:outline-none transition-colors placeholder:opacity-30 resize-none"
      style={{ borderBottomColor: styles.inputBorderColor, color: styles.textColor }}
    />
  );
}

function EmailInput({ field, value, styles, onChange }: FieldInputProps) {
  return (
    <input
      type="email"
      autoFocus
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="name@example.com"
      className="w-full bg-transparent border-b text-lg py-2 focus:outline-none transition-colors placeholder:opacity-30"
      style={{ borderBottomColor: styles.inputBorderColor, color: styles.textColor }}
    />
  );
}

function NumberInput({ field, value, styles, onChange }: FieldInputProps) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoFocus
      value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
      onChange={(e) => {
        const cleaned = e.target.value.replace(/[^0-9.-]/g, "");
        onChange(cleaned);
      }}
      placeholder="0"
      className="w-full bg-transparent border-b text-lg py-2 focus:outline-none transition-colors placeholder:opacity-30"
      style={{ borderBottomColor: styles.inputBorderColor, color: styles.textColor }}
    />
  );
}

function SingleSelectInput({ field, value, styles, onChange }: FieldInputProps) {
  const choices = getChoices(field);

  return (
    <div className="grid gap-2">
      {choices.map((choice, idx) => {
        const selected = value === choice;
        const letter = String.fromCharCode(65 + idx);

        return (
          <button
            key={choice}
            type="button"
            onClick={() => onChange(choice)}
            className="w-full text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-all text-xs font-semibold group"
            style={{
              borderColor: selected ? styles.primaryColor : styles.inputBorderColor,
              backgroundColor: selected ? styles.glow : undefined,
              color: styles.textColor,
            }}
          >
            <div className="flex items-center gap-3">
              <kbd
                className="text-[10px] font-mono border rounded px-1.5 py-0.5 transition-transform group-hover:scale-105"
                style={{
                  borderColor: selected ? styles.primaryColor : styles.inputBorderColor,
                }}
              >
                {letter}
              </kbd>
              <span>{choice}</span>
            </div>
            {selected && (
              <Check className="h-4 w-4 shrink-0" style={{ color: styles.primaryColor }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

function MultiSelectInput({ field, value, styles, onChange }: FieldInputProps) {
  const choices = getChoices(field);
  const selected: string[] = Array.isArray(value) ? (value as string[]) : [];

  function toggle(choice: string) {
    if (selected.includes(choice)) {
      onChange(selected.filter((c) => c !== choice));
    } else {
      onChange([...selected, choice]);
    }
  }

  return (
    <div className="grid gap-2">
      {choices.map((choice, idx) => {
        const isSelected = selected.includes(choice);
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
              <span>{choice}</span>
            </div>
            {/* Checkbox indicator */}
            <div
              className="h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors"
              style={{
                borderColor: isSelected ? styles.primaryColor : styles.inputBorderColor,
                backgroundColor: isSelected ? styles.primaryColor : undefined,
              }}
            >
              {isSelected && <Check className="h-3 w-3 text-white" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function CheckboxInput({ field, value, styles, onChange }: FieldInputProps) {
  const checked = value === true;

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-semibold transition-all"
      style={{
        borderColor: checked ? styles.primaryColor : styles.inputBorderColor,
        backgroundColor: checked ? styles.glow : undefined,
        color: styles.textColor,
      }}
    >
      <div
        className="h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors"
        style={{
          borderColor: checked ? styles.primaryColor : styles.inputBorderColor,
          backgroundColor: checked ? styles.primaryColor : undefined,
        }}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </div>
      I confirm this.
    </button>
  );
}

function RatingInput({ field, value, styles, onChange }: FieldInputProps) {
  const current = typeof value === "number" ? value : 0;

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = current >= n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="p-1 transition-transform hover:scale-110"
            aria-label={`Rate ${n}`}
            style={{ color: filled ? styles.primaryColor : styles.inputBorderColor }}
          >
            <Star
              className="h-8 w-8"
              fill={filled ? styles.primaryColor : "none"}
            />
          </button>
        );
      })}
      <span className="text-[10px] opacity-35 ml-2 font-semibold hidden md:block">
        (keys 1–5)
      </span>
    </div>
  );
}

function DateInput({ field, value, styles, onChange }: FieldInputProps) {
  return (
    <input
      type="date"
      autoFocus
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent border rounded-xl py-2.5 px-4 text-xs focus:outline-none transition-colors"
      style={{
        borderColor: styles.inputBorderColor,
        color: styles.textColor,
      }}
    />
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

const FIELD_COMPONENTS: Partial<Record<FormField["type"], React.ComponentType<FieldInputProps>>> = {
  short_text: ShortTextInput,
  long_text: LongTextInput,
  email: EmailInput,
  number: NumberInput,
  single_select: SingleSelectInput,
  multi_select: MultiSelectInput,
  checkbox: CheckboxInput,
  rating: RatingInput,
  date: DateInput,
};

// ─── Question Slide ───────────────────────────────────────────────────────────

interface QuestionSlideProps {
  field: FormField;
  questionNumber: number;
  value: unknown;
  error: string | null;
  isSubmitting: boolean;
  isLastQuestion: boolean;
  styles: ThemeStyles;
  onChange: (value: unknown) => void;
  onNext: () => void;
}

export function QuestionSlide({
  field,
  questionNumber,
  value,
  error,
  isSubmitting,
  isLastQuestion,
  styles,
  onChange,
  onNext,
}: QuestionSlideProps) {
  const validation = (field.validation as Record<string, unknown>) ?? {};
  const FieldControl = FIELD_COMPONENTS[field.type];

  return (
    <div className="w-full space-y-8 text-left">
      {/* Question header */}
      <div className="flex items-start gap-3">
        <span
          className="text-sm font-bold font-mono opacity-50 mt-1 shrink-0"
          style={{ color: styles.textColor }}
        >
          {questionNumber} →
        </span>
        <div className="space-y-1 flex-1">
          <h2
            className="text-xl sm:text-2xl font-bold leading-snug"
            style={{ color: styles.textColor }}
          >
            {field.label}
            {field.required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </h2>
          {typeof validation.description === "string" && validation.description && (
            <p className="text-sm opacity-70" style={{ color: styles.textColor }}>
              {validation.description}
            </p>
          )}
        </div>
      </div>

      {/* Field control */}
      <div className="pl-7 w-full max-w-lg">
        {FieldControl ? (
          <FieldControl
            field={field}
            value={value}
            styles={styles}
            onChange={onChange}
          />
        ) : (
          <p className="text-xs opacity-40 italic">Unsupported field type: {field.type}</p>
        )}
      </div>

      {/* Validation error */}
      {error && (
        <div className="pl-7 flex items-center gap-1.5 text-xs text-red-500 font-medium">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* OK / Submit button */}
      <div className="pl-7 flex items-center gap-3">
        <button
          onClick={onNext}
          disabled={isSubmitting}
          className="py-3 px-6 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-opacity hover:opacity-90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: styles.buttonBgColor,
            color: styles.buttonTextColor,
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Submitting…
            </>
          ) : isLastQuestion ? (
            <>
              Submit <Check className="h-4 w-4" />
            </>
          ) : (
            <>
              OK <Check className="h-4 w-4" />
            </>
          )}
        </button>

        <span className="text-[10px] opacity-35 font-semibold hidden md:flex items-center gap-1">
          press
          <kbd className="border px-1.5 py-0.5 rounded text-[9px] font-mono" style={{ borderColor: styles.inputBorderColor }}>
            Enter ↵
          </kbd>
        </span>
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getChoices(field: FormField): string[] {
  const v = field.validation as Record<string, unknown> | null | undefined;
  if (!v) return [];
  return Array.isArray(v.choices) ? (v.choices as string[]) : [];
}
