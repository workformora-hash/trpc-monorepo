'use client';

import React from 'react';
import { ToggleLeft, ToggleRight, Copy, Trash2, Globe, Lock, Sliders, Palette, Mail } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface Form {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  visibility: 'public' | 'unlisted' | string;
  maxResponses?: number | null;
  notifyCreator: boolean;
  notifyRespondent: boolean;
  theme?: string | null;
  isPasswordProtected?: boolean;
}

interface WorkflowTabProps {
  form: Form;
  onEditForm: (fields: {
    title?: string;
    description?: string | null;
    slug?: string | null;
    visibility?: 'public' | 'unlisted';
    maxResponses?: number | null;
    notifyCreator?: boolean;
    notifyRespondent?: boolean;
    theme?: string;
  }) => void;
  onSetPassword: (password: string) => void;
  onRemovePassword: () => void;
  onDuplicateForm: () => void;
  onDeleteForm: () => void;
}

export function WorkflowTab({
  form,
  onEditForm,
  onSetPassword,
  onRemovePassword,
  onDuplicateForm,
  onDeleteForm,
}: WorkflowTabProps) {
  // Local state for instant/snappy UI feedback (Optimistic Updates)        
  const [localNotifyCreator, setLocalNotifyCreator] = React.useState(form.notifyCreator);
  const [localNotifyRespondent, setLocalNotifyRespondent] = React.useState(form.notifyRespondent);
  const [localMaxResponses, setLocalMaxResponses] = React.useState(form.maxResponses);
  const [localIsPasswordProtected, setLocalIsPasswordProtected] = React.useState(form.isPasswordProtected);
  const [localTheme, setLocalTheme] = React.useState(form.theme || 'default');

  // Synchronize state when props update from database
  React.useEffect(() => {
    setLocalNotifyCreator(form.notifyCreator);
  }, [form.notifyCreator]);

  React.useEffect(() => {
    setLocalNotifyRespondent(form.notifyRespondent);
  }, [form.notifyRespondent]);

  React.useEffect(() => {
    setLocalMaxResponses(form.maxResponses);
  }, [form.maxResponses]);

  React.useEffect(() => {
    setLocalIsPasswordProtected(form.isPasswordProtected);
  }, [form.isPasswordProtected]);

  React.useEffect(() => {
    setLocalTheme(form.theme || 'default');
  }, [form.theme]);

  const handleToggleCreator = () => {
    const newVal = !localNotifyCreator;
    setLocalNotifyCreator(newVal);
    onEditForm({ notifyCreator: newVal });
  };

  const handleToggleRespondent = () => {
    const newVal = !localNotifyRespondent;
    setLocalNotifyRespondent(newVal);
    onEditForm({ notifyRespondent: newVal });
  };

  const handleToggleMaxResponses = () => {
    if (localMaxResponses !== null && localMaxResponses !== undefined) {    
      setLocalMaxResponses(null);
      onEditForm({ maxResponses: null });
    } else {
      setLocalMaxResponses(100);
      onEditForm({ maxResponses: 100 });
    }
  };

  const handleTogglePassword = () => {
    if (localIsPasswordProtected) {
      setLocalIsPasswordProtected(false);
      onRemovePassword();
    } else {
      const pass = prompt('Enter a password to protect the form (minimum 4 characters):');
      if (pass !== null) {
        if (pass.length < 4) {
          alert('Password must be at least 4 characters long.');
        } else {
          setLocalIsPasswordProtected(true);
          onSetPassword(pass);
        }
      }
    }
  };

  return (
    <div className="flex-1 bg-[#f9f9fb] dark:bg-neutral-955 p-10 overflow-y-auto">
      <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-900 border dark:border-neutral-800 border-neutral-200 rounded-2xl p-8 space-y-8 shadow-sm text-left animate-fadeIn">
        
        {/* Header */}
        <div className="border-b dark:border-neutral-800 pb-4">
          <h3 className="text-lg font-bold dark:text-neutral-100 text-neutral-800 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            <span>Form Settings & Details</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Configure parameters, access control limits, theme styles, and submission rules. Cache is automatically updated instantly via Redis for ultra-fast load times.
          </p>
        </div>

        <div className="space-y-6">

          {/* Section 1: General Details */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">General Metadata</h4>

            {/* Form Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold dark:text-neutral-300 text-neutral-600">Form Title</label>
              <input
                type="text"
                defaultValue={form.title}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && val !== form.title) {
                    onEditForm({ title: val });
                  }
                }}
                className="w-full dark:bg-neutral-950 bg-white border dark:border-neutral-800 border-neutral-250 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:text-neutral-200 text-neutral-800 transition-all"
              />
            </div>

            {/* Form Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold dark:text-neutral-300 text-neutral-600">Form Description</label>
              <textarea
                defaultValue={form.description || ''}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val !== (form.description || '')) {
                    onEditForm({ description: val || null });
                  }
                }}
                placeholder="Brief description to display under the form title..."
                className="w-full dark:bg-neutral-955 bg-white border dark:border-neutral-800 border-neutral-250 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 h-20 resize-none dark:text-neutral-200 text-neutral-800 transition-all"
              />
            </div>
          </div>

          {/* Section 2: Form Link & Visibility */}
          <div className="space-y-4 pt-4 border-t dark:border-neutral-800"> 
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              <span>Link & Discovery</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Custom Link (Slug) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold dark:text-neutral-300 text-neutral-600">Custom URL Slug</label>
                <div className="flex items-center gap-1.5 dark:bg-neutral-950 bg-white border dark:border-neutral-800 border-neutral-250 rounded-xl px-4 py-2.5 text-xs focus-within:border-primary transition-all">
                  <span className="text-neutral-400 font-semibold select-none">/f/</span>
                  <input
                    type="text"
                    defaultValue={form.slug}
                    onBlur={(e) => {
                      const val = e.target.value.trim().toLowerCase();      
                      if (val && val !== form.slug) {
                        if (!/^[a-z0-9-_]+$/.test(val)) {
                          alert('Slug must contain only lowercase letters, numbers, hyphens, and underscores.');
                          e.target.value = form.slug; // reset
                        } else {
                          onEditForm({ slug: val });
                        }
                      }
                    }}
                    className="flex-1 bg-transparent focus:outline-none dark:text-neutral-200 text-neutral-800 font-semibold"
                  />
                </div>
              </div>

              {/* Form Visibility */}
              <div className="space-y-1">
                <label className="text-xs font-semibold dark:text-neutral-300 text-neutral-600">Form Visibility</label>
                <select
                  value={form.visibility}
                  onChange={(e) => {
                    const val = e.target.value as 'public' | 'unlisted';    
                    onEditForm({ visibility: val });
                  }}
                  className="w-full dark:bg-neutral-955 bg-white border dark:border-neutral-800 border-neutral-250 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:text-neutral-200 text-neutral-800 font-semibold transition-all h-[38px]"
                >
                  <option value="unlisted">Unlisted (Private link only)</option>
                  <option value="public">Public (Discoverable in search)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Access Control & Limits */}
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
                    {localIsPasswordProtected ? (
                      <ToggleRight className="h-9 w-9 text-primary cursor-pointer" />
                    ) : (
                      <ToggleLeft className="h-9 w-9 text-neutral-400 cursor-pointer" />
                    )}
                  </button>
                </div>
                {localIsPasswordProtected && (
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
                    {(localMaxResponses !== null && localMaxResponses !== undefined) ? (
                      <ToggleRight className="h-9 w-9 text-primary cursor-pointer" />
                    ) : (
                      <ToggleLeft className="h-9 w-9 text-neutral-400 cursor-pointer" />
                    )}
                  </button>
                </div>
                {localMaxResponses !== null && localMaxResponses !== undefined && (
                  <div className="pt-2 flex items-center gap-3 border-t border-dashed dark:border-neutral-800 mt-1 animate-fadeIn">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Limit:</span>
                    <input
                      type="number"
                      min={1}
                      value={localMaxResponses}
                      onChange={(e) => {
                        const val = parseInt(e.target.value.trim(), 10);
                        if (!isNaN(val)) {
                          setLocalMaxResponses(val);
                        }
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value.trim(), 10);    
                        if (!isNaN(val) && val > 0 && val !== form.maxResponses) {
                          onEditForm({ maxResponses: val });
                        }
                      }}
                      className="w-24 dark:bg-neutral-900 bg-white border dark:border-neutral-800 border-neutral-250 rounded-lg px-2.5 py-1 text-xs focus:outline-none dark:text-neutral-200 text-neutral-800 font-semibold"
                    />
                    <span className="text-[10px] text-neutral-400 font-medium">responses</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Email Notifications */}
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
                  {localNotifyCreator ? (
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
                  {localNotifyRespondent ? (
                    <ToggleRight className="h-9 w-9 text-primary cursor-pointer" />
                  ) : (
                    <ToggleLeft className="h-9 w-9 text-neutral-400 cursor-pointer" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Form Theme style */}
          <div className="space-y-4 pt-4 border-t dark:border-neutral-800">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              <span>Form Color Themes</span>
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[
                { id: 'default', name: 'Slate', color: 'bg-neutral-850 border-neutral-600' },
                { id: 'cyberpunk', name: 'Cyberpunk', color: 'bg-purple-650 border-pink-500' },
                { id: 'ocean', name: 'Ocean', color: 'bg-blue-500 border-sky-450' },
                { id: 'forest', name: 'Forest', color: 'bg-emerald-650 border-green-450' },
                { id: 'japanese', name: 'Japanese', color: 'bg-[#F9F4F0] border-[#BC243C]' },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setLocalTheme(t.id);
                    onEditForm({ theme: t.id });
                  }}
                  className={`cursor-pointer py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all text-center ${   
                    localTheme === t.id
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'    
                      : 'dark:border-neutral-800 border-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-950'
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full border ${t.color}`} />
                  <span className="text-[10px] font-bold dark:text-neutral-200 text-neutral-800">{t.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t dark:border-neutral-800 flex gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={onDuplicateForm}
              className="flex-1 text-xs font-semibold h-10 border dark:border-neutral-800 flex items-center justify-center gap-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-950"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Duplicate Form</span>
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                if (confirm('Soft-delete this form? You can restore it from the archive later.')) {
                  onDeleteForm();
                }
              }}
              className="flex-1 text-xs font-semibold h-10 border dark:border-red-950 border-neutral-205 hover:bg-red-50 dark:hover:bg-red-955/20 hover:text-red-500 flex items-center justify-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-505" />
              <span className="text-red-505">Delete Form</span>
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
