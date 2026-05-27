'use client';

import React, { memo } from "react";
import { ArrowRight, Clock, Lock, CheckCircle2 } from "lucide-react";
import type { ThemeStyles } from "../types";

interface WelcomeContentProps {
  title: string;
  description: string | null;
  buttonText: string;
  onStart: () => void;
  styles: ThemeStyles;
  customLabelStyles: React.CSSProperties;
  customDescStyles: React.CSSProperties;
  resolvedButtonStyles: React.CSSProperties;
  isJapaneseTheme: boolean;
  showStats: boolean;
  statsTime: string;
  features: string[];
}

export const WelcomeContent = memo(({
  title,
  description,
  buttonText,
  onStart,
  styles,
  customLabelStyles,
  customDescStyles,
  resolvedButtonStyles,
  isJapaneseTheme,
  showStats,
  statsTime,
  features,
}: WelcomeContentProps) => {
  return (
    <div className="space-y-6">
      {/* Stats estimation pill badge */}
      {showStats && (
        <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap animate-fadeIn select-none mb-3">
          <span 
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 shrink-0" 
            style={{ color: (customLabelStyles.color as string) || styles.primaryColor }}
          >
            <Clock className="h-3 w-3" />
            Takes {statsTime}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Lock className="h-3 w-3" />
            Secure & Anonymous
          </span>
        </div>
      )}

      <div className="relative w-fit">
        <h1 className="font-extrabold tracking-tight leading-tight" style={customLabelStyles}>
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

      {description && (
        <p className="opacity-70 leading-relaxed whitespace-pre-line" style={customDescStyles}>
          {description}
        </p>
      )}

      {features.length > 0 && (
        <ul className="space-y-2 animate-fadeIn text-left mt-2 mb-3 max-w-md w-full">
          {features.map((feat, i) => (
            <li key={i} className="flex items-start gap-2 text-xs font-semibold opacity-90 leading-relaxed">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
              <span style={{ fontFamily: styles.fontFamily }}>{feat}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={onStart}
          className="px-8 py-4 rounded-xl bg-primary text-white font-bold flex items-center gap-2.5 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto justify-center group"
          style={resolvedButtonStyles}
        >
          <span>{buttonText}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        {!isJapaneseTheme && (
          <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest hidden sm:block">
            Press Enter ↵
          </span>
        )}
      </div>
    </div>
  );
});

WelcomeContent.displayName = 'WelcomeContent';
