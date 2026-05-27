'use client';

import React, { memo } from "react";
import { Check } from "lucide-react";
import type { ThemeStyles } from "../types";

interface SuccessContentProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  customLabelStyles: React.CSSProperties;
  customDescStyles: React.CSSProperties;
  resolvedButtonStyles: React.CSSProperties;
  isJapaneseTheme: boolean;
}

export const SuccessContent = memo(({
  title,
  description,
  buttonText,
  onButtonClick,
  customLabelStyles,
  customDescStyles,
  resolvedButtonStyles,
  isJapaneseTheme,
}: SuccessContentProps) => {
  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center text-center space-y-8">
      <div className="flex flex-col items-center gap-6">
        <div className="p-2.5 bg-emerald-500/15 rounded-full text-emerald-500 w-fit shrink-0">
          <Check className="h-6 w-6 stroke-[3]" />
        </div>
        
        <div className="relative w-fit">
          <h1 className="font-extrabold tracking-tight leading-snug" style={customLabelStyles}>
            {title}
          </h1>
          {isJapaneseTheme && (
            <div className="absolute -top-4 -right-8 w-10 h-10 text-[#BC243C] opacity-80 mix-blend-multiply dark:mix-blend-screen rotate-[12deg] pointer-events-none">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                <rect x="10" y="10" width="80" height="80" rx="6" />
                <rect x="20" y="20" width="60" height="60" rx="3" strokeWidth="2" />
                <path d="M40 30 V70 M60 30 V70 M30 50 H70" strokeWidth="6" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <p className="opacity-70 leading-relaxed whitespace-pre-line max-w-lg" style={customDescStyles}>
        {description}
      </p>

      <div className="pt-4 w-full flex justify-center">
        <button
          onClick={onButtonClick}
          className="px-8 py-4 rounded-xl bg-primary text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 w-full sm:w-auto"
          style={resolvedButtonStyles}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
});

SuccessContent.displayName = 'SuccessContent';
