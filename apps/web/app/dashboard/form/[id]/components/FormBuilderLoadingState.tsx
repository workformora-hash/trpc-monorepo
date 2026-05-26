import { Loader2 } from 'lucide-react';
import React from 'react';

export function FormBuilderLoadingState() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <span className="text-sm font-semibold text-neutral-500">Loading form workspace...</span>
    </div>
  );
}
