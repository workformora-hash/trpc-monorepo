'use client';

import React from 'react';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { toast } from 'sonner';

export type FormTab = 'content' | 'workflow' | 'connect' | 'share' | 'results';

interface FormHeaderProps {
  formId: string;
  formTitle: string;
  isPublished: boolean;
  activeTab: FormTab;
  setActiveTab: (tab: FormTab) => void;
  onTitleChange: (newTitle: string) => void;
  onPublishToggle: () => void;
  themeMounted: boolean;
  theme: string | undefined;
  setTheme: (theme: 'light' | 'dark') => void;
  userName?: string | null;
  refetchResponses: () => void;
  refetchAnalytics: () => void;
}

export function FormHeader({
  formId,
  formTitle,
  isPublished,
  activeTab,
  setActiveTab,
  onTitleChange,
  onPublishToggle,
  themeMounted,
  theme,
  setTheme,
  userName,
  refetchResponses,
  refetchAnalytics,
}: FormHeaderProps) {
  return (
    <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 bg-white dark:bg-neutral-900 z-40 select-none">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 flex items-center gap-1 transition-colors"
        >
          &lt; My workspace
        </Link>
        <span className="text-neutral-300 font-light">/</span>
        <input
          type="text"
          defaultValue={formTitle}
          onBlur={(e) => {
            const val = e.target.value.trim();
            if (val && val !== formTitle) {
              onTitleChange(val);
            }
          }}
          className="text-xs font-bold text-neutral-800 dark:text-neutral-200 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-primary focus:outline-none px-1 py-0.5 transition-all"
        />
      </div>

      {/* Nav Center Tabs */}
      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-950 p-1 rounded-full border border-neutral-200 dark:border-neutral-800/80">
        {(['content', 'workflow', 'connect', 'share', 'results'] as const).map((tab) => {
          const labels: Record<FormTab, string> = {
            content: 'Content',
            workflow: 'Workflow',
            connect: 'Connect',
            share: 'Share',
            results: 'Results',
          };
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'results') {
                  refetchResponses();
                  refetchAnalytics();
                }
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-955 dark:hover:text-neutral-200'
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {themeMounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="border dark:border-neutral-800 border-neutral-200 h-8 w-8 hover:bg-neutral-50 dark:hover:bg-neutral-950 rounded-lg text-neutral-500"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}

        <button
          onClick={() => toast.info('Premium plans tier active!')}
          className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-xs hover:bg-emerald-500/15 transition-all uppercase tracking-wider"
        >
          View plans
        </button>

        <button
          onClick={onPublishToggle}
          className={`text-xs font-semibold px-4 py-1.5 h-8 rounded-lg transition-all ${
            isPublished
              ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              : 'bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-md shadow-primary/10'
          }`}
        >
          {isPublished ? 'Unpublish' : 'Publish'}
        </button>

        <div className="h-7 w-7 rounded-full bg-neutral-800 dark:bg-neutral-700 text-white flex items-center justify-center text-xs font-bold select-none shadow-xs">
          {userName ? userName.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
}
