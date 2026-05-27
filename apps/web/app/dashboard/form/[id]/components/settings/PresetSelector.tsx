'use client';

import React, { memo } from 'react';
import { useFormBuilderContext } from '../FormBuilderContext';
import { SidebarSection, SectionLabel } from './ui/SidebarPrimitives';
import { WELCOME_PRESETS, THANK_YOU_PRESETS } from './Presets';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const PresetSelector = memo(() => {
  const { activeField, editFormFieldMutation, setLocalLabel, setLocalDescription } = useFormBuilderContext();

  if (!activeField) return null;

  const handleApplyPreset = (preset: any) => {
    setLocalLabel(preset.label);
    setLocalDescription(preset.validation.description || "");
    editFormFieldMutation.mutate({
      id: activeField.id,
      label: preset.label,
      validation: preset.validation,
    });
    toast.success(`Applied "${preset.name}" template!`);
  };

  const presets = activeField.type === "welcome" ? WELCOME_PRESETS : THANK_YOU_PRESETS;

  return (
    <SidebarSection>
      <SectionLabel>Screen Templates</SectionLabel>
      <div className="grid grid-cols-1 gap-2.5">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleApplyPreset(preset)}
            className="text-left p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[11px] font-bold dark:text-neutral-200 text-neutral-800 group-hover:text-primary transition-colors">{preset.name}</span>
            </div>
            <p className="text-[9px] text-neutral-500 leading-relaxed line-clamp-2">{preset.description}</p>
          </button>
        ))}
      </div>
    </SidebarSection>
  );
});

PresetSelector.displayName = 'PresetSelector';
