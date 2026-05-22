"use client";

import { useEffect } from "react";

interface UseKeyboardNavProps {
  onNext: () => void;
  onPrev: () => void;
  /** When true, suppress Enter from firing onNext (e.g. user is in a textarea). */
  suppressEnter: boolean;
}

/**
 * Registers global keyboard shortcuts for slide navigation:
 *   Enter        → next
 *   Alt+ArrowUp  → prev
 *   Alt+ArrowDown→ next
 */
export function useKeyboardNav({
  onNext,
  onPrev,
  suppressEnter,
}: UseKeyboardNavProps) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Enter" && !suppressEnter) {
        e.preventDefault();
        onNext();
      }
      if (e.altKey && e.key === "ArrowUp") onPrev();
      if (e.altKey && e.key === "ArrowDown") onNext();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, onPrev, suppressEnter]);
}

interface UseRatingKeysProps {
  enabled: boolean;
  onRate: (value: number) => void;
}

/** Lets users press 1-5 to select a star rating instantly. */
export function useRatingKeys({ enabled, onRate }: UseRatingKeysProps) {
  useEffect(() => {
    if (!enabled) return;
    function handler(e: KeyboardEvent) {
      const n = Number(e.key);
      if (n >= 1 && n <= 5) onRate(n);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onRate]);
}
