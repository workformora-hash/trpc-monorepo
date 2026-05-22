"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ThemeStyles } from "./types";
import { THEME_FONTS } from "./theme-config";

interface FormSuccessScreenProps {
  formTitle: string;
  responseId?: string;
  themeId: string;
  styles: ThemeStyles;
}

export function FormSuccessScreen({
  formTitle,
  responseId,
  themeId,
  styles,
}: FormSuccessScreenProps) {
  const router = useRouter();

  // Stable receipt label — generated once on mount (not on every render).
  const receiptLabel =
    responseId ??
    `receipt_${Math.random().toString(36).substring(2, 10)}`;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6"
      style={{
        backgroundColor: styles.backgroundColor,
        fontFamily: styles.fontFamily,
        color: styles.textColor,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: THEME_FONTS[themeId] ?? "",
        }}
      />

      <div
        className="w-full max-w-md border p-10 rounded-2xl shadow-xl text-center space-y-6"
        style={{
          backgroundColor: styles.cardBgColor,
          borderColor: styles.inputBorderColor,
        }}
      >
        {/* Animated checkmark */}
        <div className="p-3 bg-emerald-500/15 rounded-full w-fit mx-auto text-emerald-500">
          <Check className="h-10 w-10 stroke-[3]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Response Submitted
          </h1>
          <p className="text-xs opacity-70 max-w-sm mx-auto leading-relaxed">
            Thank you for completing{" "}
            <span className="font-semibold">"{formTitle}"</span>. Your answers
            have been recorded.
          </p>
        </div>

        {/* Receipt ID */}
        <div
          className="pt-4 border-t space-y-1"
          style={{ borderColor: styles.inputBorderColor }}
        >
          <span className="text-[10px] uppercase tracking-widest opacity-40 font-mono block">
            Submission ID
          </span>
          <span className="text-[11px] font-mono font-semibold opacity-75 break-all select-all block bg-neutral-100 dark:bg-neutral-800 py-1.5 px-3 rounded-lg">
            {receiptLabel}
          </span>
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full py-3 rounded-xl text-xs font-bold transition-colors"
          style={{
            backgroundColor: styles.buttonBgColor,
            color: styles.buttonTextColor,
          }}
        >
          Create your own form →
        </button>
      </div>
    </div>
  );
}
