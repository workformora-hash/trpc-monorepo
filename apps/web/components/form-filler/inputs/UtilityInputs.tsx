'use client';

import React, { memo } from "react";
import { Globe, Calendar } from "lucide-react";
import type { FieldInputProps } from "../types";

export const UtilityInputs = memo(({ field, value, styles, onChange }: FieldInputProps) => {
  const commonInputStyles = {
    color: styles.textColor,
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight as any,
    borderBottomColor: styles.inputBorderColor,
  };

  const renderIconInput = (Icon: React.ElementType, placeholder: string, type: string = "text") => (
    <div className="flex items-center gap-3 py-4 border-b transition-colors focus-within:border-primary" style={{ borderBottomColor: styles.inputBorderColor }}>
      <Icon className="h-5 w-5 opacity-30 shrink-0" />
      <input
        type={type}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent focus:outline-none placeholder:opacity-30 text-lg"
        style={commonInputStyles}
      />
    </div>
  );

  switch (field.type) {
    case 'date':
      return renderIconInput(Calendar, "MM / DD / YYYY", "date");
    case 'website':
      return renderIconInput(Globe, "https://example.com", "url");
    case 'contact_info':
      return (
        <div className="space-y-4 py-4 w-full max-w-md">
          {['First Name', 'Last Name', 'Email Address'].map(p => (
            <input 
              key={p} 
              type="text" 
              placeholder={p} 
              className="w-full bg-transparent border-b py-3 focus:outline-none opacity-50 focus:opacity-100 transition-all"
              style={commonInputStyles}
            />
          ))}
        </div>
      );
    case 'address':
      return (
        <div className="space-y-4 py-4 w-full max-w-md">
          {['Street Address', 'City', 'State / Province', 'Zip / Postal Code'].map(p => (
            <input 
              key={p} 
              type="text" 
              placeholder={p} 
              className="w-full bg-transparent border-b py-3 focus:outline-none opacity-50 focus:opacity-100 transition-all"
              style={commonInputStyles}
            />
          ))}
        </div>
      );
    case 'checkbox': {
      const checked = !!value;
      return (
        <div 
          role="checkbox"
          aria-checked={checked}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); } }}
          className="py-6 flex items-center gap-4 group cursor-pointer focus:outline-none rounded px-2"
          onClick={() => onChange(!checked)}
        >
          <div 
            className="h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-all"
            style={{ 
              borderColor: checked ? styles.primaryColor : styles.inputBorderColor,
              backgroundColor: checked ? styles.primaryColor : 'transparent'
            }}
          >
            {checked && <div className="w-1.5 h-3 border-r-2 border-b-2 border-white rotate-45 mb-1" />}
          </div>
          <span className="text-lg font-medium select-none" style={{ color: styles.textColor }}>I agree to the terms</span>
        </div>
      );
    }
    default:
      return null;
  }
});

UtilityInputs.displayName = 'UtilityInputs';
