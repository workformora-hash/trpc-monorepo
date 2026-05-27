'use client';

import React, { useSyncExternalStore } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { toast } from 'sonner';

const emptySubscribe = () => () => {};
const getSnapshot = () => window.location.origin;
const getServerSnapshot = () => '';

interface Form {
  isPublished: boolean;
  slug: string;
}

interface ShareTabProps {
  form: Form;
}

export function ShareTab({ form }: ShareTabProps) {
  const origin = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  const publicUrl = form.isPublished
    ? `${origin}/form/${form.slug}`
    : 'Form must be Published to access public URL.';

  const iframeEmbedCode = form.isPublished
    ? `<iframe src="${origin}/form/${form.slug}" width="100%" height="600px" frameborder="0" style="border:none;border-radius:12px;"></iframe>`
    : 'Publish form to generate iframe responsive snippet.';

  const handleCopyLink = () => {
    if (!form.isPublished) return;
    navigator.clipboard.writeText(`${origin}/form/${form.slug}`);
    toast.success('Public URL link copied to clipboard!');
  };

  return (
    <div className="flex-1 bg-[#f9f9fb] dark:bg-neutral-955 p-10 overflow-y-auto">
      <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-2xl p-8 space-y-6 shadow-sm text-left">
        <div className="border-b pb-2">
          <h3 className="text-lg font-bold dark:text-neutral-100 text-neutral-850">Share your Form</h3>
          <p className="text-xs text-neutral-500 font-medium">
            Distribute public link pages or embed inline response cards on landing portals.
          </p>
        </div>

        <div className="space-y-4">
          {/* Public URL Link */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">Public URL Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 dark:bg-neutral-950 bg-neutral-50 border dark:border-neutral-800 border-neutral-250 rounded-xl px-4 py-2.5 text-xs text-neutral-650 focus:outline-none select-all"
              />
              <Button
                disabled={!form.isPublished}
                onClick={handleCopyLink}
                className="bg-primary text-primary-foreground text-xs font-semibold px-4 rounded-xl shadow-xs"
              >
                Copy Link
              </Button>
            </div>
          </div>

          {/* Iframe Embed */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">Responsive Iframe Embed</label>
            <textarea
              readOnly
              value={iframeEmbedCode}
              className="w-full dark:bg-neutral-955 bg-neutral-50 border dark:border-neutral-800 border-neutral-200 rounded-xl p-3 text-[10px] text-neutral-505 font-mono focus:outline-none h-20 select-all resize-none leading-relaxed"
            />
          </div>

          {/* Draft warning */}
          {!form.isPublished && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-600 flex gap-2 text-left">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <span className="font-bold">Form is in Draft status</span>
                <p className="text-[10px] text-neutral-500">
                  Only you can view and preview this draft in builder canvas. Publish it to enable sharing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
