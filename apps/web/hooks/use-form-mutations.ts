import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { trpc } from '~/trpc/client';
import { type FormField } from '@repo/database';

interface UseFormMutationsProps {
  formId: string;
  refetchFormDetails: () => Promise<unknown>;
  refetchResponses: () => Promise<unknown>;
  refetchAnalytics: () => Promise<unknown>;
  selectedFields: FormField[];
}

export function useFormMutations({
  formId,
  refetchFormDetails,
  refetchResponses,
  refetchAnalytics,
}: UseFormMutationsProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const editFormMutation = trpc.form.editForm.useMutation({
    onSuccess: () => {
      toast.success('Form updated successfully!');
      refetchFormDetails();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update form.');
    },
  });

  const setFormPasswordMutation = trpc.form.setFormPassword.useMutation({
    onSuccess: () => {
      toast.success('Password protection enabled!');
      refetchFormDetails();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to set password.');
    },
  });

  const removeFormPasswordMutation = trpc.form.removeFormPassword.useMutation({
    onSuccess: () => {
      toast.success('Password protection disabled.');
      refetchFormDetails();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to remove password.');
    },
  });

  const publishMutation = trpc.form.publishForm.useMutation({
    onSuccess: () => {
      toast.success('Form is now live!');
      refetchFormDetails();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to publish form. Make sure it has at least one question.');
    },
  });

  const unpublishMutation = trpc.form.unpublishForm.useMutation({
    onSuccess: () => {
      toast.success('Form set to draft.');
      refetchFormDetails();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to unpublish form.');
    },
  });

  const duplicateMutation = trpc.form.duplicateForm.useMutation({
    onSuccess: (data) => {
      toast.success('Form duplicated successfully!');
      router.push(`/dashboard/form/${data.form.id}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to duplicate form.');
    },
  });

  const deleteMutation = trpc.form.deleteForm.useMutation({
    onSuccess: () => {
      toast.success('Form deleted successfully.');
      router.push('/dashboard');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete form.');
    },
  });

  const addFormFieldMutation = trpc.form.addFormField.useMutation({
    onSuccess: () => {
      toast.success('Question added successfully!');
      refetchFormDetails();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to add question.');
    },
  });

  const deleteFormFieldMutation = trpc.form.deleteFormField.useMutation({
    onSuccess: () => {
      toast.success('Question removed.');
      refetchFormDetails();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete question.');
    },
  });

  const duplicateFormFieldMutation = trpc.form.duplicateFormField.useMutation({
    onSuccess: () => {
      toast.success('Question duplicated successfully!');
      refetchFormDetails();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to duplicate question.');
    },
  });

  const clearFormResponsesMutation = trpc.form.clearFormResponses.useMutation({
    onSuccess: () => {
      toast.success('All responses cleared successfully.');
      refetchResponses();
      refetchAnalytics();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to clear responses.');
    },
  });

  const deleteResponseMutation = trpc.form.deleteResponse.useMutation({
    onSuccess: () => {
      toast.success('Response deleted successfully.');
      refetchResponses();
      refetchAnalytics();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete response.');
    },
  });

  const editFormFieldMutation = trpc.form.editFormField.useMutation({
    onMutate: async (newData) => {
      // Cancel outgoing refetches to prevent overwriting our local changes
      await utils.form.getFormByIdCreator.cancel({ id: formId || '' });

      // Snapshot the current cache details
      const previousDetails = utils.form.getFormByIdCreator.getData({ id: formId || '' });

      // Optimistically update the cached list
      if (previousDetails) {
        utils.form.getFormByIdCreator.setData(
          { id: formId || '' },
          {
            ...previousDetails,
            fields: previousDetails.fields.map((field) =>
              field.id === newData.id ? { ...field, ...newData } : field
            ),
          }
        );
      }

      return { previousDetails };
    },
    onError: (err, newData, context) => {
      // If mutation fails, roll back to original details
      if (context?.previousDetails) {
        utils.form.getFormByIdCreator.setData({ id: formId || '' }, context.previousDetails);
      }
      toast.error(err.message || 'Failed to update question.');
    },
  });

  const reorderFormFieldsMutation = trpc.form.reorderFormFields.useMutation({
    onMutate: async (newData) => {
      await utils.form.getFormByIdCreator.cancel({ id: formId || '' });
      const previousDetails = utils.form.getFormByIdCreator.getData({ id: formId || '' });

      if (previousDetails) {
        const orderMap = new Map(newData.fields.map(f => [f.id, f.orderIndex]));
        utils.form.getFormByIdCreator.setData(
          { id: formId || '' },
          {
            ...previousDetails,
            fields: [...previousDetails.fields]
              .map(field => {
                const newIdx = orderMap.get(field.id);
                return newIdx !== undefined ? { ...field, orderIndex: newIdx } : field;
              })
              .sort((a, b) => a.orderIndex - b.orderIndex)
          }
        );
      }

      return { previousDetails };
    },
    onError: (err, newData, context) => {
      if (context?.previousDetails) {
        utils.form.getFormByIdCreator.setData({ id: formId || '' }, context.previousDetails);
      }
      toast.error(err.message || 'Failed to reorder fields.');
    },
    onSuccess: () => {
      refetchFormDetails();
    }
  });

  return {
    editFormMutation,
    setFormPasswordMutation,
    removeFormPasswordMutation,
    publishMutation,
    unpublishMutation,
    duplicateMutation,
    deleteMutation,
    addFormFieldMutation,
    deleteFormFieldMutation,
    editFormFieldMutation,
    reorderFormFieldsMutation,
    duplicateFormFieldMutation,
    clearFormResponsesMutation,
    deleteResponseMutation,
  };
}
