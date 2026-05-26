"use client";

import { ArrowRight, Sparkles, Clock, Lock, CheckCircle2 } from "lucide-react";
import type { FormData, ThemeStyles } from "./types";
import React from "react";

interface FormWelcomeSlideProps {
  form: FormData;
  styles: ThemeStyles;
  onStart: () => void;
  welcomeField?: {
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

export function FormWelcomeSlide({ form, styles, onStart, welcomeField }: FormWelcomeSlideProps) {
  const title = welcomeField?.label || form.title;
  const validation = welcomeField?.validation || {};

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
  const description = typeof validation.description === 'string' ? validation.description : form.description;
  const buttonText = validation.buttonText || "Start";

  const imageLayout = validation.imageLayout || 'top';
  const hasImage = !!validation.imageUrl;
  const hasBgImage = !!validation.bgImageUrl;

  // Premium SaaS sections
  const showStats = !!validation.showStatsBadge;
  const statsTime = validation.statsTime || "2 mins";
  const creatorProfile = validation.creatorProfile;
  const features = Array.isArray(validation.features) ? validation.features : [];
  const socialProof = Array.isArray(validation.socialProof) ? validation.socialProof : [];

  const isDarkTheme = form.theme === 'dark' || form.theme === 'cyberpunk' || form.theme === 'retro' || form.theme === 'japanese' || styles.backgroundColor?.toLowerCase() === '#0f172a' || styles.backgroundColor?.toLowerCase() === '#050505' || styles.backgroundColor?.toLowerCase() === '#0a0f0d';
  const isJapaneseTheme = form.theme === 'japanese';

  const resolvedCardStyle: React.CSSProperties = {
    backgroundColor: validation.cardBgColor || (isJapaneseTheme ? 'rgba(255, 255, 255, 0.03)' : (hasBgImage ? (isDarkTheme ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.45)') : undefined)),
    backgroundImage: validation.cardBgColor ? undefined : (isJapaneseTheme ? 'linear-gradient(135deg, rgba(188, 36, 60, 0.05) 0%, transparent 100%)' : (validation.bgGradient || undefined)),
    backdropFilter: validation.cardBgColor ? (validation.cardBgColor.includes('rgba') ? 'blur(16px)' : undefined) : (isJapaneseTheme ? 'blur(12px) saturate(120%)' : (hasBgImage ? 'blur(24px) saturate(180%)' : undefined)),
    WebkitBackdropFilter: validation.cardBgColor ? (validation.cardBgColor.includes('rgba') ? 'blur(16px)' : undefined) : (isJapaneseTheme ? 'blur(12px) saturate(120%)' : (hasBgImage ? 'blur(24px) saturate(180%)' : undefined)),
    borderColor: validation.activeColor ? `${validation.activeColor}40` : (isJapaneseTheme ? 'rgba(188, 36, 60, 0.15)' : (hasBgImage ? (isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.25)') : undefined)),
    boxShadow: isJapaneseTheme ? '12px 12px 0px rgba(188, 36, 60, 0.05)' : (hasBgImage ? '0 8px 32px 0 rgba(0, 0, 0, 0.12)' : undefined),
    borderWidth: (validation.cardBgColor || validation.bgGradient || hasBgImage || isJapaneseTheme) ? '1px' : undefined,
    padding: (validation.cardBgColor || validation.bgGradient || hasBgImage || isJapaneseTheme) ? '3.5rem 4rem' : undefined,
    borderRadius: isJapaneseTheme ? '4px' : ((validation.cardBgColor || validation.bgGradient || hasBgImage) ? '1.5rem' : undefined),
  };

  // 1. Stats estimation pill badge
  const statsBadgeEl = showStats && (
    <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap animate-fadeIn select-none mb-3">
      <span 
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 shrink-0" 
        style={{ color: (validation.activeColor as string) || styles.primaryColor, borderColor: validation.activeColor ? `${validation.activeColor}30` : undefined, backgroundColor: validation.activeColor ? `${validation.activeColor}15` : undefined }}
      >
        <Clock className="h-3 w-3" />
        Takes {statsTime}
      </span>
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
        <Lock className="h-3 w-3" />
        Secure & Anonymous
      </span>
    </div>
  );

  // 2. High-converting Feature Highlight checklist
  const featuresEl = features.length > 0 && (
    <ul className="space-y-2 animate-fadeIn text-left mt-2 mb-3 max-w-md w-full">
      {features.map((feat: string, i: number) => (
        <li key={i} className="flex items-start gap-2 text-xs font-semibold opacity-90 leading-relaxed">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
          <span style={{ fontFamily: styles.fontFamily }}>{feat}</span>
        </li>
      ))}
    </ul>
  );

  // 3. Creator Profile Bio/Testimonial Card
  const creatorProfileEl = creatorProfile && creatorProfile.name && (
    <div className="bg-white/60 dark:bg-neutral-900/50 backdrop-blur-lg border border-neutral-200/50 dark:border-white/5 p-4 rounded-2xl shadow-xs space-y-2.5 max-w-[260px] animate-fadeIn shrink-0 hover:scale-[1.02] transition-all duration-300 text-left border-dashed">
      <div className="flex items-center gap-3">
        {creatorProfile.avatar && (
          <img
            src={creatorProfile.avatar}
            alt={creatorProfile.name}
            className="h-9 w-9 rounded-full object-cover border-2 shrink-0"
            style={{ borderColor: (validation.activeColor as string) || styles.primaryColor }}
          />
        )}
        <div className="space-y-0.5 min-w-0">
          <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 truncate">{creatorProfile.name}</h4>
          <p className="text-[9px] opacity-60 font-semibold truncate leading-none">{creatorProfile.role}</p>
        </div>
      </div>
      {creatorProfile.quote && (
        <p className="text-[10px] italic opacity-85 leading-relaxed relative before:content-[''] border-l-2 pl-2 border-primary/20 dark:border-white/10" style={{ borderLeftColor: validation.activeColor || undefined }}>
          {creatorProfile.quote}
        </p>
      )}
    </div>
  );

  // 4. Center Centered Social Proof Brands Trust Banner
  const socialProofEl = socialProof.length > 0 && (
    <div className="w-full pt-5 border-t border-dashed border-neutral-300/30 dark:border-neutral-800/40 mt-7 flex flex-col items-center gap-2.5 select-none">
      <span className="text-[9px] uppercase tracking-widest font-extrabold opacity-40 font-sans">
        Trusted by leading teams worldwide
      </span>
      <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 opacity-50 dark:opacity-35 hover:opacity-65 transition-opacity duration-300">
        {socialProof.map((brand: any, i: number) => (
          <div key={i} className="flex items-center gap-1 h-5">
            {brand.logo && (
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-3.5 sm:h-4.5 object-contain grayscale dark:invert"
              />
            )}
            <span className="text-[10px] font-extrabold tracking-tight text-neutral-600 dark:text-neutral-400">{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full relative flex items-center justify-center min-h-[70vh]">
      {/* Decorative Enso Circle for Japanese Theme */}
      {isJapaneseTheme && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <svg viewBox="0 0 100 100" className="w-[500px] h-[500px] text-[#BC243C]">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray="200 60" transform="rotate(-90 50 50)" />
          </svg>
        </div>
      )}

      {/* Main content wrapper, transparent when there's a background image to let the page-level fullscreen background shine through */}
      <div className="w-full z-10 transition-all duration-300 relative" style={resolvedCardStyle}>
        
        {/* Japanese Theme Corner Accent */}
        {isJapaneseTheme && (
          <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[#BC243C] opacity-20" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          </div>
        )}

        {/* Render Side Split Layouts (Left & Right) */}
        {hasImage && (imageLayout === 'split-left' || imageLayout === 'split-right') ? (
          <div className={`w-full flex flex-col md:flex-row items-center gap-8 md:gap-12 text-left ${
            imageLayout === 'split-right' ? 'md:flex-row-reverse' : ''
          }`}>
            <div className="w-full md:w-1/2 flex justify-center animate-fadeIn">
              <div className="w-full max-w-[200px] max-h-[200px] aspect-square overflow-hidden rounded-xl border border-neutral-250/50 dark:border-neutral-800 shadow-sm relative group">
                <img 
                  src={validation.imageUrl as string} 
                  alt={validation.imageAlt as string || "Welcome Media"} 
                  style={getImageStyles(validation)}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col gap-4">
              {statsBadgeEl}

              {form.theme !== "default" && !hasBgImage && (
                <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-neutral-500/10 border border-neutral-500/20 w-fit" style={{ color: styles.primaryColor }}>
                  <Sparkles className="h-3 w-3" />
                  {form.theme} theme
                </span>
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

              {featuresEl}

              {creatorProfileEl}

              <button
                onClick={onStart}
                className="py-3 px-6 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all hover:scale-105 hover:opacity-90 shadow-md group w-fit"
                style={resolvedButtonStyles}
              >
                {buttonText}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Render Standard / Top Header Layout */
          <div className="w-full flex flex-col items-center text-center">
            <div className={`w-full flex flex-col ${creatorProfile?.name ? 'md:flex-row md:items-start md:text-left text-center' : 'items-center text-center'} gap-6 md:gap-10 animate-fadeIn`}>
              
              <div className={`flex-1 flex flex-col ${creatorProfile?.name ? 'items-start text-left' : 'items-center text-center'} gap-5`}>
                {validation.showHighlightsGrid && (
                  <div className="flex justify-center w-full mb-3.5 animate-scaleIn">
                    <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center border-4 border-indigo-100/50 dark:border-indigo-900/30 shadow-xs relative animate-pulse">
                      <div className="absolute inset-0 rounded-full border border-indigo-200/50 dark:border-indigo-800/40 animate-pulse" />
                      <svg className="w-10 h-10 text-indigo-650 dark:text-indigo-400 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                  </div>
                )}

                {statsBadgeEl}

                {form.theme !== "default" && !hasBgImage && (
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-neutral-500/10 border border-neutral-500/20 w-fit" style={{ color: styles.primaryColor }}>
                    <Sparkles className="h-3 w-3" />
                    {form.theme} theme
                  </span>
                )}

                {hasImage && imageLayout === 'top' && (
                  <div className="w-full max-w-[280px] max-h-[160px] overflow-hidden rounded-xl border border-neutral-250/50 dark:border-neutral-800 shadow-xs animate-scaleIn mx-auto">
                    <img 
                      src={validation.imageUrl as string} 
                      alt={validation.imageAlt as string || "Welcome Media"} 
                      style={getImageStyles(validation)}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  </div>
                )}

                <div className={`space-y-3 ${creatorProfile?.name ? 'max-w-xl' : 'max-w-xl text-center'} relative w-fit mx-auto`}>
                  <h1 className="font-extrabold tracking-tight leading-tight" style={{
                    ...customLabelStyles,
                    fontSize: validation.labelFontSize ? (validation.labelFontSize as string) : (styles.fontSize ? `calc(${styles.fontSize} * 2.4)` : '3rem')
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
                    <p className={`opacity-70 leading-relaxed whitespace-pre-line ${creatorProfile?.name ? '' : 'max-w-md mx-auto'}`} style={{
                      ...customDescStyles,
                      fontSize: validation.descriptionFontSize ? (validation.descriptionFontSize as string) : (styles.fontSize ? `calc(${styles.fontSize} * 1.05)` : '0.875rem')
                    }}>
                      {description}
                    </p>
                  )}
                </div>

                {featuresEl}

                {validation.showHighlightsGrid && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-xl mx-auto my-7 pt-5 border-t border-dashed border-neutral-300/30 dark:border-neutral-800/40">
                    <div className="flex flex-col items-center text-center space-y-1.5 animate-fadeIn" style={{ animationDelay: '100ms' }}>
                      <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
                        <Clock className="w-4.5 h-4.5 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-extrabold text-neutral-600 dark:text-neutral-300 font-sans">Quick & Easy</span>
                    </div>
                    
                    <div className="flex flex-col items-center text-center space-y-1.5 animate-fadeIn" style={{ animationDelay: '200ms' }}>
                      <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400 shadow-2xs">
                        <Lock className="w-4.5 h-4.5 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-extrabold text-neutral-600 dark:text-neutral-300 font-sans">Secure & Private</span>
                    </div>
                    
                    <div className="flex flex-col items-center text-center space-y-1.5 animate-fadeIn" style={{ animationDelay: '300ms' }}>
                      <div className="w-9 h-9 rounded-full bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center text-violet-650 dark:text-violet-400 shadow-2xs">
                        <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-extrabold text-neutral-600 dark:text-neutral-300 font-sans">Important Info</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={onStart}
                    className="py-3 px-6 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all hover:scale-105 hover:opacity-90 shadow-md group w-fit"
                    style={resolvedButtonStyles}
                  >
                    {buttonText}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  {validation.showHighlightsGrid && (
                    <button
                      type="button"
                      onClick={() => window.history.back()}
                      className="text-xs font-bold text-neutral-400 hover:text-neutral-650 dark:hover:text-neutral-300 transition-colors cursor-pointer font-sans"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {creatorProfileEl && (
                <div className="w-full md:w-auto flex justify-center pt-2 md:pt-8 shrink-0">
                  {creatorProfileEl}
                </div>
              )}
            </div>
          </div>
        )}

        {socialProofEl}

      </div>
    </div>
  );
}
