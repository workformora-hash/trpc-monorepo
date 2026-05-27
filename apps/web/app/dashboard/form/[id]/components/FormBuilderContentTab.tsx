  import React from 'react';
import { NavigationSidebar } from './NavigationSidebar';
import QuestionEditor from './QuestionEditor';
import { SettingsSidebar } from './SettingsSidebar';
import { useFormBuilderContext } from './FormBuilderContext';

export function FormBuilderContentTab() {
  const {
    activeField,
    selectedForm,
  } = useFormBuilderContext();

  const themeId = selectedForm?.theme ?? "default";

  return (
    <>
      {/* Enhanced Japanese Theme Visual Elements - Now managed globally by FormHeader background */}
      {themeId === 'japanese' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Subtle local Japanese architecture hint */}
          <div className="absolute top-[10%] left-[2%] w-48 h-48 opacity-[0.015] text-[#2C1810]">
             <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                <path d="M10,80 L90,80 L85,75 L15,75 Z M20,75 L80,75 L80,30 L20,30 Z M15,30 L85,30 L90,25 L10,25 Z M30,25 L70,25 L70,10 L30,10 Z M25,10 L75,10 L80,5 L20,5 Z" />
             </svg>
          </div>
        </div>
      )}

      {/* Left timeline sidebar */}
      <NavigationSidebar />

      {/* Center Canvas */}
      <QuestionEditor />

      {/* Right Settings Sidebar */}
      {activeField && (
        <SettingsSidebar />
      )}
    </>
  );
}
