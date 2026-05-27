'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Loader2, ClipboardCheck, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { trpc } from '~/trpc/client';
import { toast } from 'sonner';
import { Navbar } from '~/components/landing/Navbar';
import { Footer } from '~/components/landing/Footer';

interface TemplateField {
  id: string;
  label: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  fields: TemplateField[];
}

export default function TemplatesClient() {
  const router = useRouter();
  const [cloningId, setCloningId] = useState<string | null>(null);

  // Queries
  const { data: userSession } = trpc.auth.getCurrentUser.useQuery();
  const user = userSession?.user;

  const { data: templatesRaw = [], isLoading } = trpc.form.listFormTemplates.useQuery();
  const templates = templatesRaw as unknown as Template[];

  // Mutation to clone a template
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

  const handleUseTemplate = (templateId: string) => {
    if (!user) {
      toast.info("Please sign in or register to use this template!");
      router.push(`/login?redirect=/templates`);
      return;
    }
    setCloningId(templateId);
    createFormFromTemplate.mutate({ templateId });
  };

  const getTemplateIcon = () => {
    return (
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <ClipboardCheck className="h-5 w-5" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-955 dark:text-neutral-100 text-foreground flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-12">
        
        {/* Title Block */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-primary" />
            <span>Premium Pre-made Blueprints</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
            curated form template blueprints
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Save time and construct pristine, professional feedback systems, RSVPs, or PMF studies with pre-configured schemas.
          </p>
        </div>

        {/* Gallery Content */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div 
                key={template.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-neutral-350 dark:hover:border-neutral-700 transition-all gap-6"
              >
                <div className="space-y-4">
                  {/* Category & Header */}
                  <div className="flex justify-between items-start">
                    {getTemplateIcon()}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 border border-emerald-500/10">
                      Feedback
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-base font-bold dark:text-neutral-100 text-neutral-800">
                      {template.name}
                    </h3>
                    <p className="text-xs dark:text-neutral-400 text-neutral-500 leading-relaxed min-h-[48px]">
                      {template.description}
                    </p>
                  </div>

                  {/* Schema Info Preview */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-2 tracking-wider">
                      Included Questions ({template.fields.length})
                    </span>
                    <ul className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {template.fields.map((f) => (
                        <li key={f.id} className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate">{f.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Button Action */}
                <Button
                  onClick={() => handleUseTemplate(template.id)}
                  disabled={cloningId !== null}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-10 flex items-center justify-center gap-2 font-bold rounded-xl"
                >
                  {cloningId === template.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating draft…</span>
                    </>
                  ) : (
                    <>
                      <span>Use this template</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
