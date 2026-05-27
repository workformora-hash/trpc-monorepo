'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface LinkDiscoverySectionProps {
  formMethods: UseFormReturn<any>;
  onEditForm: (fields: { slug?: string; visibility?: 'public' | 'unlisted' }) => void;
}

export const LinkDiscoverySection = React.memo(({
  formMethods,
  onEditForm,
}: LinkDiscoverySectionProps) => {
  const { register, formState: { errors } } = formMethods;

  return (
    <div className="space-y-4 pt-4 border-t dark:border-neutral-800">
      <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
        <Globe className="h-3.5 w-3.5" />
        <span>Link & Discovery</span>
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Custom Link (Slug) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold dark:text-neutral-300 text-neutral-600">Custom URL Slug</label>
          <div className="flex items-center gap-1.5 dark:bg-neutral-950 bg-white border dark:border-neutral-800 border-neutral-250 rounded-xl px-4 py-2.5 text-xs focus-within:border-primary transition-all">
            <span className="text-neutral-400 font-semibold select-none">/f/</span>
            <input
              type="text"
              {...register('slug', {
                onBlur: (e) => {
                  const val = e.target.value.trim().toLowerCase();
                  if (val && !errors.slug) {
                    onEditForm({ slug: val });
                  }
                }
              })}
              className="flex-1 bg-transparent focus:outline-none dark:text-neutral-200 text-neutral-800 font-semibold"
            />
          </div>
          {errors.slug && <p className="text-[10px] text-red-500 font-bold">{errors.slug.message as string}</p>}
        </div>

        {/* Form Visibility */}
        <div className="space-y-1">
          <label className="text-xs font-semibold dark:text-neutral-300 text-neutral-600">Form Visibility</label>
          <select
            {...register('visibility', {
              onChange: (e) => {
                onEditForm({ visibility: e.target.value });
              }
            })}
            className="w-full dark:bg-neutral-955 bg-white border dark:border-neutral-800 border-neutral-250 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:text-neutral-200 text-neutral-800 font-semibold transition-all h-[38px]"
          >
            <option value="unlisted">Unlisted (Private link only)</option>
            <option value="public">Public (Discoverable in search)</option>
          </select>
        </div>
      </div>
    </div>
  );
});

LinkDiscoverySection.displayName = 'LinkDiscoverySection';
