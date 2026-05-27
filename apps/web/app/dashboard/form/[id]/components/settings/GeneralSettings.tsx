import React, { useState, useEffect, memo } from 'react';
import { useFormBuilderContext } from '../FormBuilderContext';
import { SettingsToggleRow } from './ui/SettingsToggleRow';
import { SidebarSection, SectionLabel } from './ui/SidebarPrimitives';

export const GeneralSettings = memo(() => {
  const { activeField, editFormFieldMutation } = useFormBuilderContext();
  
  const [localRequired, setLocalRequired] = useState(activeField?.required ?? false);

  useEffect(() => {
    if (activeField) {
      setLocalRequired(activeField.required);
    }
  }, [activeField?.required]);

  if (!activeField) return null;

  const handleToggleRequired = () => {
    const nextVal = !localRequired;
    setLocalRequired(nextVal);
    editFormFieldMutation.mutate({
      id: activeField.id,
      required: nextVal,
    });
  };

  return (
    <SidebarSection>
      <SectionLabel>General Settings</SectionLabel>
      <div className="space-y-3.5">
        <SettingsToggleRow
          label="Required"
          description="Respondent must fill this out"
          checked={localRequired}
          onToggle={handleToggleRequired}
        />
      </div>
    </SidebarSection>
  );
});

GeneralSettings.displayName = 'GeneralSettings';
