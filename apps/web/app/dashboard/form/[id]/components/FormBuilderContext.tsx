import React, { createContext, use } from 'react';
import { trpc } from '~/trpc/client';
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

// Define the shape of the context data
interface FormBuilderContextType {
  selectedFields: FormField[];
  activeFieldId: string | null;
  setActiveFieldId: (id: string | null) => void;
  activeField: FormField | undefined;
  activeFieldIndex: number;
  localLabel: string;
  setLocalLabel: (value: string) => void;
  localDescription: string;
  setLocalDescription: (value: string) => void;
  localChoices: string[];
  setLocalChoices: (choices: string[]) => void;
  labelRef: React.RefObject<HTMLTextAreaElement>;
  descRef: React.RefObject<HTMLTextAreaElement>;
  editFormFieldMutation: ReturnType<typeof trpc.form.editFormField.useMutation>;
  deleteFormFieldMutation: ReturnType<typeof trpc.form.deleteFormField.useMutation>;
  addFormFieldMutation: ReturnType<typeof trpc.form.addFormField.useMutation>;
  reorderFormFieldsMutation: ReturnType<typeof trpc.form.reorderFormFields.useMutation>;
  duplicateFormFieldMutation: ReturnType<typeof trpc.form.duplicateFormField.useMutation>;
  handleUpdateChoice: (idx: number, val: string) => void;
  handleAddChoice: () => void;
  handleDeleteChoice: (idx: number) => void;
  handleAddNewField: (type: string) => Promise<void>;
  handleReorderFields: (draggedIdx: number, targetIdx: number) => void;
  formId: string;
  selectedForm: FormDetails['form'] | undefined;
  formDetails: FormDetails | undefined;
  refetchFormDetails: () => Promise<unknown>;
  activeValidation: Record<string, unknown>;
}

// Create the context
const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined);

// Custom hook to use the context
export function useFormBuilderContext() {
  const context = use(FormBuilderContext);
  if (!context) {
    throw new Error('useFormBuilderContext must be used within a FormBuilderProvider');
  }
  return context;
}

// Provider component
export function FormBuilderProvider({ children, value }: { children: React.ReactNode; value: FormBuilderContextType }) {
  return <FormBuilderContext.Provider value={value}>{children}</FormBuilderContext.Provider>;
}
