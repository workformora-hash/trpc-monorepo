"use client";

import React, { memo } from "react";
import type { FormData, ThemeStyles } from "./types";
import { getImageStyles } from "~/utils/image-styles";

// Modular Sub-components
import { WelcomeVisuals } from "./welcome/WelcomeVisuals";
import { WelcomeContent } from "./welcome/WelcomeContent";

interface FormWelcomeSlideProps {
  form: FormData;
  styles: ThemeStyles;
  onStart: () => void;
  welcomeField?: {
    label: string;
    validation?: any;
  } | null;
}

export const FormWelcomeSlide = memo(({ form, styles, onStart, welcomeField }: FormWelcomeSlideProps) => {
  const title = welcomeField?.label || form.title;
  const validation = welcomeField?.validation || {};

  // Resolve Styles
  const customLabelStyles: React.CSSProperties = {
    color: (validation.labelColor as string) || styles.textColor,
    fontFamily: (validation.labelFontFamily as string) || styles.fontFamily,
    fontSize: validation.labelFontSize ? (validation.labelFontSize as string) : (styles.fontSize ? `calc(${styles.fontSize} * 2.2)` : '3rem')
  };

  const customDescStyles: React.CSSProperties = {
    color: (validation.descriptionColor as string) || `${styles.textColor}aa`,
    fontFamily: (validation.descriptionFontFamily as string) || styles.fontFamily,
    fontSize: validation.descriptionFontSize ? (validation.descriptionFontSize as string) : (styles.fontSize ? `calc(${styles.fontSize} * 1.05)` : '0.875rem')
  };

  const resolvedButtonStyles = {
    backgroundColor: (validation.buttonBgColor as string) || styles.buttonBgColor,
    color: (validation.buttonTextColor as string) || styles.buttonTextColor,
  };

  const hasBgImage = !!validation.bgImageUrl;
  const isDarkTheme = form.theme === 'dark' || form.theme === 'cyberpunk' || form.theme === 'retro' || form.theme === 'japanese' || styles.backgroundColor?.toLowerCase() === '#0f172a' || styles.backgroundColor?.toLowerCase() === '#050505' || styles.backgroundColor?.toLowerCase() === '#0a0f0d';
  const isJapaneseTheme = form.theme === 'japanese';

  const resolvedCardStyle: React.CSSProperties = {
    backgroundColor: validation.cardBgColor || (isJapaneseTheme ? (hasBgImage ? 'transparent' : 'rgba(255, 255, 255, 0.03)') : (hasBgImage ? (isDarkTheme ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.45)') : undefined)),
    backgroundImage: validation.cardBgColor ? undefined : (isJapaneseTheme ? (hasBgImage ? 'none' : 'linear-gradient(135deg, rgba(188, 36, 60, 0.05) 0%, transparent 100%)') : (validation.bgGradient || undefined)),
    backdropFilter: validation.cardBgColor ? (validation.cardBgColor.includes('rgba') ? 'blur(16px)' : undefined) : (isJapaneseTheme ? (hasBgImage ? 'none' : 'blur(12px) saturate(120%)') : (hasBgImage ? 'blur(24px) saturate(180%)' : undefined)),
    WebkitBackdropFilter: validation.cardBgColor ? (validation.cardBgColor.includes('rgba') ? 'blur(16px)' : undefined) : (isJapaneseTheme ? (hasBgImage ? 'none' : 'blur(12px) saturate(120%)') : (hasBgImage ? 'blur(24px) saturate(180%)' : undefined)),
    borderColor: validation.activeColor ? `${validation.activeColor}40` : (isJapaneseTheme ? (hasBgImage ? 'transparent' : 'rgba(188, 36, 60, 0.15)') : (hasBgImage ? (isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.25)') : undefined)),
    boxShadow: isJapaneseTheme ? (hasBgImage ? 'none' : '12px 12px 0px rgba(188, 36, 60, 0.05)') : (hasBgImage ? '0 8px 32px 0 rgba(0, 0, 0, 0.12)' : undefined),
    borderWidth: (validation.cardBgColor || validation.bgGradient || hasBgImage || isJapaneseTheme) ? (isJapaneseTheme && hasBgImage ? '0' : '1px') : undefined,
    padding: (validation.cardBgColor || validation.bgGradient || hasBgImage || isJapaneseTheme) ? '3.5rem 4rem' : undefined,
    borderRadius: isJapaneseTheme ? '4px' : ((validation.cardBgColor || validation.bgGradient || hasBgImage) ? '1.5rem' : undefined),
  };

  const imageLayout = validation.imageLayout || 'top';
  const hasImage = !!validation.imageUrl;

  return (
    <div className="w-full relative flex items-center justify-center min-h-[70vh]">
      <WelcomeVisuals isJapaneseTheme={isJapaneseTheme} />

      <div className="w-full z-10 transition-all duration-300 relative" style={resolvedCardStyle}>
        {/* Japanese Theme Corner Accent */}
        {isJapaneseTheme && (
          <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[#BC243C] opacity-20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          </div>
        )}

        {hasImage && (imageLayout === 'split-left' || imageLayout === 'split-right') ? (
          <div className={`w-full flex flex-col md:flex-row items-center gap-8 md:gap-12 text-left ${imageLayout === 'split-right' ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-full aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-700">
                <img src={validation.imageUrl} alt={validation.imageAlt || "Welcome"} style={getImageStyles(validation)} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <WelcomeContent 
                {...{ title, styles, onStart, customLabelStyles, customDescStyles, resolvedButtonStyles, isJapaneseTheme }}
                description={validation.description || form.description}
                buttonText={validation.buttonText || "Start"}
                showStats={!!validation.showStatsBadge}
                statsTime={validation.statsTime || "2 mins"}
                features={Array.isArray(validation.features) ? validation.features : []}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
            {hasImage && imageLayout === 'top' && (
              <div className="mb-8 w-full max-w-lg aspect-video rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-4 duration-700">
                <img src={validation.imageUrl} alt={validation.imageAlt || "Welcome"} style={getImageStyles(validation)} className="w-full h-full object-cover" />
              </div>
            )}
            <WelcomeContent 
                {...{ title, styles, onStart, customLabelStyles, customDescStyles, resolvedButtonStyles, isJapaneseTheme }}
                description={validation.description || form.description}
                buttonText={validation.buttonText || "Start"}
                showStats={!!validation.showStatsBadge}
                statsTime={validation.statsTime || "2 mins"}
                features={Array.isArray(validation.features) ? validation.features : []}
              />
          </div>
        )}
      </div>
    </div>
  );
});

FormWelcomeSlide.displayName = 'FormWelcomeSlide';
