import { useState, useRef, useMemo } from 'react';
import { FormTab } from '~/app/dashboard/form/[id]/components/FormHeader';
import { FormField as DbFormField } from '@repo/database';
import { getFormByIdCreatorOutputModel } from '@repo/trpc/server/routes/form/model';
import { z } from 'zod';

// We override the validation type to ensure it's compatible with frontend expectations
type FormField = Omit<DbFormField, 'validation'> & {
  validation?: Record<string, unknown> | null;
};

type InferredFormDetails = z.infer<typeof getFormByIdCreatorOutputModel>;
type FormDetails = Omit<InferredFormDetails, 'form'> & {
  form: Omit<InferredFormDetails['form'], 'expiresAt' | 'createdAt' | 'updatedAt'> & {
    expiresAt: string | Date | null;
    createdAt: string | Date;
    updatedAt: string | Date;
  }
};

interface UseFormBuilderStateProps {
  selectedFields: FormField[];
  formDetails: FormDetails | undefined;
}

export function useFormBuilderState({ selectedFields }: UseFormBuilderStateProps) {
  // High-fidelity active states
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<FormTab>('content');
  const [selectedResponseDetailId, setSelectedResponseDetailId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Local state for active editing fields to enable fully reactive typing in controlled inputs
  const [localLabel, setLocalLabel] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [localChoices, setLocalChoices] = useState<string[]>([]);

  const activeField: FormField | undefined = useMemo(
    () => selectedFields.find((f) => f.id === activeFieldId) || selectedFields[0],
    [activeFieldId, selectedFields]
  );
  const activeFieldIndex = activeField ? selectedFields.findIndex((f) => f.id === activeField.id) : -1;
  const activeValidation = (activeField?.validation as Record<string, unknown>) || {};
  const initialActiveChoices = Array.isArray(activeValidation?.choices)
    ? (activeValidation.choices as string[])
    : ['Choice A', 'Choice B'];

  const prevActiveFieldIdRef = useRef<string | null>(null);

  if (activeFieldId !== prevActiveFieldIdRef.current) {
    prevActiveFieldIdRef.current = activeFieldId;
    if (activeField) {
      setLocalLabel(activeField.label || '');
      const validation = (activeField.validation as Record<string, unknown>) || {};
      setLocalDescription(typeof validation.description === 'string' ? validation.description : '');
      setLocalChoices(Array.isArray(validation.choices) ? (validation.choices as string[]) : ['Choice A', 'Choice B']);
    } else {
      setLocalLabel('');
      setLocalDescription('');
      setLocalChoices([]);
    }
  }

  return {
    activeFieldId,
    setActiveFieldId,
    activeFormTab,
    setActiveFormTab,
    selectedResponseDetailId,
    setSelectedResponseDetailId,
    previewOpen,
    setPreviewOpen,
    localLabel,
    setLocalLabel,
    localDescription,
    setLocalDescription,
    localChoices,
    setLocalChoices,
    activeField,
    activeFieldIndex,
    activeValidation,
    initialActiveChoices,
  };
}
