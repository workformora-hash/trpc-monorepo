'use client';

import React from "react";
import { 
  Palette as PaletteIcon, 
  ChevronDown, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Type 
} from "lucide-react";
import { useFormBuilderContext } from "../FormBuilderContext";
import { type ActiveValidationType } from "../QuestionEditor";

interface StylePopoverProps {
  type: 'title' | 'description' | 'choices' | 'answer';
  onClose: () => void;
}

const PRESET_COLORS = [
  { name: 'Default', hex: '' },
  { name: 'Vermillion', hex: '#BC243C' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Sky', hex: '#0ea5e9' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Slate', hex: '#475569' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
];

const FONT_SIZES = ['14px', '16px', '18px', '20px', '24px', '32px', '40px', '48px'];
const FONT_WEIGHTS = [
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Extrabold', value: '800' },
];

const GOOGLE_FONTS = [
  { name: "Inter (Clean UI)", value: "Inter, sans-serif" },
  { name: "Outfit (Premium Geometric)", value: "Outfit, sans-serif" },
  { name: "Poppins (Warm & Friendly)", value: "Poppins, sans-serif" },
  { name: "Montserrat (Classic Modern)", value: "Montserrat, sans-serif" },
  { name: "DM Sans (Minimalist UI)", value: "DM Sans, sans-serif" },
  { name: "Satoshi (Premium Sans)", value: "Satoshi, sans-serif" },
  { name: "General Sans (Neo-Grotesque)", value: "General Sans, sans-serif" },
  { name: "Clash Display (Expressive display)", value: "Clash Display, sans-serif" },
  { name: "Raleway (Elegant High-Contrast)", value: "Raleway, sans-serif" },
  { name: "Nunito (Soft Rounded)", value: "Nunito, sans-serif" },
  { name: "Syne (Trendy Art)", value: "Syne, sans-serif" },
  { name: "Zen Old Mincho (Traditional)", value: "'Zen Old Mincho', serif" },
  { name: "Playfair Display (Vintage Serif)", value: '"Playfair Display", serif' },
  { name: "Merriweather (Classic Editorial Book)", value: "Merriweather, serif" },
  { name: "Lora (Contemporary Scholarly Serif)", value: "Lora, serif" },
  { name: "Fira Code (Developer Mono)", value: '"Fira Code", monospace' },
  { name: "Roboto Mono (Clean Tech Mono)", value: '"Roboto Mono", monospace' },
];

export const StylePopover = React.memo(({ type, onClose }: StylePopoverProps) => {
  const { activeField, editFormFieldMutation, activeValidation: rawActiveValidation } = useFormBuilderContext();
  const activeValidation = rawActiveValidation as ActiveValidationType;

  if (!activeField) return null;

  const updateStyle = (key: string, value: string | null) => {
    const fieldPrefix = type === 'title' ? 'label' : type === 'description' ? 'description' : type === 'choices' ? 'description' : 'answer';
    const styleKey = `${fieldPrefix}${key.charAt(0).toUpperCase() + key.slice(1)}`;
    
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: { ...activeValidation, [styleKey]: value || undefined }
    });
  };

  const currentPrefix = type === 'title' ? 'label' : type === 'description' ? 'description' : type === 'choices' ? 'description' : 'answer';
  const currentColor = (activeValidation[`${currentPrefix}Color`] as string) || '';
  const currentFont = (activeValidation[`${currentPrefix}FontFamily`] as string) || '';
  const currentSize = (activeValidation[`${currentPrefix}FontSize`] as string) || '';
  const currentWeight = (activeValidation[`${currentPrefix}FontWeight`] as string) || '';
  const currentAlign = (activeValidation[`${currentPrefix}Alignment`] as string) || 'left';

  return (
    <div 
      className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 rounded-2xl shadow-2xl z-50 p-5 animate-in fade-in zoom-in duration-150 origin-top-right"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-5">
        {/* Color Grid */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Text Color</span>
          <div className="grid grid-cols-6 gap-2">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => updateStyle('color', preset.hex)}
                className={`h-7 w-7 rounded-full border-2 transition-all ${
                  currentColor === preset.hex ? 'border-primary scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: preset.hex || '#A1A1AA' }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Font Family</span>
          <select
            value={currentFont}
            onChange={(e) => updateStyle('fontFamily', e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary transition-all font-medium"
          >
            <option value="">Theme default</option>
            {GOOGLE_FONTS.map(f => (
              <option key={f.value} value={f.value}>{f.name}</option>
            ))}
          </select>
        </div>

        {/* Alignment & Size */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Size</span>
            <select
              value={currentSize}
              onChange={(e) => updateStyle('fontSize', e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-primary transition-all font-medium"
            >
              <option value="">Default</option>
              {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Weight</span>
            <select
              value={currentWeight}
              onChange={(e) => updateStyle('fontWeight', e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-primary transition-all font-medium"
            >
              <option value="">Default</option>
              {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
          </div>
        </div>

        {/* Alignment */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Alignment</span>
          <div className="flex bg-neutral-50 dark:bg-neutral-950 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800">
            {[
              { id: 'left', Icon: AlignLeft },
              { id: 'center', Icon: AlignCenter },
              { id: 'right', Icon: AlignRight },
            ].map((align) => (
              <button
                key={align.id}
                onClick={() => updateStyle('alignment', align.id)}
                className={`flex-1 flex justify-center py-1.5 rounded-lg transition-all ${
                  currentAlign === align.id ? 'bg-white dark:bg-neutral-800 shadow-xs text-primary' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <align.Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-neutral-150 dark:border-neutral-800 flex justify-end">
        <button
          onClick={onClose}
          className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
});

StylePopover.displayName = 'StylePopover';
