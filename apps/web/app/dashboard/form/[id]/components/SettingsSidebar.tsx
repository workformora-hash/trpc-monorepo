import React, { useState, useEffect } from "react";
import {
  Plus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";

interface ActiveField {
  id: string;
  type: string;
  required: boolean;
  validation?: any;
}

interface EditFormFieldMutation {
  mutate: (variables: any) => void;
}

export function SettingsSidebar({
  activeField,
  editFormFieldMutation,
}: {
  activeField: ActiveField;
  editFormFieldMutation: EditFormFieldMutation;
}) {
  const activeValidation = activeField?.validation || {};

  // Local optimistic states to ensure toggles switch instantly (0ms latency)
  const [localRequired, setLocalRequired] = useState(activeField.required);
  const [localIsMultiple, setLocalIsMultiple] = useState(activeField.type === "multi_select");
  const [localRandomize, setLocalRandomize] = useState(!!activeValidation.randomize);
  const [localAllowOther, setLocalAllowOther] = useState(!!activeValidation.allowOther);
  const [localVerticalAlign, setLocalVerticalAlign] = useState(!!activeValidation.verticalAlign);

  // Synchronize local state when the active field or validation updates from the database
  useEffect(() => {
    setLocalRequired(activeField.required);
    setLocalIsMultiple(activeField.type === "multi_select");
    setLocalRandomize(!!activeValidation.randomize);
    setLocalAllowOther(!!activeValidation.allowOther);
    setLocalVerticalAlign(!!activeValidation.verticalAlign);
  }, [activeField, activeField.required, activeField.type, activeValidation.randomize, activeValidation.allowOther, activeValidation.verticalAlign]);

  const handleToggleRequired = () => {
    const nextVal = !localRequired;
    setLocalRequired(nextVal);
    editFormFieldMutation.mutate({
      id: activeField.id,
      required: nextVal,
    });
  };

  const handleToggleMultiple = () => {
    const nextVal = !localIsMultiple;
    setLocalIsMultiple(nextVal);
    const nextType = nextVal ? "multi_select" : "single_select";
    editFormFieldMutation.mutate({
      id: activeField.id,
      type: nextType,
    });
  };

  const handleToggleRandomize = () => {
    const nextVal = !localRandomize;
    setLocalRandomize(nextVal);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        randomize: nextVal,
      },
    });
  };

  const handleToggleAllowOther = () => {
    const nextVal = !localAllowOther;
    setLocalAllowOther(nextVal);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        allowOther: nextVal,
      },
    });
  };

  const handleToggleVerticalAlign = () => {
    const nextVal = !localVerticalAlign;
    setLocalVerticalAlign(nextVal);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        verticalAlign: nextVal,
      },
    });
  };

  const isChoiceField = activeField.type === "single_select" || activeField.type === "multi_select";

  return (
    <aside className="w-80 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-6 overflow-y-auto font-sans select-none animate-fadeIn">
      
      {/* Category switcher */}
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block border-b pb-1">Question</span>
        
        {/* Text vs Video switcher */}
        <div className="flex bg-neutral-100 dark:bg-neutral-950 p-1 rounded-lg border dark:border-neutral-800">
          <button className="flex-1 py-1 text-[11px] font-bold bg-white dark:bg-neutral-900 rounded shadow-xs text-neutral-800 dark:text-neutral-100 text-center">Text</button>
          <button className="flex-1 py-1 text-[11px] font-bold text-neutral-500 hover:text-neutral-800 text-center">Video</button>
        </div>

        {/* Question Type selection dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-neutral-400 block">Type</label>
          <select
            value={activeField.type}
            onChange={(e) => {
              if (activeField) {
                editFormFieldMutation.mutate({
                  id: activeField.id,
                  type: e.target.value as any
                });
              }
            }}
            className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs font-semibold dark:text-neutral-100 text-neutral-750 focus:outline-none"
          >
            <option value="short_text">Short Text</option>
            <option value="long_text">Long Text</option>
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="single_select">Multiple Choice</option>
            <option value="multi_select">Checkbox Options</option>
            <option value="rating">Rating</option>
            <option value="date">Date</option>
          </select>
        </div>
      </div>

      {/* Settings switches */}
      <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block border-b pb-1">Settings</span>
        
        <div className="space-y-3.5">
          {/* REQUIRED SWITCH */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">Required</span>
              <span className="text-[9px] text-neutral-400">Respondent must fill this out</span>
            </div>
            <button
              onClick={handleToggleRequired}
              className="p-1 text-primary focus:outline-none transition-all active:scale-95"
            >
              {localRequired ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
            </button>
          </div>

          {/* CHOICE QUESTION SPECIFIC SETTINGS */}
          {isChoiceField && (
            <>
              {/* MULTIPLE SELECTION SWITCH */}
              <div className="flex items-center justify-between animate-fadeIn">
                <div className="text-left">
                  <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">Multiple selection</span>
                  <span className="text-[9px] text-neutral-400">Allow selecting multiple options</span>
                </div>
                <button
                  onClick={handleToggleMultiple}
                  className="p-1 text-primary focus:outline-none transition-all active:scale-95"
                >
                  {localIsMultiple ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
                </button>
              </div>

              {/* RANDOMIZE */}
              <div className="flex items-center justify-between animate-fadeIn">
                <div className="text-left">
                  <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">Randomize</span>
                  <span className="text-[9px] text-neutral-400">Shuffle option arrangements</span>
                </div>
                <button
                  onClick={handleToggleRandomize}
                  className="p-1 text-primary focus:outline-none transition-all active:scale-95"
                >
                  {localRandomize ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
                </button>
              </div>

              {/* OTHER OPTION */}
              <div className="flex items-center justify-between animate-fadeIn">
                <div className="text-left">
                  <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">&quot;Other&quot; option</span>
                  <span className="text-[9px] text-neutral-400">Include customizable input</span>
                </div>
                <button
                  onClick={handleToggleAllowOther}
                  className="p-1 text-primary focus:outline-none transition-all active:scale-95"
                >
                  {localAllowOther ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
                </button>
              </div>
            </>
          )}

          {/* VERTICAL ALIGNMENT */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">Vertical alignment</span>
              <span className="text-[9px] text-neutral-400">Center align on slide canvas</span>
            </div>
            <button
              onClick={handleToggleVerticalAlign}
              className="p-1 text-primary focus:outline-none transition-all active:scale-95"
            >
              {localVerticalAlign ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Image/Video preview box */}
      <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">Image or video</span>
        <button
          onClick={() => toast.info("Premium layout asset attachment active!")}
          className="w-full aspect-video border-2 border-dashed dark:border-neutral-800 border-neutral-200 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-950 flex flex-col items-center justify-center gap-1.5 text-neutral-400 transition-all"
        >
          <Plus className="h-5 w-5" />
          <span className="text-[10px] font-bold">Add media assets</span>
        </button>
      </div>

    </aside>
  );
}
