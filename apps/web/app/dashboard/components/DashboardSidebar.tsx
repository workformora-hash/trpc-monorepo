'use client';

import React from 'react';
import { 
  LayoutDashboard, Globe, Sparkles, User
} from 'lucide-react';

export type DashboardTab = 'forms' | 'explore' | 'templates' | 'profile';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  isMobileOpen?: boolean;
}

export const DashboardSidebar = React.memo(({
  activeTab,
  setActiveTab,
  isMobileOpen
}: DashboardSidebarProps) => {
  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 border-r dark:border-neutral-800 border-border dark:bg-neutral-900 bg-neutral-100 p-6 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:bg-neutral-100/50 md:dark:bg-neutral-900/30
      ${isMobileOpen ? 'translate-x-0 pt-20' : '-translate-x-full'}
    `}>
      <div className="space-y-6">
        <div className="space-y-1">
          <button 
            onClick={() => setActiveTab('forms')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              activeTab === 'forms' ? 'bg-primary text-primary-foreground font-medium' : 'dark:text-neutral-400 text-muted-foreground dark:hover:text-neutral-100 hover:text-foreground dark:hover:bg-neutral-900 hover:bg-neutral-200/50'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" /> My Forms
          </button>
          <button 
            onClick={() => setActiveTab('explore')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              activeTab === 'explore' ? 'bg-primary text-primary-foreground font-medium' : 'dark:text-neutral-400 text-muted-foreground dark:hover:text-neutral-100 hover:text-foreground dark:hover:bg-neutral-900 hover:bg-neutral-200/50'
            }`}
          >
            <Globe className="h-4 w-4" /> Explore Gallery
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              activeTab === 'templates' ? 'bg-primary text-primary-foreground font-medium' : 'dark:text-neutral-400 text-muted-foreground dark:hover:text-neutral-100 hover:text-foreground dark:hover:bg-neutral-900 hover:bg-neutral-200/50'
            }`}
          >
            <Sparkles className="h-4 w-4" /> Templates Gallery
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              activeTab === 'profile' ? 'bg-primary text-primary-foreground font-medium' : 'dark:text-neutral-400 text-muted-foreground dark:hover:text-neutral-100 hover:text-foreground dark:hover:bg-neutral-900 hover:bg-neutral-200/50'
            }`}
          >
            <User className="h-4 w-4" /> My Account
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl dark:bg-neutral-900/60 bg-white border dark:border-neutral-800 border-border text-center shadow-sm">
        <Sparkles className="h-5 w-5 text-primary mx-auto mb-2" />
        <div className="text-xs font-semibold text-foreground">Starter Plan</div>
        <div className="text-[10px] dark:text-neutral-400 text-muted-foreground mt-1">Up to 5 forms & unlimited submissions</div>
      </div>
    </aside>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';
