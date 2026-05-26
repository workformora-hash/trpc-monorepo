  import React from 'react';
import { NavigationSidebar } from './NavigationSidebar';
import QuestionEditor from './QuestionEditor';
import { SettingsSidebar } from './SettingsSidebar';
import { useFormBuilderContext } from './FormBuilderContext';

export function FormBuilderContentTab() {
  const {
    selectedFields,
    activeFieldId,
    setActiveFieldId,
    deleteFormFieldMutation,
    handleAddNewField,
    handleReorderFields,
    activeField,
    activeFieldIndex,
    localLabel,
    setLocalLabel,
    localDescription,
    setLocalDescription,
    localChoices,
    setLocalChoices,
    labelRef,
    descRef,
    editFormFieldMutation,
    handleUpdateChoice,
    handleAddChoice,
    handleDeleteChoice,
    selectedForm,
  } = useFormBuilderContext();

  const themeId = selectedForm?.theme ?? "default";

  return (
    <>
      {/* Enhanced Japanese Theme Visual Elements - Now managed globally by FormHeader background */}
      {themeId === 'japanese' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* We keep only subtle local hints if needed, but let global elements take the lead */}
        </div>
      )}

      {/* Left timeline sidebar */}
      <NavigationSidebar />

      {/* Center Canvas */}
      <QuestionEditor />

      {/* Right Settings Sidebar */}
      {activeField && (
        <SettingsSidebar />
      )}
    </>
  );
}
