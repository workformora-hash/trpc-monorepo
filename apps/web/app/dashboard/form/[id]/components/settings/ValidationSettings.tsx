import React, { useState, useRef, memo } from 'react';
import { useFormBuilderContext } from '../FormBuilderContext';
import { SidebarSection, SectionLabel } from './ui/SidebarPrimitives';
import { type ActiveValidationType } from '../QuestionEditor';

export const ValidationSettings = memo(() => {
  const { activeField, activeValidation: rawActiveValidation, editFormFieldMutation } = useFormBuilderContext();
  const activeValidation = rawActiveValidation as ActiveValidationType;

  const [localRules, setLocalRules] = useState({
    minLength: ((activeValidation?.minLength as number) ?? "") as number | "",
    maxLength: ((activeValidation?.maxLength as number) ?? "") as number | "",
    min: ((activeValidation?.min as number) ?? "") as number | "",
    max: ((activeValidation?.max as number) ?? "") as number | "",
  });

  const prevFieldIdRef = useRef<string | null>(null);
  const currentFieldId = activeField?.id || null;

  if (currentFieldId !== prevFieldIdRef.current) {
    prevFieldIdRef.current = currentFieldId;
    setLocalRules({
      minLength: ((activeValidation?.minLength as number) ?? "") as number | "",
      maxLength: ((activeValidation?.maxLength as number) ?? "") as number | "",
      min: ((activeValidation?.min as number) ?? "") as number | "",
      max: ((activeValidation?.max as number) ?? "") as number | "",
    });
  }

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
                    value={localRules.minLength}
                    onChange={(e) => setLocalRules(prev => ({ ...prev, minLength: e.target.value === "" ? "" : parseInt(e.target.value, 10) }))}
                    onBlur={() => updateValidation({ minLength: localRules.minLength === "" ? undefined : localRules.minLength })}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-1.5 text-xs"
                    placeholder="None"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Max Length</label>
                  <input 
                    type="number" 
                    value={localRules.maxLength}
                    onChange={(e) => setLocalRules(prev => ({ ...prev, maxLength: e.target.value === "" ? "" : parseInt(e.target.value, 10) }))}
                    onBlur={() => updateValidation({ maxLength: localRules.maxLength === "" ? undefined : localRules.maxLength })}
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
                  value={localRules.min}
                  onChange={(e) => setLocalRules(prev => ({ ...prev, min: e.target.value === "" ? "" : parseInt(e.target.value, 10) }))}
                  onBlur={() => updateValidation({ min: localRules.min === "" ? undefined : localRules.min })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Max Value</label>
                <input 
                  type="number" 
                  value={localRules.max}
                  onChange={(e) => setLocalRules(prev => ({ ...prev, max: e.target.value === "" ? "" : parseInt(e.target.value, 10) }))}
                  onBlur={() => updateValidation({ max: localRules.max === "" ? undefined : localRules.max })}
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
