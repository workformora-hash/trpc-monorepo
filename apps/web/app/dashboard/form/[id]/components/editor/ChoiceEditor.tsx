import React from "react";
import { Plus, X, GripVertical, Palette as PaletteIcon } from "lucide-react";
import { useFormBuilderContext } from "../FormBuilderContext";
import { ActiveValidationType } from "../QuestionEditor";

interface ChoiceEditorProps {
  onOpenStylePopover: (type: 'choices') => void;
  renderPopover: () => React.ReactNode;
  activePopover: string | null;
}

const ChoiceEditor: React.FC<ChoiceEditorProps> = React.memo(({ onOpenStylePopover, renderPopover, activePopover }) => {
  const {
    activeField,
    localChoices,
    setLocalChoices,
    handleUpdateChoice,
    handleAddChoice,
    handleDeleteChoice,
    activeValidation: rawActiveValidation,
  } = useFormBuilderContext();

  const activeValidation = rawActiveValidation as ActiveValidationType;

  if (!activeField) return null;

  const isChoiceField = activeField.type === 'single_select' || activeField.type === 'multi_select';
  const isRankingField = activeField.type === 'ranking';
  const isDropdownField = activeField.type === 'dropdown';

  if (!isChoiceField && !isRankingField && !isDropdownField) return null;

  return (
    <div className={`space-y-3 pt-4 border-t border-neutral-150/50 dark:border-neutral-800/50 mt-4 animate-fadeIn relative group/${activeField.type}`}>
      {/* Float Paintbrush Style Trigger */}
      <div className="absolute right-0 top-4 z-20">
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onOpenStylePopover('choices'); }}
          className={`opacity-0 group-hover/${activeField.type}:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer`}
          title={`Style ${activeField.type === 'ranking' ? 'Ranking' : activeField.type === 'dropdown' ? 'Dropdown' : 'Options'} Font & Color`}
        >
          <PaletteIcon className="h-3.5 w-3.5" />
          <span>Style Options</span>
        </button>
      </div>

      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2">Options</span>
      
      {activePopover === 'choices' && renderPopover()}

      <div className="space-y-2.5">
        {localChoices.map((choice, cIdx) => (
          <div 
            key={cIdx} 
            className={`flex items-center gap-3 group animate-fadeIn ${
              isRankingField ? 'max-w-md bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-250 dark:border-neutral-800 px-3 py-2 rounded-xl' : 
              isDropdownField ? 'max-w-md' : ''
            }`}
          >
            {isChoiceField && (
              <div 
                className="h-7 w-7 rounded-lg bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-[11px] font-extrabold text-neutral-600 dark:text-neutral-450 border border-neutral-250 dark:border-neutral-800 transition-all group-hover:scale-105 shadow-2xs"
                style={{
                  borderColor: activeValidation.activeColor ? activeValidation.activeColor + '40' : undefined,
                  color: activeValidation.activeColor || undefined,
                }}
              >
                {String.fromCharCode(65 + cIdx)}
              </div>
            )}

            {isRankingField && (
              <>
                <GripVertical className="h-4 w-4 text-neutral-400 cursor-grab active:cursor-grabbing" />
                <div 
                  className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-[10px] font-extrabold text-primary border border-primary/20" 
                  style={{ 
                    color: activeValidation.activeColor || undefined, 
                    backgroundColor: activeValidation.activeColor ? activeValidation.activeColor + '10' : undefined, 
                    borderColor: activeValidation.activeColor ? activeValidation.activeColor + '20' : undefined 
                  }}
                >
                  {cIdx + 1}
                </div>
              </>
            )}

            <input
              type="text"
              value={choice}
              onChange={(e) => {
                const updated = [...localChoices];
                updated[cIdx] = e.target.value;
                setLocalChoices(updated);
              }}
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  handleUpdateChoice(cIdx, e.target.value.trim());
                }
              }}
              aria-label={`Option ${cIdx + 1}`}
              className={`flex-1 bg-transparent text-sm font-semibold transition-all focus:outline-none dark:text-neutral-200 text-neutral-800 ${
                isChoiceField ? 'px-3 py-1.5 rounded-lg border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 focus:border-primary' :
                isRankingField ? 'text-xs border-none' :
                isDropdownField ? 'bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-700 px-3 py-2 rounded-xl text-xs focus:border-primary focus:ring-1 focus:ring-primary/20' : ''
              }`}
              style={{ 
                color: activeValidation.descriptionColor || undefined,
                fontFamily: activeValidation.descriptionFontFamily || undefined,
                fontSize: activeValidation.descriptionFontSize || undefined,
                fontWeight: activeValidation.descriptionFontWeight || undefined,
              }}
            />
            <button
              type="button"
              onClick={() => handleDeleteChoice(cIdx)}
              className="text-neutral-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 outline-none"
              title="Remove choice"
              aria-label={`Remove option ${cIdx + 1}`}
            >
              <X className={isChoiceField ? "h-4 w-4" : "h-3.5 w-3.5"} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddChoice}
        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 pt-2 transition-colors pl-10 cursor-pointer"
        style={{ color: activeValidation.activeColor || undefined }}
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add choice</span>
      </button>
    </div>
  );
});

ChoiceEditor.displayName = "ChoiceEditor";

export default ChoiceEditor;
