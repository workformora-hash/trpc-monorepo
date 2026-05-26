import React, { useState, useEffect } from "react";
import {
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Image as ImageIcon,
  Settings as SettingsIcon,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { getImageStyles, getBgImageStyles } from '~/utils/image-styles';
import { useFormBuilderContext } from './FormBuilderContext';





const WELCOME_PRESETS = [
  {
    id: "premium-onboarding-card",
    name: "Premium Onboarding Card",
    description: "Elegant card layout with clip-art clipboard icon, 3 Highlights Grid (Quick & Easy, Secure & Private, Important Info), and Cancel link.",
    label: "Welcome!",
    validation: {
      buttonText: "Start Form",
      buttonBgColor: "#4f46e5",
      buttonTextColor: "#ffffff",
      cardBgColor: "#ffffff",
      bgGradient: "linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 100%)",
      labelColor: "#1e1b4b",
      labelFontFamily: "Outfit, sans-serif",
      labelFontSize: "32px",
      descriptionColor: "#4338ca",
      descriptionFontFamily: "Inter, sans-serif",
      descriptionFontSize: "14px",
      description: "You're about to start a form. It will only take a few minutes to complete.",
      showHighlightsGrid: true,
      showStatsBadge: false,
    }
  },
  {
    id: "modern-split-hero",
    name: "Modern Split-Media Hero",
    description: "High-converting layout with left-aligned split graphic, stats estimation badge, features list, and clean text colors.",
    label: "Share Your Feedback",
    validation: {
      buttonText: "Let's Begin",
      buttonBgColor: "#0ea5e9",
      buttonTextColor: "#ffffff",
      imageLayout: "split-left",
      imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1000&auto=format&fit=crop",
      imageAlt: "Feedback Team",
      showStatsBadge: true,
      statsTime: "2 mins",
      features: [
        "100% Anonymous & Secure",
        "Takes less than 2 minutes",
        "Get a 15% discount code at the end"
      ],
      cardBgColor: "rgba(255, 255, 255, 0.7)",
      bgGradient: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
      labelColor: "#0f172a",
      labelFontFamily: "Outfit, sans-serif",
      labelFontSize: "28px",
      descriptionColor: "#334155",
      descriptionFontFamily: "Inter, sans-serif",
      description: "Join 10,000+ others in shaping the future of our product. Your voice matters.",
    }
  },
  {
    id: "sleek-dark-glassmorphism",
    name: "Sleek Dark Glassmorphism",
    description: "Deep obsidian backdrop with translucent neon card, custom geometric headings, fuchsia buttons, and expert quote card.",
    label: "Unlock Your Potential",
    validation: {
      buttonText: "Start Assessment",
      buttonBgColor: "#d946ef",
      buttonTextColor: "#ffffff",
      bgGradient: "linear-gradient(135deg, #090514 0%, #12092b 50%, #22053d 100%)",
      bgImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
      cardBgColor: "rgba(15, 10, 35, 0.8)",
      labelColor: "#ffffff",
      labelFontFamily: "Outfit, sans-serif",
      labelFontSize: "32px",
      descriptionColor: "#e2e8f0",
      descriptionFontFamily: "Inter, sans-serif",
      description: "Complete this quick assessment to get a personalized career trajectory map instantly.",
      showStatsBadge: true,
      statsTime: "3 mins",
      creatorProfile: {
        name: "Dr. Sarah Jenkins",
        role: "Head of Career Strategy",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
        quote: "This assessment represents our latest research in organizational psychology."
      }
    }
  }
];

const THANK_YOU_PRESETS = [
  {
    id: "premium-reward-share",
    name: "Premium Reward & Social Share",
    description: "Emerald green styling, custom Gift promo resource card, and direct X & LinkedIn social share buttons.",
    label: "Awesome! You're All Done",
    validation: {
      buttonText: "Claim Reward",
      buttonBgColor: "#10b981",
      buttonTextColor: "#ffffff",
      cardBgColor: "#ffffff",
      bgGradient: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
      labelColor: "#064e3b",
      labelFontFamily: "Outfit, sans-serif",
      labelFontSize: "28px",
      descriptionColor: "#065f46",
      descriptionFontFamily: "Inter, sans-serif",
      description: "Thank you for sharing your feedback. Your submission has been recorded. As a thank you, here is a special reward for you!",
      socialShare: true,
      promoCard: {
        title: "Claim Your 15% Discount Code",
        description: "Use coupon code FEEDBACK15 at checkout to enjoy a 15% discount on all our plans.",
        linkUrl: "https://example.com/claim",
        linkText: "Go to Checkout →"
      }
    }
  },
  {
    id: "split-visual-thank-you",
    name: "Visual Split Thank You",
    description: "Elegant split layout with digital abstract graphic, beautiful pastel indigo colors, and direct link copy function.",
    label: "Thank You!",
    validation: {
      buttonText: "Create Your Own Form",
      buttonBgColor: "#6366f1",
      buttonTextColor: "#ffffff",
      imageLayout: "split-right",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop",
      imageAlt: "Digital Abstract",
      cardBgColor: "#ffffff",
      bgGradient: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
      labelColor: "#1e1b4b",
      labelFontFamily: "Outfit, sans-serif",
      labelFontSize: "32px",
      descriptionColor: "#312e81",
      descriptionFontFamily: "Inter, sans-serif",
      description: "Your answers have been successfully submitted. We appreciate your time and support.",
      socialShare: true,
    }
  },
  {
    id: "minimalist-executive-outro",
    name: "Minimalist Executive Outro",
    description: "Vogue luxury layout with clean paper-white gradients, Playfair Display serif typography, and clean action button.",
    label: "Submission Received",
    validation: {
      buttonText: "Return to Homepage",
      buttonBgColor: "#18181b",
      buttonTextColor: "#ffffff",
      cardBgColor: "#ffffff",
      bgGradient: "linear-gradient(135deg, #fafafa 0%, #eaeaea 100%)",
      labelColor: "#09090b",
      labelFontFamily: '"Playfair Display", serif',
      labelFontSize: "32px",
      descriptionColor: "#27272a",
      descriptionFontFamily: "Inter, sans-serif",
      description: "Thank you for completing this form. Your response has been securely archived and will be reviewed shortly by our executive team.",
      socialShare: false,
    }
  }
];

export function SettingsSidebar() {
  const { 
    activeField, 
    editFormFieldMutation, 
    activeValidation: rawActiveValidation,
    setLocalLabel,
    setLocalDescription
  } = useFormBuilderContext();

  const activeValidation = rawActiveValidation as any;

  // Large Interactive Image Studio Modal State
  const [activeEditorType, setActiveEditorType] = useState<'main' | 'bg' | null>(null);
  const [previewMode, setPreviewMode] = useState<'crop' | 'original'>('crop');

  // Local optimistic states to ensure toggles switch instantly (0ms latency)
  const [localRequired, setLocalRequired] = useState(activeField?.required ?? false);
  const [localIsMultiple, setLocalIsMultiple] = useState(activeField?.type === "multi_select");
  const [localRandomize, setLocalRandomize] = useState(!!activeValidation?.randomize);
  const [localAllowOther, setLocalAllowOther] = useState(!!activeValidation?.allowOther);
  const [localVerticalAlign, setLocalVerticalAlign] = useState(!!activeValidation?.verticalAlign);

  // Local optimistic validation rule states (Basic)
  const [localMinLength, setLocalMinLength] = useState<number | "">(activeValidation?.minLength !== undefined ? activeValidation.minLength : "");
  const [localMaxLength, setLocalMaxLength] = useState<number | "">(activeValidation?.maxLength !== undefined ? activeValidation.maxLength : "");
  const [localMin, setLocalMin] = useState<number | "">(activeValidation?.min !== undefined ? activeValidation.min : "");
  const [localMax, setLocalMax] = useState<number | "">(activeValidation?.max !== undefined ? activeValidation.max : "");
  const [localMinDate, setLocalMinDate] = useState<string>(activeValidation?.minDate || "");
  const [localMaxDate, setLocalMaxDate] = useState<string>(activeValidation?.maxDate || "");

  // Local optimistic validation rule states (Advanced/Typeform Premium)
  const [localBlockFreeEmails, setLocalBlockFreeEmails] = useState(!!activeValidation?.blockFreeEmails);
  const [localAllowedDomains, setLocalAllowedDomains] = useState(activeValidation?.allowedDomains || "");
  const [localFormat, setLocalFormat] = useState(activeValidation?.format || "any");
  const [localPattern, setLocalPattern] = useState(activeValidation?.pattern || "");
  const [localPatternMessage, setLocalPatternMessage] = useState(activeValidation?.patternMessage || "");
  const [localIntegerOnly, setLocalIntegerOnly] = useState(!!activeValidation?.integerOnly);
  const [localMaxStars, setLocalMaxStars] = useState<number>(activeValidation?.maxStars || activeValidation?.max || 5);
  const [localMustBeChecked, setLocalMustBeChecked] = useState(!!activeValidation?.mustBeChecked);
  const [localMinChoices, setLocalMinChoices] = useState<number | "">(activeValidation?.minChoices !== undefined ? activeValidation.minChoices : "");
  const [localMaxChoices, setLocalMaxChoices] = useState<number | "">(activeValidation?.maxChoices !== undefined ? activeValidation.maxChoices : "");

  // Local optimistic validation rule states (Brand New 6 Field Types)
  const [localRequirePhone, setLocalRequirePhone] = useState(!!activeValidation?.requirePhone);
  const [localRequireCompany, setLocalRequireCompany] = useState(!!activeValidation?.requireCompany);
  const [localRequireZip, setLocalRequireZip] = useState(!!activeValidation?.requireZip);
  const [localRequireCountry, setLocalRequireCountry] = useState(!!activeValidation?.requireCountry);
  const [localRequireSecure, setLocalRequireSecure] = useState(!!activeValidation?.requireSecure);
  const [localAlphabetical, setLocalAlphabetical] = useState(!!activeValidation?.alphabetical);
  const [localMustRankAll, setLocalMustRankAll] = useState(!!activeValidation?.mustRankAll);

  // States for Starting/Ending screen customization
  const [localButtonText, setLocalButtonText] = useState(activeValidation?.buttonText || "");
  const [localRedirectUrl, setLocalRedirectUrl] = useState(activeValidation?.redirectUrl || "");

  // Synchronize local states when the active field or validation updates from the database
  useEffect(() => {
    if (!activeField) return;
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

    setLocalRequirePhone(!!activeValidation.requirePhone);
    setLocalRequireCompany(!!activeValidation.requireCompany);
    setLocalRequireZip(!!activeValidation.requireZip);
    setLocalRequireCountry(!!activeValidation.requireCountry);
    setLocalRequireSecure(!!activeValidation.requireSecure);
    setLocalAlphabetical(!!activeValidation.alphabetical);
    setLocalMustRankAll(!!activeValidation.mustRankAll);

    setLocalButtonText(activeValidation.buttonText || "");
    setLocalRedirectUrl(activeValidation.redirectUrl || "");
  }, [
    activeField,
    activeField?.required,
    activeField?.type,
    activeValidation?.randomize,
    activeValidation?.allowOther,
    activeValidation?.verticalAlign,
    activeValidation?.minLength,
    activeValidation?.maxLength,
    activeValidation?.min,
    activeValidation?.max,
    activeValidation?.minDate,
    activeValidation?.maxDate,
    activeValidation?.blockFreeEmails,
    activeValidation?.allowedDomains,
    activeValidation?.format,
    activeValidation?.pattern,
    activeValidation?.patternMessage,
    activeValidation?.integerOnly,
    activeValidation?.maxStars,
    activeValidation?.max,
    activeValidation?.mustBeChecked,
    activeValidation?.minChoices,
    activeValidation?.maxChoices,
    activeValidation?.requirePhone,
    activeValidation?.requireCompany,
    activeValidation?.requireZip,
    activeValidation?.requireCountry,
    activeValidation?.requireSecure,
    activeValidation?.alphabetical,
    activeValidation?.mustRankAll,
    activeValidation?.buttonText,
    activeValidation?.redirectUrl,
  ]);

  if (!activeField) return null;

  const handleApplyPreset = (preset: any) => {
    setLocalLabel(preset.label);
    setLocalDescription(preset.validation.description || "");
    
    editFormFieldMutation.mutate({
      id: activeField.id,
      label: preset.label,
      validation: preset.validation,
    });
    
    toast.success(`Applied template "${preset.name}" successfully!`);
  };

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

  // 6 New Advanced Field Types Toggle Handlers
  const handleToggleRequirePhone = () => {
    const nextVal = !localRequirePhone;
    setLocalRequirePhone(nextVal);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: { ...activeValidation, requirePhone: nextVal },
    });
  };

  const handleToggleRequireCompany = () => {
    const nextVal = !localRequireCompany;
    setLocalRequireCompany(nextVal);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: { ...activeValidation, requireCompany: nextVal },
    });
  };

  const handleToggleRequireZip = () => {
    const nextVal = !localRequireZip;
    setLocalRequireZip(nextVal);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: { ...activeValidation, requireZip: nextVal },
    });
  };

  const handleToggleRequireCountry = () => {
    const nextVal = !localRequireCountry;
    setLocalRequireCountry(nextVal);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: { ...activeValidation, requireCountry: nextVal },
    });
  };

  const handleToggleRequireSecure = () => {
    const nextVal = !localRequireSecure;
    setLocalRequireSecure(nextVal);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: { ...activeValidation, requireSecure: nextVal },
    });
  };

  const handleToggleAlphabetical = () => {
    const nextVal = !localAlphabetical;
    setLocalAlphabetical(nextVal);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: { ...activeValidation, alphabetical: nextVal },
    });
  };

  const handleToggleMustRankAll = () => {
    const nextVal = !localMustRankAll;
    setLocalMustRankAll(nextVal);
    editFormFieldMutation.mutate({
      id: activeField.id,
      validation: { ...activeValidation, mustRankAll: nextVal },
    });
  };

  const isChoiceField =
    activeField.type === "single_select" ||
    activeField.type === "multi_select" ||
    activeField.type === "dropdown" ||
    activeField.type === "ranking";
  
  const hasValidationRules =
    activeField.type === "short_text" ||
    activeField.type === "long_text" ||
    activeField.type === "email" ||
    activeField.type === "number" ||
    activeField.type === "rating" ||
    activeField.type === "checkbox" ||
    activeField.type === "multi_select" ||
    activeField.type === "date" ||
    activeField.type === "contact_info" ||
    activeField.type === "address" ||
    activeField.type === "website" ||
    activeField.type === "dropdown" ||
    activeField.type === "yes_no" ||
    activeField.type === "ranking" ||
    activeField.type === "welcome" ||
    activeField.type === "thank_you" ||
    activeField.type === "statement";

  return (
    <aside className="w-72 border-l border-neutral-150 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col overflow-hidden font-sans select-none animate-fadeIn shrink-0">
      
      {/* Contextual header showing active field type */}
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg text-[10px] ${
            activeField.type === 'welcome' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' :
            activeField.type === 'thank_you' ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-500' :
            activeField.type === 'rating' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600' :
            activeField.type === 'email' ? 'bg-violet-100 dark:bg-violet-950/40 text-violet-600' :
            'bg-primary/10 text-primary'
          }`}>
            <SettingsIcon className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-200 block capitalize">
              {activeField.type === 'welcome' ? 'Welcome Screen' :
               activeField.type === 'thank_you' ? 'Thank You Screen' :
               activeField.type === 'statement' ? 'Statement Slide' :
               activeField.type.replace('_', ' ')} Settings
            </span>
            <span className="text-[9px] text-neutral-400">Configure field properties</span>
          </div>
        </div>
      </div>

      {/* Scrollable panel */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
      
        {/* Question Type selection dropdown */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Field Type</label>
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
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs font-semibold dark:text-neutral-100 text-neutral-700 focus:outline-none focus:border-primary transition-colors"
          >
            <option value="welcome">Starting / Welcome Screen</option>
            <option value="short_text">Short Text</option>
            <option value="long_text">Long Text</option>
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="single_select">Multiple Choice</option>
            <option value="multi_select">Checkbox Options</option>
            <option value="rating">Rating</option>
            <option value="date">Date</option>
            <option value="contact_info">Contact Info</option>
            <option value="address">Address</option>
            <option value="website">Website</option>
            <option value="dropdown">Dropdown Selection</option>
            <option value="yes_no">Yes/No buttons</option>
            <option value="ranking">Ranking list</option>
            <option value="thank_you">Ending / Thank You Screen</option>
            <option value="statement">Statement (Text slide)</option>
          </select>
        </div>

        {/* Starting/Ending Screen Preset Templates Selector */}
        {(activeField.type === "welcome" || activeField.type === "thank_you") && (
          <div className="space-y-3 pt-3.5 border-t border-neutral-100 dark:border-neutral-800 animate-fadeIn">
            <label className="text-[9.5px] font-extrabold text-neutral-450 uppercase tracking-wider block">
              Screen Templates
            </label>
            <div className="space-y-2.5">
              {(activeField.type === "welcome" ? WELCOME_PRESETS : THANK_YOU_PRESETS).map((preset) => {
                const isSelected = activeField.label === preset.label && 
                  activeValidation.buttonText === preset.validation.buttonText;
                
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all relative flex flex-col gap-1.5 cursor-pointer overflow-hidden group/preset ${
                      isSelected 
                        ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-indigo-500/30" 
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-350 dark:hover:border-neutral-700 bg-neutral-50/45 dark:bg-neutral-900/30"
                    }`}
                  >
                    {/* Small color dots preview on top corner */}
                    <div className="absolute right-3.5 top-3.5 flex gap-1.5 opacity-70 group-hover/preset:opacity-100 transition-opacity">
                      <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: preset.validation.buttonBgColor }} title="Button color" />
                      <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: preset.validation.labelColor }} title="Text color" />
                    </div>

                    <span className="font-extrabold text-neutral-800 dark:text-neutral-200 tracking-tight">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-550 leading-normal font-medium font-sans">
                      {preset.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      

      {/* Settings switches */}
      <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Field Options</span>
        
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
              {(activeField.type === "single_select" || activeField.type === "multi_select") && (
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
              )}

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
              {(activeField.type === "single_select" || activeField.type === "multi_select") && (
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
              )}
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
                      className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-850 rounded-lg px-2.5 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-755 focus:outline-none focus:border-primary"
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
                      className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-855 rounded-lg px-2.5 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-755 focus:outline-none focus:border-primary"
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
                    className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-755 focus:outline-none"
                  >
                    <option value="any">Any text format</option>
                    <option value="url">Valid Web URL (HTTP/HTTPS)</option>
                    <option value="alpha">Letters only (A-Z)</option>
                    <option value="alphanumeric">Letters & Numbers only</option>
                  </select>
                </div>

                {/* Regex Pattern Matcher */}
                <div className="space-y-3 p-3 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-800 rounded-xl">
                  <span className="text-[10px] font-bold dark:text-neutral-300 text-neutral-700 block">Advanced Regex Match</span>
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-neutral-400 block">Regex Expression Pattern</label>
                    <input
                      type="text"
                      value={localPattern}
                      onChange={(e) => setLocalPattern(e.target.value)}
                      onBlur={(e) => handlePatternBlur(e.target.value)}
                      placeholder="e.g. ^[0-9]{5}$"
                      className="w-full bg-white dark:bg-neutral-955 border border-neutral-205 dark:border-neutral-800 rounded-lg px-2 py-1 text-xs dark:text-neutral-200 text-neutral-750 focus:outline-none focus:border-primary"
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
                      className="w-full bg-white dark:bg-neutral-955 border border-neutral-205 dark:border-neutral-800 rounded-lg px-2 py-1 text-xs dark:text-neutral-200 text-neutral-755 focus:outline-none focus:border-primary"
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
                    className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-850 rounded-lg px-3 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-755 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-450 block">Max Allowed Date</label>
                  <input
                    type="date"
                    value={localMaxDate}
                    onChange={(e) => setLocalMaxDate(e.target.value)}
                    onBlur={(e) => handleMaxDateBlur(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-855 rounded-lg px-3 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-755 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {/* Contact Info Validations */}
            {activeField.type === "contact_info" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-955/20 border dark:border-neutral-800 border-neutral-200 rounded-xl">
                  <div className="space-y-0.5 text-left pr-3">
                    <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">Require Phone</span>
                    <span className="text-[9px] text-neutral-400 block leading-tight">Must provide a contact phone number</span>
                  </div>
                  <button
                    onClick={handleToggleRequirePhone}
                    className="focus:outline-none transition-all active:scale-95"
                  >
                    {localRequirePhone ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-955/20 border dark:border-neutral-800 border-neutral-200 rounded-xl">
                  <div className="space-y-0.5 text-left pr-3">
                    <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">Require Company</span>
                    <span className="text-[9px] text-neutral-400 block leading-tight">Must provide a company name</span>
                  </div>
                  <button
                    onClick={handleToggleRequireCompany}
                    className="focus:outline-none transition-all active:scale-95"
                  >
                    {localRequireCompany ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
                  </button>
                </div>
              </div>
            )}

            {/* Address Validations */}
            {activeField.type === "address" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-955/20 border dark:border-neutral-800 border-neutral-200 rounded-xl">
                  <div className="space-y-0.5 text-left pr-3">
                    <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">Require Zip/Postal</span>
                    <span className="text-[9px] text-neutral-400 block leading-tight">Zip/Postal code is strictly required</span>
                  </div>
                  <button
                    onClick={handleToggleRequireZip}
                    className="focus:outline-none transition-all active:scale-95"
                  >
                    {localRequireZip ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-955/20 border dark:border-neutral-800 border-neutral-200 rounded-xl">
                  <div className="space-y-0.5 text-left pr-3">
                    <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">Require Country</span>
                    <span className="text-[9px] text-neutral-400 block leading-tight">Country selection is strictly required</span>
                  </div>
                  <button
                    onClick={handleToggleRequireCountry}
                    className="focus:outline-none transition-all active:scale-95"
                  >
                    {localRequireCountry ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
                  </button>
                </div>
              </div>
            )}

            {/* Website Validations */}
            {activeField.type === "website" && (
              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-955/20 border dark:border-neutral-800 border-neutral-200 rounded-xl">
                <div className="space-y-0.5 text-left pr-3">
                  <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">Secure URLs Only</span>
                  <span className="text-[9px] text-neutral-400 block leading-tight">Restrict inputs to HTTPS websites only</span>
                </div>
                <button
                  onClick={handleToggleRequireSecure}
                  className="focus:outline-none transition-all active:scale-95"
                >
                  {localRequireSecure ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
                </button>
              </div>
            )}

            {/* Dropdown Validations */}
            {activeField.type === "dropdown" && (
              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-955/20 border dark:border-neutral-800 border-neutral-200 rounded-xl">
                <div className="space-y-0.5 text-left pr-3">
                  <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">Alphabetical Order</span>
                  <span className="text-[9px] text-neutral-400 block leading-tight">Sort choice elements alphabetically in UI</span>
                </div>
                <button
                  onClick={handleToggleAlphabetical}
                  className="focus:outline-none transition-all active:scale-95"
                >
                  {localAlphabetical ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
                </button>
              </div>
            )}

            {/* Ranking Validations */}
            {activeField.type === "ranking" && (
              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-955/20 border dark:border-neutral-800 border-neutral-200 rounded-xl">
                <div className="space-y-0.5 text-left pr-3">
                  <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">Must Rank All</span>
                  <span className="text-[9px] text-neutral-400 block leading-tight">Force ordering of all elements in list</span>
                </div>
                <button
                  onClick={handleToggleMustRankAll}
                  className="focus:outline-none transition-all active:scale-95"
                >
                  {localMustRankAll ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
                </button>
              </div>
            )}

          </div>
        </div>
      )}
      </div>
    </aside>
  );
}
