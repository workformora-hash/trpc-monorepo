'use client';

import React, { memo } from 'react';
import { useFormBuilderContext } from '../FormBuilderContext';
import { ColorPickerRow } from './ui/ColorPickerRow';
import { SidebarSection, SectionLabel } from './ui/SidebarPrimitives';
import { type ActiveValidationType } from '../QuestionEditor';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export const AppearanceSettings = memo(() => {
  const { activeField, activeValidation: rawActiveValidation, editFormFieldMutation } = useFormBuilderContext();
  const activeValidation = rawActiveValidation as ActiveValidationType;

  if (!activeField) return null;

  const updateAppearance = (updates: Partial<ActiveValidationType>) => {
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: { ...activeValidation, ...updates }
    });
  };

  return (
    <SidebarSection>
      <SectionLabel>Appearance</SectionLabel>
      <div className="space-y-4">
        <ColorPickerRow 
          label="Active Color" 
          value={activeValidation.activeColor || "#6366f1"} 
          onChange={(val) => updateAppearance({ activeColor: val })} 
        />
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Alignment</label>
          <div className="flex bg-neutral-50 dark:bg-neutral-950 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800">
            {[
              { id: 'left', Icon: AlignLeft },
              { id: 'center', Icon: AlignCenter },
              { id: 'right', Icon: AlignRight },
            ].map((align) => (
              <button
                key={align.id}
                onClick={() => updateAppearance({ labelAlignment: align.id as any })}
                className={`flex-1 flex justify-center py-1.5 rounded-lg transition-all ${
                  (activeValidation.labelAlignment || 'left') === align.id ? 'bg-white dark:bg-neutral-800 shadow-xs text-primary' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <align.Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        <ColorPickerRow 
          label="Card BG" 
          value={activeValidation.cardBgColor || ""} 
          onChange={(val) => updateAppearance({ cardBgColor: val })} 
        />
      </div>
    </SidebarSection>
  );
});

AppearanceSettings.displayName = 'AppearanceSettings';
