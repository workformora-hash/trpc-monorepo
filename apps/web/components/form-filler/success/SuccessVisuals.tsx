'use client';

import React, { memo } from "react";

interface SuccessVisualsProps {
  isJapaneseTheme: boolean;
}

export const SuccessVisuals = memo(({ isJapaneseTheme }: SuccessVisualsProps) => {
  if (!isJapaneseTheme) return null;

  return (
    <>
      <div className="absolute bottom-[5%] left-0 w-full h-48 opacity-[0.03] text-[#BC243C] pointer-events-none">
        <svg viewBox="0 0 200 60" fill="currentColor" className="w-full h-full">
           <path d="M10,50 Q100,0 190,50 L190,55 Q100,5 10,55 Z" />
           <path d="M30,45 L30,58 M60,35 L60,58 M90,30 L90,58 M120,30 L120,58 M150,35 L150,58 M180,45 L180,58" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <svg viewBox="0 0 100 100" className="w-[500px] h-[500px] text-[#BC243C]">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray="200 60" transform="rotate(-90 50 50)" />
        </svg>
      </div>
    </>
  );
});

SuccessVisuals.displayName = 'SuccessVisuals';
