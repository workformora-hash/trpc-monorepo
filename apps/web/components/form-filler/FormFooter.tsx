"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import type { ThemeStyles } from "./types";

interface FormFooterProps {
  progressPercent: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  styles: ThemeStyles;
  onPrev: () => void;
  onNext: () => void;
}

export function FormFooter({
  progressPercent,
  canGoPrev,
  canGoNext,
  styles,
  onPrev,
  onNext,
}: FormFooterProps) {
  return (
    <footer
      className="h-14 px-6 border-t flex items-center justify-between shrink-0"
      style={{ borderColor: styles.inputBorderColor, color: styles.textColor }}
    >
      {/* Progress bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xs">
        <div className="flex-1 h-1 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              backgroundColor: styles.primaryColor,
              width: `${progressPercent}%`,
            }}
          />
        </div>
        <span className="text-[10px] font-mono font-bold opacity-50 w-8 text-right">
          {progressPercent}%
        </span>
      </div>

      {/* Arrow navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          aria-label="Previous question"
          className="p-2 rounded-lg border transition-colors hover:bg-neutral-500/5 disabled:opacity-25 disabled:cursor-not-allowed"
          style={{ borderColor: styles.inputBorderColor }}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          aria-label="Next question"
          className="p-2 rounded-lg border transition-colors hover:bg-neutral-500/5 disabled:opacity-25 disabled:cursor-not-allowed"
          style={{ borderColor: styles.inputBorderColor }}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </footer>
  );
}
