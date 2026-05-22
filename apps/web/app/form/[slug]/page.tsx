"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { trpc } from "~/trpc/client";

import { getNextIndex, getPrevIndex, validateField } from "~/components/form-filler/form-logic";
import { getThemeStyles, THEME_FONTS } from "~/components/form-filler/theme-config";
import { useKeyboardNav, useRatingKeys } from "~/components/form-filler/use-keyboard";

import { FormLoading } from "~/components/form-filler/FormLoading";
import { FormError } from "~/components/form-filler/FormError";
import { FormPasswordGate } from "~/components/form-filler/FormPasswordGate";
import { FormSuccessScreen } from "~/components/form-filler/FormSuccessScreen";
import { FormHeader } from "~/components/form-filler/FormHeader";
import { FormWelcomeSlide } from "~/components/form-filler/FormWelcomeSlide";
import { QuestionSlide } from "~/components/form-filler/QuestionSlide";
import { FormFooter } from "~/components/form-filler/FormFooter";

import type { AnswersMap, FormData, FormField, LogicTreeItem } from "~/components/form-filler/types";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Sentinel value: -1 = Welcome slide, 0+ = question index. */
const WELCOME_INDEX = -1;

// ─── Page Component ───────────────────────────────────────────────────────────

export default function PublicFormPage() {
  const params = useParams();
  const slug = params?.slug as string;

  // ── State ──────────────────────────────────────────────────────────────────

  /** Populated after a successful password verification (fields were withheld initially). */
  const [unlockedPayload, setUnlockedPayload] = useState<{
    form: FormData;
    fields: FormField[];
  } | null>(null);

  const [currentIndex, setCurrentIndex] = useState(WELCOME_INDEX);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [responseId, setResponseId] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  // ── tRPC queries ───────────────────────────────────────────────────────────

  const {
    data: publicPayload,
    isLoading,
    error: fetchError,
  } = trpc.form.getFormBySlugPublic.useQuery({ slug }, { enabled: !!slug });

  const { data: logicData } = trpc.form.getFormLogicTree.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // ── tRPC mutations ─────────────────────────────────────────────────────────

  const verifyPassword = trpc.form.verifyFormPassword.useMutation({
    onSuccess(data) {
      if (data.success) {
        setUnlockedPayload({
          form: data.form as unknown as FormData,
          fields: data.fields as unknown as FormField[],
        });
        setCurrentIndex(WELCOME_INDEX);
        toast.success("Form unlocked!");
      } else {
        toast.error("Incorrect password.");
      }
    },
    onError(err) {
      toast.error(err.message || "Failed to verify password.");
    },
  });

  const submitResponse = trpc.form.submitResponse.useMutation({
    onSuccess(data) {
      setResponseId(data.responseId ?? undefined);
      setSubmitted(true);
    },
    onError(err) {
      toast.error(err.message || "Submission failed. Please try again.");
    },
  });

  // ── Derived data ───────────────────────────────────────────────────────────

  const effectivePayload = unlockedPayload ?? publicPayload;
  const form = effectivePayload?.form as FormData | undefined;
  const fields = (effectivePayload?.fields ?? []) as FormField[];
  const isPasswordProtected =
    publicPayload?.isPasswordProtected === true && !unlockedPayload;

  const logicTree = (logicData?.logicTree ?? []) as LogicTreeItem[];
  const themeId = form?.theme ?? "default";
  const styles = useMemo(() => getThemeStyles(themeId), [themeId]);

  const currentField: FormField | undefined = fields[currentIndex];
  const currentValue = currentField ? answers[currentField.id] : undefined;

  const fieldError = useMemo(
    () => (currentField ? validateField(currentField, currentValue) : null),
    [currentField, currentValue]
  );

  const nextIndex = currentField
    ? getNextIndex(currentIndex, fields, logicTree, answers)
    : fields.length;

  const isLastQuestion = nextIndex >= fields.length && currentIndex >= 0;

  const progressPercent =
    fields.length > 0
      ? Math.round(((currentIndex + 1) / fields.length) * 100)
      : 0;

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleNext() {
    if (fieldError) {
      toast.error(fieldError);
      return;
    }

    if (currentIndex === WELCOME_INDEX) {
      const first = getNextIndex(WELCOME_INDEX, fields, logicTree, answers);
      if (first >= fields.length) {
        toast.error("This form has no accessible questions.");
        return;
      }
      setCurrentIndex(first);
      return;
    }

    const next = getNextIndex(currentIndex, fields, logicTree, answers);
    if (next >= fields.length) {
      handleSubmit();
    } else {
      setCurrentIndex(next);
    }
  }

  function handlePrev() {
    if (currentIndex <= WELCOME_INDEX) return;
    const prev = getPrevIndex(currentIndex, fields, logicTree, answers);
    setCurrentIndex(prev);
  }

  function handleAnswerChange(value: unknown) {
    if (!currentField) return;
    setAnswers((prev) => ({ ...prev, [currentField.id]: value }));
  }

  function handleSubmit() {
    if (!form) return;

    const emailField = fields.find((f) => f.type === "email");
    const respondentEmail =
      emailField && typeof answers[emailField.id] === "string"
        ? (answers[emailField.id] as string)
        : undefined;

    submitResponse.mutate({
      formId: form.id,
      respondentEmail,
      answers: Object.entries(answers).map(([fieldId, value]) => ({
        fieldId,
        value,
      })),
    });
  }

  // ── Keyboard hooks ─────────────────────────────────────────────────────────

  const isTextarea = currentField?.type === "long_text";

  useKeyboardNav({
    onNext: handleNext,
    onPrev: handlePrev,
    suppressEnter: isTextarea,
  });

  useRatingKeys({
    enabled: currentField?.type === "rating",
    onRate: handleAnswerChange,
  });

  // ── Render gates ───────────────────────────────────────────────────────────

  if (isLoading) return <FormLoading />;

  if (fetchError || !effectivePayload || !form) {
    return <FormError message={fetchError?.message} />;
  }

  if (isPasswordProtected) {
    return (
      <FormPasswordGate
        formTitle={form.title}
        isPending={verifyPassword.isPending}
        onSubmit={(password) => verifyPassword.mutate({ slug, password })}
      />
    );
  }

  if (submitted) {
    return (
      <FormSuccessScreen
        formTitle={form.title}
        responseId={responseId}
        themeId={themeId}
        styles={styles}
      />
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen w-full flex flex-col transition-colors duration-300"
      style={{
        backgroundColor: styles.backgroundColor,
        fontFamily: styles.fontFamily,
        color: styles.textColor,
      }}
    >
      {/* Inject theme font */}
      <style dangerouslySetInnerHTML={{ __html: THEME_FONTS[themeId] ?? "" }} />

      <FormHeader
        form={form}
        currentIndex={currentIndex}
        totalFields={fields.length}
        styles={styles}
      />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {currentIndex === WELCOME_INDEX ? (
            <FormWelcomeSlide form={form} styles={styles} onStart={handleNext} />
          ) : currentField ? (
            <QuestionSlide
              key={currentField.id}
              field={currentField}
              questionNumber={currentIndex + 1}
              value={currentValue}
              error={fieldError}
              isSubmitting={submitResponse.isPending}
              isLastQuestion={isLastQuestion}
              styles={styles}
              onChange={handleAnswerChange}
              onNext={handleNext}
            />
          ) : null}
        </div>
      </main>

      <FormFooter
        progressPercent={Math.max(0, Math.min(100, progressPercent))}
        canGoPrev={currentIndex > WELCOME_INDEX}
        canGoNext={fieldError === null}
        styles={styles}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
