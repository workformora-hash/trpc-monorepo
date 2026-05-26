"use client";

import { Check, Star, AlertCircle, Loader2, Globe } from "lucide-react";
import type { FormField, ThemeStyles } from "./types";
import React from "react";

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
      style={{ 
        borderBottomColor: styles.inputBorderColor, 
        color: styles.textColor,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight as any,
      }}
    />
  );
}

// ─── Text Area Input ───
function LongTextInput({ field, value, styles, onChange }: FieldInputProps) {
  return (
    <textarea
      autoFocus
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer…"
      rows={4}
      className="w-full bg-transparent border-b text-sm py-2 focus:outline-none transition-colors placeholder:opacity-30 resize-none"
      style={{ 
        borderBottomColor: styles.inputBorderColor, 
        color: styles.textColor,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight as any,
      }}
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
      style={{ 
        borderBottomColor: styles.inputBorderColor, 
        color: styles.textColor,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight as any,
      }}
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
      style={{ 
        borderBottomColor: styles.inputBorderColor, 
        color: styles.textColor,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight as any,
      }}
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
              <span style={{ 
                fontFamily: styles.fontFamily,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight,
              }}>{choice}</span>
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
              <span style={{ 
                fontFamily: styles.fontFamily,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight as any,
              }}>{choice}</span>
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
      <span style={{
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight as any,
      }}>I confirm this.</span>
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
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight as any,
      }}
    />
  );
}

function ContactInfoInput({ field, value, styles, onChange }: FieldInputProps) {
  const data = (value as Record<string, string>) || {};
  const handleChange = (key: string, val: string) => {
    onChange({ ...data, [key]: val });
  };

  return (
    <div className="grid gap-3 max-w-sm">
      <input
        type="text"
        placeholder="First name"
        value={data.firstName || ""}
        onChange={(e) => handleChange("firstName", e.target.value)}
        className="bg-transparent border-b text-sm py-2 focus:outline-none placeholder:opacity-30"
        style={{ 
          borderBottomColor: styles.inputBorderColor, 
          color: styles.textColor,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight as any,
        }}
      />
      <input
        type="text"
        placeholder="Last name"
        value={data.lastName || ""}
        onChange={(e) => handleChange("lastName", e.target.value)}
        className="bg-transparent border-b text-sm py-2 focus:outline-none placeholder:opacity-30"
        style={{ 
          borderBottomColor: styles.inputBorderColor, 
          color: styles.textColor,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight as any,
        }}
      />
      <input
        type="tel"
        placeholder="Phone number"
        value={data.phone || ""}
        onChange={(e) => handleChange("phone", e.target.value)}
        className="bg-transparent border-b text-sm py-2 focus:outline-none placeholder:opacity-30"
        style={{ 
          borderBottomColor: styles.inputBorderColor, 
          color: styles.textColor,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight as any,
        }}
      />
    </div>
  );
}

function AddressInput({ field, value, styles, onChange }: FieldInputProps) {
  const data = (value as Record<string, string>) || {};
  const handleChange = (key: string, val: string) => {
    onChange({ ...data, [key]: val });
  };

  return (
    <div className="grid gap-3 max-w-sm">
      <input
        type="text"
        placeholder="Street address"
        value={data.street || ""}
        onChange={(e) => handleChange("street", e.target.value)}
        className="bg-transparent border-b text-sm py-2 focus:outline-none placeholder:opacity-30"
        style={{ 
          borderBottomColor: styles.inputBorderColor, 
          color: styles.textColor,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight as any,
        }}
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="City"
          value={data.city || ""}
          onChange={(e) => handleChange("city", e.target.value)}
          className="bg-transparent border-b text-sm py-2 focus:outline-none placeholder:opacity-30"
          style={{ 
            borderBottomColor: styles.inputBorderColor, 
            color: styles.textColor,
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight as any,
          }}
        />
        <input
          type="text"
          placeholder="State"
          value={data.state || ""}
          onChange={(e) => handleChange("state", e.target.value)}
          className="bg-transparent border-b text-sm py-2 focus:outline-none placeholder:opacity-30"
          style={{ 
            borderBottomColor: styles.inputBorderColor, 
            color: styles.textColor,
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight as any,
          }}
        />
      </div>
    </div>
  );
}

function WebsiteInput({ field, value, styles, onChange }: FieldInputProps) {
  return (
    <div className="flex items-center gap-2.5 max-w-sm border-b" style={{ borderBottomColor: styles.inputBorderColor }}>
      <Globe className="h-4 w-4 opacity-40" style={{ color: styles.textColor }} />
      <input
        type="url"
        autoFocus
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com"
        className="w-full bg-transparent text-lg py-2 focus:outline-none transition-colors placeholder:opacity-30"
        style={{ 
          color: styles.textColor,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight as any,
        }}
      />
    </div>
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
  contact_info: ContactInfoInput,
  address: AddressInput,
  website: WebsiteInput,
};

// ─── Style helper ─────────────────────────────────────────────────────────────

export const getImageStyles = (validation: any) => {
  if (!validation) return {};
  const styles: React.CSSProperties = {
    objectFit: 'cover',
  };
  
  if (validation.imageFocalPoint) {
    styles.objectPosition = validation.imageFocalPoint;
  }
  
  if (validation.imageAspectRatio && validation.imageAspectRatio !== 'auto') {
    styles.aspectRatio = validation.imageAspectRatio;
  }
  
  styles.width = validation.imageWidth || '100%';
  styles.height = validation.imageHeight || 'auto';
  
  const filters: string[] = [];
  const brightness = validation.imageBrightness !== undefined ? validation.imageBrightness : 100;
  filters.push(`brightness(${brightness}%)`);
  
  const filterType = validation.imageFilter || 'none';
  if (filterType === 'grayscale') filters.push('grayscale(100%)');
  else if (filterType === 'sepia') filters.push('sepia(100%)');
  else if (filterType === 'vintage') filters.push('sepia(40%) brightness(85%) contrast(115%)');
  else if (filterType === 'blur') filters.push('blur(4px)');
  else if (filterType === 'invert') filters.push('invert(100%)');
  else if (filterType === 'contrast') filters.push('contrast(150%)');
  else if (filterType === 'warm') filters.push('hue-rotate(20deg) saturate(120%)');
  else if (filterType === 'cool') filters.push('hue-rotate(-20deg) saturate(120%)');
  
  styles.filter = filters.join(' ');
  return styles;
};

export const getBgImageStyles = (validation: any) => {
  if (!validation) return {};
  const styles: React.CSSProperties = {
    objectFit: 'cover',
  };
  
  if (validation.bgImageFocalPoint) {
    styles.objectPosition = validation.bgImageFocalPoint;
  }
  
  const filters: string[] = [];
  const brightness = validation.bgImageBrightness !== undefined ? validation.bgImageBrightness : 100;
  filters.push(`brightness(${brightness}%)`);
  
  const filterType = validation.bgImageFilter || 'none';
  if (filterType === 'grayscale') filters.push('grayscale(100%)');
  else if (filterType === 'sepia') filters.push('sepia(100%)');
  else if (filterType === 'vintage') filters.push('sepia(40%) brightness(85%) contrast(115%)');
  else if (filterType === 'blur') filters.push('blur(4px)');
  else if (filterType === 'invert') filters.push('invert(100%)');
  else if (filterType === 'contrast') filters.push('contrast(150%)');
  else if (filterType === 'warm') filters.push('hue-rotate(20deg) saturate(120%)');
  else if (filterType === 'cool') filters.push('hue-rotate(-20deg) saturate(120%)');
  
  styles.filter = filters.join(' ');
  return styles;
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

  // Dynamic atomic text style overrides (field-level custom styles)
  const customLabelStyles: React.CSSProperties = {
    color: (validation.labelColor as string) || styles.textColor,
    fontFamily: (validation.labelFontFamily as string) || styles.fontFamily,
  };
  if (validation.labelFontSize) {
    customLabelStyles.fontSize = validation.labelFontSize as string;
  } else if (styles.fontSize) {
    customLabelStyles.fontSize = `calc(${styles.fontSize} * 1.5)`;
  }

  const customDescStyles: React.CSSProperties = {
    color: (validation.descriptionColor as string) || `${styles.textColor}aa`,
    fontFamily: (validation.descriptionFontFamily as string) || styles.fontFamily,
  };
  if (validation.descriptionFontSize) {
    customDescStyles.fontSize = validation.descriptionFontSize as string;
  } else if (styles.fontSize) {
    customDescStyles.fontSize = `calc(${styles.fontSize} * 0.9)`;
  }

  // Dynamic resolved colors and control styles
  const resolvedControlStyles = {
    ...styles,
    primaryColor: (validation.activeColor as string) || styles.primaryColor,
    glow: (validation.activeColor as string) ? `${validation.activeColor}15` : styles.glow,
    fontFamily: (validation.descriptionFontFamily as string) || styles.fontFamily,
    fontSize: (validation.descriptionFontSize as string) || styles.fontSize,
    fontWeight: (validation.descriptionFontWeight as string) || '400',
  };

  const resolvedButtonStyles: React.CSSProperties = {
    backgroundColor: (validation.buttonBgColor as string) || styles.buttonBgColor,
    color: (validation.buttonTextColor as string) || styles.buttonTextColor,
  };

  const imageLayout = validation.imageLayout || 'top';
  const hasImage = !!validation.imageUrl;
  const hasBgImage = !!validation.bgImageUrl;

  const themeId = (styles as any).themeId || "default"; // Extract themeId if passed, though styles don't strictly have it, we can infer dark mode loosely
  const isDarkTheme = styles.backgroundColor?.toLowerCase() === '#0f172a' || styles.backgroundColor?.toLowerCase() === '#050505' || styles.backgroundColor?.toLowerCase() === '#0a0f0d';
  // Check if we are likely in Japanese theme by looking at font or background color
  const isJapaneseTheme = styles.backgroundColor === '#F9F4F0' || styles.fontFamily?.includes('Zen Old Mincho') || styles.fontFamily?.includes('Noto Sans JP');

  const cardBgColor = validation.cardBgColor as string | undefined;
  const bgGradient = validation.bgGradient as string | undefined;
  const activeColor = validation.activeColor as string | undefined;

  const resolvedCardStyle: React.CSSProperties = {
    backgroundColor: cardBgColor || (isJapaneseTheme ? 'rgba(255, 255, 255, 0.03)' : (hasBgImage ? (isDarkTheme ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.45)') : undefined)),
    backgroundImage: cardBgColor ? undefined : (isJapaneseTheme ? 'linear-gradient(135deg, rgba(188, 36, 60, 0.05) 0%, transparent 100%)' : (bgGradient || undefined)),
    backdropFilter: cardBgColor ? (cardBgColor.includes('rgba') ? 'blur(16px)' : undefined) : (isJapaneseTheme ? 'blur(12px) saturate(120%)' : (hasBgImage ? 'blur(24px) saturate(180%)' : undefined)),
    WebkitBackdropFilter: cardBgColor ? (cardBgColor.includes('rgba') ? 'blur(16px)' : undefined) : (isJapaneseTheme ? 'blur(12px) saturate(120%)' : (hasBgImage ? 'blur(24px) saturate(180%)' : undefined)),
    borderColor: activeColor ? `${activeColor}40` : (isJapaneseTheme ? 'rgba(188, 36, 60, 0.15)' : (hasBgImage ? (isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.25)') : undefined)),
    boxShadow: isJapaneseTheme ? '12px 12px 0px rgba(188, 36, 60, 0.05)' : (hasBgImage ? '0 8px 32px 0 rgba(0, 0, 0, 0.12)' : undefined),
    borderWidth: (cardBgColor || bgGradient || hasBgImage || isJapaneseTheme) ? '1px' : undefined,
    padding: (cardBgColor || bgGradient || hasBgImage || isJapaneseTheme) ? '3rem 3.5rem' : undefined,
    borderRadius: isJapaneseTheme ? '4px' : ((cardBgColor || bgGradient || hasBgImage) ? '1.5rem' : undefined),
  };

  return (
    <div className="w-full relative flex items-center justify-center min-h-[70vh]">
      {/* Decorative Enso Circle for Japanese Theme */}
      {isJapaneseTheme && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <svg viewBox="0 0 100 100" className="w-[500px] h-[500px] text-[#BC243C]">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray="200 60" transform="rotate(-90 50 50)" />
          </svg>
        </div>
      )}

      {/* Main card wrapper, transparent when there's a background image to let the page-level fullscreen background shine through */}
      <div className="w-full z-10 transition-all duration-300 relative" style={resolvedCardStyle}>
        
        {/* Japanese Theme Corner Accent */}
        {isJapaneseTheme && (
          <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[#BC243C] opacity-20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          </div>
        )}
        
        {/* Render Side Split Layouts (Left & Right) */}
        {hasImage && (imageLayout === 'split-left' || imageLayout === 'split-right') ? (
          <div className={`w-full flex flex-col md:flex-row items-center gap-8 md:gap-12 text-left ${
            imageLayout === 'split-right' ? 'md:flex-row-reverse' : ''
          }`}>
            <div className="w-full md:w-1/2 flex justify-center animate-fadeIn">
              <div className="w-full max-w-[200px] max-h-[200px] aspect-square overflow-hidden rounded-xl border border-neutral-250/50 dark:border-neutral-800 shadow-sm">
                <img 
                  src={validation.imageUrl as string} 
                  alt={validation.imageAlt as string || "Question Media"} 
                  style={getImageStyles(validation)}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-6">
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
                    className="font-bold leading-snug"
                    style={customLabelStyles}
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1" aria-label="required">
                        *
                      </span>
                    )}
                  </h2>
                  {typeof validation.description === "string" && validation.description && (
                    <p className="opacity-70" style={customDescStyles}>
                      {validation.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Field control */}
              <div className="pl-7 w-full">
                {FieldControl ? (
                  <FieldControl
                    field={field}
                    value={value}
                    styles={resolvedControlStyles}
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
                  style={resolvedButtonStyles}
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
          </div>
        ) : (
          /* Render Standard / Top Header Layout */
          <div className="w-full space-y-8 text-left animate-fadeIn">
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
                  className="font-bold leading-snug"
                  style={customLabelStyles}
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1" aria-label="required">
                      *
                    </span>
                  )}
                </h2>
                {typeof validation.description === "string" && validation.description && (
                  <p className="opacity-70" style={{
                    ...customDescStyles,
                    fontSize: validation.descriptionFontSize ? (validation.descriptionFontSize as string) : (styles.fontSize ? `calc(${styles.fontSize} * 0.95)` : '0.875rem')
                  }}>
                    {validation.description}
                  </p>
                )}
              </div>
            </div>

            {/* Field control */}
            <div className="pl-7 w-full max-w-lg space-y-5">
              {hasImage && imageLayout === 'top' && (
                <div className="w-full max-w-[240px] max-h-[160px] overflow-hidden rounded-xl border border-neutral-250/50 dark:border-neutral-800 shadow-xs animate-scaleIn">
                  <img 
                    src={validation.imageUrl as string} 
                    alt={validation.imageAlt as string || "Question Media"} 
                    style={getImageStyles(validation)}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                </div>
              )}
              {FieldControl ? (
                <FieldControl
                  field={field}
                  value={value}
                  styles={resolvedControlStyles}
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
                style={resolvedButtonStyles}
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
        )}

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
