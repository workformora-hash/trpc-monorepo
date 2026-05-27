'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface ThemeGridSectionProps {
  formMethods: UseFormReturn<any>;
  onEditForm: (fields: { theme: string }) => void;
}

export const ThemeGridSection = React.memo(({
  formMethods,
  onEditForm,
}: ThemeGridSectionProps) => {
  const { watch, setValue } = formMethods;
  const currentTheme = watch('theme') || 'default';

  const themes = [
    { id: 'default', name: 'Slate', color: 'bg-neutral-850 border-neutral-600' },
    { id: 'cyberpunk', name: 'Cyberpunk', color: 'bg-purple-650 border-pink-500' },
    { id: 'ocean', name: 'Ocean', color: 'bg-blue-500 border-sky-450' },
    { id: 'forest', name: 'Forest', color: 'bg-emerald-650 border-green-450' },
    { id: 'japanese', name: 'Japanese', color: 'bg-[#F9F4F0] border-[#BC243C]' },
  ];

  const handleSelectTheme = (id: string) => {
    setValue('theme', id);
    onEditForm({ theme: id });
  };

  return (
    <div className="space-y-4 pt-4 border-t dark:border-neutral-800">
      <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
        <Palette className="h-3.5 w-3.5" />
        <span>Form Color Themes</span>
      </h4>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {themes.map((t) => (
          <div
            key={t.id}
            onClick={() => handleSelectTheme(t.id)}
            className={`cursor-pointer py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center ${
              currentTheme === t.id
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'dark:border-neutral-800 border-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-950'
            }`}
          >
            <div className={`h-4 w-4 rounded-full border ${t.color}`} />
            <span className="text-[10px] font-bold dark:text-neutral-200 text-neutral-800">{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

ThemeGridSection.displayName = 'ThemeGridSection';
