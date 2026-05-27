'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, FileText, ChevronRight, Calendar, Globe, BarChart3, Loader2
} from 'lucide-react';
import { Button } from '~/components/ui/button';

interface Form {
  id: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  visibility: string;
  createdAt: string | Date;
}

interface FormsListTabProps {
  forms: Form[];
  isLoading: boolean;
}

export const FormsListTab = React.memo(({
  forms,
  isLoading
}: FormsListTabProps) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight dark:text-neutral-100 text-foreground">My Forms</h1>
          <p className="dark:text-neutral-400 text-muted-foreground text-sm mt-1">Create, build, and view response analytics for your forms.</p>
        </div>

        <Button 
          onClick={() => router.push('/dashboard/create')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 h-10 flex items-center gap-2 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" /> Create Form
        </Button>
      </div>

      {/* Quick Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="dark:bg-neutral-900/50 bg-white border dark:border-neutral-800 border-border p-6 rounded-xl flex items-center gap-4 shadow-xs">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs dark:text-neutral-400 text-muted-foreground uppercase font-bold tracking-wider">Total Forms</div>
            <div className="text-2xl font-bold">{forms.length}</div>
          </div>
        </div>
        <div className="dark:bg-neutral-900/50 bg-white border dark:border-neutral-800 border-border p-6 rounded-xl flex items-center gap-4 shadow-xs">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs dark:text-neutral-400 text-muted-foreground uppercase font-bold tracking-wider">Published</div>
            <div className="text-2xl font-bold">
              {forms.filter(f => f.isPublished).length}
            </div>
          </div>
        </div>
        <div className="dark:bg-neutral-900/50 bg-white border dark:border-neutral-800 border-border p-6 rounded-xl flex items-center gap-4 shadow-xs">
          <div className="h-10 w-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs dark:text-neutral-400 text-muted-foreground uppercase font-bold tracking-wider">Status</div>
            <div className="text-sm font-semibold dark:text-neutral-200 text-foreground">System Healthy</div>
          </div>
        </div>
      </div>

      {/* Forms List Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
        {forms.map((form) => (
          <div 
             key={form.id} 
             role="listitem"
             onClick={() => router.push(`/dashboard/form/${form.id}`)}
             onKeyDown={(e) => {
               if (e.key === 'Enter' || e.key === ' ') {
                 e.preventDefault();
                 router.push(`/dashboard/form/${form.id}`);
               }
             }}
             tabIndex={0}
             aria-label={`Edit form: ${form.title}`}
             className="group dark:bg-neutral-900 bg-white border dark:border-neutral-800 border-border p-6 rounded-xl hover:border-primary/50 cursor-pointer transition-all flex flex-col justify-between h-56 shadow-xs hover:shadow-md active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950"
          >
            <div>
              <div className="flex justify-between items-start gap-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  form.isPublished ? 'bg-emerald-500/10 text-emerald-400' : 'dark:bg-neutral-800 bg-muted dark:text-neutral-400 text-muted-foreground'
                }`}>
                  {form.isPublished ? 'Published' : 'Draft'}
                </span>
                <span className="text-[10px] dark:text-neutral-400 text-muted-foreground flex items-center gap-1 font-medium">
                  <Globe className="h-3 w-3" /> {form.visibility}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold dark:text-neutral-100 text-foreground mt-4 group-hover:text-primary transition-colors line-clamp-1">{form.title}</h3>
              <p className="text-xs dark:text-neutral-400 text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{form.description || "No description provided."}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] dark:text-neutral-500 text-muted-foreground/80 pt-4 border-t dark:border-neutral-800 border-border mt-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {new Date(form.createdAt).toLocaleDateString()}
              </span>
              <span className="text-primary font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Edit <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}

        {forms.length === 0 && (
          <div className="col-span-full border-2 border-dashed dark:border-neutral-800 border-border rounded-xl p-16 text-center bg-muted/20">
            <FileText className="h-10 w-10 text-neutral-600 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-semibold dark:text-neutral-200 text-foreground">No forms yet</h3>
            <p className="dark:text-neutral-400 text-muted-foreground text-sm mt-1 max-w-sm mx-auto">Create your first responsive interactive form to start gathering submissions.</p>
            <Button 
              onClick={() => router.push('/dashboard/create')}
              className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm"
            >
              Create your first form
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

FormsListTab.displayName = 'FormsListTab';
