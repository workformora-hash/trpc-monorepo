'use client';

import React, { useState, useEffect, memo } from 'react';
import { useFormBuilderContext } from '../FormBuilderContext';
import { SettingsToggleRow } from './ui/SettingsToggleRow';
import { SidebarSection, SectionLabel } from './ui/SidebarPrimitives';
import { type ActiveValidationType } from '../QuestionEditor';

export const ValidationSettings = memo(() => {
  const { activeField, activeValidation: rawActiveValidation, editFormFieldMutation } = useFormBuilderContext();
  const activeValidation = rawActiveValidation as ActiveValidationType;

  const [localMinLength, setLocalMinLength] = useState<number | "">((activeValidation?.minLength as number) ?? "");
  const [localMaxLength, setLocalMaxLength] = useState<number | "">((activeValidation?.maxLength as number) ?? "");
  const [localMin, setLocalMin] = useState<number | "">((activeValidation?.min as number) ?? "");
  const [localMax, setLocalMax] = useState<number | "">((activeValidation?.max as number) ?? "");

  useEffect(() => {
    setLocalMinLength((activeValidation?.minLength as number) ?? "");
    setLocalMaxLength((activeValidation?.maxLength as number) ?? "");
    setLocalMin((activeValidation?.min as number) ?? "");
    setLocalMax((activeValidation?.max as number) ?? "");
  }, [activeValidation?.minLength, activeValidation?.maxLength, activeValidation?.min, activeValidation?.max]);

  if (!activeField) return null;

  const updateValidation = (updates: Partial<ActiveValidationType>) => {
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: { ...activeValidation, ...updates }
    });
  };

  const isTextField = activeField.type === 'short_text' || activeField.type === 'long_text' || activeField.type === 'email';
  const isNumberField = activeField.type === 'number';
  const isRatingField = activeField.type === 'rating';

  return (
    <SidebarSection>
      <SectionLabel>Validation Rules</SectionLabel>
      <div className="space-y-4">
        {isTextField && (
          <div className="space-y-3">
             <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Min Length</label>
                  <input 
                    type="number" 
                    value={localMinLength}
                    onChange={(e) => setLocalMinLength(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                    onBlur={() => updateValidation({ minLength: localMinLength === "" ? undefined : localMinLength })}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-1.5 text-xs"
                    placeholder="None"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Max Length</label>
                  <input 
                    type="number" 
                    value={localMaxLength}
                    onChange={(e) => setLocalMaxLength(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                    onBlur={() => updateValidation({ maxLength: localMaxLength === "" ? undefined : localMaxLength })}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-1.5 text-xs"
                    placeholder="None"
                  />
                </div>
             </div>
          </div>
        )}

        {isNumberField && (
           <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Min Value</label>
                <input 
                  type="number" 
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                  onBlur={() => updateValidation({ min: localMin === "" ? undefined : localMin })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Max Value</label>
                <input 
                  type="number" 
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                  onBlur={() => updateValidation({ max: localMax === "" ? undefined : localMax })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>
           </div>
        )}

        {isRatingField && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Steps (Stars)</label>
            <input 
              type="number" 
              min={3} 
              max={10}
              value={activeValidation.maxStars || 5}
              onChange={(e) => updateValidation({ maxStars: parseInt(e.target.value, 10) })}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-bold"
            />
          </div>
        )}
      </div>
    </SidebarSection>
  );
});

ValidationSettings.displayName = 'ValidationSettings';
