"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Upload, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { trpc } from "~/trpc/client";

type Mode = "scratch" | "import" | "ai";

const CARDS: { mode: Mode; title: string; description: string; Icon: React.ElementType }[] = [
  {
    mode: "scratch",
    title: "Start from scratch",
    description: "Build from a list of ready-made form elements.",
    Icon: Plus,
  },
  {
    mode: "import",
    title: "Import questions",
    description: "Copy and paste questions or import from Google Forms.",
    Icon: Upload,
  },
  {
    mode: "ai",
    title: "Create with AI",
    description: "Use AI to help generate questions for any form.",
    Icon: Sparkles,
  },
];

export default function CreateFormPage() {
  const router = useRouter();
  const [pending, setPending] = useState<Mode | null>(null);

  const createForm = trpc.form.createForm.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/form/${data.form.id}`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create form.");
      setPending(null);
    },
  });

  function handlePick(mode: Mode) {
    if (pending) return;
    setPending(mode);
    createForm.mutate({
      title: "Untitled form",
      visibility: "unlisted",
      theme: "default",
    });
  }

  return (
    <div className="h-screen bg-white dark:bg-neutral-950 flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          My workspace
        </Link>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col items-center justify-center gap-12 p-10">
        <h1 className="text-[28px] font-light text-neutral-800 dark:text-neutral-100 tracking-tight">
          How do you want to build your form?
        </h1>

        <div className="grid grid-cols-3 gap-5 w-full max-w-2xl">
          {CARDS.map(({ mode, title, description, Icon }) => (
            <button
              key={mode}
              type="button"
              disabled={!!pending}
              onClick={() => handlePick(mode)}
              className="group flex flex-col items-center gap-5 p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed text-center"
            >
              <div className="h-24 w-24 rounded-2xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-100 dark:group-hover:bg-neutral-700 transition-colors">
                {pending === mode ? (
                  <Loader2 className="h-10 w-10 text-neutral-400 animate-spin" />
                ) : (
                  <Icon className="h-10 w-10 text-neutral-400" />
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{title}</p>
                <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
