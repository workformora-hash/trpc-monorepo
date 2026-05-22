import React from "react";
import {
  Plus,
  Trash2,
  Mail,
  Hash,
  Star,
  Calendar,
  Sparkles,
  Settings,
  Clock,
  Database,
  Palette as PaletteIcon,
  X,
  Type,
  FileText,
  ListIcon,
  CheckSquare,
  Globe,
  GripVertical,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

export function QuestionEditor({
  selectedFields,
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
  resizeTextarea,
  editFormFieldMutation,
  handleUpdateChoice,
  handleAddChoice,
  handleDeleteChoice,
  handleAddNewField,
}: {
  selectedFields: any[];
  activeField: any;
  activeFieldIndex: number;
  localLabel: string;
  setLocalLabel: (value: string) => void;
  localDescription: string;
  setLocalDescription: (value: string) => void;
  localChoices: string[];
  setLocalChoices: (choices: string[]) => void;
  labelRef: React.RefObject<HTMLTextAreaElement | null>;
  descRef: React.RefObject<HTMLTextAreaElement | null>;
  resizeTextarea: (textarea: HTMLTextAreaElement | null) => void;
  editFormFieldMutation: any;
  handleUpdateChoice: (idx: number, val: string) => void;
  handleAddChoice: () => void;
  handleDeleteChoice: (idx: number) => void;
  handleAddNewField: (type: string) => void;
}) {
  const activeValidation = (activeField?.validation as Record<string, any>) || {};

  return (
    <main className="flex-1 bg-[#f9f9fb] dark:bg-neutral-955 flex flex-col justify-start items-center p-8 overflow-y-auto relative border-r border-neutral-200 dark:border-neutral-800">
      {/* Canvas sub-header tool controls */}
      <div className="w-full flex items-center justify-between max-w-2xl mb-8">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => {
                const dropdown = document.getElementById("addFieldDropdown");
                if (dropdown) dropdown.classList.toggle("hidden");
              }}
              className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 h-8 rounded-lg text-xs font-semibold shadow-xs text-neutral-700 dark:text-neutral-350 hover:bg-neutral-50"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add content</span>
            </button>
            <div id="addFieldDropdown" className="hidden absolute left-0 top-9 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg w-48 py-1.5 z-50 text-left font-sans">
              {[
                { id: 'short_text', name: 'Short Text' },
                { id: 'long_text', name: 'Long Text' },
                { id: 'email', name: 'Email Address' },
                { id: 'number', name: 'Number' },
                { id: 'single_select', name: 'Multiple Choice' },
                { id: 'multi_select', name: 'Checkbox Options' },
                { id: 'rating', name: 'Rating Star Scale' },
                { id: 'date', name: 'Date Field' },
                { id: 'contact_info', name: 'Contact Info' },
                { id: 'address', name: 'Address' },
                { id: 'website', name: 'Website' },
                { id: 'dropdown', name: 'Dropdown Selection' },
                { id: 'yes_no', name: 'Yes/No buttons' },
                { id: 'ranking', name: 'Ranking list' }
              ].map((element) => (
                <button
                  key={element.id}
                  onClick={() => {
                    handleAddNewField(element.id);
                    const dropdown = document.getElementById("addFieldDropdown");
                    if (dropdown) dropdown.classList.add("hidden");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  {element.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => toast.info("Style preset parameters active in settings!")}
            className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 h-8 rounded-lg text-xs font-semibold shadow-xs text-neutral-700 dark:text-neutral-350 hover:bg-neutral-50"
          >
            <PaletteIcon className="h-3.5 w-3.5" />
            <span>Design</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-400 hover:text-neutral-600">
            <Database className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => toast.info("No edits to undo")}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-400 hover:text-neutral-600"
          >
            <Clock className="h-3.5 w-3.5" />
          </button>
          <button className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-400 hover:text-neutral-600">
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* The main Question preview interactive Card */}
      {selectedFields.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-lg rounded-2xl p-12 max-w-2xl w-full text-center space-y-6 animate-scaleIn">
          <Sparkles className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold dark:text-neutral-200 text-neutral-800">Your Form Canvas is Empty</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">Create a personalized creation layout by tapping "+ Add content" above or click the recommended elements sidebar.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-md rounded-2xl p-10 max-w-2xl w-full text-left space-y-6 animate-fadeIn transition-all relative group">
          {/* Editor Indicator */}
          <div className="absolute -top-3 left-6 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm z-10">
            Question Editor
          </div>

          <div className="space-y-4">

            {/* Label Inline Editor */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1 mt-1">
                <span className="text-sm font-bold text-primary font-mono">{activeFieldIndex + 1}</span>
                <span className="text-primary text-xl leading-none italic font-serif">~</span>
              </div>
              <div className="flex-1 space-y-1.5">
                <textarea
                  ref={labelRef}
                  rows={1}
                  value={localLabel}
                  onChange={(e) => setLocalLabel(e.target.value)}
                  onInput={(e) => resizeTextarea(e.currentTarget)}
                  onBlur={(e) => {
                    if (activeField && localLabel.trim() && localLabel.trim() !== activeField.label) {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        label: localLabel.trim()
                      });
                    }
                  }}
                  placeholder="Question label..."
                  className="w-full bg-transparent text-xl font-bold border-b border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 focus:border-primary focus:outline-none py-1 dark:text-neutral-100 text-neutral-850 placeholder-neutral-400 resize-none overflow-hidden leading-7"
                  style={{ height: 'auto', minHeight: '36px', fieldSizing: 'content' } as any}
                />

                {/* Description Input stored inside validation record */}
                <div className="relative group/desc pt-2">
                  <div className="absolute top-0 left-3 bg-white dark:bg-neutral-900 px-2 text-[10px] font-bold text-primary/70 uppercase tracking-wider z-10">
                    Description / Help Text
                  </div>
                  <textarea
                    ref={descRef}
                    value={localDescription}
                    onChange={(e) => setLocalDescription(e.target.value)}
                    onInput={(e) => resizeTextarea(e.currentTarget)}
                    onBlur={(e) => {
                      if (activeField && localDescription !== (typeof activeValidation.description === 'string' ? activeValidation.description : "")) {
                        editFormFieldMutation.mutate({
                          id: activeField.id,
                          validation: { ...activeValidation, description: localDescription.trim() }
                        });
                      }
                    }}
                    placeholder="Add a description to help people understand the question..."
                    className="w-full bg-primary/5 dark:bg-primary/10 text-sm border border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none p-4 rounded-xl text-neutral-600 dark:text-neutral-300 placeholder-neutral-400 min-h-20 resize-none transition-all"
                    style={{ fieldSizing: 'content' } as any}
                  />
                </div>
              </div>
            </div>

            {/* Editable Choices list (Inputs positioned right after Description) */}
            {(activeField?.type === 'single_select' || activeField?.type === 'multi_select' || activeField?.type === 'dropdown' || activeField?.type === 'ranking') && (
              <div className="pl-10 space-y-3 pt-4 border-t border-dashed mt-4 animate-fadeIn">
                <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block">Edit Choices</span>
                <div className="space-y-2">
                  {localChoices.map((choice, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-3 animate-fadeIn">
                      <div className="h-6 w-6 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-extrabold text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                        {String.fromCharCode(65 + cIdx)}
                      </div>
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
                        className="flex-1 bg-transparent text-xs font-semibold px-2 py-1 border-b border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 focus:border-primary focus:outline-none dark:text-neutral-250 text-neutral-750"
                      />
                      <button
                        onClick={() => handleDeleteChoice(cIdx)}
                        className="text-neutral-400 hover:text-red-500 p-1 font-semibold"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddChoice}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 pt-2 transition-colors pl-9"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add choice</span>
                </button>
              </div>
            )}

            {/* CORRECTED: Subtle, aside divider */}
            <div className="relative flex items-center pl-10 py-2 pt-6">
              <div className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary/50 animate-bounce-subtle">
                  <path d="M12 5V19M12 19L18 13M12 19L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[9px] font-bold text-primary/50 uppercase tracking-wider">Preview</span>
              </div>
              <div className="flex-1 ml-4 border-t border-dashed border-neutral-200 dark:border-neutral-700"></div>
            </div>

            {/* --- PREVIEW COMPONENTS MOVED BACK HERE --- */}

            {/* Question Header in Visual Preview */}
            <div className="flex items-start gap-3 pl-10 pt-2">
              <div className="flex-1 space-y-1">
                <h2 className="text-lg font-bold dark:text-neutral-100 text-neutral-800 leading-tight">
                  {localLabel || "Untitled question"}
                </h2>
                {localDescription && (
                  <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                    {localDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Interactive Choices Options list (Visual Preview Only) */}
            {(activeField?.type === 'single_select' || activeField?.type === 'multi_select') && (
              <div className="pl-10 space-y-3 pt-2">
                {localChoices.map((choice, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-3 animate-fadeIn">
                    <div className="h-6 w-6 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-extrabold text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                      {String.fromCharCode(65 + cIdx)}
                    </div>
                    <span className="text-sm font-semibold dark:text-neutral-250 text-neutral-750">{choice}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Ranking list Drag & Drop visual preview */}
            {activeField?.type === 'ranking' && (
              <div className="pl-10 space-y-3 pt-2">
                {localChoices.map((choice, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-3 animate-fadeIn max-w-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-2 rounded-xl">
                    <GripVertical className="h-4 w-4 text-neutral-400 cursor-grab active:cursor-grabbing" />
                    <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-[10px] font-extrabold text-primary border border-primary/20">
                      {cIdx + 1}
                    </div>
                    <span className="text-xs font-bold dark:text-neutral-250 text-neutral-750">{choice}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Dropdown Selection visual preview */}
            {activeField?.type === 'dropdown' && (
              <div className="pl-10 pt-3">
                <div className="w-full max-w-xs border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-3 text-xs text-neutral-500 flex items-center justify-between font-semibold">
                  <span>Select an option...</span>
                  <ChevronDown className="h-4 w-4 text-neutral-400" />
                </div>
              </div>
            )}

            {/* Stars Rating Visual representation */}
            {activeField?.type === 'rating' && (
              <div className="pl-10 pt-3 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} className="p-1">
                    <Star className="h-7 w-7 text-amber-400 dark:text-amber-500 fill-amber-400/25" />
                  </button>
                ))}
              </div>
            )}

            {/* Inputs Visual representations */}
            {activeField?.type === 'short_text' && (
              <div className="pl-10 pt-3">
                <div className="w-full max-w-sm border-b border-neutral-350 dark:border-neutral-700 text-xs text-neutral-400 py-2.5 italic">
                  User input placeholder...
                </div>
              </div>
            )}
            {activeField?.type === 'long_text' && (
              <div className="pl-10 pt-3">
                <div className="w-full max-w-md border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs text-neutral-450 p-4 min-h-20 bg-neutral-50 dark:bg-neutral-900/50 italic">
                  Multi-line user input placeholder...
                </div>
              </div>
            )}
            {activeField?.type === 'email' && (
              <div className="pl-10 pt-3">
                <div className="w-full max-w-sm border-b border-neutral-350 dark:border-neutral-700 text-xs text-neutral-400 py-2.5 flex items-center gap-2 italic">
                  <Mail className="h-4 w-4 text-neutral-400" />
                  <span>name@example.com</span>
                </div>
              </div>
            )}
            {activeField?.type === 'number' && (
              <div className="pl-10 pt-3">
                <div className="w-full max-w-sm border-b border-neutral-350 dark:border-neutral-700 text-xs text-neutral-400 py-2.5 flex items-center gap-2 italic">
                  <Hash className="h-4 w-4 text-neutral-400" />
                  <span>12345...</span>
                </div>
              </div>
            )}
            {activeField?.type === 'contact_info' && (
              <div className="pl-10 pt-3 space-y-2 max-w-md">
                <div className="border-b border-neutral-350 dark:border-neutral-700 text-xs text-neutral-400 py-1.5 italic">Name...</div>
                <div className="border-b border-neutral-350 dark:border-neutral-700 text-xs text-neutral-400 py-1.5 italic">Phone...</div>
                <div className="border-b border-neutral-350 dark:border-neutral-700 text-xs text-neutral-400 py-1.5 italic">Company...</div>
              </div>
            )}
            {activeField?.type === 'address' && (
              <div className="pl-10 pt-3 space-y-2 max-w-md">
                <div className="border-b border-neutral-350 dark:border-neutral-700 text-xs text-neutral-400 py-1.5 italic">Street address...</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border-b border-neutral-350 dark:border-neutral-700 text-xs text-neutral-400 py-1.5 italic">City...</div>
                  <div className="border-b border-neutral-350 dark:border-neutral-700 text-xs text-neutral-400 py-1.5 italic">State...</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border-b border-neutral-350 dark:border-neutral-700 text-xs text-neutral-400 py-1.5 italic">Zip/Postal code...</div>
                  <div className="border-b border-neutral-350 dark:border-neutral-700 text-xs text-neutral-400 py-1.5 italic">Country...</div>
                </div>
              </div>
            )}
            {activeField?.type === 'website' && (
              <div className="pl-10 pt-3">
                <div className="w-full max-w-sm border-b border-neutral-350 dark:border-neutral-700 text-xs text-neutral-400 py-2.5 flex items-center gap-2 italic">
                  <Globe className="h-4 w-4 text-neutral-400" />
                  <span>https://example.com</span>
                </div>
              </div>
            )}
            {activeField?.type === 'yes_no' && (
              <div className="pl-10 pt-3 flex gap-3">
                <button className="px-5 py-2 bg-primary/10 border border-primary/20 rounded-xl text-xs font-bold text-primary">Yes</button>
                <button className="px-5 py-2 bg-neutral-100 dark:bg-neutral-800 border dark:border-neutral-700 rounded-xl text-xs font-bold dark:text-neutral-350">No</button>
              </div>
            )}


          </div>
        </div>
      )}
    </main>
  );
}
