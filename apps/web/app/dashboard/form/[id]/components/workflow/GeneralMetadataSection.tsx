'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';

interface GeneralMetadataSectionProps {
  formMethods: UseFormReturn<any>;
  onEditForm: (fields: { title?: string; description?: string | null }) => void;
}

export const GeneralMetadataSection = React.memo(({
  formMethods,
  onEditForm,
}: GeneralMetadataSectionProps) => {
  const { register, formState: { errors } } = formMethods;

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">General Metadata</h4>

      {/* Form Title */}
      <div className="space-y-1">
        <label className="text-xs font-semibold dark:text-neutral-300 text-neutral-600">Form Title</label>
        <input
          type="text"
          {...register('title', {
            onBlur: (e) => {
              const val = e.target.value.trim();
              if (val) onEditForm({ title: val });
            }
          })}
          className="w-full dark:bg-neutral-950 bg-white border dark:border-neutral-800 border-neutral-250 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:text-neutral-200 text-neutral-800 transition-all"
        />
        {errors.title && <p className="text-[10px] text-red-500 font-bold">{errors.title.message as string}</p>}
      </div>

      {/* Form Description */}
      <div className="space-y-1">
        <label className="text-xs font-semibold dark:text-neutral-300 text-neutral-600">Form Description</label>
        <textarea
          {...register('description', {
            onBlur: (e) => {
              const val = e.target.value.trim();
              onEditForm({ description: val || null });
            }
          })}
          placeholder="Brief description to display under the form title..."
          className="w-full dark:bg-neutral-955 bg-white border dark:border-neutral-800 border-neutral-250 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 h-20 resize-none dark:text-neutral-200 text-neutral-800 transition-all"
        />
        {errors.description && <p className="text-[10px] text-red-500 font-bold">{errors.description.message as string}</p>}
      </div>
    </div>
  );
});

GeneralMetadataSection.displayName = 'GeneralMetadataSection';
