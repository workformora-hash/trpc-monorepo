'use client';

import { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { trpc } from '~/trpc/client';

// Shared Page Components
import { NavigationSidebar } from './components/NavigationSidebar';
import { QuestionEditor } from './components/QuestionEditor';
import { SettingsSidebar } from './components/SettingsSidebar';
import { FormHeader, FormTab } from './components/FormHeader';
import { WorkflowTab } from './components/WorkflowTab';
import { ConnectTab } from './components/ConnectTab';
import { ShareTab } from './components/ShareTab';
import { ResultsTab } from './components/ResultsTab';
import { ResponseDetailsModal } from './components/ResponseDetailsModal';

export default function FormBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params?.id as string;
  const { theme, setTheme } = useTheme();
  const utils = trpc.useUtils();
  const [themeMounted, setThemeMounted] = useState(false);

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  // Authentication and Session Check
  const { data: userSession, isLoading: sessionLoading } = trpc.auth.getCurrentUser.useQuery();
  const user = userSession?.user;

  // Redirect if not logged in after session loading completes
  useEffect(() => {
    if (!sessionLoading && !user) {
      toast.error('Please login to access the form builder.');
      router.push('/login');
    }
  }, [user, sessionLoading, router]);

  // High-fidelity active states
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<FormTab>('content');
  const [selectedResponseDetailId, setSelectedResponseDetailId] = useState<string | null>(null);

  // Queries for the specific form
  const {
    data: formDetails,
    isLoading: detailsLoading,
    refetch: refetchFormDetails,
  } = trpc.form.getFormByIdCreator.useQuery({ id: formId || '' }, { enabled: !!user && !!formId });

  const { data: responsesData, refetch: refetchResponses } = trpc.form.listResponses.useQuery(
    { formId: formId || '' },
    { enabled: !!user && !!formId }
  );

  const { data: analyticsData, refetch: refetchAnalytics } = trpc.form.getFormAnalytics.useQuery(
    { formId: formId || '' },
    { enabled: !!user && !!formId }
  );

  const selectedForm = formDetails?.form;
  const selectedFields = useMemo(() => formDetails?.fields || [], [formDetails?.fields]);
  const selectedResponses = useMemo(() => responsesData?.responses || [], [responsesData?.responses]);

  // Local state for active editing fields to enable fully reactive typing in controlled inputs
  const [localLabel, setLocalLabel] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [localChoices, setLocalChoices] = useState<string[]>([]);

  // Refs for auto-resizing textareas
  const labelRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;

    // Maintain parent scroll position to prevent "jumping"
    const parent = textarea.closest('main');
    const scrollPos = parent ? parent.scrollTop : 0;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    if (parent) {
      parent.scrollTop = scrollPos;
    }
  };

  useLayoutEffect(() => {
    if (localLabel !== undefined) {
      resizeTextarea(labelRef.current);
    }
  }, [localLabel, activeFieldId]); // Also resize when switching fields

  useLayoutEffect(() => {
    if (localDescription !== undefined) {
      resizeTextarea(descRef.current);
    }
  }, [localDescription, activeFieldId]);

  useEffect(() => {
    const active = selectedFields.find((f) => f.id === activeFieldId) || selectedFields[0];
    if (active) {
      setLocalLabel(active.label || '');
      const validation = (active.validation as Record<string, unknown>) || {};
      setLocalDescription(typeof validation.description === 'string' ? validation.description : '');
      setLocalChoices(Array.isArray(validation.choices) ? (validation.choices as string[]) : ['Choice A', 'Choice B']);
    } else {
      setLocalLabel('');
      setLocalDescription('');
      setLocalChoices([]);
    }
  }, [activeFieldId, formDetails, selectedFields]);

  // Mutations
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
    onSuccess: () => {
      // Background refetch to keep data in sync with DB
      refetchFormDetails();
    },
  });

  if (sessionLoading || detailsLoading || !selectedForm) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <span className="text-sm font-semibold text-neutral-500">Loading form workspace...</span>
      </div>
    );
  }

  const activeField = selectedFields.find((f) => f.id === activeFieldId) || selectedFields[0];
  const activeFieldIndex = activeField ? selectedFields.findIndex((f) => f.id === activeField.id) : -1;
  const activeValidation = (activeField?.validation as Record<string, unknown>) || {};
  const activeChoices = Array.isArray(activeValidation?.choices)
    ? (activeValidation.choices as string[])
    : ['Choice A', 'Choice B'];

  const handleUpdateChoice = (idx: number, val: string) => {
    if (!activeField) return;
    const updated = [...activeChoices];
    updated[idx] = val;
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: { ...activeValidation, choices: updated },
    });
  };

  const handleAddChoice = () => {
    if (!activeField) return;
    const nextLetter = String.fromCharCode(65 + activeChoices.length) || 'New Option';
    const updated = [...activeChoices, `Choice ${nextLetter}`];
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: { ...activeValidation, choices: updated },
    });
  };

  const handleDeleteChoice = (idx: number) => {
    if (!activeField) return;
    if (activeChoices.length <= 1) {
      toast.error('At least one option is required!');
      return;
    }
    const updated = activeChoices.filter((_, i) => i !== idx);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: { ...activeValidation, choices: updated },
    });
  };

  const handleAddNewField = async (type: string) => {
    try {
      const res = await addFormFieldMutation.mutateAsync({
        formId: selectedForm.id,
        label: '',
        type,
        required: false,
        validation:
          type === 'single_select' || type === 'multi_select' ? { choices: ['Choice A', 'Choice B'] } : {},
      });
      toast.success('New question added!');
      if (res?.field?.id) {
        setActiveFieldId(res.field.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishToggle = () => {
    if (selectedForm.isPublished) {
      unpublishMutation.mutate({ id: selectedForm.id });
    } else {
      publishMutation.mutate({ id: selectedForm.id });
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white dark:bg-neutral-955 font-sans transition-colors duration-300 overflow-hidden">
      {/* Top Breadcrumb Nav Bar */}
      <FormHeader
        formId={selectedForm.id}
        formTitle={selectedForm.title}
        isPublished={selectedForm.isPublished}
        activeTab={activeFormTab}
        setActiveTab={setActiveFormTab}
        onTitleChange={(newTitle) => editFormMutation.mutate({ id: selectedForm.id, title: newTitle })}
        onPublishToggle={handlePublishToggle}
        themeMounted={themeMounted}
        theme={theme}
        setTheme={(newTheme) => setTheme(newTheme)}
        userName={user?.name}
        refetchResponses={refetchResponses}
        refetchAnalytics={refetchAnalytics}
      />

      {/* Content Tabs Switcher */}
      <div className="flex-1 flex overflow-hidden">
        {/* TAB 1: CONTENT BUILDER */}
        {activeFormTab === 'content' && (
          <>
            {/* Left timeline sidebar */}
            <NavigationSidebar
              selectedFields={selectedFields}
              activeFieldId={activeFieldId}
              setActiveFieldId={setActiveFieldId}
              deleteFormFieldMutation={deleteFormFieldMutation}
              handleAddNewField={handleAddNewField}
            />

            {/* Center Canvas */}
            <QuestionEditor
              selectedFields={selectedFields}
              activeField={activeField}
              activeFieldIndex={activeFieldIndex}
              localLabel={localLabel}
              setLocalLabel={setLocalLabel}
              localDescription={localDescription}
              setLocalDescription={setLocalDescription}
              localChoices={localChoices}
              setLocalChoices={setLocalChoices}
              labelRef={labelRef}
              descRef={descRef}
              resizeTextarea={resizeTextarea}
              editFormFieldMutation={editFormFieldMutation}
              handleUpdateChoice={handleUpdateChoice}
              handleAddChoice={handleAddChoice}
              handleDeleteChoice={handleDeleteChoice}
              handleAddNewField={handleAddNewField}
            />

            {/* Right Settings Sidebar */}
            {activeField && (
              <SettingsSidebar activeField={activeField} editFormFieldMutation={editFormFieldMutation} />
            )}
          </>
        )}

        {/* TAB 2: WORKFLOW & SETTINGS */}
        {activeFormTab === 'workflow' && (
          <WorkflowTab
            form={{
              id: selectedForm.id,
              title: selectedForm.title,
              description: selectedForm.description,
              slug: selectedForm.slug,
              visibility: selectedForm.visibility as any,
              maxResponses: selectedForm.maxResponses,
              notifyCreator: selectedForm.notifyCreator,
              notifyRespondent: selectedForm.notifyRespondent,
              theme: selectedForm.theme,
              isPasswordProtected: (selectedForm as any).isPasswordProtected,
            }}
            onEditForm={(fields) => editFormMutation.mutate({ id: selectedForm.id, ...fields })}
            onSetPassword={(password) => setFormPasswordMutation.mutate({ id: selectedForm.id, password })}
            onRemovePassword={() => removeFormPasswordMutation.mutate({ id: selectedForm.id })}
            onDuplicateForm={() => duplicateMutation.mutate({ id: selectedForm.id })}
            onDeleteForm={() => deleteMutation.mutate({ id: selectedForm.id })}
          />
        )}

        {/* TAB 3: CONNECT */}
        {activeFormTab === 'connect' && <ConnectTab />}

        {/* TAB 4: SHARE */}
        {activeFormTab === 'share' && (
          <ShareTab
            form={{
              isPublished: selectedForm.isPublished,
              slug: selectedForm.slug,
            }}
          />
        )}

        {/* TAB 5: RESULTS */}
        {activeFormTab === 'results' && (
          <ResultsTab
            analyticsData={analyticsData}
            responses={selectedResponses}
            onViewDetails={(id) => setSelectedResponseDetailId(id)}
          />
        )}
      </div>

      {/* Floating Detail Overlay Modal for Submissions */}
      <ResponseDetailsModal
        responseId={selectedResponseDetailId}
        onClose={() => setSelectedResponseDetailId(null)}
        responses={selectedResponses}
        fields={selectedFields}
      />
    </div>
  );
}
