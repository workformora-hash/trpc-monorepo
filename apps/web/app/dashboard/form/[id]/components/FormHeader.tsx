'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Sun, Moon, Eye, Loader2, ChevronRight, Zap, Globe } from 'lucide-react';

export type FormTab = 'content' | 'logic' | 'workflow' | 'connect' | 'share' | 'results';

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
  onPreviewOpen: () => void;
  isSaving?: boolean;
}

const TAB_CONFIG: { id: FormTab; label: string }[] = [
  { id: 'content', label: 'Build' },
  { id: 'logic', label: 'Logic' },
  { id: 'workflow', label: 'Settings' },
  { id: 'connect', label: 'Connect' },
  { id: 'share', label: 'Share' },
  { id: 'results', label: 'Results' },
];

export function FormHeader({
  formId: _formId,
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
  onPreviewOpen,
  isSaving,
}: FormHeaderProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState<string | null>(null);
  const localTitle = draftTitle ?? formTitle;

  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.focus();
      node.select();
    }
  }, []);

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (draftTitle !== null) {
      const trimmed = draftTitle.trim();
      if (trimmed && trimmed !== formTitle) onTitleChange(trimmed);
      setDraftTitle(null);
    }
  };

  return (
    <header className="h-13 border-b border-neutral-150 dark:border-neutral-800/80 flex items-center justify-between px-5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm z-40 select-none shrink-0" style={{ height: '52px' }}>
      
      {/* Left: Breadcrumb + editable title */}
      <div className="flex items-center gap-2 min-w-0">
        <Link
          href="/dashboard"
          className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
        >
          Workspace
        </Link>
        <ChevronRight className="h-3 w-3 text-neutral-300 dark:text-neutral-700 shrink-0" />

        {editingTitle ? (
          <input
            ref={inputRef}
            value={localTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') handleTitleBlur(); if (e.key === 'Escape') { setDraftTitle(null); setEditingTitle(false); } }}
            className="text-xs font-bold text-neutral-800 dark:text-neutral-100 bg-transparent border-b border-primary focus:outline-none px-1 min-w-0 max-w-[200px]"
          />
        ) : (
          <button
            onClick={() => { setDraftTitle(null); setEditingTitle(true); }}
            className="text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white truncate max-w-[180px] text-left transition-colors group flex items-center gap-1.5"
            title="Click to rename"
          >
            <span className="truncate">{formTitle}</span>
            <span className="opacity-0 group-hover:opacity-40 text-[9px] shrink-0 transition-opacity">✎</span>
          </button>
        )}

        {/* Live save indicator */}
        {isSaving && (
          <div className="flex items-center gap-1 text-[10px] text-neutral-400 shrink-0 animate-fadeIn">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            <span className="hidden sm:block">Saving…</span>
          </div>
        )}
      </div>

      {/* Center: Tab nav */}
      <nav className="flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'results') { refetchResponses(); refetchAnalytics(); }
            }}
            className={`relative px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-500 dark:text-neutral-450 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-850'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        {themeMounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Preview */}
        <button
          onClick={onPreviewOpen}
          className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] font-bold text-neutral-600 dark:text-neutral-350 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 transition-all active:scale-95"
        >
          <Eye className="h-3 w-3" />
          Preview
        </button>

        {/* Publish */}
        <button
          onClick={onPublishToggle}
          className={`flex items-center gap-1.5 h-7 px-3.5 rounded-lg text-[11px] font-bold transition-all active:scale-95 ${
            isPublished
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
              : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-sm'
          }`}
        >
          {isPublished ? (
            <><Globe className="h-3 w-3" /><span>Published</span></>
          ) : (
            <><Zap className="h-3 w-3" /><span>Publish</span></>
          )}
        </button>

        {/* Avatar */}
        <div
          className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center text-[11px] font-bold shadow-sm"
          title={userName || 'User'}
        >
          {userName ? userName.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
}
