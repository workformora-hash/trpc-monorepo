'use client';

import React from 'react';
import { Sparkles, Check } from 'lucide-react';

interface User {
  name: string;
  email: string;
}

interface ProfileTabProps {
  user: User;
}

export const ProfileTab = React.memo(({ user }: ProfileTabProps) => {
  return (
    <div className="space-y-8 max-w-2xl mx-auto dark:bg-neutral-900 bg-white border dark:border-neutral-800 border-border p-8 rounded-2xl shadow-sm text-left animate-fadeIn">
      <div>
        <h1 className="text-2xl font-light dark:text-neutral-100 text-foreground">Account Settings</h1>
        <p className="dark:text-neutral-400 text-muted-foreground text-sm mt-1">Manage your creator profile and preferences.</p>
      </div>

      <div className="space-y-4 pt-4 border-t dark:border-neutral-800 border-border">
        <div className="grid grid-cols-3 gap-4 py-3 border-b dark:border-neutral-800/50 border-border/50">
          <span className="text-sm dark:text-neutral-400 text-muted-foreground font-medium">Full Name</span>
          <span className="text-sm font-bold col-span-2 text-foreground">{user.name}</span>
        </div>
        <div className="grid grid-cols-3 gap-4 py-3 border-b dark:border-neutral-800/50 border-border/50">
          <span className="text-sm text-neutral-400 font-medium">Email Address</span>
          <span className="text-sm font-bold col-span-2 text-foreground">{user.email}</span>
        </div>
        <div className="grid grid-cols-3 gap-4 py-3">
          <span className="text-sm text-neutral-400 font-medium">Status</span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 inline-flex w-fit items-center gap-1 uppercase tracking-wider">
            <Check className="h-3 w-3 stroke-[3]" /> Active Creator
          </span>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3 mt-8 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
           <Sparkles className="h-24 w-24 text-primary" />
        </div>
        <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="relative z-10">
          <h4 className="text-sm font-bold text-foreground">You are on the Free Tier</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Upgrade to Premium for custom domains, unlimited forms, custom branding, and advanced logic branching.</p>
          <button className="mt-3 text-[10px] font-extrabold uppercase tracking-widest text-primary hover:underline">View Plans →</button>
        </div>
      </div>
    </div>
  );
});

ProfileTab.displayName = 'ProfileTab';
