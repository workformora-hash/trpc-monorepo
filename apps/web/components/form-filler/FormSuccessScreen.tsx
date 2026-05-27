"use client";

import React, { memo } from "react";
import { useRouter } from "next/navigation";
import type { ThemeStyles } from "./types";
import { getThemeFontImport } from "./theme-config";

// Modular Sub-components
import { SuccessVisuals } from "./success/SuccessVisuals";
import { SuccessContent } from "./success/SuccessContent";

interface FormSuccessScreenProps {
  formTitle: string;
  responseId?: string;
  themeId: string;
  styles: ThemeStyles;
  thankYouField?: {
    label: string;
    validation?: any;
  } | null;
}

export const FormSuccessScreen = memo(({
  formTitle,
  themeId,
  styles,
  thankYouField,
}: FormSuccessScreenProps) => {
  const router = useRouter();

  const title = thankYouField?.label || "Response Submitted";
  const validation = thankYouField?.validation || {};
  const description = typeof validation.description === 'string' ? validation.description : `Thank you for completing "${formTitle}". Your answers have been recorded.`;
  const buttonText = validation.buttonText || "Create your own form →";
  const redirectUrl = validation.redirectUrl || "";

  // Resolve Styles
  const customLabelStyles: React.CSSProperties = {
    color: (validation.labelColor as string) || styles.textColor,
    fontFamily: (validation.labelFontFamily as string) || styles.fontFamily,
    fontSize: validation.labelFontSize ? (validation.labelFontSize as string) : (styles.fontSize ? `calc(${styles.fontSize} * 2.2)` : '2rem')
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
  const bgImageUrl = validation.bgImageUrl as string | undefined;
  const isJapaneseTheme = themeId === 'japanese';
  const isDarkTheme = themeId === 'dark' || themeId === 'cyberpunk' || themeId === 'retro' || themeId === 'japanese' || styles.backgroundColor?.toLowerCase() === '#0f172a' || styles.backgroundColor?.toLowerCase() === '#050505' || styles.backgroundColor?.toLowerCase() === '#0a0f0d';

  const resolvedCardStyle: React.CSSProperties = {
    backgroundColor: validation.cardBgColor || (isJapaneseTheme ? (hasBgImage ? 'transparent' : 'rgba(255, 255, 255, 0.03)') : (hasBgImage ? (isDarkTheme ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.45)') : styles.cardBgColor)),
    backgroundImage: validation.cardBgColor ? undefined : (isJapaneseTheme ? (hasBgImage ? 'none' : 'linear-gradient(135deg, rgba(188, 36, 60, 0.05) 0%, transparent 100%)') : (validation.bgGradient || undefined)),
    backdropFilter: validation.cardBgColor ? (validation.cardBgColor.includes('rgba') ? 'blur(16px)' : undefined) : (isJapaneseTheme ? (hasBgImage ? 'none' : 'blur(12px) saturate(120%)') : (hasBgImage ? 'blur(24px) saturate(180%)' : undefined)),
    WebkitBackdropFilter: validation.cardBgColor ? (validation.cardBgColor.includes('rgba') ? 'blur(16px)' : undefined) : (isJapaneseTheme ? (hasBgImage ? 'none' : 'blur(12px) saturate(120%)') : (hasBgImage ? 'blur(24px) saturate(180%)' : undefined)),
    borderColor: validation.activeColor ? `${validation.activeColor}40` : (isJapaneseTheme ? (hasBgImage ? 'transparent' : 'rgba(188, 36, 60, 0.15)') : (hasBgImage ? (isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.25)') : styles.inputBorderColor)),
    boxShadow: isJapaneseTheme ? (hasBgImage ? 'none' : '12px 12px 0px rgba(188, 36, 60, 0.05)') : (hasBgImage ? '0 8px 32px 0 rgba(0, 0, 0, 0.12)' : undefined),
    borderWidth: (isJapaneseTheme && hasBgImage) ? '0' : '1px',
    borderRadius: isJapaneseTheme ? '4px' : undefined,
  };

  const handleButtonClick = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      router.push("/");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 transition-all relative overflow-hidden"
      style={{
        backgroundColor: bgImageUrl ? 'transparent' : styles.backgroundColor,
        fontFamily: styles.fontFamily,
        color: styles.textColor,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: getThemeFontImport(themeId) }} />
      
      <SuccessVisuals isJapaneseTheme={isJapaneseTheme} />

      <div className="w-full z-10 transition-all duration-300 relative p-10 md:p-14" style={resolvedCardStyle}>
        {/* Japanese Theme Corner Accent */}
        {isJapaneseTheme && (
          <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[#BC243C] opacity-20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          </div>
        )}

        <SuccessContent 
          {...{ title, description, buttonText, isJapaneseTheme, customLabelStyles, customDescStyles, resolvedButtonStyles }}
          onButtonClick={handleButtonClick}
        />
      </div>
    </div>
  );
});

FormSuccessScreen.displayName = 'FormSuccessScreen';
