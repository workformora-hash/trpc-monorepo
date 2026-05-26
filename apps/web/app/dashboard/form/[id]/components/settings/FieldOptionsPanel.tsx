import { SettingsToggleRow } from './ui/SettingsToggleRow';
import { SectionLabel } from './ui/SidebarPrimitives';

interface FieldOptionsPanelProps {
  fieldType: string;
  localRequired: boolean;
  localIsMultiple: boolean;
  localRandomize: boolean;
  localAllowOther: boolean;
  localVerticalAlign: boolean;
  onToggleRequired: () => void;
  onToggleMultiple: () => void;
  onToggleRandomize: () => void;
  onToggleAllowOther: () => void;
  onToggleVerticalAlign: () => void;
}

const CHOICE_TYPES = new Set(['single_select', 'multi_select', 'dropdown', 'ranking']);
const MULTI_CHOICE_TYPES = new Set(['single_select', 'multi_select']);

export function FieldOptionsPanel({
  fieldType,
  localRequired,
  localIsMultiple,
  localRandomize,
  localAllowOther,
  localVerticalAlign,
  onToggleRequired,
  onToggleMultiple,
  onToggleRandomize,
  onToggleAllowOther,
  onToggleVerticalAlign,
}: FieldOptionsPanelProps) {
  const isChoiceField = CHOICE_TYPES.has(fieldType);
  const isMultiChoiceField = MULTI_CHOICE_TYPES.has(fieldType);

  return (
    <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
      <SectionLabel>Field Options</SectionLabel>

      <div className="space-y-3.5">
        <SettingsToggleRow
          label="Required"
          description="Respondent must fill this out"
          checked={localRequired}
          onToggle={onToggleRequired}
        />

        {isChoiceField && (
          <>
            {isMultiChoiceField && (
              <SettingsToggleRow
                label="Multiple selection"
                description="Allow selecting multiple options"
                checked={localIsMultiple}
                onToggle={onToggleMultiple}
              />
            )}
            <SettingsToggleRow
              label="Randomize"
              description="Shuffle option arrangements"
              checked={localRandomize}
              onToggle={onToggleRandomize}
            />
            {isMultiChoiceField && (
              <SettingsToggleRow
                label='"Other" option'
                description="Include customizable input"
                checked={localAllowOther}
                onToggle={onToggleAllowOther}
              />
            )}
          </>
        )}

        <SettingsToggleRow
          label="Vertical alignment"
          description="Center align on slide canvas"
          checked={localVerticalAlign}
          onToggle={onToggleVerticalAlign}
        />
      </div>
    </div>
  );
}
