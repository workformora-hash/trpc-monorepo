import React from "react";
import { 
  User, Mail, Phone, MapPin, Globe, Sparkles, FileText, Type, Play, 
  ListIcon, ChevronDown, Image as ImageIcon, CheckSquare, Hash, 
  Calendar, CreditCard, Upload, Database, Clock, Sliders, Star, 
  GripVertical, Smile, Folder, Layers, Search, X 
} from "lucide-react";
import { toast } from "sonner";
import { useFormBuilderContext } from "../FormBuilderContext";

interface FieldTypeSelectorProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const FieldTypeSelector: React.FC<FieldTypeSelectorProps> = React.memo(({ isOpen, onClose }) => {
  const { handleAddNewField } = useFormBuilderContext();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSelectField = async (id: string, name: string, premium?: boolean) => {
    if (premium) {
      toast.error(`${name} is a premium form field option! Upgrade your workspace to unlock.`);
      return;
    }
    await handleAddNewField(id);
    if (onClose) onClose();
    setSearchQuery("");
  };

  const categories = [
    {
      title: "Contact info",
      items: [
        { id: "contact_info", name: "Contact Info", Icon: User, color: "bg-pink-50 text-pink-600 dark:bg-pink-955/20 dark:text-pink-400" },
        { id: "email", name: "Email", Icon: Mail, color: "bg-pink-50 text-pink-650 dark:bg-pink-955/20 dark:text-pink-400" },
        { id: "phone_number", name: "Phone Number", Icon: Phone, color: "bg-pink-50 text-pink-655 dark:bg-pink-955/20 dark:text-pink-400", premium: true },
        { id: "address", name: "Address", Icon: MapPin, color: "bg-pink-50 text-pink-655 dark:bg-pink-955/20 dark:text-pink-400" },
        { id: "website", name: "Website", Icon: Globe, color: "bg-pink-50 text-pink-655 dark:bg-pink-955/20 dark:text-pink-400" }
      ]
    },
    {
      title: "Text & Video",
      items: [
        { id: "long_text", name: "Long Text", Icon: FileText, color: "bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400" },
        { id: "short_text", name: "Short Text", Icon: Type, color: "bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400" },
        { id: "video", name: "Video", Icon: Play, color: "bg-sky-50 text-sky-605 dark:bg-sky-955/20 dark:text-sky-400", premium: true },
        { id: "clarify_ai", name: "Clarify with AI", Icon: Sparkles, color: "bg-sky-50 text-sky-655 dark:bg-sky-955/20 dark:text-sky-400", premium: true }
      ]
    },
    {
      title: "Choice",
      items: [
        { id: "single_select", name: "Multiple Choice", Icon: ListIcon, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400" },
        { id: "dropdown", name: "Dropdown", Icon: ChevronDown, color: "bg-indigo-50 text-indigo-650 dark:bg-indigo-955/20 dark:text-indigo-400" },
        { id: "picture_choice", name: "Picture Choice", Icon: ImageIcon, color: "bg-indigo-50 text-indigo-655 dark:bg-indigo-955/20 dark:text-indigo-400", premium: true },
        { id: "yes_no", name: "Yes/No", Icon: CheckSquare, color: "bg-indigo-50 text-indigo-655 dark:bg-indigo-955/20 dark:text-indigo-400" },
        { id: "legal", name: "Legal", Icon: FileText, color: "bg-indigo-50 text-indigo-655 dark:bg-indigo-955/20 dark:text-indigo-400", premium: true },
        { id: "multi_select", name: "Checkbox", Icon: CheckSquare, color: "bg-indigo-50 text-indigo-655 dark:bg-indigo-955/20 dark:text-indigo-400" }
      ]
    },
    {
      title: "Other",
      items: [
        { id: "number", name: "Number", Icon: Hash, color: "bg-amber-50 text-amber-600 dark:bg-amber-955/20 dark:text-amber-400" },
        { id: "date", name: "Date", Icon: Calendar, color: "bg-amber-50 text-amber-650 dark:bg-amber-955/20 dark:text-amber-400" },
        { id: "payment", name: "Payment", Icon: CreditCard, color: "bg-amber-50 text-amber-655 dark:bg-amber-955/20 dark:text-amber-400", premium: true },
        { id: "file_upload", name: "File Upload", Icon: Upload, color: "bg-amber-50 text-amber-655 dark:bg-amber-955/20 dark:text-amber-400", premium: true },
        { id: "google_drive", name: "Google Drive", Icon: Database, color: "bg-amber-50 text-amber-655 dark:bg-amber-955/20 dark:text-amber-400", premium: true },
        { id: "calendly", name: "Calendly", Icon: Clock, color: "bg-amber-50 text-amber-655 dark:bg-amber-955/20 dark:text-amber-400", premium: true }
      ]
    },
    {
      title: "Rating & ranking",
      items: [
        { id: "nps", name: "Net Promoter Score", Icon: Sliders, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400", premium: true },
        { id: "opinion_scale", name: "Opinion Scale", Icon: Sliders, color: "bg-emerald-50 text-emerald-650 dark:bg-emerald-955/20 dark:text-emerald-400", premium: true },
        { id: "rating", name: "Rating", Icon: Star, color: "bg-emerald-50 text-emerald-655 dark:bg-emerald-955/20 dark:text-emerald-400" },
        { id: "ranking", name: "Ranking", Icon: GripVertical, color: "bg-emerald-50 text-emerald-655 dark:bg-emerald-955/20 dark:text-emerald-400" },
        { id: "matrix", name: "Matrix", Icon: CheckSquare, color: "bg-emerald-50 text-emerald-655 dark:bg-emerald-955/20 dark:text-emerald-400", premium: true }
      ]
    },
    {
      title: "Other / Structure",
      items: [
        { id: "welcome", name: "Welcome Screen", Icon: Play, color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
        { id: "partial_submit", name: "Partial Submit Point", Icon: CheckSquare, color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400", premium: true },
        { id: "statement", name: "Statement", Icon: FileText, color: "bg-neutral-100 text-neutral-605 dark:bg-neutral-805 dark:text-neutral-400" },
        { id: "question_group", name: "Question Group", Icon: Folder, color: "bg-neutral-100 text-neutral-605 dark:bg-neutral-805 dark:text-neutral-400", premium: true },
        { id: "multi_question_page", name: "Multi-Question Page", Icon: Layers, color: "bg-neutral-100 text-neutral-605 dark:bg-neutral-805 dark:text-neutral-400", premium: true },
        { id: "thank_you", name: "End Screen", Icon: Smile, color: "bg-neutral-100 text-neutral-605 dark:bg-neutral-805 dark:text-neutral-400" },
        { id: "redirect_url", name: "Redirect to URL", Icon: Globe, color: "bg-neutral-100 text-neutral-605 dark:bg-neutral-805 dark:text-neutral-400", premium: true }
      ]
    }
  ];

  const content = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full animate-fadeIn overflow-y-auto p-4 scrollbar-hide">
      {/* Column 1: Contact info & Text & Video */}
      <div className="space-y-8">
        {categories.slice(0, 2).map((cat) => (
          <div key={cat.title} className="space-y-2">
            <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{cat.title}</h3>
            <div className="space-y-1">
              {cat.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectField(item.id, item.name, item.premium)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-850/60 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className={`p-1.5 rounded-lg ${item.color} shrink-0`}>
                      <item.Icon className="size-3.5" />
                    </span>
                    <span className="text-xs font-semibold text-neutral-750 dark:text-neutral-205 group-hover:text-primary transition-colors">{item.name}</span>
                  </div>
                  {item.premium && (
                    <span className="text-emerald-500 dark:text-emerald-400 p-1 shrink-0">
                      <Sparkles className="size-3.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Column 2: Choice & Other */}
      <div className="space-y-8">
        {categories.slice(2, 4).map((cat) => (
          <div key={cat.title} className="space-y-2">
            <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{cat.title}</h3>
            <div className="space-y-1">
              {cat.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectField(item.id, item.name, item.premium)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-850/60 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className={`p-1.5 rounded-lg ${item.color} shrink-0`}>
                      <item.Icon className="size-3.5" />
                    </span>
                    <span className="text-xs font-semibold text-neutral-750 dark:text-neutral-205 group-hover:text-primary transition-colors">{item.name}</span>
                  </div>
                  {item.premium && (
                    <span className="text-emerald-500 dark:text-emerald-400 p-1 shrink-0">
                      <Sparkles className="size-3.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Column 3: Rating & Structure */}
      <div className="space-y-8">
        {categories.slice(4, 6).map((cat) => (
          <div key={cat.title} className="space-y-2">
            <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">{cat.title}</h3>
            <div className="space-y-1">
              {cat.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectField(item.id, item.name, item.premium)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-850/60 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className={`p-1.5 rounded-lg ${item.color} shrink-0`}>
                      <item.Icon className="size-3.5" />
                    </span>
                    <span className="text-xs font-semibold text-neutral-750 dark:text-neutral-205 group-hover:text-primary transition-colors">{item.name}</span>
                  </div>
                  {item.premium && (
                    <span className="text-emerald-500 dark:text-emerald-400 p-1 shrink-0">
                      <Sparkles className="size-3.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (onClose) {
    // Modal variant
    return (
      <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-neutral-950/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`bg-white dark:bg-neutral-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh] transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
          <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
            <div className="flex-1 max-w-md relative mr-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search elements…" 
                aria-label="Search elements"
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="button" onClick={onClose} className="size-10 rounded-2xl flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer">
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
});

FieldTypeSelector.displayName = "FieldTypeSelector";

export default FieldTypeSelector;
