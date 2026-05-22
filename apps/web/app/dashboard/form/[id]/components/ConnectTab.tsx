'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { toast } from 'sonner';

const HubSpotIcon = () => (
  <svg className="w-4 h-4 text-[#ff7a59]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.91 10.42c-.22-.19-.48-.31-.76-.36-.08-.47-.32-.9-.67-1.22-.38-.34-.87-.52-1.37-.52-.39 0-.77.11-1.1.32-.42-.51-.97-.88-1.59-1.07V4.73c.49-.17.84-.63.84-1.18 0-.69-.56-1.25-1.25-1.25S11.91 2.86 11.91 3.55c0 .55.35 1.01.84 1.18V7.57c-.62.19-1.17.56-1.59 1.07-.33-.21-.71-.32-1.1-.32-.5 0-.99.18-1.37.52-.35.32-.59.75-.67 1.22-.28.05-.54.17-.76.36-.56.49-.87 1.18-.87 1.91s.31 1.42.87 1.91c.22.19.48.31.76.36.08.47.32.9.67 1.22.38.34.87.52 1.37.52.39 0 7.37-.11 7.7-.32.42.51.97.88 1.59 1.07v2.84c-.49.17-.84.63-.84 1.18 0 .69.56 1.25 1.25 1.25s1.25-.56 1.25-1.25c0-.55-.35-1.01-.84-1.18v-2.84c.62-.19 1.17-.56 1.59-1.07.33.21.71.32 1.1.32.5 0 .99-.18 1.37-.52.35-.32.59-.75.67-1.22.28-.05.54-.17.76-.36.56-.49.87-1.18.87-1.91s-.31-1.42-.87-1.91zm-7.66 1.91c0-.41.33-.75.75-.75s.75.34.75.75-.33.75-.75.75-.75-.34-.75-.75z" />
  </svg>
);

export function ConnectTab() {
  const handleConfigureHubspot = () => {
    toast.success('HubSpot integration settings are synced!');
  };

  return (
    <div className="flex-1 bg-[#f9f9fb] dark:bg-neutral-955 p-10 overflow-y-auto">
      <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-2xl p-8 space-y-6 shadow-sm text-left">
        <div className="border-b pb-2 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold dark:text-neutral-100 text-neutral-800">Connected Integrations</h3>
            <p className="text-xs text-neutral-500">
              Synchronize your form leads, submissions and parameters directly to CRM systems.
            </p>
          </div>
          <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
        </div>

        {/* HubSpot CRM card */}
        <div className="p-6 rounded-2xl border dark:border-neutral-800 border-neutral-200 flex items-start gap-4 hover:shadow-xs transition-all relative">
          <div className="p-3 rounded-xl bg-[#ff7a59]/10 text-[#ff7a59]">
            <HubSpotIcon />
          </div>
          <div className="flex-1 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold dark:text-neutral-200 text-neutral-850">HubSpot Lead Syncing</span>
              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Sync Active
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              Every submission registers immediately as a qualified lead in your HubSpot workspace with visual tracking
              matching.
            </p>
            <div className="pt-2">
              <Button type="button" variant="outline" onClick={handleConfigureHubspot} className="text-[10px] font-bold h-8 px-4">
                Configure HubSpot mapping
              </Button>
            </div>
          </div>
        </div>

        {/* Zapier placeholder */}
        <div className="p-6 rounded-2xl border border-dashed dark:border-neutral-800 border-neutral-250 flex items-start gap-4 opacity-80 hover:opacity-100 transition-all">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold dark:text-neutral-300 text-neutral-800">
                Zapier Automation Triggers
              </span>
              <span className="text-[9px] font-semibold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                Setup Guide
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              Connect FormBuilder to 1000+ app automations via custom triggers premium tier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
