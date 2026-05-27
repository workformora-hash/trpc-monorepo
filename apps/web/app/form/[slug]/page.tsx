"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { FormLoading } from "~/components/form-filler/FormLoading";
import { FormError } from "~/components/form-filler/FormError";
import { FormPasswordGate } from "~/components/form-filler/FormPasswordGate";
import { FormWelcomeSlide } from "~/components/form-filler/FormWelcomeSlide";
import { QuestionSlide } from "~/components/form-filler/QuestionSlide";
import { FormSuccessScreen } from "~/components/form-filler/FormSuccessScreen";
import { FormHeader } from "~/components/form-filler/FormHeader";
import { FormFooter } from "~/components/form-filler/FormFooter";
import { getThemeStyles, getThemeFontImport } from "~/components/form-filler/theme-config";
import { getBgImageStyles } from "~/utils/image-styles";
import type { FormField } from "~/components/form-filler/types";

export default function PublicFormPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data, isLoading, error } = trpc.form.getFormBySlugPublic.useQuery({ slug }, {
    enabled: !!slug,
  });

  const verifyPasswordMutation = trpc.form.verifyFormPassword.useMutation();

  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = welcome
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [slideDir, setSlideDir] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);

  // Transitions
  const transition = useCallback((fn: () => void) => {
    if (animating) return;
    setAnimating(true);
    fn();
    setTimeout(() => setAnimating(false), 400);
  }, [animating]);

  const handlePasswordSubmit = async (password: string) => {
    try {
      await verifyPasswordMutation.mutateAsync({ slug, password });
      setPasswordVerified(true);
    } catch (err) {
      // Error handled by mutation
    }
  };

  if (isLoading) return <FormLoading />;
  if (error) return <FormError message={error.message} />;
  if (!data || !data.form) return <FormError message="Form not found" />;

  const { form, fields, isPasswordProtected: requiresPassword } = data;
  
  if (requiresPassword && !passwordVerified) {
    return (
      <FormPasswordGate 
        formTitle={form.title}
        isPending={verifyPasswordMutation.isPending}
        onSubmit={handlePasswordSubmit}
      />
    );
  }

  const activeStyles = getThemeStyles(form.theme);
  const questions = fields.filter((f) => f.type !== 'welcome' && f.type !== 'thank_you') as FormField[];
  const welcomeField = (fields.find((f) => f.type === 'welcome') || null) as FormField | null;
  const thankYouField = (fields.find((f) => f.type === 'thank_you') || null) as FormField | null;

  const handleNext = () => {
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
  };

  const handlePrev = () => {
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
  };

  const activeField = questions[currentIndex];
  const currentValue = activeField ? answers[activeField.id] : undefined;
  
  const activeValidation = (submitted ? thankYouField?.validation : (currentIndex === -1 ? welcomeField?.validation : activeField?.validation)) || {};
  const bgImageUrl = activeValidation.bgImageUrl as string | undefined;

  const totalSlides = questions.length + (welcomeField ? 1 : 0) + (thankYouField ? 1 : 0);
  const currentSlideNum = submitted ? totalSlides : (welcomeField ? currentIndex + 2 : currentIndex + 1);
  const progress = Math.round((currentSlideNum / totalSlides) * 100);

  return (
    <div 
      className={`fixed inset-0 flex flex-col overflow-hidden theme-${form.theme}`}
      style={{ 
        backgroundColor: bgImageUrl ? 'transparent' : activeStyles.backgroundColor, 
        backgroundImage: bgImageUrl ? undefined : activeStyles.backgroundImage,
        fontFamily: activeStyles.fontFamily,
        color: activeStyles.textColor 
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: getThemeFontImport(form.theme) }} />
      
      {bgImageUrl && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src={bgImageUrl} 
            alt="" 
            style={{ ...getBgImageStyles(activeValidation as any), width: '100%', height: '100%' }}
            className="w-full h-full object-cover" 
          />
        </div>
      )}

      {/* Enhanced Japanese Theme Visual Elements - Now managed globally by FormHeader background */}
      {form.theme === 'japanese' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Subtle local mountain silhouette hint */}
          <div className="absolute bottom-0 left-0 w-full h-[40%] opacity-[0.02] text-[#2C1810]">
             <svg viewBox="0 0 200 60" fill="currentColor" className="w-full h-full">
                <path d="M0,60 L40,20 L70,45 L110,10 L160,50 L200,30 L200,60 Z" />
             </svg>
          </div>
        </div>
      )}

      {/* Header with progress */}
      <FormHeader 
        form={{ ...form, theme: form.theme }} 
        currentIndex={currentIndex} 
        totalFields={questions.length} 
        styles={activeStyles} 
      />

      <main className="flex-1 flex items-center justify-center z-10 relative px-6 py-12">
        <div 
          className="w-full max-w-2xl"
          style={{
            animation: animating 
              ? `${slideDir === 'forward' ? 'slideInForward' : 'slideInBack'} 0.4s cubic-bezier(0.16, 1, 0.3, 1) both`
              : undefined
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
              onChange={(val) => setAnswers(prev => ({ ...prev, [activeField.id]: val }))}
              onNext={handleNext}
            />
          ) : (
            <div className="text-center opacity-50 italic">No questions found.</div>
          )}
        </div>
      </main>

      <FormFooter 
        progressPercent={progress}
        canGoPrev={currentIndex > -1 || submitted}
        canGoNext={!submitted && (currentIndex < questions.length - 1 || questions.length === 0)}
        styles={activeStyles}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <style>{`
        @keyframes slideInForward {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInBack {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sakuraFall3D {
          0% { transform: translateY(-30px) translateX(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(105vh) translateX(120px) rotateX(360deg) rotateY(720deg) rotateZ(180deg); opacity: 0; }
        }
        @keyframes moonPulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
