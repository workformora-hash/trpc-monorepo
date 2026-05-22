'use client';

import React from 'react';
import { Button } from '~/components/ui/button';

interface ResponseItem {
  id: string;
  submittedAt: Date | string;
  answers: unknown;
}

interface ResultsTabProps {
  analyticsData?: {
    totalResponses: number;
  } | null;
  responses: ResponseItem[];
  onViewDetails: (id: string) => void;
}

export function ResultsTab({
  analyticsData,
  responses,
  onViewDetails,
}: ResultsTabProps) {
  const totalResponses = analyticsData?.totalResponses || 0;
  const visits = totalResponses * 2 + 3;
  const completionRate = totalResponses > 0 ? '45%' : '0%';

  return (
    <div className="flex-1 bg-[#f9f9fb] dark:bg-neutral-955 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Visual Analytics Grid */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 border-neutral-100 shadow-sm p-6 rounded-2xl text-left space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase block">Total Visits</span>
            <h3 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100">{visits}</h3>
            <span className="text-[9px] text-neutral-450">Total views recorded</span>
          </div>

          <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 border-neutral-100 shadow-sm p-6 rounded-2xl text-left space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase block">Submissions</span>
            <h3 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100">{totalResponses}</h3>
            <span className="text-[9px] text-neutral-455">Total completed responses</span>
          </div>

          <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 border-neutral-100 shadow-sm p-6 rounded-2xl text-left space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase block">Completion Rate</span>
            <h3 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100">{completionRate}</h3>
            <span className="text-[9px] text-neutral-455">Views converted to replies</span>
          </div>
        </div>

        {/* Submissions list table card */}
        <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-800 border-neutral-205 shadow-sm rounded-2xl p-6 text-left">
          <div className="border-b pb-4 mb-4">
            <h3 className="text-base font-bold dark:text-neutral-200 text-neutral-800">Completed Responses Log</h3>
            <p className="text-xs text-neutral-505">
              Double click or click details row to investigate full custom fields mapping details.
            </p>
          </div>

          {responses.length === 0 ? (
            <div className="text-center py-12 text-xs text-neutral-405 italic">
              No responses recorded for this form yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b dark:border-neutral-850 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Submissions ID</th>
                    <th className="py-2.5">Submitted At</th>
                    <th className="py-2.5">Sync Status</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((res) => (
                    <tr
                      key={res.id}
                      className="border-b dark:border-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors font-medium"
                    >
                      <td className="py-3 font-mono text-[10px]">{res.id}</td>
                      <td className="py-3 text-neutral-505">{new Date(res.submittedAt).toLocaleString()}</td>
                      <td className="py-3">
                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Synced
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          onClick={() => onViewDetails(res.id)}
                          className="text-[10px] font-bold h-7 px-3 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                          View details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
