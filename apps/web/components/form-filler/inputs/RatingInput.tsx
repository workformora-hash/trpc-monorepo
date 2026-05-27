'use client';

import React, { memo } from "react";
import { Star } from "lucide-react";
import type { FieldInputProps } from "../types";

export const RatingInput = memo(({ field, value, styles, onChange }: FieldInputProps) => {
  const v = field.validation as Record<string, unknown> | null | undefined;
  const max = Number(v?.maxStars || v?.max || 5);
  const currentRating = Number(value) || 0;

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const active = starValue <= currentRating;

        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            className="transition-transform hover:scale-110 active:scale-95"
            aria-label={`Rate ${starValue} out of ${max}`}
          >
            <Star
              className={`h-10 w-10 ${active ? "fill-current" : "text-neutral-200 dark:text-neutral-800"}`}
              style={{ color: active ? styles.primaryColor : undefined }}
            />
          </button>
        );
      })}
    </div>
  );
});

RatingInput.displayName = 'RatingInput';
