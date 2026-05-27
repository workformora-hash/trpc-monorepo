'use client';

import React, { memo } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { useFormBuilderContext } from './FormBuilderContext';

// Modular Settings Components
import { GeneralSettings } from './settings/GeneralSettings';
import { ValidationSettings } from './settings/ValidationSettings';
import { AppearanceSettings } from './settings/AppearanceSettings';
import { MediaSettings } from './settings/MediaSettings';
import { PresetSelector } from './settings/PresetSelector';

export const SettingsSidebar = memo(() => {
  const { activeField } = useFormBuilderContext();

  if (!activeField) {
    return (
      <aside className="w-80 border-l dark:border-neutral-800 border-neutral-200 bg-white dark:bg-neutral-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="h-16 w-16 bg-neutral-50 dark:bg-neutral-900 rounded-2xl flex items-center justify-center mb-4">
          <SettingsIcon className="h-8 w-8 text-neutral-300" />
        </div>
        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">No field selected</h3>
        <p className="text-xs text-neutral-500 mt-2">Select a field on the canvas to configure its settings and appearance.</p>
      </aside>
    );
  }

  const isSpecialScreen = activeField.type === 'welcome' || activeField.type === 'thank_you';

  return (
    <aside className="w-80 border-l dark:border-neutral-800 border-neutral-200 bg-white dark:bg-neutral-950 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b dark:border-neutral-800 border-neutral-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <SettingsIcon className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-200">Question Settings</h2>
        </div>
      </div>

      {/* Settings Scroll Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        {/* Type Identifier */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white dark:bg-neutral-800 shadow-xs flex items-center justify-center text-[10px] font-bold text-primary border border-neutral-150 dark:border-neutral-750">
             {activeField.type.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight leading-none">Field Type</div>
            <div className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">{activeField.type.replace('_', ' ')}</div>
          </div>
        </div>

        {!isSpecialScreen && <GeneralSettings />}
        
        {isSpecialScreen && <PresetSelector />}

        <ValidationSettings />
        
        <AppearanceSettings />
        
        <MediaSettings />

        {/* Footer info */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-center">
          <p className="text-[9px] text-neutral-400 font-medium">Changes are saved automatically to the cloud.</p>
        </div>
      </div>
    </aside>
  );
});

SettingsSidebar.displayName = 'SettingsSidebar';

export default SettingsSidebar;
