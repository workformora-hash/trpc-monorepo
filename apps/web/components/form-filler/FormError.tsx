"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 border dark:border-neutral-800 p-8 rounded-2xl shadow-xl text-center space-y-6">
        <div className="p-3 bg-red-500/10 rounded-full w-fit mx-auto text-red-500">
          <AlertCircle className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
            Form Unavailable
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {message ??
              "This form could not be found. It may be archived, unpublished, or the link is incorrect."}
          </p>
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl text-xs font-bold transition-all"
        >
          Return to Homepage
        </button>
      </div>
    </div>
  );
}
