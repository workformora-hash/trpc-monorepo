'use client';

import React from 'react';
import { Loader2, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface Template {
  id: string;
  name: string;
  description: string;
  fields: any[];
}

interface TemplatesTabProps {
  templates: Template[];
  isLoading: boolean;
  onUseTemplate: (id: string) => void;
  cloningTemplateId: string | null;
}

export const TemplatesTab = React.memo(({
  templates,
  isLoading,
  onUseTemplate,
  cloningTemplateId
}: TemplatesTabProps) => {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn text-left">
      <div>
        <h1 className="text-3xl font-light tracking-tight dark:text-neutral-100 text-foreground">Templates Gallery</h1>
        <p className="dark:text-neutral-400 text-muted-foreground text-sm mt-1 leading-relaxed">Select a pre-made form blueprint to jumpstart your workflow and professional design.</p>
      </div>

      <menu className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <li 
            key={template.id} 
            className="group dark:bg-neutral-900 bg-white border dark:border-neutral-850 border-neutral-200 p-6 rounded-2xl hover:border-primary/50 transition-all flex flex-col justify-between h-64 shadow-xs hover:shadow-md"
          >
            <div>
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest flex items-center gap-1.5">
                <Sparkles className="size-3" />
                <span>Blueprint</span>
              </span>
              <h3 className="text-base font-semibold dark:text-neutral-100 text-neutral-800 mt-2 line-clamp-1">{template.name}</h3>
              <p className="text-xs dark:text-neutral-400 text-neutral-500 mt-2 line-clamp-2 leading-relaxed">{template.description}</p>
              
              <div className="mt-3 text-[10px] dark:text-neutral-500 text-neutral-400 font-bold uppercase tracking-wider">
                {template.fields.length} questions included
              </div>
            </div>

            <div className="pt-4 border-t dark:border-neutral-800 border-neutral-100 mt-4">
              <Button
                disabled={cloningTemplateId !== null}
                onClick={() => onUseTemplate(template.id)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-10 flex items-center justify-center gap-1.5 rounded-xl shadow-sm active:scale-95 transition-all"
              >
                {cloningTemplateId === template.id ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Cloning template…</span>
                  </>
                ) : (
                  <>
                    <span>Use this blueprint</span>
                    <ChevronRight className="size-3.5" />
                  </>
                )}
              </Button>
            </div>
          </li>
        ))}
      </menu>
    </div>
  );
});

TemplatesTab.displayName = 'TemplatesTab';
