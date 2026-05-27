'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ExploreForm {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  theme: string;
}

interface ExploreTabProps {
  forms: ExploreForm[];
  isLoading: boolean;
}

export const ExploreTab = React.memo(({
  forms,
  isLoading
}: ExploreTabProps) => {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn text-left">
      <div>
        <h1 className="text-3xl font-light tracking-tight dark:text-neutral-100 text-foreground">Explore Templates & Gallery</h1>
        <p className="dark:text-neutral-400 text-muted-foreground text-sm mt-2 leading-relaxed">See what other creators are building, and get inspired by public forms from the community.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <div key={form.id} className="dark:bg-neutral-900 bg-white border dark:border-neutral-800 border-border p-6 rounded-xl hover:border-primary/50 transition-all flex flex-col justify-between h-52 shadow-xs hover:shadow-md">
            <div>
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest">{form.theme} theme</span>
              <h3 className="text-base font-semibold dark:text-neutral-100 text-foreground mt-2 line-clamp-1">{form.title}</h3>
              <p className="text-xs dark:text-neutral-400 text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{form.description || "No description provided."}</p>
            </div>
            <div className="flex items-center justify-between text-[11px] dark:text-neutral-500 text-muted-foreground/80 pt-4 border-t dark:border-neutral-800 border-border">
              <span>Creator ID: {form.userId.slice(0, 8)}...</span>
            </div>
          </div>
        ))}

        {forms.length === 0 && (
          <div className="col-span-full text-center py-24 dark:text-neutral-500 text-muted-foreground/80 border-2 border-dashed dark:border-neutral-800 rounded-xl bg-muted/10">
            <p className="text-sm font-medium italic">No public forms found in explore gallery yet. Be the first to publish one!</p>
          </div>
        )}
      </div>
    </div>
  );
});

ExploreTab.displayName = 'ExploreTab';
