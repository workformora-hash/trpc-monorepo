'use client';

import React from "react";
import {
  Trash2,
  Palette as PaletteIcon,
  X,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { getBgImageStyles } from '~/utils/image-styles';
import { useFormBuilderContext } from './FormBuilderContext';

// New decomposed components
import VisualTemplateModal from './editor/VisualTemplateModal';
import FieldTypeSelector from './editor/FieldTypeSelector';
import ChoiceEditor from './editor/ChoiceEditor';
import { QuestionInputRenderer } from './editor/QuestionInputRenderer';
import { StylePopover } from './editor/StylePopover';

export interface ActiveValidationType {
  buttonText?: string;
  redirectUrl?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  activeColor?: string;
  labelFontFamily?: string;
  labelFontSize?: string;
  labelFontWeight?: string;
  labelAlignment?: 'left' | 'center' | 'right' | 'justify' | 'start' | 'end';
  labelColor?: string;
  descriptionFontFamily?: string;
  descriptionFontSize?: string;
  descriptionFontWeight?: string;
  descriptionAlignment?: 'left' | 'center' | 'right' | 'justify' | 'start' | 'end';
  descriptionColor?: string;
  answerFontFamily?: string;
  answerFontSize?: string;
  answerFontWeight?: string;
  answerColor?: string;
  imageLayout?: string;
  imageFilter?: string;
  imageBrightness?: number;
  imageAspectRatio?: string;
  imageFocalPoint?: string;
  imageAlt?: string;
  bgImageUrl?: string;
  bgGradient?: string;
  showHighlightsGrid?: boolean;
  maxStars?: number;
  max?: number;
  bgImageBrightness?: number;
  bgImageFilter?: string;
  description?: string;
  choices?: string[];
  cardBgColor?: string;
  [key: string]: unknown;
}

const QuestionEditor = React.memo(() => {
  const {
    activeField,
    localLabel,
    setLocalLabel,
    localDescription,
    setLocalDescription,
    labelRef,
    descRef,
    editFormFieldMutation,
    activeValidation: rawActiveValidation,
    selectedForm,
  } = useFormBuilderContext();

  const activeValidation = rawActiveValidation as ActiveValidationType;
  const themeId = selectedForm?.theme ?? "default";

  const [showTemplateModal, setShowTemplateModal] = React.useState(false);
  const [activePopover, setActivePopover] = React.useState<'title' | 'description' | 'choices' | 'answer' | null>(null);

  // Close popover when active field changes to prevent accidental cross-field editing
  React.useEffect(() => {
    setActivePopover(null);
  }, [activeField?.id]);

  const bgImageUrl = activeValidation.bgImageUrl as string | undefined;
  const cardBgColor = activeValidation.cardBgColor as string | undefined;
  const bgGradient = activeValidation.bgGradient as string | undefined;
  const hasBgImage = !!bgImageUrl;
  const isJapaneseTheme = themeId === 'japanese';
  const isDarkTheme = themeId === 'dark' || themeId === 'cyberpunk' || themeId === 'retro';

  const resolvedCardStyle: React.CSSProperties = {
    backgroundColor: cardBgColor || (isJapaneseTheme ? (hasBgImage ? 'transparent' : 'rgba(255, 255, 255, 0.03)') : (hasBgImage ? (isDarkTheme ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.45)') : undefined)),
    backgroundImage: cardBgColor ? undefined : (isJapaneseTheme ? (hasBgImage ? 'none' : 'linear-gradient(135deg, rgba(188, 36, 60, 0.05) 0%, transparent 100%)') : (bgGradient || undefined)),
    backdropFilter: cardBgColor ? (cardBgColor.includes('rgba') ? 'blur(16px)' : undefined) : (isJapaneseTheme ? (hasBgImage ? 'none' : 'blur(12px) saturate(120%)') : (hasBgImage ? 'blur(24px) saturate(180%)' : undefined)),
    WebkitBackdropFilter: cardBgColor ? (cardBgColor.includes('rgba') ? 'blur(16px)' : undefined) : (isJapaneseTheme ? (hasBgImage ? 'none' : 'blur(12px) saturate(120%)') : (hasBgImage ? 'blur(24px) saturate(180%)' : undefined)),
    borderColor: activeValidation.activeColor ? `${activeValidation.activeColor}40` : (isJapaneseTheme ? (hasBgImage ? 'transparent' : 'rgba(188, 36, 60, 0.15)') : (hasBgImage ? (isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.25)') : undefined)),
    boxShadow: isJapaneseTheme ? (hasBgImage ? 'none' : '12px 12px 0px rgba(188, 36, 60, 0.05)') : (hasBgImage ? '0 8px 32px 0 rgba(0, 0, 0, 0.12)' : undefined),
    borderWidth: (cardBgColor || bgGradient || hasBgImage || isJapaneseTheme) ? (isJapaneseTheme && hasBgImage ? '0' : '1px') : undefined,
    padding: (cardBgColor || bgGradient || hasBgImage || isJapaneseTheme) ? '3rem 3.5rem' : '3.5rem 4rem',
    borderRadius: isJapaneseTheme ? '4px' : ((cardBgColor || bgGradient || hasBgImage) ? '1.5rem' : '2rem'),
  };

  return (
    <main 
      className={`flex-1 flex flex-col items-center overflow-y-auto no-scrollbar relative border-r border-neutral-200 dark:border-neutral-800 theme-${themeId}`} 
      style={mainStyle}
    >
      {/* Background Image Preview in Editor */}
      {hasBgImage && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img 
            src={bgImageUrl} 
            alt="" 
            style={{ ...getBgImageStyles(activeValidation), width: '100%', height: '100%' }}
            className="w-full h-full object-cover" 
          />
        </div>
      )}

      {/* Enhanced Japanese Theme Visual Elements - Now managed globally by FormHeader background */}
      {themeId === 'japanese' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute bottom-[5%] left-[2%] w-32 h-64 opacity-[0.02] text-[#2C1810]">
            <svg viewBox="0 0 50 100" fill="currentColor" className="w-full h-full">
              <path d="M10,90 L40,90 L40,95 L10,95 Z M5,75 L45,75 L45,80 L5,80 Z M10,70 L40,70 L40,75 L10,75 Z M15,55 L35,55 L35,60 L15,60 Z M10,50 L40,50 L40,55 L10,55 Z M15,35 L35,35 L35,40 L15,40 Z M20,30 L30,30 L30,35 L20,35 Z M22,10 L28,10 L28,30 L22,30 Z" />
              <path d="M24,2 L26,2 L26,10 L24,10 Z" />
            </svg>
          </div>
          <div className="absolute top-[20%] right-[2%] w-48 h-48 opacity-[0.015] text-[#2C1810]">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
               <path d="M50,95 L70,95 L70,98 L30,98 L30,95 L50,95 Z M45,95 L48,80 Q40,75 35,60 Q30,45 38,30 Q45,15 60,25 Q75,35 65,55 Q55,75 52,80 L55,95 Z" />
               <path d="M38,30 Q25,25 20,40 Q15,55 30,50 Z" />
               <path d="M60,25 Q75,20 85,35 Q95,50 75,45 Z" />
               <path d="M45,15 Q50,5 65,10 Q80,15 70,25 Z" />
            </svg>
          </div>
        </div>
      )}

      {activeField ? (
        <div className="w-full flex-1 flex flex-col items-center justify-start p-8 md:p-16 relative overflow-visible">
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@400;500;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
            
            .theme-japanese {
              background-color: #F9F4F0 !important;
              background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40a20 20 0 0 1 20-20 20 20 0 0 1 20 20H0zm20-20a20 20 0 0 1 20-20V0a20 20 0 0 1-20 20 20 20 0 0 1-20-20v20a20 20 0 0 1 20 20z' fill='%23d4c4b0' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E") !important;
            }

            .theme-japanese main > div > div, .theme-japanese form, .theme-japanese .form-card-editor {
              background-color: #FFFFFF !important;
              border-radius: 4px !important;
              border: 1px solid #D4C4B0 !important;
              box-shadow: 12px 12px 0px rgba(188, 36, 60, 0.05) !important;
              position: relative;
            }

            .theme-japanese .form-card-editor::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #BC243C 0%, #BC243C 50%, transparent 50%);
              z-index: 10;
              opacity: 0.8;
            }

            .theme-japanese .form-card-editor::after {
              content: '吉';
              position: absolute;
              top: 20px;
              right: 20px;
              width: 32px;
              height: 32px;
              border: 2px solid rgba(188, 36, 60, 0.85);
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: 'Zen Old Mincho', serif;
              font-size: 16px;
              font-weight: 700;
              color: rgba(188, 36, 60, 0.85);
              transform: rotate(5deg);
              pointer-events: none;
              z-index: 20;
            }
          `}</style>

          <div className="w-full max-w-2xl space-y-12 relative z-10 form-card-editor transition-all duration-500" style={resolvedCardStyle}>
            {/* Template Trigger */}
            <div className="absolute top-6 left-6">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-primary transition-all shadow-xs"
                title="Browse design templates"
              >
                <PaletteIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Title Section */}
              <div className="relative group/title">
                <div className="absolute -right-10 top-0 opacity-0 group-hover/title:opacity-100 transition-opacity">
                  <button onClick={() => setActivePopover('title')} className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm text-neutral-400 hover:text-primary">
                    <PaletteIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
                {activePopover === 'title' && <StylePopover type="title" onClose={() => setActivePopover(null)} />}
                <textarea
                  ref={labelRef}
                  value={localLabel}
                  onChange={(e) => setLocalLabel(e.target.value)}
                  onBlur={() => {
                    if (localLabel.trim() !== activeField.label) {
                      editFormFieldMutation.mutate({ id: activeField.id, label: localLabel.trim() });
                    }
                  }}
                  className="w-full bg-transparent text-3xl font-bold border-none focus:outline-none resize-none overflow-hidden"
                  style={{ 
                    color: activeValidation.labelColor || undefined,
                    fontFamily: activeValidation.labelFontFamily || undefined,
                    fontSize: activeValidation.labelFontSize || undefined,
                    fontWeight: activeValidation.labelFontWeight || undefined,
                    textAlign: activeValidation.labelAlignment || 'left',
                  } as React.CSSProperties}
                  placeholder="Enter your question..."
                />
              </div>

              {/* Description Section */}
              <div className="relative group/desc">
                <div className="absolute -right-10 top-0 opacity-0 group-hover/desc:opacity-100 transition-opacity">
                  <button onClick={() => setActivePopover('description')} className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm text-neutral-400 hover:text-primary">
                    <PaletteIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
                {activePopover === 'description' && <StylePopover type="description" onClose={() => setActivePopover(null)} />}
                <textarea
                  ref={descRef}
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  onBlur={() => {
                    if (localDescription.trim() !== (activeValidation.description || "")) {
                      editFormFieldMutation.mutate({ id: activeField.id, validation: { ...activeValidation, description: localDescription.trim() } });
                    }
                  }}
                  className="w-full bg-transparent text-lg opacity-60 border-none focus:outline-none resize-none overflow-hidden"
                  style={{ 
                    color: activeValidation.descriptionColor || undefined,
                    fontFamily: activeValidation.descriptionFontFamily || undefined,
                    fontSize: activeValidation.descriptionFontSize || undefined,
                    fontWeight: activeValidation.descriptionFontWeight || undefined,
                    textAlign: activeValidation.descriptionAlignment || 'left',
                  } as React.CSSProperties}
                  placeholder="Add a subtitle (optional)..."
                />
              </div>

              {/* Question Specific Inputs */}
              <QuestionInputRenderer />

              {/* Choices Editor */}
              <ChoiceEditor onOpenStylePopover={() => setActivePopover('choices')} renderPopover={() => <StylePopover type="choices" onClose={() => setActivePopover(null)} />} activePopover={activePopover} />
            </div>

            {/* Background Image/Media logic remains for now to keep things integrated */}
            <div className="pt-8 mt-8 border-t dark:border-neutral-800 space-y-8">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Media & Assets</h4>
                <div className="flex gap-2">
                   <button className="text-[10px] font-bold uppercase text-primary hover:underline">Add Image</button>
                   <button className="text-[10px] font-bold uppercase text-primary hover:underline">Add Background</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <FieldTypeSelector />
      )}

      <VisualTemplateModal 
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)} 
      />
    </main>
  );
});

QuestionEditor.displayName = "QuestionEditor";

export default QuestionEditor;
