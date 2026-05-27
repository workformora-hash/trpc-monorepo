'use client';

import React, { memo } from 'react';
import { useFormBuilderContext } from '../FormBuilderContext';
import { SidebarSection, SectionLabel } from './ui/SidebarPrimitives';
import { ImageIcon, Trash2, Upload } from 'lucide-react';
import { type ActiveValidationType } from '../QuestionEditor';
import { toast } from 'sonner';

export const MediaSettings = memo(() => {
  const { activeField, activeValidation: rawActiveValidation, editFormFieldMutation } = useFormBuilderContext();
  const activeValidation = rawActiveValidation as ActiveValidationType;

  if (!activeField) return null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'bg') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading(`Uploading ${type}...`);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.url) {
        const updates = type === 'image' 
          ? { imageUrl: data.url, imageLayout: 'top' }
          : { bgImageUrl: data.url, bgImageBrightness: 100 };
        
        editFormFieldMutation.mutate({
          id: activeField.id,
          validation: { ...activeValidation, ...updates }
        });
        toast.success(`${type} uploaded!`);
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <SidebarSection>
      <SectionLabel>Media & Assets</SectionLabel>
      <div className="space-y-4">
        <div className="space-y-2">
           <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Main Image</label>
           {activeValidation.imageUrl ? (
             <div className="relative group rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
               <img src={activeValidation.imageUrl as string} className="w-full h-24 object-cover" alt="Preview" />
               <button 
                 onClick={() => editFormFieldMutation.mutate({ id: activeField.id, validation: { ...activeValidation, imageUrl: undefined } })}
                 className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 <Trash2 className="h-5 w-5 text-white" />
               </button>
             </div>
           ) : (
             <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors">
               <Upload className="h-5 w-5 text-neutral-400 mb-1" />
               <span className="text-[10px] font-bold text-neutral-400 uppercase">Upload Image</span>
               <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'image')} accept="image/*" />
             </label>
           )}
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Background Image</label>
           {activeValidation.bgImageUrl ? (
             <div className="relative group rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
               <img src={activeValidation.bgImageUrl as string} className="w-full h-24 object-cover" alt="Preview" />
               <button 
                 onClick={() => editFormFieldMutation.mutate({ id: activeField.id, validation: { ...activeValidation, bgImageUrl: undefined } })}
                 className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 <Trash2 className="h-5 w-5 text-white" />
               </button>
             </div>
           ) : (
             <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors">
               <ImageIcon className="h-5 w-5 text-neutral-400 mb-1" />
               <span className="text-[10px] font-bold text-neutral-400 uppercase">Upload BG</span>
               <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'bg')} accept="image/*" />
             </label>
           )}
        </div>
      </div>
    </SidebarSection>
  );
});

MediaSettings.displayName = 'MediaSettings';
