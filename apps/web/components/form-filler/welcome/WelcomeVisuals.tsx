'use client';

import React, { memo } from "react";

interface WelcomeVisualsProps {
  isJapaneseTheme: boolean;
}

export const WelcomeVisuals = memo(({ isJapaneseTheme }: WelcomeVisualsProps) => {
  if (!isJapaneseTheme) return null;

  return (
    <>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <svg viewBox="0 0 100 100" className="w-[500px] h-[500px] text-[#BC243C]">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray="200 60" transform="rotate(-90 50 50)" />
        </svg>
      </div>

      <div className="absolute bottom-[5%] left-[5%] w-64 h-64 opacity-[0.03] text-[#2C1810] pointer-events-none">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
           <path d="M50,95 L70,95 L70,98 L30,98 L30,95 L50,95 Z M45,95 L48,80 Q40,75 35,60 Q30,45 38,30 Q45,15 60,25 Q75,35 65,55 Q55,75 52,80 L55,95 Z" />
           <path d="M38,30 Q25,25 20,40 Q15,55 30,50 Z" />
           <path d="M60,25 Q75,20 85,35 Q95,50 75,45 Z" />
           <path d="M45,15 Q50,5 65,10 Q80,15 70,25 Z" />
        </svg>
      </div>
    </>
  );
});

WelcomeVisuals.displayName = 'WelcomeVisuals';
