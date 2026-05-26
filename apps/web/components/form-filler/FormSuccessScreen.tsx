"use client";

import { Check, Twitter, Linkedin, Facebook, Copy, Share2, Sparkles, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ThemeStyles } from "./types";
import { getThemeFontImport } from "./theme-config";
import React, { useState } from "react";
import { toast } from "sonner";

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

export const getImageStyles = (validation: any) => {
  if (!validation) return {};
  const styles: React.CSSProperties = {
    objectFit: 'cover',
  };
  
  if (validation.imageFocalPoint) {
    styles.objectPosition = validation.imageFocalPoint;
  }
  
  if (validation.imageAspectRatio && validation.imageAspectRatio !== 'auto') {
    styles.aspectRatio = validation.imageAspectRatio;
  }
  
  styles.width = validation.imageWidth || '100%';
  styles.height = validation.imageHeight || 'auto';
  
  const filters: string[] = [];
  const brightness = validation.imageBrightness !== undefined ? validation.imageBrightness : 100;
  filters.push(`brightness(${brightness}%)`);
  
  const filterType = validation.imageFilter || 'none';
  if (filterType === 'grayscale') filters.push('grayscale(100%)');
  else if (filterType === 'sepia') filters.push('sepia(100%)');
  else if (filterType === 'vintage') filters.push('sepia(40%) brightness(85%) contrast(115%)');
  else if (filterType === 'blur') filters.push('blur(4px)');
  else if (filterType === 'invert') filters.push('invert(100%)');
  else if (filterType === 'contrast') filters.push('contrast(150%)');
  else if (filterType === 'warm') filters.push('hue-rotate(20deg) saturate(120%)');
  else if (filterType === 'cool') filters.push('hue-rotate(-20deg) saturate(120%)');
  
  styles.filter = filters.join(' ');
  return styles;
};

export const getBgImageStyles = (validation: any) => {
  if (!validation) return {};
  const styles: React.CSSProperties = {
    objectFit: 'cover',
  };
  
  if (validation.bgImageFocalPoint) {
    styles.objectPosition = validation.bgImageFocalPoint;
  }
  
  const filters: string[] = [];
  const brightness = validation.bgImageBrightness !== undefined ? validation.bgImageBrightness : 100;
  filters.push(`brightness(${brightness}%)`);
  
  const filterType = validation.bgImageFilter || 'none';
  if (filterType === 'grayscale') filters.push('grayscale(100%)');
  else if (filterType === 'sepia') filters.push('sepia(100%)');
  else if (filterType === 'vintage') filters.push('sepia(40%) brightness(85%) contrast(115%)');
  else if (filterType === 'blur') filters.push('blur(4px)');
  else if (filterType === 'invert') filters.push('invert(100%)');
  else if (filterType === 'contrast') filters.push('contrast(150%)');
  else if (filterType === 'warm') filters.push('hue-rotate(20deg) saturate(120%)');
  else if (filterType === 'cool') filters.push('hue-rotate(-20deg) saturate(120%)');
  
  styles.filter = filters.join(' ');
  return styles;
};

export function FormSuccessScreen({
  formTitle,
  responseId,
  themeId,
  styles,
  thankYouField,
}: FormSuccessScreenProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const title = thankYouField?.label || "Response Submitted";
  const validation = thankYouField?.validation || {};
  const description = typeof validation.description === 'string' ? validation.description : `Thank you for completing "${formTitle}". Your answers have been recorded.`;
  const buttonText = validation.buttonText || "Create your own form →";
  const redirectUrl = validation.redirectUrl || "";

  // Premium SaaS sections
  const promoCard = validation.promoCard;
  const showSocialShare = !!validation.socialShare;

  // Dynamic atomic text style overrides (field-level custom styles)
  const customLabelStyles: React.CSSProperties = {
    color: (validation.labelColor as string) || styles.textColor,
    fontFamily: (validation.labelFontFamily as string) || styles.fontFamily,
  };
  if (validation.labelFontSize) {
    customLabelStyles.fontSize = validation.labelFontSize as string;
  } else if (styles.fontSize) {
    customLabelStyles.fontSize = `calc(${styles.fontSize} * 2.2)`;
  }

  const customDescStyles: React.CSSProperties = {
    color: (validation.descriptionColor as string) || `${styles.textColor}aa`,
    fontFamily: (validation.descriptionFontFamily as string) || styles.fontFamily,
  };
  if (validation.descriptionFontSize) {
    customDescStyles.fontSize = validation.descriptionFontSize as string;
  } else if (styles.fontSize) {
    customDescStyles.fontSize = `calc(${styles.fontSize} * 1.05)`;
  }

  const resolvedButtonStyles = {
    backgroundColor: (validation.buttonBgColor as string) || styles.buttonBgColor,
    color: (validation.buttonTextColor as string) || styles.buttonTextColor,
  };

  const imageLayout = validation.imageLayout || 'top';
  const hasImage = !!validation.imageUrl;
  const hasBgImage = !!validation.bgImageUrl;
  const bgImageUrl = validation.bgImageUrl as string | undefined;

  // Stable receipt label — generated once on mount
  const receiptLabel =
    responseId ??
    `receipt_${Math.random().toString(36).substring(2, 10)}`;

  const handleButtonClick = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      router.push("/");
    }
  };

  const handleCopyLink = () => {
    const link = typeof window !== 'undefined' ? window.location.href : "";
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Form link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isDarkTheme = themeId === 'dark' || themeId === 'cyberpunk' || themeId === 'retro' || themeId === 'japanese' || styles.backgroundColor?.toLowerCase() === '#0f172a' || styles.backgroundColor?.toLowerCase() === '#050505' || styles.backgroundColor?.toLowerCase() === '#0a0f0d';
  const isJapaneseTheme = themeId === 'japanese';

  const resolvedCardStyle: React.CSSProperties = {
    backgroundColor: validation.cardBgColor || (isJapaneseTheme ? 'rgba(255, 255, 255, 0.03)' : (hasBgImage ? (isDarkTheme ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.45)') : styles.cardBgColor)),
    backgroundImage: validation.cardBgColor ? undefined : (isJapaneseTheme ? 'linear-gradient(135deg, rgba(188, 36, 60, 0.05) 0%, transparent 100%)' : (validation.bgGradient || undefined)),
    backdropFilter: validation.cardBgColor ? (validation.cardBgColor.includes('rgba') ? 'blur(16px)' : undefined) : (isJapaneseTheme ? 'blur(12px) saturate(120%)' : (hasBgImage ? 'blur(24px) saturate(180%)' : undefined)),
    WebkitBackdropFilter: validation.cardBgColor ? (validation.cardBgColor.includes('rgba') ? 'blur(16px)' : undefined) : (isJapaneseTheme ? 'blur(12px) saturate(120%)' : (hasBgImage ? 'blur(24px) saturate(180%)' : undefined)),
    borderColor: validation.activeColor ? `${validation.activeColor}40` : (isJapaneseTheme ? 'rgba(188, 36, 60, 0.15)' : (hasBgImage ? (isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.25)') : styles.inputBorderColor)),
    boxShadow: isJapaneseTheme ? '12px 12px 0px rgba(188, 36, 60, 0.05)' : (hasBgImage ? '0 8px 32px 0 rgba(0, 0, 0, 0.12)' : undefined),
    borderWidth: '1px',
    borderRadius: isJapaneseTheme ? '4px' : undefined,
  };

  // 1. Sleek CTA Promo Resource Card
  const promoCardEl = promoCard && promoCard.title && (
    <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl space-y-2 text-left animate-fadeIn shadow-2xs hover:shadow-xs transition-shadow duration-300 relative overflow-hidden group">
      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
        <Gift className="h-16 w-16 text-emerald-500" />
      </div>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
        <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{promoCard.title}</h4>
      </div>
      <p className="text-[11px] opacity-80 leading-normal">{promoCard.description}</p>
      {promoCard.linkUrl && (
        <a
          href={promoCard.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:opacity-80 pt-1"
        >
          {promoCard.linkText || "Claim Reward →"}
        </a>
      )}
    </div>
  );

  // 2. SaaS Sharing buttons
  const socialShareEl = showSocialShare && (
    <div className="space-y-2 animate-fadeIn pt-2">
      <span className="text-[9px] uppercase tracking-widest font-extrabold opacity-40 block font-sans">
        Share this form
      </span>
      <div className="flex items-center justify-center gap-3">
        <a
          href={`https://twitter.com/intent/tweet?text=Check%20out%20this%20form%20"${encodeURIComponent(formTitle)}"`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
          title="Share on X"
        >
          <Twitter className="h-3.5 w-3.5 fill-current" />
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
          title="Share on LinkedIn"
        >
          <Linkedin className="h-3.5 w-3.5 fill-current" />
        </a>
        <button
          onClick={handleCopyLink}
          className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all hover:scale-105 active:scale-95"
          title="Copy link"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 transition-all relative overflow-hidden"
      style={{
        backgroundColor: bgImageUrl ? 'transparent' : styles.backgroundColor,
        fontFamily: styles.fontFamily,
        color: styles.textColor,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: getThemeFontImport(themeId),
        }}
      />

      {/* Full-bleed Fullscreen Page Level Background Image */}
      {bgImageUrl && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={bgImageUrl}
            alt="Form Viewport Background"
            style={{ ...getBgImageStyles(validation), width: '100%', height: '100%' }}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-neutral-955/15 dark:bg-black/40 backdrop-blur-[1px]" />
        </div>
      )}

      <div
        className={`w-full z-10 p-8 sm:p-10 rounded-2xl transition-all duration-300 border shadow-xl ${
          hasImage && (imageLayout === 'split-left' || imageLayout === 'split-right')
            ? 'max-w-3xl'
            : 'max-w-md text-center'
        }`}
        style={resolvedCardStyle}
      >
        {hasImage && (imageLayout === 'split-left' || imageLayout === 'split-right') ? (
          <div className={`w-full flex flex-col md:flex-row items-center gap-8 md:gap-10 ${
            imageLayout === 'split-right' ? 'md:flex-row-reverse' : ''
          }`}>
            {/* Split Media Image */}
            <div className="w-full md:w-1/2 flex justify-center animate-scaleIn">
              <div className="w-full max-w-[200px] max-h-[200px] aspect-square overflow-hidden rounded-xl border border-neutral-250/50 dark:border-neutral-800 shadow-sm relative group">
                <img 
                  src={validation.imageUrl as string} 
                  alt={validation.imageAlt as string || "Success Media"} 
                  style={getImageStyles(validation)}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Split Success Content */}
            <div className="w-full md:w-1/2 space-y-5 text-left flex flex-col">
              <div className="flex items-center gap-3">
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

              {description && (
                <p className="opacity-70 leading-relaxed whitespace-pre-line" style={customDescStyles}>
                  {description}
                </p>
              )}

              {/* Receipt ID */}
              <div
                className="pt-3.5 border-t border-dashed space-y-1 w-full"
                style={{ borderColor: styles.inputBorderColor }}
              >
                <span className="text-[9px] uppercase tracking-widest opacity-40 font-mono block">
                  Submission ID
                </span>
                <span className="text-[10px] font-mono font-semibold opacity-75 break-all select-all block bg-neutral-100/50 dark:bg-neutral-800/50 py-1.5 px-3 rounded-lg border border-neutral-200/30 dark:border-white/5">
                  {receiptLabel}
                </span>
              </div>

              {promoCardEl}

              {socialShareEl}

              <button
                onClick={handleButtonClick}
                className="w-full py-3 rounded-xl text-xs font-bold transition-all hover:opacity-90 shadow-sm mt-2"
                style={resolvedButtonStyles}
              >
                {buttonText}
              </button>
            </div>
          </div>
        ) : (
          /* Standard card layout (top or standard image layouts) */
          <div className="space-y-5 animate-fadeIn flex flex-col items-center">
            {/* Animated checkmark */}
            <div className="p-3 bg-emerald-500/15 rounded-full w-fit mx-auto text-emerald-500">
              <Check className="h-10 w-10 stroke-[3]" />
            </div>

            {hasImage && imageLayout === 'top' && (
              <div className="w-full max-w-[280px] max-h-[160px] overflow-hidden rounded-xl border border-neutral-250/50 dark:border-neutral-800 shadow-xs animate-scaleIn mx-auto">
                <img 
                  src={validation.imageUrl as string} 
                  alt={validation.imageAlt as string || "Success Media"} 
                  style={getImageStyles(validation)}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              </div>
            )}

            <div className="space-y-2 relative w-fit mx-auto">
              <h1 className="font-extrabold tracking-tight leading-snug" style={{
                ...customLabelStyles,
                fontSize: validation.labelFontSize ? (validation.labelFontSize as string) : (styles.fontSize ? `calc(${styles.fontSize} * 2.2)` : '2rem')
              }}>
                {title}
              </h1>
              {isJapaneseTheme && (
                <div className="absolute -top-4 -right-10 w-12 h-12 text-[#BC243C] opacity-80 mix-blend-multiply dark:mix-blend-screen rotate-[12deg] pointer-events-none">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                    <rect x="10" y="10" width="80" height="80" rx="6" />
                    <rect x="20" y="20" width="60" height="60" rx="3" strokeWidth="2" />
                    <path d="M40 30 V70 M60 30 V70 M30 50 H70" strokeWidth="6" />
                  </svg>
                </div>
              )}
              {description && (
                <p className="opacity-70 max-w-sm mx-auto leading-relaxed whitespace-pre-line" style={{
                  ...customDescStyles,
                  fontSize: validation.descriptionFontSize ? (validation.descriptionFontSize as string) : (styles.fontSize ? `calc(${styles.fontSize} * 1.0)` : '0.875rem')
                }}>
                  {description}
                </p>
              )}
            </div>

            {/* Receipt ID */}
            <div
              className="pt-3.5 border-t border-dashed space-y-1 mx-auto max-w-sm w-full"
              style={{ borderColor: styles.inputBorderColor }}
            >
              <span className="text-[9px] uppercase tracking-widest opacity-40 font-mono block">
                Submission ID
              </span>
              <span className="text-[10px] font-mono font-semibold opacity-75 break-all select-all block bg-neutral-100/50 dark:bg-neutral-800/50 py-1.5 px-3 rounded-lg border border-neutral-200/30 dark:border-white/5">
                {receiptLabel}
              </span>
            </div>

            {promoCardEl && <div className="w-full max-w-sm">{promoCardEl}</div>}

            {socialShareEl}

            <button
              onClick={handleButtonClick}
              className="w-full py-3 rounded-xl text-xs font-bold transition-all hover:opacity-90 shadow-sm max-w-sm"
              style={resolvedButtonStyles}
            >
              {buttonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

