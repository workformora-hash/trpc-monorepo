'use client';

import React from "react";
import { 
  Star, 
  Hash, 
  Calendar, 
  Play, 
  Mail, 
  CheckCircle2, 
  ChevronDown
} from "lucide-react";
import { useFormBuilderContext } from "../FormBuilderContext";
import { type ActiveValidationType } from "../QuestionEditor";

const i18n = {
  en: {
    yes: "YES",
    no: "NO",
    start: "Start",
    done: "Done",
    typeAnswer: "Type your answer here…",
    typeLongAnswer: "Type your long answer here…",
    emailPlaceholder: "name@example.com",
    agreeTerms: "I agree to the terms",
    selectOption: "Select an option…",
    firstName: "First Name",
    lastName: "Last Name",
    emailAddress: "Email Address",
    datePlaceholder: "MM / DD / YYYY",
    previewNotAvailable: "Preview not available for this question type.",
  }
};

const t = (key: keyof typeof i18n.en) => {
  return i18n.en[key];
};

export const QuestionInputRenderer = React.memo(() => {
  const { activeField, activeValidation: rawActiveValidation } = useFormBuilderContext();
  const activeValidation = rawActiveValidation as ActiveValidationType;

  if (!activeField) return null;

  const inputStyle = {
    color: (activeValidation.answerColor as string) || undefined,
    fontFamily: (activeValidation.answerFontFamily as string) || undefined,
    fontSize: (activeValidation.answerFontSize as string) || undefined,
    fontWeight: (activeValidation.answerFontWeight as string) || undefined,
  };

  switch (activeField.type) {
    case 'rating':
      return (
        <div className="flex items-center gap-2 py-4">
          {Array.from({ length: Number(activeValidation.maxStars || activeValidation.max || 5) }).map((_, star) => (
            <Star 
              key={star} 
              className="size-8 text-neutral-200 dark:text-neutral-800" 
              style={{ color: (activeValidation.activeColor as string) || '#fbbf24' }} 
            />
          ))}
        </div>
      );

    case 'yes_no':
      return (
        <div className="flex gap-4 py-4">
          <div className="flex-1 h-24 rounded-2xl border-2 border-neutral-150 dark:border-neutral-800 flex items-center justify-center text-sm font-bold opacity-50">{t('yes')}</div>
          <div className="flex-1 h-24 rounded-2xl border-2 border-neutral-150 dark:border-neutral-800 flex items-center justify-center text-sm font-bold opacity-50">{t('no')}</div>
        </div>
      );

    case 'welcome':
      return (
        <div className="py-6 flex flex-col items-center gap-6">
          <button 
            type="button"
            className="px-8 py-3 rounded-xl bg-primary text-white font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            style={{ 
              backgroundColor: (activeValidation.buttonBgColor as string) || (activeValidation.activeColor as string) || '#10b981',
              color: (activeValidation.buttonTextColor as string) || '#ffffff'
            }}
          >
            <Play className="size-4 fill-current" />
            <span>{String(activeValidation.buttonText || t('start'))}</span>
          </button>
        </div>
      );

    case 'thank_you':
      return (
        <div className="py-6 flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500 mb-2">
            <CheckCircle2 className="size-10" />
          </div>
          <button 
            type="button"
            className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            style={{ 
              backgroundColor: (activeValidation.buttonBgColor as string) || (activeValidation.activeColor as string) || '#6366f1',
              color: (activeValidation.buttonTextColor as string) || '#ffffff'
            }}
          >
            {String(activeValidation.buttonText || t('done'))}
          </button>
        </div>
      );

    case 'short_text':
      return (
        <div className="py-4 border-b-2 border-primary/30 max-w-md">
          <span className="text-xl opacity-40 font-medium" style={inputStyle}>{t('typeAnswer')}</span>
        </div>
      );

    case 'long_text':
      return (
        <div className="py-4 border-b-2 border-primary/30 max-w-xl">
          <span className="text-xl opacity-40 font-medium" style={inputStyle}>{t('typeLongAnswer')}</span>
        </div>
      );

    case 'email':
      return (
        <div className="py-4 border-b-2 border-primary/30 max-w-md flex items-center gap-3">
          <Mail className="size-5 opacity-30" />
          <span className="text-xl opacity-40 font-medium" style={inputStyle}>{t('emailPlaceholder')}</span>
        </div>
      );

    case 'number':
      return (
        <div className="py-4 border-b-2 border-primary/30 max-w-md flex items-center gap-3">
          <Hash className="size-5 opacity-30" />
          <span className="text-xl opacity-40 font-medium" style={inputStyle}>0</span>
        </div>
      );

    case 'contact_info':
      return (
        <div className="space-y-4 py-4 max-w-md">
          <div className="py-3 border-b border-neutral-200 dark:border-neutral-800 opacity-40 text-sm" style={inputStyle}>{t('firstName')}</div>
          <div className="py-3 border-b border-neutral-200 dark:border-neutral-800 opacity-40 text-sm" style={inputStyle}>{t('lastName')}</div>
          <div className="py-3 border-b border-neutral-200 dark:border-neutral-800 opacity-40 text-sm" style={inputStyle}>{t('emailAddress')}</div>
        </div>
      );

    case 'date':
      return (
        <div className="py-4 border-b-2 border-primary/30 max-w-md flex items-center gap-3">
          <Calendar className="size-5 opacity-30" />
          <span className="text-xl opacity-40 font-medium" style={inputStyle}>{t('datePlaceholder')}</span>
        </div>
      );

    case 'checkbox':
      return (
        <div className="py-4 flex items-center gap-3">
          <div className="size-6 rounded border-2 border-primary/30" />
          <span className="text-lg opacity-40 font-medium" style={inputStyle}>{t('agreeTerms')}</span>
        </div>
      );

    case 'dropdown':
      return (
        <div className="py-4 max-w-md">
          <div className="h-12 w-full rounded-xl border-2 border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 opacity-50">
            <span className="text-sm font-medium" style={inputStyle}>{t('selectOption')}</span>
            <ChevronDown className="size-4" />
          </div>
        </div>
      );

    case 'statement':
      return <div className="h-8" />; // Statements have no input

    default:
      return (
        <div className="py-8 text-center text-neutral-400 italic text-sm">
          {t('previewNotAvailable')}
        </div>
      );
  }
});

QuestionInputRenderer.displayName = 'QuestionInputRenderer';
