import React from "react";
import { X, Check } from "lucide-react";
import { toast } from "sonner";
import { useFormBuilderContext } from "../FormBuilderContext";
import { ActiveValidationType } from "../QuestionEditor";

export interface VisualTemplate {
  id: string;
  name: string;
  description: string;
  cardBgColor?: string;
  bgImageUrl?: string;
  bgGradient?: string;
  labelColor?: string;
  descriptionColor?: string;
  activeColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  labelFontFamily?: string;
  descriptionFontFamily?: string;
  imageLayout?: string;
  imageFilter?: string;
  previewGradient: string;
  themeTag: string;
}

const VISUAL_TEMPLATES: VisualTemplate[] = [
  {
    id: "dark-glassmorphism",
    name: "Midnight Aurora",
    description: "Deep obsidian violet backdrop with a translucent glass card, glowing neon accents, and fuchsia buttons.",
    cardBgColor: "rgba(15, 10, 35, 0.8)",
    bgGradient: "linear-gradient(135deg, #090514 0%, #12092b 50%, #22053d 100%)",
    bgImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    labelColor: "#ffffff",
    descriptionColor: "#c084fc",
    activeColor: "#e879f9",
    buttonBgColor: "#e879f9",
    buttonTextColor: "#ffffff",
    labelFontFamily: "Outfit, sans-serif",
    descriptionFontFamily: "Inter, sans-serif",
    previewGradient: "from-indigo-950 via-purple-900 to-pink-900",
    themeTag: "Glassmorphic Dark",
  },
  {
    id: "sunset-glow",
    name: "Tangerine Sunset",
    description: "Warm sunset orange canvas with a cream-filled peach card, dark brown headers, and tangerine buttons.",
    cardBgColor: "#fffbf7",
    bgGradient: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)",
    bgImageUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop",
    labelColor: "#7c2d12",
    descriptionColor: "#c2410c",
    activeColor: "#ea580c",
    buttonBgColor: "#ea580c",
    buttonTextColor: "#ffffff",
    labelFontFamily: "Outfit, sans-serif",
    descriptionFontFamily: "Inter, sans-serif",
    previewGradient: "from-orange-400 via-amber-300 to-amber-100",
    themeTag: "Warm Sunset",
  },
  {
    id: "neon-cyberpunk",
    name: "Cyberpunk Terminal",
    description: "Dark matrix green grid with a solid onyx card, glowing hacker text, and radioactive green button overrides.",
    cardBgColor: "#050508",
    bgGradient: "linear-gradient(135deg, #020205 0%, #0d0d18 100%)",
    bgImageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop",
    labelColor: "#22c55e",
    descriptionColor: "#4ade80",
    activeColor: "#22c55e",
    buttonBgColor: "#22c55e",
    buttonTextColor: "#050508",
    labelFontFamily: '"Fira Code", monospace',
    descriptionFontFamily: '"Roboto Mono", monospace',
    previewGradient: "from-emerald-950 via-zinc-900 to-emerald-900",
    themeTag: "Neon Hacker",
  },
  {
    id: "forest-aura",
    name: "Emerald Sanctuary",
    description: "Deep pine forest setting with a sage green container, vintage display letters, and fresh moss elements.",
    cardBgColor: "#f4fcf6",
    bgGradient: "linear-gradient(135deg, #052e16 0%, #022c22 100%)",
    bgImageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1000&auto=format&fit=crop",
    labelColor: "#064e3b",
    descriptionColor: "#0f766e",
    activeColor: "#059669",
    buttonBgColor: "#059669",
    buttonTextColor: "#ffffff",
    labelFontFamily: '"Playfair Display", serif',
    descriptionFontFamily: "Inter, sans-serif",
    previewGradient: "from-emerald-900 via-green-800 to-emerald-955",
    themeTag: "Earthy Botanical",
  },
  {
    id: "minimalist-luxury",
    name: "Studio Minimalist",
    description: "Vogue luxury layout with a clean paper-white card, sharp obsidian serif headings, and a sleek solid black button.",
    cardBgColor: "#ffffff",
    bgGradient: "linear-gradient(135deg, #fafafa 0%, #eaeaea 100%)",
    bgImageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
    labelColor: "#000000",
    descriptionColor: "#404040",
    activeColor: "#000000",
    buttonBgColor: "#000000",
    buttonTextColor: "#ffffff",
    labelFontFamily: '"Playfair Display", serif',
    descriptionFontFamily: "Inter, sans-serif",
    previewGradient: "from-zinc-400 via-zinc-200 to-zinc-50",
    themeTag: "Luxury Editorial",
  },
  {
    id: "dreamy-lavender",
    name: "Lavender Dreams",
    description: "Dreamy lavender sky with a lilac cloud card, whimsical typography, and royal purple button details.",
    cardBgColor: "#faf9fe",
    bgGradient: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)",
    bgImageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop",
    labelColor: "#581c87",
    descriptionColor: "#7e22ce",
    activeColor: "#a855f7",
    buttonBgColor: "#a855f7",
    buttonTextColor: "#ffffff",
    labelFontFamily: "Outfit, sans-serif",
    descriptionFontFamily: "Inter, sans-serif",
    previewGradient: "from-purple-400 via-violet-300 to-indigo-150",
    themeTag: "Pastel Cloud",
  },
  {
    id: "default-theme",
    name: "Reset to Default",
    description: "Revert all visual overrides and inherit the default form theme styling.",
    previewGradient: "from-neutral-200 to-neutral-300",
    themeTag: "Default Theme",
  }
];

interface VisualTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VisualTemplateModal: React.FC<VisualTemplateModalProps> = React.memo(({ isOpen, onClose }) => {
  const { activeField, activeValidation: rawActiveValidation, editFormFieldMutation } = useFormBuilderContext();
  const activeValidation = rawActiveValidation as ActiveValidationType;

  if (!isOpen) return null;

  const handleApplyVisualTemplate = (tpl: VisualTemplate) => {
    if (!activeField) return;
    const updated = { ...activeValidation };
    if (tpl.id === "default-theme") {
      delete updated.cardBgColor;
      delete updated.bgGradient;
      delete updated.bgImageUrl;
      delete updated.labelColor;
      delete updated.descriptionColor;
      delete updated.activeColor;
      delete updated.buttonBgColor;
      delete updated.buttonTextColor;
      delete updated.labelFontFamily;
      delete updated.descriptionFontFamily;
      delete updated.imageFilter;
    } else {
      if (tpl.cardBgColor) updated.cardBgColor = tpl.cardBgColor; else delete updated.cardBgColor;
      if (tpl.bgGradient) updated.bgGradient = tpl.bgGradient; else delete updated.bgGradient;
      if (tpl.bgImageUrl) updated.bgImageUrl = tpl.bgImageUrl; else delete updated.bgImageUrl;
      if (tpl.labelColor) updated.labelColor = tpl.labelColor; else delete updated.labelColor;
      if (tpl.descriptionColor) updated.descriptionColor = tpl.descriptionColor; else delete updated.descriptionColor;
      if (tpl.activeColor) updated.activeColor = tpl.activeColor; else delete updated.activeColor;
      if (tpl.buttonBgColor) updated.buttonBgColor = tpl.buttonBgColor; else delete updated.buttonBgColor;
      if (tpl.buttonTextColor) updated.buttonTextColor = tpl.buttonTextColor; else delete updated.buttonTextColor;
      if (tpl.labelFontFamily) updated.labelFontFamily = tpl.labelFontFamily; else delete updated.labelFontFamily;
      if (tpl.descriptionFontFamily) updated.descriptionFontFamily = tpl.descriptionFontFamily; else delete updated.descriptionFontFamily;
      if (tpl.imageFilter) updated.imageFilter = tpl.imageFilter;
    }

    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: updated,
    });

    toast.success(`Applied design style "${tpl.name}" successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-neutral-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-primary" />
              </span>
              Visual Style Templates
            </h2>
            <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mt-0.5 uppercase tracking-widest">Premium Aesthetics</p>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 rounded-2xl flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VISUAL_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleApplyVisualTemplate(tpl)}
                className="group relative flex flex-col text-left rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-primary/50 dark:hover:border-primary/50 transition-all overflow-hidden hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
              >
                {/* Preview Image / Gradient Area */}
                <div className={`h-24 w-full bg-gradient-to-br ${tpl.previewGradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/5 dark:bg-black/20 group-hover:bg-black/0 transition-colors" />
                  <div className="absolute bottom-2 right-3">
                    <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                      {tpl.themeTag}
                    </span>
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-4 space-y-1.5 flex-1">
                  <h3 className="text-sm font-black text-neutral-900 dark:text-neutral-100 tracking-tight group-hover:text-primary transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-[11px] leading-relaxed font-medium text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {tpl.description}
                  </p>
                </div>

                {/* Selected Indicator */}
                {(activeValidation.bgGradient === tpl.bgGradient || activeValidation.bgImageUrl === tpl.bgImageUrl) && (
                  <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white dark:border-neutral-900 animate-scaleIn">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900/80 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            Template applies to current active field only
          </p>
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-black bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

VisualTemplateModal.displayName = "VisualTemplateModal";

export default VisualTemplateModal;
