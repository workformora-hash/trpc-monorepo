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

  // Local optimistic validation rule states (Basic)
  const [localMinLength, setLocalMinLength] = useState<number | "">(activeValidation.minLength !== undefined ? activeValidation.minLength : "");
  const [localMaxLength, setLocalMaxLength] = useState<number | "">(activeValidation.maxLength !== undefined ? activeValidation.maxLength : "");
  const [localMin, setLocalMin] = useState<number | "">(activeValidation.min !== undefined ? activeValidation.min : "");
  const [localMax, setLocalMax] = useState<number | "">(activeValidation.max !== undefined ? activeValidation.max : "");
  const [localMinDate, setLocalMinDate] = useState<string>(activeValidation.minDate || "");
  const [localMaxDate, setLocalMaxDate] = useState<string>(activeValidation.maxDate || "");

  // Local optimistic validation rule states (Advanced/Typeform Premium)
  const [localBlockFreeEmails, setLocalBlockFreeEmails] = useState(!!activeValidation.blockFreeEmails);
  const [localAllowedDomains, setLocalAllowedDomains] = useState(activeValidation.allowedDomains || "");
  const [localFormat, setLocalFormat] = useState(activeValidation.format || "any");
  const [localPattern, setLocalPattern] = useState(activeValidation.pattern || "");
  const [localPatternMessage, setLocalPatternMessage] = useState(activeValidation.patternMessage || "");
  const [localIntegerOnly, setLocalIntegerOnly] = useState(!!activeValidation.integerOnly);
  const [localMaxStars, setLocalMaxStars] = useState<number>(activeValidation.maxStars || activeValidation.max || 5);
  const [localMustBeChecked, setLocalMustBeChecked] = useState(!!activeValidation.mustBeChecked);
  const [localMinChoices, setLocalMinChoices] = useState<number | "">(activeValidation.minChoices !== undefined ? activeValidation.minChoices : "");
  const [localMaxChoices, setLocalMaxChoices] = useState<number | "">(activeValidation.maxChoices !== undefined ? activeValidation.maxChoices : "");

  // Synchronize local states when the active field or validation updates from the database
  useEffect(() => {
    setLocalRequired(activeField.required);
    setLocalIsMultiple(activeField.type === "multi_select");
    setLocalRandomize(!!activeValidation.randomize);
    setLocalAllowOther(!!activeValidation.allowOther);
    setLocalVerticalAlign(!!activeValidation.verticalAlign);

    setLocalMinLength(activeValidation.minLength !== undefined ? activeValidation.minLength : "");
    setLocalMaxLength(activeValidation.maxLength !== undefined ? activeValidation.maxLength : "");
    setLocalMin(activeValidation.min !== undefined ? activeValidation.min : "");
    setLocalMax(activeValidation.max !== undefined ? activeValidation.max : "");
    setLocalMinDate(activeValidation.minDate || "");
    setLocalMaxDate(activeValidation.maxDate || "");

    setLocalBlockFreeEmails(!!activeValidation.blockFreeEmails);
    setLocalAllowedDomains(activeValidation.allowedDomains || "");
    setLocalFormat(activeValidation.format || "any");
    setLocalPattern(activeValidation.pattern || "");
    setLocalPatternMessage(activeValidation.patternMessage || "");
    setLocalIntegerOnly(!!activeValidation.integerOnly);
    setLocalMaxStars(activeValidation.maxStars || activeValidation.max || 5);
    setLocalMustBeChecked(!!activeValidation.mustBeChecked);
    setLocalMinChoices(activeValidation.minChoices !== undefined ? activeValidation.minChoices : "");
    setLocalMaxChoices(activeValidation.maxChoices !== undefined ? activeValidation.maxChoices : "");
  }, [
    activeField,
    activeField.required,
    activeField.type,
    activeValidation.randomize,
    activeValidation.allowOther,
    activeValidation.verticalAlign,
    activeValidation.minLength,
    activeValidation.maxLength,
    activeValidation.min,
    activeValidation.max,
    activeValidation.minDate,
    activeValidation.maxDate,
    activeValidation.blockFreeEmails,
    activeValidation.allowedDomains,
    activeValidation.format,
    activeValidation.pattern,
    activeValidation.patternMessage,
    activeValidation.integerOnly,
    activeValidation.maxStars,
    activeValidation.max,
    activeValidation.mustBeChecked,
    activeValidation.minChoices,
    activeValidation.maxChoices,
  ]);

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

  const handleMinLengthBlur = (val: string) => {
    const parsed = val === "" ? undefined : parseInt(val, 10);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        minLength: parsed,
      },
    });
  };

  const handleMaxLengthBlur = (val: string) => {
    const parsed = val === "" ? undefined : parseInt(val, 10);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        maxLength: parsed,
      },
    });
  };

  const handleMinBlur = (val: string) => {
    const parsed = val === "" ? undefined : parseFloat(val);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        min: parsed,
      },
    });
  };

  const handleMaxBlur = (val: string) => {
    const parsed = val === "" ? undefined : parseFloat(val);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        max: parsed,
      },
    });
  };

  const handleMinDateBlur = (val: string) => {
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        minDate: val || undefined,
      },
    });
  };

  const handleMaxDateBlur = (val: string) => {
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        maxDate: val || undefined,
      },
    });
  };

  // Advanced Typeform validation handlers
  const handleToggleBlockFreeEmails = () => {
    const nextVal = !localBlockFreeEmails;
    setLocalBlockFreeEmails(nextVal);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        blockFreeEmails: nextVal,
      },
    });
  };

  const handleAllowedDomainsBlur = (val: string) => {
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        allowedDomains: val.trim() || undefined,
      },
    });
  };

  const handleFormatChange = (val: string) => {
    setLocalFormat(val);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        format: val === "any" ? undefined : val,
      },
    });
  };

  const handlePatternBlur = (val: string) => {
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        pattern: val.trim() || undefined,
      },
    });
  };

  const handlePatternMessageBlur = (val: string) => {
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        patternMessage: val.trim() || undefined,
      },
    });
  };

  const handleToggleIntegerOnly = () => {
    const nextVal = !localIntegerOnly;
    setLocalIntegerOnly(nextVal);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        integerOnly: nextVal,
      },
    });
  };

  const handleMaxStarsChange = (val: number) => {
    setLocalMaxStars(val);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        maxStars: val,
        max: val,
      },
    });
  };

  const handleToggleMustBeChecked = () => {
    const nextVal = !localMustBeChecked;
    setLocalMustBeChecked(nextVal);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        mustBeChecked: nextVal,
      },
    });
  };

  const handleMinChoicesBlur = (val: string) => {
    const parsed = val === "" ? undefined : parseInt(val, 10);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        minChoices: parsed,
      },
    });
  };

  const handleMaxChoicesBlur = (val: string) => {
    const parsed = val === "" ? undefined : parseInt(val, 10);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: {
        ...activeValidation,
        maxChoices: parsed,
      },
    });
  };

  const isChoiceField = activeField.type === "single_select" || activeField.type === "multi_select";
  
  const hasValidationRules =
    activeField.type === "short_text" ||
    activeField.type === "long_text" ||
    activeField.type === "email" ||
    activeField.type === "number" ||
    activeField.type === "rating" ||
    activeField.type === "checkbox" ||
    activeField.type === "multi_select" ||
    activeField.type === "date";

  return (
    <aside className="w-80 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-6 overflow-y-auto font-sans select-none animate-fadeIn">
      
      {/* Category switcher */}
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block border-b pb-1">Question</span>
        
        {/* Text vs Video switcher */}
        <div className="flex bg-neutral-100 dark:bg-neutral-955 p-1 rounded-lg border dark:border-neutral-800">
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
              <span className="text-xs font-bold dark:text-neutral-200 text-neutral-755 block">Required</span>
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
                  <span className="text-xs font-bold dark:text-neutral-200 text-neutral-755 block">Multiple selection</span>
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
                  <span className="text-xs font-bold dark:text-neutral-200 text-neutral-755 block">Randomize</span>
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
                  <span className="text-xs font-bold dark:text-neutral-200 text-neutral-755 block">&quot;Other&quot; option</span>
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
              <span className="text-xs font-bold dark:text-neutral-200 text-neutral-755 block">Vertical alignment</span>
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

      {/* Validation settings (Conditional based on field type) */}
      {hasValidationRules && (
        <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 animate-fadeIn text-left">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block border-b pb-1">Validation Rules</span>
          
          <div className="space-y-4">
            
            {/* Text validations */}
            {(activeField.type === "short_text" || activeField.type === "long_text") && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-450">Min Characters</label>
                    <input
                      type="number"
                      min={0}
                      value={localMinLength}
                      onChange={(e) => setLocalMinLength(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                      onBlur={(e) => handleMinLengthBlur(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-850 rounded-lg px-2.5 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-750 focus:outline-none focus:border-primary"
                      placeholder="None"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-450">Max Characters</label>
                    <input
                      type="number"
                      min={0}
                      value={localMaxLength}
                      onChange={(e) => setLocalMaxLength(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                      onBlur={(e) => handleMaxLengthBlur(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-855 rounded-lg px-2.5 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-750 focus:outline-none focus:border-primary"
                      placeholder="None"
                    />
                  </div>
                </div>

                {/* Text Structure Preset */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-450">Text Format Restriction</label>
                  <select
                    value={localFormat}
                    onChange={(e) => handleFormatChange(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-750 focus:outline-none"
                  >
                    <option value="any">Any text format</option>
                    <option value="url">Valid Web URL (HTTP/HTTPS)</option>
                    <option value="alpha">Letters only (A-Z)</option>
                    <option value="alphanumeric">Letters & Numbers only</option>
                  </select>
                </div>

                {/* Regex Pattern Matcher */}
                <div className="space-y-3 p-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-800 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold dark:text-neutral-300 text-neutral-700 block">Advanced Regex Match</span>
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-neutral-400 block">Regex Expression Pattern</label>
                    <input
                      type="text"
                      value={localPattern}
                      onChange={(e) => setLocalPattern(e.target.value)}
                      onBlur={(e) => handlePatternBlur(e.target.value)}
                      placeholder="e.g. ^[0-9]{5}$"
                      className="w-full bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1 text-xs dark:text-neutral-200 text-neutral-750 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-neutral-400 block">Custom Error Message</label>
                    <input
                      type="text"
                      value={localPatternMessage}
                      onChange={(e) => setLocalPatternMessage(e.target.value)}
                      onBlur={(e) => handlePatternMessageBlur(e.target.value)}
                      placeholder="Must be a valid zip code."
                      className="w-full bg-white dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1 text-xs dark:text-neutral-200 text-neutral-755 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email validations */}
            {activeField.type === "email" && (
              <>
                {/* Block Free Email Providers */}
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-955/20 border dark:border-neutral-800 border-neutral-200 rounded-xl">
                  <div className="space-y-0.5 text-left pr-3">
                    <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">Corporate Email Only</span>
                    <span className="text-[9px] text-neutral-400 block leading-tight">Block free addresses (Gmail, Yahoo, Outlook)</span>
                  </div>
                  <button
                    onClick={handleToggleBlockFreeEmails}
                    className="focus:outline-none transition-all active:scale-95"
                  >
                    {localBlockFreeEmails ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
                  </button>
                </div>

                {/* Restrict to exact domains */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-450 block">Restrict to Email Domains</label>
                  <input
                    type="text"
                    value={localAllowedDomains}
                    onChange={(e) => setLocalAllowedDomains(e.target.value)}
                    onBlur={(e) => handleAllowedDomainsBlur(e.target.value)}
                    placeholder="e.g. apple.com, google.com"
                    className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-850 rounded-lg px-3 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-755 focus:outline-none focus:border-primary"
                  />
                  <span className="text-[9px] text-neutral-400 leading-tight block mt-0.5">Separate multiple domains with commas</span>
                </div>
              </>
            )}

            {/* Number validations */}
            {activeField.type === "number" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-450">Min Value</label>
                    <input
                      type="number"
                      value={localMin}
                      onChange={(e) => setLocalMin(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      onBlur={(e) => handleMinBlur(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-750 focus:outline-none focus:border-primary"
                      placeholder="None"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-450">Max Value</label>
                    <input
                      type="number"
                      value={localMax}
                      onChange={(e) => setLocalMax(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      onBlur={(e) => handleMaxBlur(e.target.value)}
                      className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-850 rounded-lg px-2.5 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-750 focus:outline-none focus:border-primary"
                      placeholder="None"
                    />
                  </div>
                </div>

                {/* Integer-only Toggle */}
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-955/20 border dark:border-neutral-800 border-neutral-200 rounded-xl">
                  <div className="space-y-0.5 text-left pr-3">
                    <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">Integer Values Only</span>
                    <span className="text-[9px] text-neutral-400 block leading-tight">Restrict answers to whole integers</span>
                  </div>
                  <button
                    onClick={handleToggleIntegerOnly}
                    className="focus:outline-none transition-all active:scale-95"
                  >
                    {localIntegerOnly ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
                  </button>
                </div>
              </>
            )}

            {/* Rating validations */}
            {activeField.type === "rating" && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-450 block">Maximum Rating Stars</label>
                <select
                  value={localMaxStars}
                  onChange={(e) => handleMaxStarsChange(parseInt(e.target.value, 10))}
                  className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-750 focus:outline-none"
                >
                  <option value={3}>3 Stars scale</option>
                  <option value={5}>5 Stars scale (Default)</option>
                  <option value={10}>10 Stars scale</option>
                </select>
              </div>
            )}

            {/* Checkbox validations */}
            {activeField.type === "checkbox" && (
              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-955/20 border dark:border-neutral-800 border-neutral-200 rounded-xl">
                <div className="space-y-0.5 text-left pr-3">
                  <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">Must Be Checked</span>
                  <span className="text-[9px] text-neutral-400 block leading-tight">Force check (e.g. Terms & Privacy policies)</span>
                </div>
                <button
                  onClick={handleToggleMustBeChecked}
                  className="focus:outline-none transition-all active:scale-95"
                >
                  {localMustBeChecked ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
                </button>
              </div>
            )}

            {/* Multi-select validations */}
            {activeField.type === "multi_select" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-450 block">Min Checked</label>
                  <input
                    type="number"
                    min={1}
                    value={localMinChoices}
                    onChange={(e) => setLocalMinChoices(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                    onBlur={(e) => handleMinChoicesBlur(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-750 focus:outline-none focus:border-primary"
                    placeholder="None"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-450 block">Max Checked</label>
                  <input
                    type="number"
                    min={1}
                    value={localMaxChoices}
                    onChange={(e) => setLocalMaxChoices(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                    onBlur={(e) => handleMaxChoicesBlur(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-750 focus:outline-none focus:border-primary"
                    placeholder="None"
                  />
                </div>
              </div>
            )}

            {/* Date validations */}
            {activeField.type === "date" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-450 block">Min Allowed Date</label>
                  <input
                    type="date"
                    value={localMinDate}
                    onChange={(e) => setLocalMinDate(e.target.value)}
                    onBlur={(e) => handleMinDateBlur(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-850 rounded-lg px-3 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-750 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-450 block">Max Allowed Date</label>
                  <input
                    type="date"
                    value={localMaxDate}
                    onChange={(e) => setLocalMaxDate(e.target.value)}
                    onBlur={(e) => handleMaxDateBlur(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-855 rounded-lg px-3 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-750 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image/Video preview box */}
      <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider text-left block">Image or video</span>
        <button
          onClick={() => toast.info("Premium layout asset attachment active!")}
          className="w-full aspect-video border-2 border-dashed dark:border-neutral-800 border-neutral-200 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-955 flex flex-col items-center justify-center gap-1.5 text-neutral-400 transition-all"
        >
          <Plus className="h-5 w-5" />
          <span className="text-[10px] font-bold">Add media assets</span>
        </button>
      </div>

    </aside>
  );
}
