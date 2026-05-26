import React from "react";
import {
  Plus,
  Trash2,
  Mail,
  Hash,
  Star,
  Calendar,
  Sparkles,
  Settings,
  Clock,
  Database,
  Palette as PaletteIcon,
  X,
  Type,
  FileText,
  ListIcon,
  CheckSquare,
  Globe,
  GripVertical,
  ChevronDown,
  Smile,
  Play,
  User,
  Phone,
  Image as ImageIcon,
  CreditCard,
  Upload,
  Sliders,
  Folder,
  Layers,
  MapPin,
  Check,
  CheckCircle2,
  Lock,
  Gift,
  Twitter,
  Linkedin,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { getImageStyles, getBgImageStyles } from '~/utils/image-styles';
import { useFormBuilderContext } from './FormBuilderContext';

interface VisualTemplate {
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

const ELEMENT_CATEGORIES = [
  {
    category: "Choice",
    items: [
      { id: "single_select", name: "Multiple Choice", description: "Allow selecting one option", Icon: ListIcon, color: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" },
      { id: "multi_select", name: "Checkbox Options", description: "Allow selecting multiple options", Icon: CheckSquare, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" },
      { id: "dropdown", name: "Dropdown Selection", description: "Select from a collapsed list", Icon: ChevronDown, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" },
      { id: "yes_no", name: "Yes/No buttons", description: "Simple binary selection choice", Icon: CheckSquare, color: "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400" },
      { id: "ranking", name: "Ranking list", description: "Allow ordering items dynamically", Icon: GripVertical, color: "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400" }
    ]
  },
  {
    category: "Contact info",
    items: [
      { id: "contact_info", name: "Contact Info", description: "Capture name, email, and phone", Icon: FileText, color: "bg-pink-100 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400" },
      { id: "email", name: "Email", description: "Accept valid email addresses", Icon: Mail, color: "bg-pink-100 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400" },
      { id: "address", name: "Address", description: "Format street, city, state, zip", Icon: Globe, color: "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400" },
      { id: "website", name: "Website", description: "Accept secure URLs (HTTPS)", Icon: Globe, color: "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400" }
    ]
  },
  {
    category: "Rating & ranking",
    items: [
      { id: "rating", name: "Rating Star Scale", description: "Star scales for NPS / satisfaction", Icon: Star, color: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" }
    ]
  },
  {
    category: "Text & Video",
    items: [
      { id: "short_text", name: "Short Text", description: "Accept brief single-line responses", Icon: Type, color: "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400" },
      { id: "long_text", name: "Long Text", description: "Accept multi-line feedback/essays", Icon: FileText, color: "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400" },
      { id: "statement", name: "Statement (Text Slide)", description: "Display statements without inputs", Icon: Sparkles, color: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" }
    ]
  },
  {
    category: "Other",
    items: [
      { id: "number", name: "Number", description: "Accept valid numerical inputs", Icon: Hash, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
      { id: "date", name: "Date Field", description: "Display calendar date selectors", Icon: Calendar, color: "bg-teal-100 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400" },
      { id: "welcome", name: "Welcome Screen", description: "Introductory starting form card", Icon: Play, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
      { id: "thank_you", name: "Thank You Screen", description: "Outro ending form completion card", Icon: Smile, color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" }
    ]
  }
];

const GOOGLE_FONTS = [
  { name: "Inter (Clean UI)", value: "Inter, sans-serif" },
  { name: "Outfit (Premium Geometric)", value: "Outfit, sans-serif" },
  { name: "Poppins (Warm & Friendly)", value: "Poppins, sans-serif" },
  { name: "Montserrat (Classic Modern)", value: "Montserrat, sans-serif" },
  { name: "DM Sans (Minimalist UI)", value: "DM Sans, sans-serif" },
  { name: "Satoshi (Premium Sans)", value: "Satoshi, sans-serif" },
  { name: "General Sans (Neo-Grotesque)", value: "General Sans, sans-serif" },
  { name: "Clash Display (Expressive display)", value: "Clash Display, sans-serif" },
  { name: "Raleway (Elegant High-Contrast)", value: "Raleway, sans-serif" },
  { name: "Nunito (Soft Rounded)", value: "Nunito, sans-serif" },
  { name: "Syne (Trendy Art)", value: "Syne, sans-serif" },
  { name: "Playfair Display (Vintage Serif)", value: '"Playfair Display", serif' },
  { name: "Merriweather (Classic Editorial Book)", value: "Merriweather, serif" },
  { name: "Lora (Contemporary Scholarly Serif)", value: "Lora, serif" },
  { name: "Fira Code (Developer Mono)", value: '"Fira Code", monospace' },
  { name: "Roboto Mono (Clean Tech Mono)", value: '"Roboto Mono", monospace' },
];

export function QuestionEditor() {
  const {
    selectedFields,
    activeField,
    activeFieldIndex,
    localLabel,
    setLocalLabel,
    localDescription,
    setLocalDescription,
    localChoices,
    setLocalChoices,
    labelRef,
    descRef,
    editFormFieldMutation,
    handleUpdateChoice,
    handleAddChoice,
    handleDeleteChoice,
    handleAddNewField,
    activeValidation: rawActiveValidation,
    selectedForm,
  } = useFormBuilderContext();

  const activeValidation = rawActiveValidation as any;
  const isDarkTheme = selectedForm?.theme === 'dark' || selectedForm?.theme === 'cyberpunk' || selectedForm?.theme === 'retro';
  const themeId = selectedForm?.theme ?? "default";

  const [showTemplateModal, setShowTemplateModal] = React.useState(false);

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
    setShowTemplateModal(false);
  };

  const mainStyle = activeValidation.bgGradient
    ? {
        background: activeValidation.bgGradient,
      }
    : {
        background: 'radial-gradient(ellipse at 60% 0%, hsl(220,20%,97%) 0%, hsl(220,15%,94%) 100%)',
      };

  const [showAddElementModal, setShowAddElementModal] = React.useState(false);
  const [elementSearchQuery, setElementSearchQuery] = React.useState("");
  
  const [activePopover, setActivePopover] = React.useState<'button' | 'rating' | 'yes_no' | 'title' | 'description' | 'image' | 'choices' | null>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Close popover when active field changes to prevent accidental cross-field editing
  React.useEffect(() => {
    setActivePopover(null);
  }, [activeField?.id]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderPopover = () => {
    if (!activePopover || !activeField) return null;

    const colorPresets = [
      { name: "Royal Violet", hex: "#a855f7" },
      { name: "Emerald Green", hex: "#10b981" },
      { name: "Cyberpunk Green", hex: "#22c55e" },
      { name: "Warm Orange", hex: "#ea580c" },
      { name: "Sunset Pink", hex: "#ec4899" },
      { name: "Sleek Charcoal", hex: "#27272a" },
      { name: "Deep Ocean", hex: "#3b82f6" },
    ];

    const isTopElement = activePopover === 'image' || activePopover === 'title' || activePopover === 'description' || activePopover === 'choices';

    return (
      <div 
        ref={popoverRef}
        className={`absolute ${isTopElement ? 'right-0 top-full mt-3' : 'left-0 bottom-full mb-3'} bg-white/95 dark:bg-neutral-900/98 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl shadow-2xl z-70 w-72 animate-scaleIn space-y-4 text-left select-none font-sans`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-105 dark:border-neutral-800 pb-2 mb-1">
          <span className="text-xs font-extrabold text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
            <PaletteIcon className="h-3.5 w-3.5 text-primary" />
            <span>
              {activePopover === 'title' ? "Style Question Title" : 
               activePopover === 'description' ? "Style Description" : 
               activePopover === 'image' ? "Style Layout Image" :
               activePopover === 'choices' ? (
                 (activeField?.type === 'short_text' || activeField?.type === 'long_text' || activeField?.type === 'email' || activeField?.type === 'number' || activeField?.type === 'website' || activeField?.type === 'date' || activeField?.type === 'address' || activeField?.type === 'contact_info') 
                 ? "Style Input Text" 
                 : "Style Options"
               ) :
               "Customize Style"}
            </span>
          </span>
          <button 
            type="button"
            onClick={() => setActivePopover(null)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-250 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Input fields for buttons */}
        {activePopover === 'button' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Button Label</label>
              <input 
                type="text"
                value={activeValidation.buttonText || ""}
                placeholder={activeField?.type === 'welcome' ? "Start" : activeField?.type === 'thank_you' ? "Done" : "Continue"}
                onChange={(e) => {
                  editFormFieldMutation.mutate({
                    id: activeField?.id || "",
                    validation: { ...activeValidation, buttonText: e.target.value || undefined }
                  });
                }}
                className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-850 dark:text-neutral-100 focus:outline-none focus:border-primary"
              />
            </div>

            {activeField?.type === 'thank_you' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Redirect URL</label>
                <input 
                  type="text"
                  value={activeValidation.redirectUrl || ""}
                  placeholder="https://yourwebsite.com/success"
                  onChange={(e) => {
                    editFormFieldMutation.mutate({
                      id: activeField.id,
                      validation: { ...activeValidation, redirectUrl: e.target.value || undefined }
                    });
                  }}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-850 dark:text-neutral-100 focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {/* Colors picker */}
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Button Color</label>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, buttonBgColor: preset.hex }
                      });
                    }}
                    className={`h-6 w-6 rounded-full border border-white dark:border-neutral-900 transition-transform active:scale-90 relative ${
                      (activeValidation.buttonBgColor || (activeField?.type === 'welcome' ? '#10b981' : activeField?.type === 'thank_you' ? '#6366f1' : '#27272a')) === preset.hex ? 'scale-110 ring-2 ring-primary/40' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.name}
                  />
                ))}

                {/* Custom Color Dot */}
                <div className="relative h-6 w-6 rounded-full border border-white dark:border-neutral-900 overflow-hidden flex items-center justify-center hover:scale-105 transition-transform bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
                  <input 
                    type="color"
                    value={activeValidation.buttonBgColor || "#000000"}
                    onChange={(e) => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, buttonBgColor: e.target.value }
                      });
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                  />
                  <span className="text-[9px] font-black text-white pointer-events-none">+</span>
                </div>
              </div>
            </div>

            {/* Custom Text Color Picker */}
            <div className="space-y-2 pt-1.5">
              <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Text Color</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "White", hex: "#ffffff" },
                  { name: "Dark Charcoal", hex: "#09090b" },
                  { name: "Warm Gold", hex: "#fbbf24" },
                  { name: "Fresh Mint", hex: "#a7f3d0" },
                  { name: "Soft Cyan", hex: "#cffafe" },
                  { name: "Pink Pastel", hex: "#fce7f3" },
                ].map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, buttonTextColor: color.hex }
                      });
                    }}
                    className={`h-6 w-6 rounded-full border border-neutral-300 dark:border-neutral-700 transition-transform active:scale-90 relative ${
                      (activeValidation.buttonTextColor || '#ffffff') === color.hex ? 'scale-110 ring-2 ring-primary/40' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}

                {/* Custom Text Color Dot */}
                <div className="relative h-6 w-6 rounded-full border border-neutral-300 dark:border-neutral-700 overflow-hidden flex items-center justify-center hover:scale-105 transition-transform bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
                  <input 
                    type="color"
                    value={activeValidation.buttonTextColor || "#ffffff"}
                    onChange={(e) => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, buttonTextColor: e.target.value }
                      });
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                  />
                  <span className="text-[9px] font-black text-white pointer-events-none">+</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customizer for rating stars */}
        {activePopover === 'rating' && (
          <div className="space-y-3">
            {/* Rating Star Colors */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Star Active Color</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Gold", hex: "#fbbf24" },
                  { name: "Ruby", hex: "#ef4444" },
                  { name: "Fuchsia", hex: "#ec4899" },
                  { name: "Violet", hex: "#8b5cf6" },
                  { name: "Emerald", hex: "#10b981" },
                  { name: "Ocean Blue", hex: "#3b82f6" },
                ].map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, activeColor: color.hex }
                      });
                    }}
                    className={`h-6 w-6 rounded-full border border-white dark:border-neutral-900 transition-transform active:scale-90 relative ${
                      (activeValidation.activeColor || '#fbbf24') === color.hex ? 'scale-110 ring-2 ring-primary/40' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}

                {/* Custom Color Dot */}
                <div className="relative h-6 w-6 rounded-full border border-white dark:border-neutral-900 overflow-hidden flex items-center justify-center hover:scale-105 transition-transform bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
                  <input 
                    type="color"
                    value={activeValidation.activeColor || "#fbbf24"}
                    onChange={(e) => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, activeColor: e.target.value }
                      });
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                  />
                  <span className="text-[9px] font-black text-white pointer-events-none">+</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customizer for yes_no buttons */}
        {activePopover === 'yes_no' && (
          <div className="space-y-3">
            {/* Yes/No active border color */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Active Highlight Color</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Default Violet", hex: "#6366f1" },
                  { name: "Emerald Green", hex: "#10b981" },
                  { name: "Teal Sunset", hex: "#0d9488" },
                  { name: "Warm Orange", hex: "#f97316" },
                  { name: "Rose Pink", hex: "#f43f5e" },
                  { name: "Obsidian Black", hex: "#18181b" },
                ].map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, activeColor: color.hex }
                      });
                    }}
                    className={`h-6 w-6 rounded-full border border-white dark:border-neutral-900 transition-transform active:scale-90 relative ${
                      (activeValidation.activeColor || '#6366f1') === color.hex ? 'scale-110 ring-2 ring-primary/40' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}

                {/* Custom Color Dot */}
                <div className="relative h-6 w-6 rounded-full border border-white dark:border-neutral-900 overflow-hidden flex items-center justify-center hover:scale-105 transition-transform bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
                  <input 
                    type="color"
                    value={activeValidation.activeColor || "#6366f1"}
                    onChange={(e) => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, activeColor: e.target.value }
                      });
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                  />
                  <span className="text-[9px] font-black text-white pointer-events-none">+</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customizer for question label / title */}
        {activePopover === 'title' && (
          <div className="space-y-3.5">
            {/* Font Family Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Font Family</label>
              <select
                value={activeValidation.labelFontFamily || "Outfit, sans-serif"}
                onChange={(e) => {
                  editFormFieldMutation.mutate({
                    id: activeField?.id || "",
                    validation: { ...activeValidation, labelFontFamily: e.target.value }
                  });
                }}
                className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                {GOOGLE_FONTS.map(f => (
                  <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Font Size Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Font Size</label>
                <select
                  value={activeValidation.labelFontSize || "24px"}
                  onChange={(e) => {
                    editFormFieldMutation.mutate({
                      id: activeField.id,
                      validation: { ...activeValidation, labelFontSize: e.target.value }
                    });
                  }}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary"
                >
                  {["16px", "18px", "20px", "22px", "24px", "26px", "28px", "32px", "36px", "40px", "48px"].map(sz => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
              </div>

              {/* Font Weight Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Weight</label>
                <select
                  value={activeValidation.labelFontWeight || "700"}
                  onChange={(e) => {
                    editFormFieldMutation.mutate({
                      id: activeField.id,
                      validation: { ...activeValidation, labelFontWeight: e.target.value }
                    });
                  }}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary"
                >
                  <option value="300">Light (300)</option>
                  <option value="400">Regular (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">SemiBold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">ExtraBold (800)</option>
                  <option value="900">Black (900)</option>
                </select>
              </div>
            </div>

            {/* Text Alignment Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Alignment</label>
              <div className="grid grid-cols-4 gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-lg">
                {["left", "center", "right", "justify"].map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, labelAlignment: align }
                      });
                    }}
                    className={`text-[10px] py-1 font-extrabold rounded capitalize transition-all ${
                      (activeValidation.labelAlignment || "left") === align
                        ? "bg-white dark:bg-neutral-900 text-primary shadow-2xs"
                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors picker */}
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Text Color</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Clean White", hex: "#ffffff" },
                  { name: "Deep Onyx", hex: "#0a0a0a" },
                  { name: "Royal Violet", hex: "#a855f7" },
                  { name: "Cyberpunk Green", hex: "#22c55e" },
                  { name: "Warm Orange", hex: "#ea580c" },
                  { name: "Sunset Pink", hex: "#ec4899" },
                  { name: "Ocean Blue", hex: "#3b82f6" },
                ].map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, labelColor: preset.hex }
                      });
                    }}
                    className={`h-6 w-6 rounded-full border border-neutral-300 dark:border-neutral-700 transition-transform active:scale-90 relative ${
                      (activeValidation.labelColor || '#ffffff') === preset.hex ? 'scale-110 ring-2 ring-primary/40' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.name}
                  />
                ))}

                {/* Custom Color Dot */}
                <div className="relative h-6 w-6 rounded-full border border-neutral-300 dark:border-neutral-700 overflow-hidden flex items-center justify-center hover:scale-105 transition-transform bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
                  <input 
                    type="color"
                    value={activeValidation.labelColor || "#ffffff"}
                    onChange={(e) => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, labelColor: e.target.value }
                      });
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                  />
                  <span className="text-[9px] font-black text-white pointer-events-none">+</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customizer for question description */}
        {activePopover === 'description' && (
          <div className="space-y-3.5">
            {/* Font Family Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Font Family</label>
              <select
                value={activeValidation.descriptionFontFamily || "Inter, sans-serif"}
                onChange={(e) => {
                  editFormFieldMutation.mutate({
                    id: activeField?.id || "",
                    validation: { ...activeValidation, descriptionFontFamily: e.target.value }
                  });
                }}
                className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                {GOOGLE_FONTS.map(f => (
                  <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Font Size Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Font Size</label>
                <select
                  value={activeValidation.descriptionFontSize || "14px"}
                  onChange={(e) => {
                    editFormFieldMutation.mutate({
                      id: activeField.id,
                      validation: { ...activeValidation, descriptionFontSize: e.target.value }
                    });
                  }}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary"
                >
                  {["11px", "12px", "13px", "14px", "15px", "16px", "18px", "20px", "22px", "24px", "28px"].map(sz => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
              </div>

              {/* Font Weight Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Weight</label>
                <select
                  value={activeValidation.descriptionFontWeight || "400"}
                  onChange={(e) => {
                    editFormFieldMutation.mutate({
                      id: activeField.id,
                      validation: { ...activeValidation, descriptionFontWeight: e.target.value }
                    });
                  }}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary"
                >
                  <option value="300">Light (300)</option>
                  <option value="400">Regular (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">SemiBold (600)</option>
                  <option value="700">Bold (700)</option>
                </select>
              </div>
            </div>

            {/* Text Alignment Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Alignment</label>
              <div className="grid grid-cols-4 gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-lg">
                {["left", "center", "right", "justify"].map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, descriptionAlignment: align }
                      });
                    }}
                    className={`text-[10px] py-1 font-extrabold rounded capitalize transition-all ${
                      (activeValidation.descriptionAlignment || "left") === align
                        ? "bg-white dark:bg-neutral-900 text-primary shadow-2xs"
                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors picker */}
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Text Color</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Muted Gray", hex: "#737373" },
                  { name: "Clean White", hex: "#ffffff" },
                  { name: "Deep Onyx", hex: "#0a0a0a" },
                  { name: "Lavender Pastel", hex: "#c084fc" },
                  { name: "Fresh Mint", hex: "#a7f3d0" },
                  { name: "Peach Glow", hex: "#fed7aa" },
                  { name: "Ocean Soft", hex: "#93c5fd" },
                ].map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, descriptionColor: preset.hex }
                      });
                    }}
                    className={`h-6 w-6 rounded-full border border-neutral-300 dark:border-neutral-700 transition-transform active:scale-90 relative ${
                      (activeValidation.descriptionColor || '#737373') === preset.hex ? 'scale-110 ring-2 ring-primary/40' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.name}
                  />
                ))}

                {/* Custom Color Dot */}
                <div className="relative h-6 w-6 rounded-full border border-neutral-300 dark:border-neutral-700 overflow-hidden flex items-center justify-center hover:scale-105 transition-transform bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
                  <input 
                    type="color"
                    value={activeValidation.descriptionColor || "#737373"}
                    onChange={(e) => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, descriptionColor: e.target.value }
                      });
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                  />
                  <span className="text-[9px] font-black text-white pointer-events-none">+</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customizer for question options / choices / answers */}
        {activePopover === 'choices' && (
          <div className="space-y-3.5">
            {/* Font Family Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Font Family</label>
              <select
                value={activeValidation.answerFontFamily || "Inter, sans-serif"}
                onChange={(e) => {
                  editFormFieldMutation.mutate({
                    id: activeField?.id || "",
                    validation: { ...activeValidation, answerFontFamily: e.target.value }
                  });
                }}
                className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                {GOOGLE_FONTS.map(f => (
                  <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Font Size Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Font Size</label>
                <select
                  value={activeValidation.answerFontSize || "14px"}
                  onChange={(e) => {
                    editFormFieldMutation.mutate({
                      id: activeField.id,
                      validation: { ...activeValidation, answerFontSize: e.target.value }
                    });
                  }}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary"
                >
                  {["11px", "12px", "13px", "14px", "15px", "16px", "18px", "20px", "22px", "24px", "28px"].map(sz => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
              </div>

              {/* Font Weight Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Weight</label>
                <select
                  value={activeValidation.answerFontWeight || "400"}
                  onChange={(e) => {
                    editFormFieldMutation.mutate({
                      id: activeField.id,
                      validation: { ...activeValidation, answerFontWeight: e.target.value }
                    });
                  }}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary"
                >
                  <option value="300">Light (300)</option>
                  <option value="400">Regular (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">SemiBold (600)</option>
                  <option value="700">Bold (700)</option>
                </select>
              </div>
            </div>

            {/* Colors picker for text */}
            <div className="space-y-2 pt-1">
              <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Text Color</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Clean White", hex: "#ffffff" },
                  { name: "Muted Gray", hex: "#737373" },
                  { name: "Deep Onyx", hex: "#0a0a0a" },
                  { name: "Lavender Pastel", hex: "#c084fc" },
                  { name: "Fresh Mint", hex: "#a7f3d0" },
                  { name: "Peach Glow", hex: "#fed7aa" },
                  { name: "Ocean Soft", hex: "#93c5fd" },
                ].map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, answerColor: preset.hex }
                      });
                    }}
                    className={`h-6 w-6 rounded-full border border-neutral-300 dark:border-neutral-700 transition-transform active:scale-90 relative ${
                      (activeValidation.answerColor || '#737373') === preset.hex ? 'scale-110 ring-2 ring-primary/40' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.name}
                  />
                ))}

                {/* Custom Color Dot */}
                <div className="relative h-6 w-6 rounded-full border border-neutral-300 dark:border-neutral-700 overflow-hidden flex items-center justify-center hover:scale-105 transition-transform bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
                  <input 
                    type="color"
                    value={activeValidation.answerColor || "#737373"}
                    onChange={(e) => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, answerColor: e.target.value }
                      });
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                  />
                  <span className="text-[9px] font-black text-white pointer-events-none">+</span>
                </div>
              </div>
            </div>

            {/* Active Highlight Color for selection/primary states */}
            {!(activeField?.type === 'short_text' || activeField?.type === 'long_text' || activeField?.type === 'email' || activeField?.type === 'number' || activeField?.type === 'website' || activeField?.type === 'date' || activeField?.type === 'address' || activeField?.type === 'contact_info') && (
              <div className="space-y-2 pt-1.5 border-t border-neutral-100 dark:border-neutral-800/60 mt-2 pt-3">
                <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Active Highlight Color</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Primary Blue", hex: "#3b82f6" },
                    { name: "Emerald", hex: "#10b981" },
                    { name: "Vivid Purple", hex: "#8b5cf6" },
                    { name: "Ruby Red", hex: "#ef4444" },
                    { name: "Sunset Orange", hex: "#f97316" },
                    { name: "Cyber Green", hex: "#22c55e" },
                  ].map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => {
                        editFormFieldMutation.mutate({
                          id: activeField.id,
                          validation: { ...activeValidation, activeColor: color.hex }
                        });
                      }}
                      className={`h-6 w-6 rounded-full border border-white dark:border-neutral-900 transition-transform active:scale-90 relative ${
                        (activeValidation.activeColor || '#3b82f6') === color.hex ? 'scale-110 ring-2 ring-primary/40' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}

                  {/* Custom Color Dot */}
                  <div className="relative h-6 w-6 rounded-full border border-white dark:border-neutral-900 overflow-hidden flex items-center justify-center hover:scale-105 transition-transform bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
                    <input 
                      type="color"
                      value={activeValidation.activeColor || "#3b82f6"}
                      onChange={(e) => {
                        editFormFieldMutation.mutate({
                          id: activeField.id,
                          validation: { ...activeValidation, activeColor: e.target.value }
                        });
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                    />
                    <span className="text-[9px] font-black text-white pointer-events-none">+</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customizer for question layout image */}
        {activePopover === 'image' && (
          <div className="space-y-3.5 max-h-[350px] overflow-y-auto no-scrollbar pr-0.5">
            {/* Position Layout */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider block">Image Position Layout</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'split-left', label: 'Left', desc: 'Split Left' },
                  { id: 'split-right', label: 'Right', desc: 'Split Right' },
                  { id: 'top', label: 'Top', desc: 'Top Inline' },
                ].map((lay) => (
                  <button
                    key={lay.id}
                    type="button"
                    onClick={() => {
                      editFormFieldMutation.mutate({
                        id: activeField.id,
                        validation: { ...activeValidation, imageLayout: lay.id }
                      });
                    }}
                    className={`px-2 py-1.5 rounded-xl text-left border text-[11px] font-bold transition-all relative ${
                      (activeValidation.imageLayout || 'top') === lay.id 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-neutral-200 dark:border-neutral-805 hover:bg-neutral-50 dark:hover:bg-neutral-950/20 text-neutral-600 dark:text-neutral-350'
                    }`}
                  >
                    <div className="block">{lay.label}</div>
                    <div className="text-[8px] font-normal text-neutral-400 mt-0.5 leading-tight">{lay.desc}</div>
                    {(activeValidation.imageLayout || 'top') === lay.id && (
                      <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider block">Visual Filter Effect</label>
              <select
                value={activeValidation.imageFilter || 'none'}
                onChange={(e) => {
                  editFormFieldMutation.mutate({
                    id: activeField?.id || "",
                    validation: { ...activeValidation, imageFilter: e.target.value }
                  });
                }}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-primary"
              >
                <option value="none">No Filter</option>
                <option value="grayscale">Grayscale (Black & White)</option>
                <option value="sepia">Sepia (Warm Vintage)</option>
                <option value="vintage">Dreamy Antique</option>
                <option value="blur">Blur Backdrop</option>
                <option value="invert">X-Ray Inverted</option>
                <option value="contrast">High Contrast</option>
                <option value="warm">Sunny Warmth</option>
                <option value="cool">Nordic Cool</option>
              </select>
            </div>

            {/* Brightness slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
                <span>Brightness</span>
                <span className="font-mono text-primary">{activeValidation.imageBrightness !== undefined ? activeValidation.imageBrightness : 100}%</span>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="range"
                  min="20"
                  max="180"
                  value={activeValidation.imageBrightness !== undefined ? activeValidation.imageBrightness : 100}
                  onChange={(e) => {
                    editFormFieldMutation.mutate({
                      id: activeField.id,
                      validation: { ...activeValidation, imageBrightness: parseInt(e.target.value, 10) }
                    });
                  }}
                  className="w-full accent-primary h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Aspect Ratio and Focal Point */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider block">Aspect Ratio</label>
                <select
                  value={activeValidation.imageAspectRatio || 'auto'}
                  onChange={(e) => {
                    editFormFieldMutation.mutate({
                      id: activeField.id,
                      validation: { ...activeValidation, imageAspectRatio: e.target.value }
                    });
                  }}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-805 rounded-lg px-2.5 py-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-200 focus:outline-none"
                >
                  <option value="auto">Auto Aspect</option>
                  <option value="1/1">1:1 Square</option>
                  <option value="16/9">16:9 Cinema</option>
                  <option value="4/3">4:3 Classic</option>
                  <option value="3/2">3:2 Studio</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider block">Focal Focus</label>
                <select
                  value={activeValidation.imageFocalPoint || 'center center'}
                  onChange={(e) => {
                    editFormFieldMutation.mutate({
                      id: activeField.id,
                      validation: { ...activeValidation, imageFocalPoint: e.target.value }
                    });
                  }}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-255 dark:border-neutral-805 rounded-lg px-2.5 py-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-200 focus:outline-none"
                >
                  <option value="center center">Center</option>
                  <option value="top center">Top Focus</option>
                  <option value="bottom center">Bottom Focus</option>
                  <option value="center left">Left Focus</option>
                  <option value="center right">Right Focus</option>
                </select>
              </div>
            </div>

            {/* Accessibility Alt Text */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider block">Alt Text (Accessibility & SEO)</label>
              <input
                type="text"
                value={activeValidation.imageAlt || ""}
                placeholder="Description of this image..."
                onChange={(e) => {
                  editFormFieldMutation.mutate({
                    id: activeField?.id || "",
                    validation: { ...activeValidation, imageAlt: e.target.value || undefined }
                  });
                }}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Remove Image Button */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Remove image?")) {
                    const updated = { ...activeValidation };
                    delete updated.imageUrl;
                    delete updated.imageLayout;
                    delete updated.imageFocalPoint;
                    delete updated.imageBrightness;
                    delete updated.imageAlt;
                    delete updated.imageWidth;
                    delete updated.imageHeight;
                    delete updated.imageAspectRatio;
                    delete updated.imageFilter;
                    editFormFieldMutation.mutate({
                      id: activeField.id,
                      validation: updated,
                    });
                    setActivePopover(null);
                  }
                }}
                className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove Content Image</span>
              </button>
            </div>
          </div>
        )}

      </div>
    );
  };

  const questionContentEl = (
    <div className="flex-1 space-y-6 w-full animate-fadeIn">
      {/* Label & Description Textareas */}
      <div className="space-y-4">
        {activeField?.type === 'welcome' && activeValidation.showHighlightsGrid && (
          <div className="flex justify-center w-full mb-2 animate-scaleIn select-none">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center border-4 border-indigo-100/50 dark:border-indigo-900/30 shadow-3xs relative animate-pulse">
              <svg className="w-8 h-8 text-indigo-650 dark:text-indigo-400 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        )}

        {/* Label (Title) Block */}
        <div className="relative group/label">
          {/* Float Paintbrush Style Trigger */}
          <div className="absolute right-0 top-0.5 z-20">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'title' ? null : 'title'); }}
              className="opacity-0 group-hover/label:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer"
              title="Style Title Font & Color"
            >
              <PaletteIcon className="h-3.5 w-3.5" />
              <span>Style Title</span>
            </button>
          </div>

          <textarea
            ref={labelRef}
            rows={1}
            value={localLabel}
            onChange={(e) => setLocalLabel(e.target.value)}
            onBlur={(e) => {
              if (activeField && localLabel.trim() && localLabel.trim() !== activeField.label) {
                editFormFieldMutation.mutate({
                  id: activeField?.id || "",
                  label: localLabel.trim()
                });
              }
            }}
            placeholder={
              activeField?.type === 'welcome' ? "Welcome screen title..." :
              activeField?.type === 'thank_you' ? "Thank you screen title..." :
              activeField?.type === 'statement' ? "Statement slide title..." :
              "Question label..."
            }
            className={`w-full bg-transparent text-2xl font-bold border-none focus:outline-none py-1 placeholder-neutral-350 dark:placeholder-neutral-700 resize-none overflow-hidden leading-tight ${
              !activeValidation.labelColor ? 'dark:text-neutral-100 text-neutral-900' : ''
            }`}
            style={{
              height: 'auto',
              minHeight: '40px',
              fieldSizing: 'content',
              color: activeValidation.labelColor || undefined,
              fontFamily: activeValidation.labelFontFamily || undefined,
              fontSize: activeValidation.labelFontSize || undefined,
              fontWeight: activeValidation.labelFontWeight || undefined,
              textAlign: activeValidation.labelAlignment || undefined,
            } as any}
          />

          {activePopover === 'title' && renderPopover()}
        </div>

        {/* Description (Subtitle) Block */}
        <div className="relative group/desc mt-2">
          {/* Float Paintbrush Style Trigger */}
          <div className="absolute right-0 top-0.5 z-20">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'description' ? null : 'description'); }}
              className="opacity-0 group-hover/desc:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer"
              title="Style Subtitle Font & Color"
            >
              <PaletteIcon className="h-3.5 w-3.5" />
              <span>Style Subtitle</span>
            </button>
          </div>

          <textarea
            ref={descRef}
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            onBlur={(e) => {
              if (activeField && localDescription !== (typeof activeValidation.description === 'string' ? activeValidation.description : "")) {
                editFormFieldMutation.mutate({
                  id: activeField?.id || "",
                  validation: { ...activeValidation, description: localDescription.trim() }
                });
              }
            }}
            placeholder={
              activeField?.type === 'welcome' ? "Add a subtitle or description…" :
              activeField?.type === 'thank_you' ? "Add a closing message or details…" :
              activeField?.type === 'statement' ? "Type the statement content…" :
              "Add a description or helper text…"
            }
            className={`w-full bg-transparent text-sm border-b border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 focus:border-primary focus:outline-none py-2 placeholder-neutral-300 dark:placeholder-neutral-700 resize-none transition-all leading-relaxed ${
              !activeValidation.descriptionColor ? 'text-neutral-500 dark:text-neutral-400' : ''
            }`}
            style={{
              fieldSizing: 'content',
              minHeight: '32px',
              color: activeValidation.descriptionColor || undefined,
              fontFamily: activeValidation.descriptionFontFamily || undefined,
              fontSize: activeValidation.descriptionFontSize || undefined,
              fontWeight: activeValidation.descriptionFontWeight || undefined,
              textAlign: activeValidation.descriptionAlignment || undefined,
            } as any}
          />

          {activePopover === 'description' && renderPopover()}
        </div>
      </div>

      {/* Unified Styled Option Choices Editor (Multiple Choice / Checkbox Options) */}
      {(activeField?.type === 'single_select' || activeField?.type === 'multi_select') && (
        <div className="space-y-3 pt-4 border-t border-neutral-150/50 dark:border-neutral-800/50 mt-4 animate-fadeIn relative group/choices">
          {/* Float Paintbrush Style Trigger */}
          <div className="absolute right-0 top-4 z-20">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'choices' ? null : 'choices'); }}
              className="opacity-0 group-hover/choices:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer"
              title="Style Options Font & Color"
            >
              <PaletteIcon className="h-3.5 w-3.5" />
              <span>Style Options</span>
            </button>
          </div>

          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2">Options</span>
          
          {activePopover === 'choices' && renderPopover()}

          <div className="space-y-2.5">
            {localChoices.map((choice, cIdx) => (
              <div key={cIdx} className="flex items-center gap-3 group animate-fadeIn">
                <div 
                  className="h-7 w-7 rounded-lg bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-[11px] font-extrabold text-neutral-600 dark:text-neutral-450 border border-neutral-250 dark:border-neutral-800 transition-all group-hover:scale-105 shadow-2xs"
                  style={{
                    borderColor: activeValidation.activeColor ? activeValidation.activeColor + '40' : undefined,
                    color: activeValidation.activeColor || undefined,
                  }}
                >
                  {String.fromCharCode(65 + cIdx)}
                </div>
                <input
                  type="text"
                  value={choice}
                  onChange={(e) => {
                    const updated = [...localChoices];
                    updated[cIdx] = e.target.value;
                    setLocalChoices(updated);
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      handleUpdateChoice(cIdx, e.target.value.trim());
                    }
                  }}
                  className="flex-1 bg-transparent text-sm font-semibold px-3 py-1.5 rounded-lg border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 focus:border-primary focus:outline-none dark:text-neutral-200 text-neutral-800 transition-all"
                  style={{ 
                    color: activeValidation.descriptionColor || undefined,
                    fontFamily: activeValidation.descriptionFontFamily || undefined,
                    fontSize: activeValidation.descriptionFontSize || undefined,
                    fontWeight: activeValidation.descriptionFontWeight || undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleDeleteChoice(cIdx)}
                  className="text-neutral-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove choice"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddChoice}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 pt-2 transition-colors pl-10"
            style={{ color: activeValidation.activeColor || undefined }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add choice</span>
          </button>
        </div>
      )}

      {/* Styled Ranking Drag & Drop Editor */}
      {activeField?.type === 'ranking' && (
        <div className="space-y-3 pt-4 border-t border-neutral-150/50 dark:border-neutral-800/50 mt-4 animate-fadeIn relative group/ranking">
          {/* Float Paintbrush Style Trigger */}
          <div className="absolute right-0 top-4 z-20">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'choices' ? null : 'choices'); }}
              className="opacity-0 group-hover/ranking:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer"
              title="Style Ranking Font & Color"
            >
              <PaletteIcon className="h-3.5 w-3.5" />
              <span>Style Options</span>
            </button>
          </div>

          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2">Options</span>
          
          {activePopover === 'choices' && renderPopover()}

          <div className="space-y-2.5">
            {localChoices.map((choice, cIdx) => (
              <div key={cIdx} className="flex items-center gap-3 group animate-fadeIn max-w-md bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-250 dark:border-neutral-800 px-3 py-2 rounded-xl">
                <GripVertical className="h-4 w-4 text-neutral-400 cursor-grab active:cursor-grabbing" />
                <div 
                  className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-[10px] font-extrabold text-primary border border-primary/20" 
                  style={{ 
                    color: activeValidation.activeColor || undefined, 
                    backgroundColor: activeValidation.activeColor ? activeValidation.activeColor + '10' : undefined, 
                    borderColor: activeValidation.activeColor ? activeValidation.activeColor + '20' : undefined 
                  }}
                >
                  {cIdx + 1}
                </div>
                <input
                  type="text"
                  value={choice}
                  onChange={(e) => {
                    const updated = [...localChoices];
                    updated[cIdx] = e.target.value;
                    setLocalChoices(updated);
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      handleUpdateChoice(cIdx, e.target.value.trim());
                    }
                  }}
                  className="flex-1 bg-transparent text-xs font-bold border-none focus:outline-none dark:text-neutral-200 text-neutral-800"
                  style={{ 
                    color: activeValidation.descriptionColor || undefined,
                    fontFamily: activeValidation.descriptionFontFamily || undefined,
                    fontSize: activeValidation.descriptionFontSize || undefined,
                    fontWeight: activeValidation.descriptionFontWeight || undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleDeleteChoice(cIdx)}
                  className="text-neutral-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove option"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddChoice}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 pt-2 transition-colors pl-10"
            style={{ color: activeValidation.activeColor || undefined }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add choice</span>
          </button>
        </div>
      )}

      {/* Styled Dropdown Editor */}
      {activeField?.type === 'dropdown' && (
        <div className="space-y-3 pt-4 border-t border-neutral-150/50 dark:border-neutral-800/50 mt-4 animate-fadeIn relative group/dropdown">
          {/* Float Paintbrush Style Trigger */}
          <div className="absolute right-0 top-4 z-20">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'choices' ? null : 'choices'); }}
              className="opacity-0 group-hover/dropdown:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer"
              title="Style Dropdown Font & Color"
            >
              <PaletteIcon className="h-3.5 w-3.5" />
              <span>Style Options</span>
            </button>
          </div>

          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2">Options</span>
          
          {activePopover === 'choices' && renderPopover()}

          <div className="space-y-2.5 mb-4">
            {localChoices.map((choice, cIdx) => (
              <div key={cIdx} className="flex items-center gap-3 group animate-fadeIn max-w-md">
                <input
                  type="text"
                  value={choice}
                  onChange={(e) => {
                    const updated = [...localChoices];
                    updated[cIdx] = e.target.value;
                    setLocalChoices(updated);
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      handleUpdateChoice(cIdx, e.target.value.trim());
                    }
                  }}
                  className="flex-1 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-700 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none dark:text-neutral-200 text-neutral-800 focus:border-primary focus:ring-1 focus:ring-primary/20"
                  style={{ 
                    color: activeValidation.descriptionColor || undefined,
                    fontFamily: activeValidation.descriptionFontFamily || undefined,
                    fontSize: activeValidation.descriptionFontSize || undefined,
                    fontWeight: activeValidation.descriptionFontWeight || undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleDeleteChoice(cIdx)}
                  className="text-neutral-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove option"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddChoice}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 pt-2 transition-colors pl-10"
            style={{ color: activeValidation.activeColor || undefined }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add choice</span>
          </button>
        </div>
      )}

      {/* Live Interactive elements directly on the canvas */}
      <div className="pt-4 mt-10 relative">
        {/* Star Rating Interactive Canvas element */}
        {activeField?.type === 'rating' && (
          <div className="relative inline-block select-none">
            <button 
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setActivePopover('rating'); }}
              className="flex items-center gap-2.5 p-3 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-neutral-50/50 dark:hover:bg-neutral-955/20 transition-all cursor-pointer group shadow-2xs"
              title="Click to style Rating Stars inline"
            >
              {Array.from({ length: activeValidation.maxStars || activeValidation.max || 5 }).map((_, star) => (
                <Star 
                  key={star}
                  className="h-8 w-8 transition-transform group-hover:scale-105" 
                  style={{
                    color: activeValidation.activeColor || '#fbbf24',
                    fill: activeValidation.activeColor ? activeValidation.activeColor + '20' : '#fbbf2440',
                  }}
                />
              ))}
            </button>
            
            {activePopover === 'rating' && renderPopover()}
          </div>
        )}

        {/* Yes / No Buttons Interactive Canvas element */}
        {activeField?.type === 'yes_no' && (
          <div className="relative inline-block select-none">
            <div 
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setActivePopover('yes_no'); }}
              className="flex gap-4 p-3 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-neutral-50/55 dark:hover:bg-neutral-955/20 transition-all cursor-pointer shadow-2xs"
              title="Click to style Yes/No buttons inline"
            >
              <button 
                type="button"
                className="px-6 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-xs font-bold text-primary transition-all pointer-events-none"
                style={{
                  color: activeValidation.activeColor || undefined,
                  borderColor: activeValidation.activeColor ? activeValidation.activeColor + '40' : undefined,
                  backgroundColor: activeValidation.activeColor ? activeValidation.activeColor + '15' : undefined,
                }}
              >
                Yes
              </button>
              <button type="button" className="px-6 py-2.5 bg-neutral-100 dark:bg-neutral-800 border dark:border-neutral-700 rounded-xl text-xs font-bold dark:text-neutral-350 pointer-events-none">
                No
              </button>
            </div>

            {activePopover === 'yes_no' && renderPopover()}
          </div>
        )}

        {/* Welcome Screen Interactive Canvas Button */}
        {activeField?.type === 'welcome' && (
          <div className="space-y-4 w-full flex flex-col items-center">
            {activeValidation.showHighlightsGrid && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-xl mx-auto my-5 pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-800 pointer-events-none select-none">
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-3xs">
                    <Clock className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-extrabold text-neutral-500 dark:text-neutral-450 font-sans">Quick & Easy</span>
                </div>
                
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400 shadow-3xs">
                    <Lock className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-extrabold text-neutral-500 dark:text-neutral-450 font-sans">Secure & Private</span>
                </div>
                
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center text-violet-650 dark:text-violet-400 shadow-3xs">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-extrabold text-neutral-500 dark:text-neutral-450 font-sans">Important Info</span>
                </div>
              </div>
            )}

            <div className="relative inline-block">
              <button 
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setActivePopover('button'); }}
                className="px-6 py-3 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500/50 dark:hover:border-primary/50 hover:bg-neutral-50/55 dark:hover:bg-neutral-955/20 transition-all cursor-pointer flex flex-col items-center gap-2 group shadow-2xs"
                title="Click to style Welcome Button inline"
              >
                <div 
                  className="px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-emerald-500/10 flex items-center gap-2 transition-all pointer-events-none"
                  style={{
                    backgroundColor: activeValidation.buttonBgColor || activeValidation.activeColor || '#10b981',
                    color: activeValidation.buttonTextColor || '#ffffff',
                  }}
                >
                  <span>{activeValidation.buttonText || "Start"}</span>
                  <Play 
                    className="h-3.5 w-3.5 fill-current"
                    style={{ fill: activeValidation.buttonTextColor || '#ffffff' }}
                  />
                </div>

                {activeValidation.showHighlightsGrid && (
                  <span className="text-[10px] font-bold text-neutral-400 hover:text-neutral-600 transition-colors mt-1 font-sans">
                    Cancel
                  </span>
                )}
              </button>

              {activePopover === 'button' && renderPopover()}
            </div>
          </div>
        )}

        {/* Thank You Screen Interactive Canvas Button */}
        {activeField?.type === 'thank_you' && (
          <div className="relative inline-block">
            <button 
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setActivePopover('button'); }}
              className="px-6 py-3 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-indigo-500/50 dark:hover:border-primary/50 hover:bg-neutral-50/55 dark:hover:bg-neutral-955/20 transition-all cursor-pointer flex items-center gap-2 group shadow-2xs"
              title="Click to style Thank You Button inline"
            >
              <div 
                className="px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/10 flex items-center gap-2 transition-all pointer-events-none"
                style={{
                  backgroundColor: activeValidation.buttonBgColor || activeValidation.activeColor || '#6366f1',
                  color: activeValidation.buttonTextColor || '#ffffff',
                }}
              >
                <span>{activeValidation.buttonText || "Done"}</span>
              </div>
            </button>

            {activePopover === 'button' && renderPopover()}
          </div>
        )}

        {/* Statement Screen Interactive Canvas Button */}
        {activeField?.type === 'statement' && (
          <div className="relative inline-block">
            <button 
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setActivePopover('button'); }}
              className="px-6 py-3 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-500/50 dark:hover:border-primary/50 hover:bg-neutral-50/55 dark:hover:bg-neutral-955/20 transition-all cursor-pointer flex items-center gap-2 group shadow-2xs"
              title="Click to style Continue Button inline"
            >
              <div 
                className="px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all pointer-events-none"
                style={{
                  backgroundColor: activeValidation.buttonBgColor || activeValidation.activeColor || '#27272a',
                  color: activeValidation.buttonTextColor || '#ffffff',
                }}
              >
                <span>{activeValidation.buttonText || "Continue"}</span>
              </div>
            </button>

            {activePopover === 'button' && renderPopover()}
          </div>
        )}

        {/* Inputs visual mockups to make other question types gorgeous */}
        {activeField?.type === 'short_text' && (
          <div className="relative inline-block group/input w-full max-w-sm">
            <div className="absolute right-0 top-0 z-20">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'choices' ? null : 'choices'); }}
                className="opacity-0 group-hover/input:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer"
                title="Style Input Text"
              >
                <PaletteIcon className="h-3.5 w-3.5" />
                <span>Style Text</span>
              </button>
            </div>
            {activePopover === 'choices' && renderPopover()}
            <div 
              className="w-full border-b border-neutral-350 dark:border-neutral-750 text-sm py-3 italic tracking-wide select-none" 
              style={{ 
                color: activeValidation.answerColor || undefined,
                fontFamily: activeValidation.answerFontFamily || undefined,
                fontSize: activeValidation.answerFontSize || undefined,
                fontWeight: activeValidation.answerFontWeight || undefined,
              }}
            >
              User input placeholder...
            </div>
          </div>
        )}
        
        {activeField?.type === 'long_text' && (
          <div className="relative inline-block group/input w-full max-w-md">
            <div className="absolute right-0 top-0 z-20">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'choices' ? null : 'choices'); }}
                className="opacity-0 group-hover/input:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer"
                title="Style Input Text"
              >
                <PaletteIcon className="h-3.5 w-3.5" />
                <span>Style Text</span>
              </button>
            </div>
            {activePopover === 'choices' && renderPopover()}
            <div 
              className="w-full border border-neutral-250 dark:border-neutral-800 rounded-xl text-sm p-4 min-h-24 bg-neutral-50 dark:bg-neutral-900/30 italic tracking-wide select-none" 
              style={{ 
                color: activeValidation.answerColor || undefined,
                fontFamily: activeValidation.answerFontFamily || undefined,
                fontSize: activeValidation.answerFontSize || undefined,
                fontWeight: activeValidation.answerFontWeight || undefined,
              }}
            >
              Multi-line user input placeholder...
            </div>
          </div>
        )}

        {activeField?.type === 'email' && (
          <div className="relative inline-block group/input w-full max-w-sm">
            <div className="absolute right-0 top-0 z-20">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'choices' ? null : 'choices'); }}
                className="opacity-0 group-hover/input:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer"
                title="Style Input Text"
              >
                <PaletteIcon className="h-3.5 w-3.5" />
                <span>Style Text</span>
              </button>
            </div>
            {activePopover === 'choices' && renderPopover()}
            <div 
              className="w-full border-b border-neutral-350 dark:border-neutral-750 text-sm py-3 flex items-center gap-2.5 italic select-none" 
              style={{ 
                color: activeValidation.answerColor || undefined,
                fontFamily: activeValidation.answerFontFamily || undefined,
                fontSize: activeValidation.answerFontSize || undefined,
                fontWeight: activeValidation.answerFontWeight || undefined,
              }}
            >
              <Mail className="h-4 w-4 text-neutral-450" />
              <span>name@example.com</span>
            </div>
          </div>
        )}

        {activeField?.type === 'number' && (
          <div className="relative inline-block group/input w-full max-w-sm">
            <div className="absolute right-0 top-0 z-20">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'choices' ? null : 'choices'); }}
                className="opacity-0 group-hover/input:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer"
                title="Style Input Text"
              >
                <PaletteIcon className="h-3.5 w-3.5" />
                <span>Style Text</span>
              </button>
            </div>
            {activePopover === 'choices' && renderPopover()}
            <div 
              className="w-full border-b border-neutral-350 dark:border-neutral-750 text-sm py-3 flex items-center gap-2.5 italic select-none" 
              style={{ 
                color: activeValidation.answerColor || undefined,
                fontFamily: activeValidation.answerFontFamily || undefined,
                fontSize: activeValidation.answerFontSize || undefined,
                fontWeight: activeValidation.answerFontWeight || undefined,
              }}
            >
              <Hash className="h-4 w-4 text-neutral-450" />
              <span>12345...</span>
            </div>
          </div>
        )}

        {activeField?.type === 'contact_info' && (
          <div className="relative inline-block group/input w-full max-w-sm">
            <div className="absolute right-0 top-0 z-20">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'choices' ? null : 'choices'); }}
                className="opacity-0 group-hover/input:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer"
                title="Style Input Text"
              >
                <PaletteIcon className="h-3.5 w-3.5" />
                <span>Style Text</span>
              </button>
            </div>
            {activePopover === 'choices' && renderPopover()}
            <div 
              className="space-y-3 w-full select-none"
              style={{ 
                color: activeValidation.descriptionColor || undefined,
                fontFamily: activeValidation.descriptionFontFamily || undefined,
                fontSize: activeValidation.descriptionFontSize || undefined,
                fontWeight: activeValidation.descriptionFontWeight || undefined,
              }}
            >
              <div className="border-b border-neutral-350 dark:border-neutral-750 text-xs py-2 italic">First name...</div>
              <div className="border-b border-neutral-350 dark:border-neutral-750 text-xs py-2 italic">Last name...</div>
              <div className="border-b border-neutral-350 dark:border-neutral-750 text-xs py-2 italic">Phone number...</div>
            </div>
          </div>
        )}

        {activeField?.type === 'address' && (
          <div className="relative inline-block group/input w-full max-w-sm">
            <div className="absolute right-0 top-0 z-20">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'choices' ? null : 'choices'); }}
                className="opacity-0 group-hover/input:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer"
                title="Style Input Text"
              >
                <PaletteIcon className="h-3.5 w-3.5" />
                <span>Style Text</span>
              </button>
            </div>
            {activePopover === 'choices' && renderPopover()}
            <div 
              className="space-y-3 w-full select-none"
              style={{ 
                color: activeValidation.descriptionColor || undefined,
                fontFamily: activeValidation.descriptionFontFamily || undefined,
                fontSize: activeValidation.descriptionFontSize || undefined,
                fontWeight: activeValidation.descriptionFontWeight || undefined,
              }}
            >
              <div className="border-b border-neutral-350 dark:border-neutral-750 text-xs py-2 italic">Street address...</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-b border-neutral-350 dark:border-neutral-750 text-xs py-2 italic">City...</div>
                <div className="border-b border-neutral-350 dark:border-neutral-750 text-xs py-2 italic">State...</div>
              </div>
            </div>
          </div>
        )}

        {activeField?.type === 'website' && (
          <div className="relative inline-block group/input w-full max-w-sm">
            <div className="absolute right-0 top-0 z-20">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'choices' ? null : 'choices'); }}
                className="opacity-0 group-hover/input:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer"
                title="Style Input Text"
              >
                <PaletteIcon className="h-3.5 w-3.5" />
                <span>Style Text</span>
              </button>
            </div>
            {activePopover === 'choices' && renderPopover()}
            <div 
              className="w-full border-b border-neutral-350 dark:border-neutral-750 text-sm py-3 flex items-center gap-2.5 italic select-none" 
              style={{ 
                color: activeValidation.descriptionColor || undefined,
                fontFamily: activeValidation.descriptionFontFamily || undefined,
                fontSize: activeValidation.descriptionFontSize || undefined,
                fontWeight: activeValidation.descriptionFontWeight || undefined,
              }}
            >
              <Globe className="h-4 w-4 text-neutral-450" />
              <span>https://example.com</span>
            </div>
          </div>
        )}

        {activeField?.type === 'date' && (
          <div className="relative inline-block group/input w-full max-w-sm">
            <div className="absolute right-0 top-0 z-20">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'choices' ? null : 'choices'); }}
                className="opacity-0 group-hover/input:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer"
                title="Style Input Text"
              >
                <PaletteIcon className="h-3.5 w-3.5" />
                <span>Style Text</span>
              </button>
            </div>
            {activePopover === 'choices' && renderPopover()}
            <div 
              className="w-full border-b border-neutral-350 dark:border-neutral-750 text-sm py-3 flex items-center gap-2.5 italic select-none" 
              style={{ 
                color: activeValidation.descriptionColor || undefined,
                fontFamily: activeValidation.descriptionFontFamily || undefined,
                fontSize: activeValidation.descriptionFontSize || undefined,
                fontWeight: activeValidation.descriptionFontWeight || undefined,
              }}
            >
              <Calendar className="h-4 w-4 text-neutral-450" />
              <span>MM / DD / YYYY</span>
            </div>
          </div>
        )}

        {activeField?.type === 'checkbox' && (
          <div className="relative inline-block group/input w-full max-w-sm">
            <div className="absolute right-0 top-0 z-20">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'choices' ? null : 'choices'); }}
                className="opacity-0 group-hover/input:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer"
                title="Style Checkbox Text"
              >
                <PaletteIcon className="h-3.5 w-3.5" />
                <span>Style Text</span>
              </button>
            </div>
            {activePopover === 'choices' && renderPopover()}
            <div className="flex items-center gap-3 py-1 select-none cursor-pointer">
              <div 
                className="h-5 w-5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex items-center justify-center"
                style={{
                  borderColor: activeValidation.activeColor ? activeValidation.activeColor + '60' : undefined,
                }}
              >
                <Check 
                  className="h-3.5 w-3.5 text-primary" 
                  style={{ 
                    color: activeValidation.activeColor || undefined,
                    opacity: activeValidation.activeColor ? 1 : 0 
                  }} 
                />
              </div>
              <span 
                className="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                style={{ 
                  color: activeValidation.descriptionColor || undefined,
                  fontFamily: activeValidation.descriptionFontFamily || undefined,
                  fontSize: activeValidation.descriptionFontSize || undefined,
                  fontWeight: activeValidation.descriptionFontWeight || undefined,
                }}
              >
                I confirm this.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const imageSectionEl = (
    <div className="w-full space-y-4 animate-fadeIn overflow-visible">
      {activeValidation.imageUrl ? (
        <div className="relative">
          <div className="relative group/img rounded-xl overflow-hidden border border-neutral-250 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 max-w-full aspect-video md:aspect-[4/3] max-h-[220px] shadow-2xs hover:shadow-xs transition-shadow duration-300">
            {/* Float Paintbrush Style Trigger */}
            <div className="absolute right-2 top-2 z-20">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === 'image' ? null : 'image'); }}
                className="opacity-0 group-hover/img:opacity-100 p-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 text-neutral-450 hover:text-primary transition-all duration-150 shadow-xs flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer"
                title="Style Content Image"
              >
                <PaletteIcon className="h-3.5 w-3.5" />
                <span>Style Image</span>
              </button>
            </div>

            <img 
              src={activeValidation.imageUrl as string} 
              alt={activeValidation.imageAlt as string || "Question Media"} 
              style={getImageStyles(activeValidation)}
              className="w-full h-full object-contain transition-all duration-300 max-h-full" 
            />
          </div>

          {activePopover === 'image' && renderPopover()}
        </div>
      ) : (
        <div className="w-full bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-3">Add Content Image</span>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-primary/50 dark:hover:border-primary/50 rounded-xl p-6 cursor-pointer bg-white hover:bg-neutral-50/50 dark:bg-neutral-900/30 dark:hover:bg-neutral-900/50 transition-all group">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <svg className="h-8 w-8 text-neutral-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-350">
                <span>Upload a layout image</span>
              </div>
              <p className="text-[10px] text-neutral-400">Drag and drop or click to choose file</p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                const loadingToast = toast.loading("Uploading image to Cloudinary...");
                try {
                  const body = new FormData();
                  body.append("file", file);
                  
                  const res = await fetch("/api/upload", {
                    method: "POST",
                    body,
                  });
                  
                  if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Upload failed");
                  }
                  
                  const data = await res.json();
                  toast.dismiss(loadingToast);
                  toast.success("Image uploaded successfully!");
                  
                  editFormFieldMutation.mutate({
                    id: activeField?.id || "",
                    validation: { ...activeValidation, imageUrl: data.url, imageLayout: 'top' },
                  });
                } catch (err: any) {
                  toast.dismiss(loadingToast);
                  toast.error(err.message || "Failed to upload image.");
                }
              }}
            />
          </label>
        </div>
      )}
    </div>
  );

  const bgSectionEl = (
    <div className="w-full space-y-4 animate-fadeIn">
      {activeValidation.bgImageUrl ? (
        <div className="space-y-4 bg-neutral-50/50 dark:bg-neutral-955/20 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200/50 dark:border-neutral-800/50">
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>Bleed Background</span>
            </span>
            <button
              type="button"
              onClick={() => {
                if (confirm("Remove background image?")) {
                  const updated = { ...activeValidation };
                  delete updated.bgImageUrl;
                  delete updated.bgImageBrightness;
                  delete updated.bgImageFilter;
                  delete updated.bgImageFocalPoint;
                  editFormFieldMutation.mutate({
                    id: activeField?.id || "",
                    validation: updated,
                  });
                }
              }}
              className="text-xs font-semibold text-red-500 hover:text-red-650 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove</span>
            </button>
          </div>

          {/* Visual Preview */}
          <div className="relative group/bg rounded-xl overflow-hidden border border-neutral-250 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 max-w-full aspect-video md:aspect-[4/3] max-h-[120px]">
            <img 
              src={activeValidation.bgImageUrl as string} 
              alt="Form Background View"
              style={getBgImageStyles(activeValidation)}
              className="w-full h-full object-cover rounded-xl" 
            />
          </div>

          {/* Brightness slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
              <span>Background Brightness</span>
              <span className="font-mono text-primary">{activeValidation.bgImageBrightness !== undefined ? activeValidation.bgImageBrightness : 100}%</span>
            </div>
            <input 
              type="range"
              min="10"
              max="150"
              value={activeValidation.bgImageBrightness !== undefined ? activeValidation.bgImageBrightness : 100}
              onChange={(e) => {
                editFormFieldMutation.mutate({
                  id: activeField?.id || "",
                  validation: { ...activeValidation, bgImageBrightness: parseInt(e.target.value, 10) }
                });
              }}
              className="w-full accent-primary h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Filter selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider block">Visual Filter Effect</label>
            <select
              value={activeValidation.bgImageFilter || 'none'}
              onChange={(e) => {
                editFormFieldMutation.mutate({
                  id: activeField?.id || "",
                  validation: { ...activeValidation, bgImageFilter: e.target.value }
                });
              }}
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-200 focus:outline-none focus:border-primary"
            >
              <option value="none">No Filter</option>
              <option value="grayscale">Grayscale</option>
              <option value="sepia">Sepia</option>
              <option value="vintage">Dreamy Antique</option>
              <option value="blur">Blur</option>
              <option value="invert">Inverted</option>
              <option value="contrast">High Contrast</option>
              <option value="warm">Warmth</option>
              <option value="cool">Cool</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="w-full bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl animate-fadeIn">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-3">Add Bleed Background</span>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-primary/50 dark:hover:border-primary/50 rounded-xl p-6 cursor-pointer bg-white hover:bg-neutral-50/55 dark:bg-neutral-900/30 dark:hover:bg-neutral-900/50 transition-all group">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <svg className="h-8 w-8 text-neutral-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-350">
                <span>Upload background image</span>
              </div>
              <p className="text-[10px] text-neutral-400">Drag and drop or click to choose file</p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                const loadingToast = toast.loading("Uploading background to Cloudinary...");
                try {
                  const body = new FormData();
                  body.append("file", file);
                  
                  const res = await fetch("/api/upload", {
                    method: "POST",
                    body,
                  });
                  
                  if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Upload failed");
                  }
                  
                  const data = await res.json();
                  toast.dismiss(loadingToast);
                  toast.success("Background uploaded successfully!");
                  
                  editFormFieldMutation.mutate({
                    id: activeField?.id || "",
                    validation: { ...activeValidation, bgImageUrl: data.url, bgImageBrightness: 100 },
                  });
                } catch (err: any) {
                  toast.dismiss(loadingToast);
                  toast.error(err.message || "Failed to upload background.");
                }
              }}
            />
          </label>
        </div>
      )}
    </div>
  );

  return (
    <main 
      className={`flex-1 flex flex-col items-center overflow-y-auto no-scrollbar relative border-r border-neutral-200 dark:border-neutral-800 theme-${themeId}`} 
      style={mainStyle}
    >
      {/* Enhanced Japanese Theme Visual Elements - Now managed globally by FormHeader background */}
      {themeId === 'japanese' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* We keep only subtle local hints if needed, but let global elements take the lead */}
        </div>
      )}

      {activeField ? (
        <div className="w-full flex-1 flex flex-col items-center justify-start p-8 md:p-16 relative overflow-visible">
          <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fira+Code:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Merriweather:wght@300;400;700&family=Montserrat:wght@300;400;500;600;700&family=Nunito:wght@300;400;600;700&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Roboto+Mono:wght@300;400;500;700&family=Syne:wght@400;500;700;800&family=Zen+Old+Mincho:wght@400;500;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap');

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes sakuraFall3D {
          0% { transform: translateY(-30px) translateX(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translateY(105vh) translateX(120px) rotateX(360deg) rotateY(720deg) rotateZ(180deg); opacity: 0; }
        }
        @keyframes moonPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        .theme-japanese {
          background-color: #F9F4F0 !important; /* Soft Cream / Washi Paper background */
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40a20 20 0 0 1 20-20 20 20 0 0 1 20 20H0zm20-20a20 20 0 0 1 20-20V0a20 20 0 0 1-20 20 20 20 0 0 1-20-20v20a20 20 0 0 1 20 20z' fill='%23d4c4b0' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E") !important;
        }

        .theme-japanese input, .theme-japanese select, .theme-japanese textarea {
          border-width: 1px !important;
          border-color: #D4C4B0 !important; 
          background-color: #FFFFFF !important; 
          color: #2C1810 !important; 
          font-family: 'Noto Sans JP', sans-serif !important; 
          padding: 12px 16px !important;
          border-radius: 4px !important; /* Sharper, more traditional corners */
          transition: all 0.3s ease;
        }

        .theme-japanese input:focus, .theme-japanese select:focus, .theme-japanese textarea:focus {
          border-color: #C76B5E !important; 
          box-shadow: 0 0 0 3px rgba(199, 107, 94, 0.1) !important;
        }

        .theme-japanese button, .theme-japanese .cta-button {
          background-color: #C76B5E !important; 
          color: #FFFFFF !important;
          font-family: 'Noto Sans JP', sans-serif !important;
          font-weight: 600 !important;
          padding: 12px 24px !important;
          border-radius: 4px !important;
          letter-spacing: 0.05em !important;
          text-transform: uppercase !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0,0,0,0.1) !important;
        }

        .theme-japanese button:hover, .theme-japanese .cta-button:hover {
          background-color: #B85A4F !important; 
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(199, 107, 94, 0.3) !important;
        }

        .theme-japanese main > div > div, .theme-japanese form, .theme-japanese .form-card-editor {
          background-color: #FFFFFF !important;
          border-radius: 4px !important;
          border: 1px solid #D4C4B0 !important;
          box-shadow: 12px 12px 0px rgba(212, 196, 176, 0.2) !important; /* Offset shadow for block print look */
          overflow: hidden !important;
          position: relative !important;
        }

        /* Stylized corner accent */
        .theme-japanese .form-card-editor::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #C76B5E 0%, #C76B5E 50%, transparent 50%);
          z-index: 10;
          opacity: 0.8;
        }

        .theme-japanese main > div > div::after, .theme-japanese form::after, .theme-japanese .form-card-editor::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: none; /* Temporarily remove the background pattern */
          opacity: 0; /* Make it invisible */
          pointer-events: none;
          z-index: 0;
        }
        .theme-japanese input:focus, .theme-japanese select:focus, .theme-japanese textarea:focus {
          border-color: #C76B5E !important;
          box-shadow: 0 0 15px rgba(199, 107, 94, 0.3), inset 0 2px 4px rgba(44, 24, 16, 0.1) !important;
          background-color: #FFFFFF !important;
        }
        .theme-japanese button, .theme-japanese .cta-button {
          background: #C76B5E !important;
          color: #FFFFFF !important;
          font-weight: 600 !important;
          border-radius: 10px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          box-shadow: 0 4px 15px rgba(199, 107, 94, 0.2) !important;
        }
        .theme-japanese button:hover, .theme-japanese .cta-button:hover {
          transform: scale(1.02) !important;
          box-shadow: 0 6px 20px rgba(199, 107, 94, 0.3) !important;
        }
        /* Apply Washi paper texture and subtle patterns to form cards */
        .theme-japanese main > div > div, .theme-japanese form, .theme-japanese .form-card-editor {
          animation: subtlePaperTexture 8s ease-in-out infinite !important;
          border-width: 1px !important;
          border-style: solid !important;
          background-image: 
            radial-gradient(circle at 25% 25%, rgba(199, 107, 94, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(212, 196, 176, 0.03) 0%, transparent 50%),
            linear-gradient(45deg, rgba(245, 240, 235, 0.1) 25%, transparent 25%, transparent 75%, rgba(245, 240, 235, 0.1) 75%, rgba(245, 240, 235, 0.1)) !important;
          background-size: 60px 60px, 80px 80px, 20px 20px !important;
          position: relative;
        }

        /* Custom Vermillion Hanko Stamp on form card */
        .theme-japanese main > div > div::after, .theme-japanese form::after, .theme-japanese .form-card-editor::after {
          content: '吉';
          position: absolute;
          top: 20px;
          right: 20px;
          width: 32px;
          height: 32px;
          border: 2px solid rgba(199, 107, 94, 0.85);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Noto Sans JP', serif;
          font-size: 16px;
          font-weight: 700;
          color: rgba(199, 107, 94, 0.85);
          background-color: transparent;
          transform: rotate(5deg);
          pointer-events: none;
          box-shadow: 0 0 6px rgba(199, 107, 94, 0.15);
          z-index: 20;
        }
      `}</style>

          <div className="w-full max-w-2xl space-y-12 relative z-10">
            {questionContentEl}
            {imageSectionEl}
            {bgSectionEl}
          </div>
        </div>
      ) : (
                  // Categories Columns Layout
                  <div className="grid grid-cols-3 gap-8 h-full animate-fadeIn">
                    
                    {/* COLUMN 1 */}
                    <div className="space-y-8">
                      {/* Contact Info */}
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Contact info</h3>
                        <div className="space-y-1">
                          {[
                            { id: "contact_info", name: "Contact Info", Icon: User, color: "bg-pink-50 text-pink-600 dark:bg-pink-955/20 dark:text-pink-400" },
                            { id: "email", name: "Email", Icon: Mail, color: "bg-pink-50 text-pink-650 dark:bg-pink-955/20 dark:text-pink-400" },
                            { id: "phone_number", name: "Phone Number", Icon: Phone, color: "bg-pink-50 text-pink-655 dark:bg-pink-955/20 dark:text-pink-400", premium: true },
                            { id: "address", name: "Address", Icon: MapPin, color: "bg-pink-50 text-pink-655 dark:bg-pink-955/20 dark:text-pink-400" },
                            { id: "website", name: "Website", Icon: Globe, color: "bg-pink-50 text-pink-655 dark:bg-pink-955/20 dark:text-pink-400" }
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={async () => {
                                if (item.premium) {
                                  toast.error(`${item.name} is a premium form field option! Upgrade your workspace to unlock.`);
                                  return;
                                }
                                await handleAddNewField(item.id);
                                setShowAddElementModal(false);
                                setElementSearchQuery("");
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-850/60 transition-all text-left group"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`p-1.5 rounded-lg ${item.color} shrink-0`}>
                                  <item.Icon className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-xs font-semibold text-neutral-750 dark:text-neutral-205 group-hover:text-primary transition-colors">{item.name}</span>
                              </div>
                              {item.premium && (
                                <span className="text-emerald-500 dark:text-emerald-400 p-1 shrink-0">
                                  <Sparkles className="h-3.5 w-3.5" />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Text & Video */}
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Text & Video</h3>
                        <div className="space-y-1">
                          {[
                            { id: "long_text", name: "Long Text", Icon: FileText, color: "bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400" },
                            { id: "short_text", name: "Short Text", Icon: Type, color: "bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400" },
                            { id: "video", name: "Video", Icon: Play, color: "bg-sky-50 text-sky-605 dark:bg-sky-955/20 dark:text-sky-400", premium: true },
                            { id: "clarify_ai", name: "Clarify with AI", Icon: Sparkles, color: "bg-sky-50 text-sky-655 dark:bg-sky-955/20 dark:text-sky-400", premium: true }
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={async () => {
                                if (item.premium) {
                                  toast.error(`${item.name} is a premium form field option! Upgrade your workspace to unlock.`);
                                  return;
                                }
                                await handleAddNewField(item.id);
                                setShowAddElementModal(false);
                                setElementSearchQuery("");
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-850/60 transition-all text-left group"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`p-1.5 rounded-lg ${item.color} shrink-0`}>
                                  <item.Icon className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-xs font-semibold text-neutral-755 dark:text-neutral-205 group-hover:text-primary transition-colors">{item.name}</span>
                              </div>
                              {item.premium && (
                                <span className="text-emerald-500 dark:text-emerald-400 p-1 shrink-0">
                                  <Sparkles className="h-3.5 w-3.5" />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* COLUMN 2 */}
                    <div className="space-y-8">
                      {/* Choice */}
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Choice</h3>
                        <div className="space-y-1">
                          {[
                            { id: "single_select", name: "Multiple Choice", Icon: ListIcon, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400" },
                            { id: "dropdown", name: "Dropdown", Icon: ChevronDown, color: "bg-indigo-50 text-indigo-650 dark:bg-indigo-955/20 dark:text-indigo-400" },
                            { id: "picture_choice", name: "Picture Choice", Icon: ImageIcon, color: "bg-indigo-50 text-indigo-655 dark:bg-indigo-955/20 dark:text-indigo-400", premium: true },
                            { id: "yes_no", name: "Yes/No", Icon: CheckSquare, color: "bg-indigo-50 text-indigo-655 dark:bg-indigo-955/20 dark:text-indigo-400" },
                            { id: "legal", name: "Legal", Icon: FileText, color: "bg-indigo-50 text-indigo-655 dark:bg-indigo-955/20 dark:text-indigo-400", premium: true },
                            { id: "multi_select", name: "Checkbox", Icon: CheckSquare, color: "bg-indigo-50 text-indigo-655 dark:bg-indigo-955/20 dark:text-indigo-400" }
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={async () => {
                                if (item.premium) {
                                  toast.error(`${item.name} is a premium form field option! Upgrade your workspace to unlock.`);
                                  return;
                                }
                                await handleAddNewField(item.id);
                                setShowAddElementModal(false);
                                setElementSearchQuery("");
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-850/60 transition-all text-left group"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`p-1.5 rounded-lg ${item.color} shrink-0`}>
                                  <item.Icon className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-xs font-semibold text-neutral-755 dark:text-neutral-205 group-hover:text-primary transition-colors">{item.name}</span>
                              </div>
                              {item.premium && (
                                <span className="text-emerald-500 dark:text-emerald-400 p-1 shrink-0">
                                  <Sparkles className="h-3.5 w-3.5" />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Other */}
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Other</h3>
                        <div className="space-y-1">
                          {[
                            { id: "number", name: "Number", Icon: Hash, color: "bg-amber-50 text-amber-600 dark:bg-amber-955/20 dark:text-amber-400" },
                            { id: "date", name: "Date", Icon: Calendar, color: "bg-amber-50 text-amber-650 dark:bg-amber-955/20 dark:text-amber-400" },
                            { id: "payment", name: "Payment", Icon: CreditCard, color: "bg-amber-50 text-amber-655 dark:bg-amber-955/20 dark:text-amber-400", premium: true },
                            { id: "file_upload", name: "File Upload", Icon: Upload, color: "bg-amber-50 text-amber-655 dark:bg-amber-955/20 dark:text-amber-400", premium: true },
                            { id: "google_drive", name: "Google Drive", Icon: Database, color: "bg-amber-50 text-amber-655 dark:bg-amber-955/20 dark:text-amber-400", premium: true },
                            { id: "calendly", name: "Calendly", Icon: Clock, color: "bg-amber-50 text-amber-655 dark:bg-amber-955/20 dark:text-amber-400", premium: true }
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={async () => {
                                if (item.premium) {
                                  toast.error(`${item.name} is a premium form field option! Upgrade your workspace to unlock.`);
                                  return;
                                }
                                await handleAddNewField(item.id);
                                setShowAddElementModal(false);
                                setElementSearchQuery("");
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-850/60 transition-all text-left group"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`p-1.5 rounded-lg ${item.color} shrink-0`}>
                                  <item.Icon className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-xs font-semibold text-neutral-755 dark:text-neutral-205 group-hover:text-primary transition-colors">{item.name}</span>
                              </div>
                              {item.premium && (
                                <span className="text-emerald-500 dark:text-emerald-400 p-1 shrink-0">
                                  <Sparkles className="h-3.5 w-3.5" />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* COLUMN 3 */}
                    <div className="space-y-8">
                      {/* Rating & ranking */}
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Rating & ranking</h3>
                        <div className="space-y-1">
                          {[
                            { id: "nps", name: "Net Promoter Score", Icon: Sliders, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400", premium: true },
                            { id: "opinion_scale", name: "Opinion Scale", Icon: Sliders, color: "bg-emerald-50 text-emerald-650 dark:bg-emerald-955/20 dark:text-emerald-400", premium: true },
                            { id: "rating", name: "Rating", Icon: Star, color: "bg-emerald-50 text-emerald-655 dark:bg-emerald-955/20 dark:text-emerald-400" },
                            { id: "ranking", name: "Ranking", Icon: GripVertical, color: "bg-emerald-50 text-emerald-655 dark:bg-emerald-955/20 dark:text-emerald-400" },
                            { id: "matrix", name: "Matrix", Icon: CheckSquare, color: "bg-emerald-50 text-emerald-655 dark:bg-emerald-955/20 dark:text-emerald-400", premium: true }
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={async () => {
                                if (item.premium) {
                                  toast.error(`${item.name} is a premium form field option! Upgrade your workspace to unlock.`);
                                  return;
                                }
                                await handleAddNewField(item.id);
                                setShowAddElementModal(false);
                                setElementSearchQuery("");
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-850/60 transition-all text-left group"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`p-1.5 rounded-lg ${item.color} shrink-0`}>
                                  <item.Icon className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-xs font-semibold text-neutral-755 dark:text-neutral-205 group-hover:text-primary transition-colors">{item.name}</span>
                              </div>
                              {item.premium && (
                                <span className="text-emerald-500 dark:text-emerald-400 p-1 shrink-0">
                                  <Sparkles className="h-3.5 w-3.5" />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Structure */}
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Other / Structure</h3>
                        <div className="space-y-1">
                          {[
                            { id: "welcome", name: "Welcome Screen", Icon: Play, color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
                            { id: "partial_submit", name: "Partial Submit Point", Icon: CheckSquare, color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400", premium: true },
                            { id: "statement", name: "Statement", Icon: FileText, color: "bg-neutral-100 text-neutral-605 dark:bg-neutral-805 dark:text-neutral-400" },
                            { id: "question_group", name: "Question Group", Icon: Folder, color: "bg-neutral-100 text-neutral-605 dark:bg-neutral-805 dark:text-neutral-400", premium: true },
                            { id: "multi_question_page", name: "Multi-Question Page", Icon: Layers, color: "bg-neutral-100 text-neutral-605 dark:bg-neutral-805 dark:text-neutral-400", premium: true },
                            { id: "thank_you", name: "End Screen", Icon: Smile, color: "bg-neutral-100 text-neutral-605 dark:bg-neutral-805 dark:text-neutral-400" },
                            { id: "redirect_url", name: "Redirect to URL", Icon: Globe, color: "bg-neutral-100 text-neutral-605 dark:bg-neutral-805 dark:text-neutral-400", premium: true }
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={async () => {
                                if (item.premium) {
                                  toast.error(`${item.name} is a premium form field option! Upgrade your workspace to unlock.`);
                                  return;
                                }
                                await handleAddNewField(item.id);
                                setShowAddElementModal(false);
                                setElementSearchQuery("");
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-850/60 transition-all text-left group"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`p-1.5 rounded-lg ${item.color} shrink-0`}>
                                  <item.Icon className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-xs font-semibold text-neutral-755 dark:text-neutral-205 group-hover:text-primary transition-colors">{item.name}</span>
                              </div>
                              {item.premium && (
                                <span className="text-emerald-500 dark:text-emerald-400 p-1 shrink-0">
                                  <Sparkles className="h-3.5 w-3.5" />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
    </main>
  );
}

export default QuestionEditor;
