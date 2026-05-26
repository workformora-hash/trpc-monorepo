"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Upload, Sparkles, ArrowLeft, Loader2, LayoutGrid } from "lucide-react";
import { trpc } from "~/trpc/client";

type Mode = "scratch" | "import" | "ai" | "template";

const CARDS: { mode: Mode; title: string; description: string; Icon: React.ElementType }[] = [
  {
    mode: "scratch",
    title: "Start from scratch",
    description: "Build from a list of ready-made form elements.",
    Icon: Plus,
  },
  {
    mode: "template",
    title: "Start from template",
    description: "Instantly create forms using predefined templates.",
    Icon: LayoutGrid,
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
  const [showTemplates, setShowTemplates] = useState(false);
  const [cloningId, setCloningId] = useState<string | null>(null);

  const { data: templates = [], isLoading: templatesLoading } = trpc.form.listFormTemplates.useQuery(undefined, { enabled: showTemplates });

  const createForm = trpc.form.createForm.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/form/${data.form.id}`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create form.");
      setPending(null);
    },
  });

  const createFormFromTemplate = trpc.form.createFormFromTemplate.useMutation({
    onSuccess: (data) => {
      toast.success("Successfully created form from template!");
      router.push(`/dashboard/form/${data.form.id}`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create form from template.");
      setCloningId(null);
    }
  });

  function handlePick(mode: Mode) {
    if (pending || cloningId) return;

    if (mode === "template") {
      setShowTemplates(true);
      return;
    }

    setPending(mode);
    createForm.mutate({
      title: "Untitled form",
      visibility: "unlisted",
      theme: "default",
    });
  }

  return (
    <div className="h-screen bg-white dark:bg-neutral-950 flex flex-col font-sans">
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
          {showTemplates ? "Choose a template blueprint" : "How do you want to build your form?"}
        </h1>

        {showTemplates ? (
          <div className="space-y-6 w-full max-w-2xl">
            <div className="grid grid-cols-3 gap-5">
              {templatesLoading ? (
                <div className="col-span-3 flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    disabled={cloningId !== null}
                    onClick={() => {
                      setCloningId(tpl.id);
                      createFormFromTemplate.mutate({ templateId: tpl.id });
                    }}
                    className="group flex flex-col items-center gap-4 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed text-center"
                  >
                    <div className="h-16 w-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      {cloningId === tpl.id ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <LayoutGrid className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-100 line-clamp-1">{tpl.name}</p>
                      <p className="text-[10px] text-neutral-500 leading-normal line-clamp-2">{tpl.description}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowTemplates(false)}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-350 transition-colors mx-auto block"
            >
              Back to options
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-5 w-full max-w-3xl">
            {CARDS.map(({ mode, title, description, Icon }) => (
              <button
                key={mode}
                type="button"
                disabled={!!pending}
                onClick={() => handlePick(mode)}
                className="group flex flex-col items-center gap-5 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed text-center"
              >
                <div className="h-20 w-20 rounded-2xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-100 dark:group-hover:bg-neutral-700 transition-colors">
                  {pending === mode ? (
                    <Loader2 className="h-8 w-8 text-neutral-400 animate-spin" />
                  ) : (
                    <Icon className="h-8 w-8 text-neutral-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">{title}</p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">{description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
