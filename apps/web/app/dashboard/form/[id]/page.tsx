'use client';

import { useRef, useLayoutEffect, useMemo } from 'react';
import { useThemeMounted } from '~/hooks/use-theme-mounted';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

import { useTextareaAutoResize } from '~/hooks/use-textarea-auto-resize';
import { useFormMutations } from '~/hooks/use-form-mutations';
import { useFormBuilderState } from '~/hooks/use-form-builder-state';
import { useAuthRedirect } from '~/hooks/use-auth-redirect';


import { trpc } from '~/trpc/client';
import { FormHeader, type FormTab } from './components/FormHeader';
import { WorkflowTab } from './components/WorkflowTab';
import { LogicRulesBuilder } from './components/LogicRulesBuilder';
import { ConnectTab } from './components/ConnectTab';
import { ShareTab } from './components/ShareTab';
import { ResultsTab } from './components/ResultsTab';
import { ResponseDetailsModal } from './components/ResponseDetailsModal';
import { FormBuilderContentTab } from './components/FormBuilderContentTab';
import { FormBuilderProvider } from './components/FormBuilderContext';
import { FormBuilderLoadingState } from './components/FormBuilderLoadingState';
import { FormPreviewModal } from './components/FormPreviewModal';

export default function FormBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params?.id as string;
  const { theme, setTheme } = useTheme();
  const utils = trpc.useUtils();
  const themeMounted = useThemeMounted();
  const { user, sessionLoading } = useAuthRedirect();

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

  const {
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
    initialActiveChoices: activeChoices,
  } = useFormBuilderState({ selectedFields, formDetails });

  const labelRef = useTextareaAutoResize(localLabel, [activeFieldId]);
  const descRef = useTextareaAutoResize(localDescription, [activeFieldId]);

  const {
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
  } = useFormMutations({
    formId,
    refetchFormDetails,
    refetchResponses,
    refetchAnalytics,
    selectedFields,
  });

  if (sessionLoading || detailsLoading || !selectedForm) {
    return <FormBuilderLoadingState />;
  }

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

  const handleAddNewField = async (type: any) => {
    try {
      const res = await addFormFieldMutation.mutateAsync({
        formId: selectedForm.id,
        label: '',
        type,
        required: false,
        validation:
          type === 'single_select' || type === 'multi_select' || type === 'dropdown' || type === 'ranking' ? { choices: ['Choice A', 'Choice B'] } : {},
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

  const handleReorder = (draggedIdx: number, targetIdx: number) => {
    const welcomeFields = selectedFields.filter(f => f.type === 'welcome');
    const thankYouFields = selectedFields.filter(f => f.type === 'thank_you');
    const standardFields = selectedFields.filter(f => f.type !== 'welcome' && f.type !== 'thank_you');

    const updatedStandard = [...standardFields];
    const [draggedItem] = updatedStandard.splice(draggedIdx, 1);
    if (draggedItem) {
      updatedStandard.splice(targetIdx, 0, draggedItem);
    }

    const merged = [...welcomeFields, ...updatedStandard, ...thankYouFields];
    reorderFormFieldsMutation.mutate({
      formId: selectedForm.id,
      fields: merged.map((f, i) => ({ id: f.id, orderIndex: i }))
    });
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
        onPreviewOpen={() => setPreviewOpen(true)}
        isSaving={editFormMutation.isPending || editFormFieldMutation.isPending}
      />

      {/* Content Tabs Switcher */}
      <div className="flex-1 flex overflow-hidden">
        {/* TAB 1: CONTENT BUILDER */}
        {activeFormTab === 'content' && (
          <FormBuilderProvider
            value={{
              selectedFields,
              activeFieldId,
              setActiveFieldId,
              activeField,
              activeFieldIndex,
              localLabel,
              setLocalLabel,
              localDescription,
              setLocalDescription,
              localChoices,
              setLocalChoices,
              labelRef: labelRef as any,
              descRef: descRef as any,
              editFormFieldMutation,
              deleteFormFieldMutation,
              addFormFieldMutation,
              reorderFormFieldsMutation,
              duplicateFormFieldMutation,
              handleUpdateChoice,
              handleAddChoice,
              handleDeleteChoice,
              handleAddNewField,
              handleReorderFields: handleReorder,
              formId,
              selectedForm,
              formDetails,
              refetchFormDetails,
              activeValidation,
            }}
          >
            <FormBuilderContentTab />
          </FormBuilderProvider>
        )}

        {/* TAB: LOGIC RULES */}
        {activeFormTab === 'logic' && (
          <div className="flex-1 bg-[#f9f9fb] dark:bg-neutral-955 p-10 overflow-y-auto">
            <LogicRulesBuilder 
              formId={selectedForm.id} 
              formSlug={selectedForm.slug} 
              fields={selectedFields} 
            />
          </div>
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
            formId={selectedForm.id}
            views={selectedForm.views}
            analyticsData={analyticsData}
            responses={selectedResponses}
            onViewDetails={(id) => setSelectedResponseDetailId(id)}
            onDeleteResponse={(id) => deleteResponseMutation.mutate({ responseId: id })}
            onClearResponses={() => {
              if (confirm("Are you absolutely sure you want to delete ALL responses for this form? This action is permanent and cannot be undone!")) {
                clearFormResponsesMutation.mutate({ id: selectedForm.id });
              }
            }}
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

      {/* Interactive Pro Design Studio and Complete Preview Modal */}
      <FormPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        form={{
          id: selectedForm.id,
          title: selectedForm.title,
          description: selectedForm.description,
          slug: selectedForm.slug,
          theme: selectedForm.theme,
          isPublished: selectedForm.isPublished,
          visibility: selectedForm.visibility,
        }}
        fields={selectedFields}
        onSaveDesign={async (themeConfig) => {
          await editFormMutation.mutateAsync({
            id: selectedForm.id,
            theme: themeConfig,
          });
        }}
        isSaving={editFormMutation.isPending}
      />
    </div>
  );
}
