'use client';

import React from 'react';
import { Button } from '~/components/ui/button';
import { trpc } from '~/trpc/client';
import { toast } from 'sonner';
import { 
  Download, 
  Trash2, 
  MapPin, 
  Clock, 
  Compass, 
  FileSpreadsheet, 
  AlertTriangle,
  Globe,
  User,
  Trash
} from 'lucide-react';

interface ResponseItem {
  id: string;
  submittedAt: Date | string;
  respondentEmail?: string | null;
  ipAddress?: string | null;
  answers: unknown;
}

interface ResultsTabProps {
  formId: string;
  views?: number | null;
  analyticsData?: {
    totalResponses: number;
  } | null;
  responses: ResponseItem[];
  onViewDetails: (id: string) => void;
  onDeleteResponse: (id: string) => void;
  onClearResponses: () => void;
}

export function ResultsTab({
  formId,
  views,
  analyticsData,
  responses,
  onViewDetails,
  onDeleteResponse,
  onClearResponses,
}: ResultsTabProps) {
  const utils = trpc.useUtils();
  const totalResponses = analyticsData?.totalResponses || 0;

  // Real Queries for Premium Analytics
  const { data: durationStats, isLoading: durationLoading } = trpc.form.getQuestionDurationStats.useQuery({ formId });
  const { data: geoDistribution, isLoading: geoLoading } = trpc.form.getResponseGeoDistribution.useQuery({ formId });

  // Real visits based on tracked view count in database
  const visits = Math.max(views ?? 0, totalResponses);
  const completionRate = visits > 0 ? `${Math.round((totalResponses / visits) * 100)}%` : '0%';

  const [exporting, setExporting] = React.useState(false);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await utils.client.form.exportResponsesToCSV.query({ formId });
      if (res && res.csv) {
        const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `form_responses_${formId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Responses exported successfully!");
      } else {
        toast.error("No CSV data returned from server.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to export responses.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex-1 bg-[#f9f9fb] dark:bg-neutral-955 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
        
        {/* Header Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-neutral-850 pb-5">
          <div className="text-left">
            <h2 className="text-xl font-extrabold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              <span>Form Submissions & Insights</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Analyze respondent behavior, answering speeds, and geographic metrics. Export clean spreadsheets instantly.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={handleExportCSV}
              disabled={exporting || responses.length === 0}
              variant="outline"
              className="text-xs font-bold h-9 px-4 border dark:border-neutral-850 flex items-center gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{exporting ? "Exporting..." : "Export to CSV"}</span>
            </Button>
            
            <Button
              onClick={onClearResponses}
              disabled={responses.length === 0}
              variant="outline"
              className="text-xs font-bold h-9 px-4 border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-650 dark:border-red-950/40 dark:hover:bg-red-955/20 flex items-center gap-2"
            >
              <Trash className="h-3.5 w-3.5" />
              <span>Clear Response Log</span>
            </Button>
          </div>
        </div>

        {/* Visual Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-850 border-neutral-100 shadow-sm p-6 rounded-2xl text-left space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase block tracking-wider">Total Visits</span>
            <h3 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100">{visits}</h3>
            <span className="text-[9px] text-neutral-450">Unique views recorded on slug</span>
          </div>

          <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-850 border-neutral-100 shadow-sm p-6 rounded-2xl text-left space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase block tracking-wider">Submissions</span>
            <h3 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100">{totalResponses}</h3>
            <span className="text-[9px] text-neutral-455">Total completed responses</span>
          </div>

          <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-850 border-neutral-100 shadow-sm p-6 rounded-2xl text-left space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase block tracking-wider">Completion Rate</span>
            <h3 className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-100">{completionRate}</h3>
            <span className="text-[9px] text-neutral-455">Conversion of visits into replies</span>
          </div>
        </div>

        {/* Secondary Analytics Panels: Answering speed & Geographic Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Question Answering Duration Stats */}
          <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-850 border-neutral-205 shadow-sm rounded-2xl p-6 text-left">
            <div className="border-b dark:border-neutral-850 pb-3 mb-4 flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-primary shrink-0" />
              <div>
                <h3 className="text-sm font-bold dark:text-neutral-200 text-neutral-800">Average Answering Speeds</h3>
                <p className="text-[10px] text-neutral-500">Track which questions take the longest to answer.</p>
              </div>
            </div>

            {durationLoading ? (
              <div className="h-40 flex items-center justify-center text-xs text-neutral-400 animate-pulse">
                Loading speed analytics...
              </div>
            ) : !durationStats || durationStats.stats.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-neutral-400 text-xs italic gap-1">
                <AlertTriangle className="h-5 w-5 text-neutral-300" />
                <span>No duration metrics tracked yet.</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-[240px] overflow-y-auto pr-1">
                {durationStats.stats.map((item, idx) => {
                  const avgSeconds = (item.averageDurationMs / 1000).toFixed(1);
                  // Find the max duration to compute percentage width for bars
                  const maxDuration = Math.max(...durationStats.stats.map(s => s.averageDurationMs)) || 1;
                  const pct = Math.max(10, Math.round((item.averageDurationMs / maxDuration) * 100));
                  
                  return (
                    <div key={item.fieldId} className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold dark:text-neutral-300 text-neutral-700">
                        <span className="truncate max-w-[280px]">Q{idx + 1}: {item.label || "Untitled Screen"}</span>
                        <span className="font-mono text-primary">{avgSeconds}s avg</span>
                      </div>
                      <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Geographic distribution stats */}
          <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-850 border-neutral-205 shadow-sm rounded-2xl p-6 text-left">
            <div className="border-b dark:border-neutral-850 pb-3 mb-4 flex items-center gap-2">
              <Globe className="h-4.5 w-4.5 text-primary shrink-0" />
              <div>
                <h3 className="text-sm font-bold dark:text-neutral-200 text-neutral-800">Geographic Regions</h3>
                <p className="text-[10px] text-neutral-500">Distribution of successful responses by country.</p>
              </div>
            </div>

            {geoLoading ? (
              <div className="h-40 flex items-center justify-center text-xs text-neutral-400 animate-pulse">
                Loading geographic distribution...
              </div>
            ) : !geoDistribution || geoDistribution.countries.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-neutral-400 text-xs italic gap-1">
                <MapPin className="h-5 w-5 text-neutral-300" />
                <span>No geographic logs detected.</span>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[240px] overflow-y-auto pr-1">
                {geoDistribution.countries.map((c) => {
                  const pct = geoDistribution.totalResponses > 0 
                    ? Math.round((c.count / geoDistribution.totalResponses) * 100)
                    : 0;

                  return (
                    <div key={c.country} className="flex items-center justify-between text-xs font-semibold dark:text-neutral-300 text-neutral-700">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[10px]">
                          {c.country}
                        </span>
                        <span className="truncate max-w-[180px]">{c.country === 'US' ? 'United States' : c.country}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-400 font-medium">{c.count} responses</span>
                        <span className="font-bold text-primary text-[10px] bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Submissions list table card */}
        <div className="bg-white dark:bg-neutral-900 border dark:border-neutral-850 border-neutral-205 shadow-sm rounded-2xl p-6 text-left">
          <div className="border-b dark:border-neutral-850 pb-4 mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold dark:text-neutral-200 text-neutral-800">Completed Responses Log</h3>
              <p className="text-xs text-neutral-505">
                Investigate full answers mapping details or delete records from database.
              </p>
            </div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded">
              Synced with Redis
            </span>
          </div>

          {responses.length === 0 ? (
            <div className="text-center py-12 text-xs text-neutral-405 italic">
              No responses recorded for this form yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b dark:border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Submission ID</th>
                    <th className="py-2.5">Respondent Email</th>
                    <th className="py-2.5">IP Address</th>
                    <th className="py-2.5">Submitted At</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((res) => (
                    <tr
                      key={res.id}
                      className="border-b dark:border-neutral-800/60 hover:bg-neutral-50 dark:hover:bg-neutral-950/40 transition-colors font-medium"
                    >
                      <td className="py-3 font-mono text-[10px] truncate max-w-[100px] text-neutral-500" title={res.id}>
                        {res.id}
                      </td>
                      <td className="py-3 font-semibold dark:text-neutral-300 text-neutral-700">
                        {res.respondentEmail || (
                          <span className="text-neutral-400 dark:text-neutral-600 font-normal italic">Anonymous</span>
                        )}
                      </td>
                      <td className="py-3 font-mono text-neutral-500 text-[10px]">
                        {res.ipAddress || "—"}
                      </td>
                      <td className="py-3 text-neutral-505">
                        {new Date(res.submittedAt).toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => onViewDetails(res.id)}
                            className="text-[10px] font-bold h-7 px-3 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 border border-transparent dark:border-neutral-700"
                          >
                            Details
                          </Button>
                          
                          <Button
                            onClick={() => {
                              if (confirm("Delete this submission row forever?")) {
                                onDeleteResponse(res.id);
                              }
                            }}
                            className="text-[10px] font-bold h-7 px-2.5 bg-white text-red-500 hover:bg-red-50 hover:text-red-650 dark:bg-neutral-900 dark:text-red-400 dark:hover:bg-red-955/20 border border-neutral-200 dark:border-red-950/40"
                            title="Delete response"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
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
