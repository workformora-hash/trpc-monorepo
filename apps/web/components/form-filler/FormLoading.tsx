"use client";

import { Loader2 } from "lucide-react";

export function FormLoading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-neutral-500 font-semibold animate-pulse">
          Loading form…
        </p>
      </div>
    </div>
  );
}
