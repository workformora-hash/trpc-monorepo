"use client";

import React, { memo } from "react";
import { Check, Star, AlertCircle, Loader2, Globe } from "lucide-react";
import type { FormField, ThemeStyles } from "./types";

// Modular Input Components
import { TextInput, NumberInput } from "./inputs/TextInput";
import { SelectionInput } from "./inputs/SelectionInput";
import { RatingInput } from "./inputs/RatingInput";
import { BooleanInput } from "./inputs/BooleanInput";
import { UtilityInputs } from "./inputs/UtilityInputs";

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

export const QuestionSlide = memo(({
  field,
  questionNumber,
  value,
  error,
  isSubmitting,
  isLastQuestion,
  styles,
  onChange,
  onNext,
}: QuestionSlideProps) => {
  const validation = (field.validation as Record<string, unknown>) || {};
  const cardBgColor = validation.cardBgColor as string | undefined;
  const bgGradient = validation.bgGradient as string | undefined;
  const activeColor = validation.activeColor as string | undefined;
  const hasBgImage = !!validation.bgImageUrl;

  const isDarkTheme = styles.backgroundColor?.toLowerCase() === '#0f172a' || styles.backgroundColor?.toLowerCase() === '#050505' || styles.backgroundColor?.toLowerCase() === '#0a0f0d';
  const isJapaneseTheme = styles.backgroundColor === '#F9F4F0' || styles.fontFamily?.includes('Zen Old Mincho') || styles.fontFamily?.includes('Noto Sans JP');

  const resolvedCardStyle: React.CSSProperties = {
    backgroundColor: cardBgColor || (isJapaneseTheme ? (hasBgImage ? 'transparent' : 'rgba(255, 255, 255, 0.03)') : (hasBgImage ? (isDarkTheme ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.45)') : undefined)),
    backgroundImage: cardBgColor ? undefined : (isJapaneseTheme ? (hasBgImage ? 'none' : 'linear-gradient(135deg, rgba(188, 36, 60, 0.05) 0%, transparent 100%)') : (bgGradient || undefined)),
    backdropFilter: cardBgColor ? (cardBgColor.includes('rgba') ? 'blur(16px)' : undefined) : (isJapaneseTheme ? (hasBgImage ? 'none' : 'blur(12px) saturate(120%)') : (hasBgImage ? 'blur(24px) saturate(180%)' : undefined)),
    WebkitBackdropFilter: cardBgColor ? (cardBgColor.includes('rgba') ? 'blur(16px)' : undefined) : (isJapaneseTheme ? (hasBgImage ? 'none' : 'blur(12px) saturate(120%)') : (hasBgImage ? 'blur(24px) saturate(180%)' : undefined)),
    borderColor: activeColor ? `${activeColor}40` : (isJapaneseTheme ? (hasBgImage ? 'transparent' : 'rgba(188, 36, 60, 0.15)') : (hasBgImage ? (isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.25)') : undefined)),
    boxShadow: isJapaneseTheme ? (hasBgImage ? 'none' : '12px 12px 0px rgba(188, 36, 60, 0.05)') : (hasBgImage ? '0 8px 32px 0 rgba(0, 0, 0, 0.12)' : undefined),
    borderWidth: (cardBgColor || bgGradient || hasBgImage || isJapaneseTheme) ? (isJapaneseTheme && hasBgImage ? '0' : '1px') : undefined,
    padding: (cardBgColor || bgGradient || hasBgImage || isJapaneseTheme) ? '3rem 3.5rem' : undefined,
    borderRadius: isJapaneseTheme ? '4px' : ((cardBgColor || bgGradient || hasBgImage) ? '1.5rem' : undefined),
  };

  const renderInput = () => {
    const props = { field, value, styles, onChange };
    
    switch (field.type) {
      case "short_text":
      case "long_text":
      case "email":
        return <TextInput {...props} />;
      case "number":
        return <NumberInput {...props} />;
      case "single_select":
      case "multi_select":
      case "dropdown":
        return <SelectionInput {...props} />;
      case "rating":
        return <RatingInput {...props} />;
      case "yes_no":
        return <BooleanInput {...props} />;
      case "date":
      case "checkbox":
      case "contact_info":
      case "address":
      case "website":
        return <UtilityInputs {...props} />;
      default:
        return <div className="text-neutral-400 italic">Input type {field.type} coming soon...</div>;
    }
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

      {/* Main card wrapper */}
      <div className="w-full z-10 transition-all duration-300 relative" style={resolvedCardStyle}>
        
        {/* Japanese Theme Corner Accent */}
        {isJapaneseTheme && (
          <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[#BC243C] opacity-20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          </div>
        )}

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-sm font-bold opacity-30 mt-1.5 shrink-0" style={{ color: styles.textColor }}>
                {questionNumber}.
              </span>
              <div className="space-y-2 flex-1">
                <h2 className="text-2xl font-bold leading-tight" style={{ color: styles.textColor, fontFamily: styles.fontFamily }}>
                  {field.label}
                  {field.required && <span className="text-primary ml-1">*</span>}
                </h2>
                {!!validation.description && (
                  <p className="text-sm opacity-50 font-medium" style={{ color: styles.textColor }}>
                    {String(validation.description)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pl-8">
            {renderInput()}
            
            {error && (
              <div className="flex items-center gap-2 mt-4 text-red-500 animate-in shake duration-300">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs font-bold">{error}</span>
              </div>
            )}

            <div className="mt-10 flex items-center gap-4">
              <button
                onClick={onNext}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-primary text-white font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                style={{ backgroundColor: styles.buttonBgColor, color: styles.buttonTextColor }}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>{isLastQuestion ? "Submit" : "OK"}</span>
                )}
              </button>
              
              {!isLastQuestion && (
                <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest hidden sm:block">
                  Press Enter ↵
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

QuestionSlide.displayName = 'QuestionSlide';
