'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCcw, Eye, Keyboard } from 'lucide-react';
import { getThemeStyles, getThemeFontImport } from '~/components/form-filler/theme-config';
import { FormWelcomeSlide } from '~/components/form-filler/FormWelcomeSlide';
import { QuestionSlide } from '~/components/form-filler/QuestionSlide';
import { FormSuccessScreen } from '~/components/form-filler/FormSuccessScreen';
import { getBgImageStyles } from '~/utils/image-styles';
import type { FormField } from '~/components/form-filler/types';

interface FormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    theme: string;
    isPublished: boolean;
    visibility: "public" | "unlisted";
  };
  fields: FormField[];
  onSaveDesign: (themeConfig: string) => Promise<void> | void;
  isSaving: boolean;
}

export function FormPreviewModal({ isOpen, onClose, form, fields }: FormPreviewModalProps) {
  const activeStyles = useMemo(() => getThemeStyles(form.theme), [form.theme]);

  const questions = useMemo(() => fields.filter((f) => f.type !== 'welcome' && f.type !== 'thank_you'), [fields]);
  const welcomeField = useMemo(() => fields.find((f) => f.type === 'welcome') || null, [fields]);
  const thankYouField = useMemo(() => fields.find((f) => f.type === 'thank_you') || null, [fields]);

  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = welcome
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [slideDir, setSlideDir] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);
  const [showKeyHint, setShowKeyHint] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(-1);
      setAnswers({});
      setSubmitted(false);
      setSlideDir('forward');
      const t = setTimeout(() => setShowKeyHint(false), 3500);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const activeField = questions[currentIndex];
  const currentValue = activeField ? answers[activeField.id] : undefined;

  const activeValidation = useMemo(() => {
    if (submitted) return thankYouField?.validation || {};
    if (currentIndex === -1) return welcomeField?.validation || {};
    return activeField?.validation || {};
  }, [submitted, currentIndex, welcomeField, thankYouField, activeField]);

  const bgImageUrl = activeValidation.bgImageUrl as string | undefined;

  const transition = useCallback((fn: () => void) => {
    if (animating) return;
    setAnimating(true);
    fn();
    setTimeout(() => setAnimating(false), 380);
  }, [animating]);

  const handleNext = useCallback(() => {
    transition(() => {
      setSlideDir('forward');
      if (currentIndex === -1) {
        questions.length === 0 ? setSubmitted(true) : setCurrentIndex(0);
      } else if (currentIndex >= questions.length - 1) {
        setSubmitted(true);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    });
  }, [currentIndex, questions.length, transition]);

  const handlePrev = useCallback(() => {
    if (submitted) {
      transition(() => {
        setSlideDir('back');
        setSubmitted(false);
        setCurrentIndex(questions.length - 1);
      });
    } else if (currentIndex > -1) {
      transition(() => {
        setSlideDir('back');
        setCurrentIndex((i) => i - 1);
      });
    }
  }, [currentIndex, questions.length, submitted, transition]);

  const handleReset = () => {
    setCurrentIndex(-1);
    setAnswers({});
    setSubmitted(false);
    setSlideDir('forward');
    setAnimating(false);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen) return null;

  const totalSlides = questions.length + 2; // welcome + questions + thank you
  const currentSlideNum = submitted ? totalSlides : currentIndex === -1 ? 1 : currentIndex + 2;
  const progress = (currentSlideNum / totalSlides) * 100;

  const slideKey = submitted ? 'success' : currentIndex === -1 ? 'welcome' : activeField?.id || 'q';

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col theme-${form.theme}`}
      style={{ 
        backgroundColor: bgImageUrl ? 'transparent' : activeStyles.backgroundColor, 
        backgroundImage: bgImageUrl ? undefined : activeStyles.backgroundImage,
        fontFamily: activeStyles.fontFamily,
        color: activeStyles.textColor
      }}
    >
      {/* Google Fonts */}
      <style dangerouslySetInnerHTML={{ __html: getThemeFontImport(form.theme) }} />

      {/* Enhanced Japanese Theme Visual Elements - Now managed globally by FormHeader background */}
      {form.theme === 'japanese' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* We keep only subtle local hints if needed, but let global elements take the lead */}
        </div>
      )}

      {/* Full-bleed background image */}
      {bgImageUrl && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={bgImageUrl}
            alt=""
            style={{ ...getBgImageStyles(activeValidation), width: '100%', height: '100%' }}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 z-50">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundColor: activeStyles.primaryColor }}
        />
      </div>

      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 pt-5 pb-3">
        {/* Preview badge */}
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
          <Eye className="h-3 w-3 text-white/70" />
          <span className="text-[11px] font-semibold text-white/70 tracking-wider">PREVIEW</span>
          <span className="mx-1 text-white/20">·</span>
          <span className="text-[11px] font-semibold text-white/50 truncate max-w-[140px]">{form.title}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            title="Restart preview"
            className="h-8 w-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-black/35 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            title="Close preview (Esc)"
            className="h-8 w-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-black/35 transition-all"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Main content — fully centered */}
      <main className="flex-1 flex items-center justify-center z-10 relative px-6 py-20">
        <div
          key={slideKey}
          className="w-full max-w-2xl"
          style={{
            animation: animating
              ? `${slideDir === 'forward' ? 'slideInForward' : 'slideInBack'} 0.35s cubic-bezier(0.16,1,0.3,1) both`
              : undefined,
          }}
        >
          {submitted ? (
            <FormSuccessScreen
              formTitle={form.title}
              themeId={form.theme}
              styles={activeStyles}
              thankYouField={thankYouField}
            />
          ) : currentIndex === -1 ? (
            <FormWelcomeSlide
              form={{ ...form, theme: form.theme }}
              styles={activeStyles}
              onStart={handleNext}
              welcomeField={welcomeField}
            />
          ) : activeField ? (
            <QuestionSlide
              key={activeField.id}
              field={activeField}
              questionNumber={currentIndex + 1}
              value={currentValue}
              error={null}
              isSubmitting={false}
              isLastQuestion={currentIndex === questions.length - 1}
              styles={activeStyles}
              onChange={(val) => setAnswers((prev) => ({ ...prev, [activeField.id]: val }))}
              onNext={handleNext}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-sm opacity-40 italic">No content to preview yet.</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom navigation bar */}
      <footer className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 pb-5 pt-3">
        {/* Slide counter */}
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
          <div className="flex gap-1">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === currentSlideNum - 1 ? '16px' : '5px',
                  height: '5px',
                  backgroundColor: i === currentSlideNum - 1 ? activeStyles.primaryColor : `${activeStyles.textColor}30`,
                }}
              />
            ))}
          </div>
          <span className="text-[10px] text-white/50 ml-1 font-mono">
            {currentSlideNum}/{totalSlides}
          </span>
        </div>

        {/* Keyboard hint */}
        <div
          className="flex items-center gap-1.5 transition-opacity duration-500"
          style={{ opacity: showKeyHint ? 0.6 : 0 }}
        >
          <Keyboard className="h-3 w-3 text-white/50" />
          <span className="text-[10px] text-white/50">Arrow keys to navigate</span>
        </div>

        {/* Prev / Next */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === -1 && !submitted}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-black/35 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={submitted}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-black/35 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </footer>

      {/* Slide transition keyframes */}
      <style>{`
        @keyframes slideInForward {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInBack {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

