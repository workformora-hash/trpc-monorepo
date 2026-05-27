'use client';

import React from 'react';
import { Lock, ToggleLeft, ToggleRight } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface AccessControlSectionProps {
  isPasswordProtected: boolean;
  onSetPassword: (password: string) => void;
  onRemovePassword: () => void;
  formMethods: UseFormReturn<any>;
  onEditForm: (fields: { maxResponses?: number | null }) => void;
}

export const AccessControlSection = React.memo(({
  isPasswordProtected,
  onSetPassword,
  onRemovePassword,
  formMethods,
  onEditForm,
}: AccessControlSectionProps) => {
  const { register, watch, setValue, formState: { errors } } = formMethods;
  const maxResponses = watch('maxResponses');

  const handleTogglePassword = () => {
    if (isPasswordProtected) {
      onRemovePassword();
    } else {
      const pass = prompt('Enter a password to protect the form (minimum 4 characters):');
      if (pass !== null) {
        if (pass.length < 4) {
          alert('Password must be at least 4 characters long.');
        } else {
          onSetPassword(pass);
        }
      }
    }
  };

  const handleToggleMaxResponses = () => {
    if (maxResponses !== null) {
      setValue('maxResponses', null);
      onEditForm({ maxResponses: null });
    } else {
      setValue('maxResponses', 100);
      onEditForm({ maxResponses: 100 });
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t dark:border-neutral-800">
      <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
        <Lock className="h-3.5 w-3.5" />
        <span>Access & Submission Control</span>
      </h4>

      <div className="space-y-3">
        {/* Password Protection */}
        <div className="flex flex-col gap-2 p-4 bg-neutral-50 dark:bg-neutral-950/20 border dark:border-neutral-800 border-neutral-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold dark:text-neutral-200 text-neutral-800">Password Protection</span>
              <p className="text-[10px] text-neutral-500">
                Require password verification before allowing a user to see or submit answers.
              </p>
            </div>
            <button
              type="button"
              onClick={handleTogglePassword}
              className="text-neutral-500 hover:text-neutral-750 transition-colors focus:outline-none"
            >
              {isPasswordProtected ? (
                <ToggleRight className="h-9 w-9 text-primary cursor-pointer" />
              ) : (
                <ToggleLeft className="h-9 w-9 text-neutral-400 cursor-pointer" />
              )}
            </button>
          </div>
          {isPasswordProtected && (
            <div className="pt-2 flex gap-3 items-center border-t border-dashed dark:border-neutral-800 mt-1 animate-fadeIn">
              <span className="text-[10px] font-extrabold text-green-500 uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded">
                Protected
              </span>
              <input
                type="password"
                placeholder="••••••••"
                disabled
                className="bg-neutral-100 dark:bg-neutral-900 border dark:border-neutral-850 rounded-lg px-2.5 py-1 text-xs text-neutral-400 w-24 cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => {
                  const pass = prompt('Enter new password (minimum 4 characters):');
                  if (pass !== null) {
                    if (pass.length < 4) {
                      alert('Password must be at least 4 characters long.');
                    } else {
                      onSetPassword(pass);
                    }
                  }
                }}
                className="text-[10px] font-bold text-primary hover:underline animate-pulse"
              >
                Change password
              </button>
            </div>
          )}
        </div>

        {/* Submission Cap (Max Responses) */}
        <div className="flex flex-col gap-2 p-4 bg-neutral-50 dark:bg-neutral-950/20 border dark:border-neutral-800 border-neutral-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold dark:text-neutral-200 text-neutral-800">Response Cap (Max Submissions)</span>
              <p className="text-[10px] text-neutral-500">
                Cap the maximum number of successful submissions this form is allowed to receive.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleMaxResponses}
              className="text-neutral-500 hover:text-neutral-755 transition-colors focus:outline-none"
            >
              {maxResponses !== null ? (
                <ToggleRight className="h-9 w-9 text-primary cursor-pointer" />
              ) : (
                <ToggleLeft className="h-9 w-9 text-neutral-400 cursor-pointer" />
              )}
            </button>
          </div>
          {maxResponses !== null && (
            <div className="pt-2 flex items-center gap-3 border-t border-dashed dark:border-neutral-800 mt-1 animate-fadeIn">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Limit:</span>
              <input
                type="number"
                min={1}
                {...register('maxResponses', {
                  valueAsNumber: true,
                  onBlur: (e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                      onEditForm({ maxResponses: val });
                    }
                  }
                })}
                className="w-24 dark:bg-neutral-900 bg-white border dark:border-neutral-800 border-neutral-250 rounded-lg px-2.5 py-1 text-xs focus:outline-none dark:text-neutral-200 text-neutral-800 font-semibold"
              />
              <span className="text-[10px] text-neutral-400 font-medium">responses</span>
            </div>
          )}
          {errors.maxResponses && <p className="text-[10px] text-red-500 font-bold">{errors.maxResponses.message as string}</p>}
        </div>
      </div>
    </div>
  );
});

AccessControlSection.displayName = 'AccessControlSection';
