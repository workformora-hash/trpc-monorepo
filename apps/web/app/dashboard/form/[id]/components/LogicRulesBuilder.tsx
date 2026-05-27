'use client';

import React, { useState } from 'react';
import { trpc } from '~/trpc/client';
import { toast } from 'sonner';
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  Info, 
  ChevronRight, 
  Save, 
  X,
  Sliders,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import type { FormField } from '@repo/database';

interface LogicRulesBuilderProps {
  formId: string;
  formSlug: string;
  fields: FormField[];
}

export function LogicRulesBuilder({ formId, formSlug, fields }: LogicRulesBuilderProps) {
  const utils = trpc.useUtils();

  // Fetch logic tree from backend
  const { data: logicData, isLoading: logicLoading, refetch: refetchLogicTree } = 
    trpc.form.getFormLogicTree.useQuery({ slug: formSlug });

  // Mutations to edit logic rules
  const addRuleMutation = trpc.form.addFieldLogicRule.useMutation({
    onSuccess: () => {
      toast.success("Logic rule applied successfully!");
      refetchLogicTree();
      setSelectedFieldId(null);
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Failed to add logic rule.");
    }
  });

  const deleteRuleMutation = trpc.form.deleteFieldLogicRule.useMutation({
    onSuccess: () => {
      toast.success("Logic rule deleted.");
      refetchLogicTree();
      setSelectedFieldId(null);
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message || "Failed to delete logic rule.");
    }
  });

  // State for rule editing
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [triggerFieldId, setTriggerFieldId] = useState<string>('');
  const [operator, setOperator] = useState<"equals" | "not_equals" | "greater_than" | "less_than">('equals');
  const [value, setValue] = useState<string>('');

  const logicTree = logicData?.logicTree || [];

  // Filter out welcome/thank_you screens and the very first standard question (as it has no preceding questions)
  const standardFields = fields.filter(f => f.type !== 'welcome' && f.type !== 'thank_you');
  const targetFields = standardFields.slice(1);

  const handleEditRule = (field: FormField, existingRule: { triggerFieldId: string; operator: "equals" | "not_equals" | "greater_than" | "less_than"; value?: unknown } | null | undefined) => {
    setSelectedFieldId(field.id);
    if (existingRule) {
      setTriggerFieldId(existingRule.triggerFieldId);
      setOperator(existingRule.operator);
      setValue(String(existingRule.value));
    } else {
      // Find a default trigger (any field that comes before this field in orderIndex)
      const precedingFields = fields.filter(f => f.orderIndex < field.orderIndex && f.type !== 'welcome' && f.type !== 'thank_you');
      setTriggerFieldId(precedingFields[0]?.id || '');
      setOperator('equals');
      setValue('');
    }
  };

  const handleSaveRule = (targetId: string) => {
    if (!triggerFieldId) {
      toast.error("Please select a trigger question.");
      return;
    }
    if (!value.trim()) {
      toast.error("Please enter a value for the condition.");
      return;
    }

    addRuleMutation.mutate({
      fieldId: targetId,
      rule: {
        triggerFieldId,
        operator,
        value,
      }
    });
  };

  const handleDeleteRule = (targetId: string) => {
    if (confirm("Are you sure you want to remove conditional logic from this question?")) {
      deleteRuleMutation.mutate({
        fieldId: targetId
      });
    }
  };

  if (logicLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-neutral-400 animate-pulse">
        <GitBranch className="h-5 w-5 mr-2 animate-spin text-primary" />
        <span>Loading logic tree...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      
      {/* Overview Card */}
      <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/40 p-4 rounded-xl flex gap-3 text-xs">
        <Info className="h-5 w-5 text-emerald-650 dark:text-emerald-450 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-emerald-805 dark:text-emerald-305">🧠 Advanced Answering Logic (Branching)</h4>
          <p className="text-neutral-550 leading-relaxed">
            Configure conditional branching to construct interactive flows. Questions with rules will be <strong>skipped</strong> unless their conditions are fully satisfied. Trigger choices only support preceding questions to avoid infinite circular display loops.
          </p>
        </div>
      </div>

      {targetFields.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl text-neutral-400 text-xs italic gap-1.5 flex flex-col items-center">
          <AlertCircle className="h-5 w-5 text-neutral-350" />
          <span>Add at least two standard questions to define branching logic rules.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {targetFields.map((field, idx) => {
            const treeItem = logicTree.find(item => item.fieldId === field.id);
            const existingRule = treeItem?.logicRule;
            const isEditing = selectedFieldId === field.id;

            // Get standard trigger candidates (only fields that come BEFORE this field)
            const triggerCandidates = fields.filter(
              f => f.orderIndex < field.orderIndex && f.type !== 'welcome' && f.type !== 'thank_you'
            );

            return (
              <div 
                key={field.id}
                className={`bg-white dark:bg-neutral-900 border rounded-xl p-5 transition-all shadow-sm ${
                  isEditing 
                    ? 'ring-1 ring-primary border-primary/50' 
                    : 'border-neutral-200 dark:border-neutral-850 hover:border-neutral-300 dark:hover:border-neutral-800'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                        Q{standardFields.findIndex(f => f.id === field.id) + 1}
                      </span>
                      <span className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200 truncate max-w-[280px]">
                        {field.label || "Untitled Question"}
                      </span>
                    </div>

                    {/* Rule Text Description */}
                    {!isEditing && (
                      <div className="text-[11px] mt-1.5 flex items-center gap-1.5 text-neutral-500">
                        {existingRule ? (
                          <>
                            <GitBranch className="h-3 w-3 text-primary shrink-0" />
                            <span>
                              Show only when{' '}
                              <strong className="text-neutral-700 dark:text-neutral-350">
                                "{fields.find(f => f.id === existingRule.triggerFieldId)?.label || 'Deleted Question'}"
                              </strong>{' '}
                              {existingRule.operator.replace('_', ' ')}{' '}
                              <strong className="text-primary font-mono bg-primary/5 dark:bg-primary/10 px-1.5 py-0.5 rounded">
                                {String(existingRule.value)}
                              </strong>
                            </span>
                          </>
                        ) : (
                          <span className="text-neutral-400 italic">Always shown (no custom display condition).</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  {!isEditing && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        onClick={() => handleEditRule(field, existingRule)}
                        className="text-[10px] font-bold h-7 px-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-350 dark:hover:bg-neutral-705 dark:border-neutral-700"
                      >
                        {existingRule ? 'Edit logic rule' : 'Add logic rule'}
                      </Button>

                      {existingRule && (
                        <button
                          onClick={() => handleDeleteRule(field.id)}
                          className="p-1.5 rounded hover:bg-red-50 hover:text-red-500 text-neutral-400 dark:hover:bg-red-955/20 transition-all"
                          title="Delete logic rule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Edit Form Panel */}
                {isEditing && (
                  <div className="mt-5 pt-4 border-t dark:border-neutral-850 space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-neutral-700 dark:text-neutral-350">
                      <Sliders className="h-3.5 w-3.5 text-primary" />
                      <span>Define Skip/Show Logic Rule</span>
                    </div>

                    {triggerCandidates.length === 0 ? (
                      <div className="text-[11px] text-red-500 italic flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" />
                        <span>Cannot add conditional logic because this is the first question in the form. Please add preceding questions first.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Select Preceding Trigger Question */}
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            If Question
                          </label>
                          <select
                            value={triggerFieldId}
                            onChange={(e) => setTriggerFieldId(e.target.value)}
                            className="w-full text-xs font-semibold px-3 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-1 focus:ring-primary focus:outline-none"
                          >
                            <option value="" disabled>Select trigger question...</option>
                            {triggerCandidates.map((c, cIdx) => (
                              <option key={c.id} value={c.id}>
                                Q{cIdx + 1}: {c.label || "Untitled Screen"}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Select Operator */}
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            Operator
                          </label>
                          <select
                            value={operator}
                            onChange={(e) => setOperator(e.target.value as any)}
                            className="w-full text-xs font-semibold px-3 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-1 focus:ring-primary focus:outline-none"
                          >
                            <option value="equals">equals</option>
                            <option value="not_equals">does not equal</option>
                            <option value="greater_than">greater than</option>
                            <option value="less_than">less than</option>
                          </select>
                        </div>

                        {/* Input Value */}
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            Value
                          </label>
                          <input
                            type="text"
                            placeholder="Choice value (e.g. Yes)"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full text-xs font-semibold px-3 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-1 focus:ring-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Edit Form Actions */}
                    <div className="flex items-center gap-2 pt-2 justify-end">
                      <Button
                        onClick={() => setSelectedFieldId(null)}
                        variant="outline"
                        className="text-[10px] font-bold h-8 px-3 border dark:border-neutral-850 flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        <span>Cancel</span>
                      </Button>

                      {triggerCandidates.length > 0 && (
                        <Button
                          onClick={() => handleSaveRule(field.id)}
                          className="text-[10px] font-bold h-8 px-3 bg-primary text-white hover:bg-primary-hover flex items-center gap-1"
                          disabled={addRuleMutation.isPending}
                        >
                          <Save className="h-3 w-3" />
                          <span>{addRuleMutation.isPending ? "Saving..." : "Save logic rule"}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
