'use client';

import React, { useRef } from 'react';
import { Copy, Trash2, Sliders } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { GeneralMetadataSection } from './workflow/GeneralMetadataSection';
import { LinkDiscoverySection } from './workflow/LinkDiscoverySection';
import { AccessControlSection } from './workflow/AccessControlSection';
import { NotificationSection } from './workflow/NotificationSection';
import { ThemeGridSection } from './workflow/ThemeGridSection';

const workflowFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(256),
  description: z.string().max(1000).nullable(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-_]+$/, 'Slug must be alphanumeric with hyphens or underscores'),
  visibility: z.enum(['public', 'unlisted']),
  maxResponses: z.number().min(1).nullable(),
  notifyCreator: z.boolean(),
  notifyRespondent: z.boolean(),
  theme: z.string().nullable(),
});

type WorkflowFormValues = z.infer<typeof workflowFormSchema>;

interface Form {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  visibility: 'public' | 'unlisted' | string;
  maxResponses?: number | null;
  notifyCreator: boolean;
  notifyRespondent: boolean;
  theme?: string | null;
  isPasswordProtected?: boolean;
}

interface WorkflowTabProps {
  form: Form;
  onEditForm: (fields: Partial<WorkflowFormValues>) => void;
  onSetPassword: (password: string) => void;
  onRemovePassword: () => void;
  onDuplicateForm: () => void;
  onDeleteForm: () => void;
}

export function WorkflowTab({
  form,
  onEditForm,
  onSetPassword,
  onRemovePassword,
  onDuplicateForm,
  onDeleteForm,
}: WorkflowTabProps) {
  const formMethods = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowFormSchema),
    defaultValues: {
      title: form.title,
      description: form.description || null,
      slug: form.slug,
      visibility: (form.visibility as 'public' | 'unlisted') || 'unlisted',
      maxResponses: form.maxResponses || null,
      notifyCreator: form.notifyCreator,
      notifyRespondent: form.notifyRespondent,
      theme: form.theme || 'default',
    },
  });

  const { reset } = formMethods;

  const prevFormRef = useRef(form);

  if (form !== prevFormRef.current) {
    prevFormRef.current = form;
    reset({
      title: form.title,
      description: form.description || null,
      slug: form.slug,
      visibility: (form.visibility as 'public' | 'unlisted') || 'unlisted',
      maxResponses: form.maxResponses || null,
      notifyCreator: form.notifyCreator,
      notifyRespondent: form.notifyRespondent,
      theme: form.theme || 'default',
    });
  }

  return (
    <div className="flex-1 bg-[#f9f9fb] dark:bg-neutral-955 p-10 overflow-y-auto">
      <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-900 border dark:border-neutral-800 border-neutral-200 rounded-2xl p-8 space-y-8 shadow-sm text-left animate-fadeIn">
        
        {/* Header */}
        <div className="border-b dark:border-neutral-800 pb-4">
          <h3 className="text-lg font-bold dark:text-neutral-100 text-neutral-800 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            <span>Form Settings & Details</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Configure parameters, access control limits, theme styles, and submission rules. Cache is automatically updated instantly via Redis for ultra-fast load times.
          </p>
        </div>

        <form className="space-y-6">
          <GeneralMetadataSection
            formMethods={formMethods}
            onEditForm={onEditForm}
          />

          <LinkDiscoverySection
            formMethods={formMethods}
            onEditForm={onEditForm}
          />

          <AccessControlSection
            isPasswordProtected={!!form.isPasswordProtected}
            onSetPassword={onSetPassword}
            onRemovePassword={onRemovePassword}
            formMethods={formMethods}
            onEditForm={onEditForm}
          />

          <NotificationSection
            formMethods={formMethods}
            onEditForm={onEditForm}
          />

          <ThemeGridSection
            formMethods={formMethods}
            onEditForm={onEditForm}
          />

          {/* Actions */}
          <div className="pt-6 border-t dark:border-neutral-800 flex gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={onDuplicateForm}
              className="flex-1 text-xs font-semibold h-10 border dark:border-neutral-800 flex items-center justify-center gap-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-950"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Duplicate Form</span>
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                if (confirm('Soft-delete this form? You can restore it from the archive later.')) {
                  onDeleteForm();
                }
              }}
              className="flex-1 text-xs font-semibold h-10 border dark:border-red-950 border-neutral-205 hover:bg-red-50 dark:hover:bg-red-955/20 hover:text-red-500 flex items-center justify-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-505" />
              <span className="text-red-505">Delete Form</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
