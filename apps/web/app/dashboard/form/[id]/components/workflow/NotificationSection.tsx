'use client';

import React from 'react';
import { Mail, ToggleLeft, ToggleRight } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface NotificationSectionProps {
  formMethods: UseFormReturn<any>;
  onEditForm: (fields: { notifyCreator?: boolean; notifyRespondent?: boolean }) => void;
}

export const NotificationSection = React.memo(({
  formMethods,
  onEditForm,
}: NotificationSectionProps) => {
  const { watch, setValue } = formMethods;
  const notifyCreator = watch('notifyCreator');
  const notifyRespondent = watch('notifyRespondent');

  const handleToggleCreator = () => {
    const newVal = !notifyCreator;
    setValue('notifyCreator', newVal);
    onEditForm({ notifyCreator: newVal });
  };

  const handleToggleRespondent = () => {
    const newVal = !notifyRespondent;
    setValue('notifyRespondent', newVal);
    onEditForm({ notifyRespondent: newVal });
  };

  return (
    <div className="space-y-4 pt-4 border-t dark:border-neutral-800"> 
      <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
        <Mail className="h-3.5 w-3.5" />
        <span>Email Notifications</span>
      </h4>

      <div className="space-y-3">
        {/* Notify Creator */}
        <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950/20 border dark:border-neutral-800 border-neutral-200 rounded-xl">
          <div className="space-y-0.5 pr-4">
            <span className="text-xs font-bold dark:text-neutral-200 text-neutral-800">Notify Creator</span>
            <p className="text-[10px] text-neutral-500">
              Receive an email notification every time a new response is submitted to this form.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleCreator}
            className="text-neutral-505 hover:text-neutral-75 transition-colors focus:outline-none"
          >
            {notifyCreator ? (
              <ToggleRight className="h-9 w-9 text-primary cursor-pointer" />
            ) : (
              <ToggleLeft className="h-9 w-9 text-neutral-400 cursor-pointer" />
            )}
          </button>
        </div>

        {/* Notify Respondent */}
        <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950/20 border dark:border-neutral-800 border-neutral-200 rounded-xl">
          <div className="space-y-0.5 pr-4">
            <span className="text-xs font-bold dark:text-neutral-200 text-neutral-800">Notify Respondent</span>
            <p className="text-[10px] text-neutral-500">
              Send an automated copy of responses and details back to the respondent.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleRespondent}
            className="text-neutral-505 hover:text-neutral-75 transition-colors focus:outline-none"
          >
            {notifyRespondent ? (
              <ToggleRight className="h-9 w-9 text-primary cursor-pointer" />
            ) : (
              <ToggleLeft className="h-9 w-9 text-neutral-400 cursor-pointer" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

NotificationSection.displayName = 'NotificationSection';
