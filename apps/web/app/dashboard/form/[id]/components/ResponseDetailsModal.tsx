'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface FieldItem {
  id: string;
  label: string;
  type: string;
}

interface ResponseItem {
  id: string;
  answers: unknown;
}

interface ResponseDetailsModalProps {
  responseId: string | null;
  onClose: () => void;
  responses: ResponseItem[];
  fields: FieldItem[];
}

export function ResponseDetailsModal({
  responseId,
  onClose,
  responses,
  fields,
}: ResponseDetailsModalProps) {
  if (!responseId) return null;

  const targetRes = responses.find((r) => r.id === responseId);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl w-full max-w-lg p-6 space-y-5 animate-scaleIn text-left">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-xs font-bold text-neutral-400 uppercase">Submissions Details</span>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600 focus:outline-none">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-2">
          {!targetRes ? (
            <p className="text-xs text-neutral-400 italic">Submission logs not found.</p>
          ) : (
            fields.map((field) => {
              const answerObj = (targetRes.answers || {}) as Record<string, unknown>;
              const ans = answerObj[field.id] ?? 'No answer provided.';
              return (
                <div key={field.id} className="space-y-1">
                  <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
                    {field.label || 'Untitled question'}
                  </span>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-955 border dark:border-neutral-850 rounded-xl text-xs font-semibold dark:text-neutral-200 text-neutral-800 leading-relaxed break-words">
                    {typeof ans === 'object' ? JSON.stringify(ans) : String(ans)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t dark:border-neutral-800">
          <Button onClick={onClose} className="w-full text-xs font-bold h-10 rounded-xl">
            Close Log Details
          </Button>
        </div>
      </div>
    </div>
  );
}
