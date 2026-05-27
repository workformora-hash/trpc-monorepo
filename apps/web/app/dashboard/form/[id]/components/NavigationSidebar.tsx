import { useState } from "react";
import {
  ChevronDown,
  Plus,
  Trash2,
  Copy,
  Type,
  FileText,
  Mail,
  Hash,
  ListIcon,
  CheckSquare,
  Star,
  Calendar,
  User,
  MapPin,
  Globe,
  HelpCircle,
  Sliders,
  Play,
  Smile,
  GripVertical,
  AlignLeft,
} from "lucide-react";
import { useFormBuilderContext } from './FormBuilderContext';

const FIELD_ICON: Record<string, React.ReactNode> = {
  short_text: <Type className="h-3 w-3" />,
  long_text: <AlignLeft className="h-3 w-3" />,
  email: <Mail className="h-3 w-3" />,
  number: <Hash className="h-3 w-3" />,
  single_select: <ListIcon className="h-3 w-3" />,
  multi_select: <CheckSquare className="h-3 w-3" />,
  checkbox: <CheckSquare className="h-3 w-3" />,
  rating: <Star className="h-3 w-3" />,
  date: <Calendar className="h-3 w-3" />,
  contact_info: <User className="h-3 w-3" />,
  address: <MapPin className="h-3 w-3" />,
  website: <Globe className="h-3 w-3" />,
  dropdown: <ChevronDown className="h-3 w-3" />,
  yes_no: <HelpCircle className="h-3 w-3" />,
  ranking: <Sliders className="h-3 w-3" />,
  statement: <FileText className="h-3 w-3" />,
  welcome: <Play className="h-3 w-3 text-emerald-500" />,
  thank_you: <Smile className="h-3 w-3 text-indigo-400" />,
};

const FIELD_COLOR: Record<string, string> = {
  short_text: 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
  long_text: 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
  email: 'bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400',
  number: 'bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
  single_select: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
  multi_select: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
  checkbox: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
  rating: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
  date: 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
  contact_info: 'bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
  address: 'bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
  website: 'bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400',
  dropdown: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
  yes_no: 'bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400',
  ranking: 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
  statement: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500',
  welcome: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
  thank_you: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400',
};

export function NavigationSidebar() {
  const { selectedFields, activeFieldId, setActiveFieldId, deleteFormFieldMutation, duplicateFormFieldMutation, handleAddNewField, handleReorderFields } = useFormBuilderContext();

  const welcomeFields = selectedFields.filter(f => f.type === 'welcome');
  const thankYouFields = selectedFields.filter(f => f.type === 'thank_you');
  const standardFields = selectedFields.filter(f => f.type !== 'welcome' && f.type !== 'thank_you');

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const renderFieldItem = (field: any, displayIdx: number | null, arrayIdx: number | null) => {
    const isActive = field.id === activeFieldId;
    const isDraggable = arrayIdx !== null;
    const isBeingDragOver = arrayIdx !== null && dragOverIdx === arrayIdx && draggedIdx !== arrayIdx;
    const colorClass = FIELD_COLOR[field.type] || 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500';

    return (
      <div 
        key={field.id}
        onClick={() => setActiveFieldId(field.id)}
        draggable={isDraggable}
        onDragStart={(e) => {
          if (!isDraggable) return;
          setDraggedIdx(arrayIdx);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragOver={(e) => {
          if (!isDraggable) return;
          e.preventDefault();
          if (draggedIdx !== arrayIdx) setDragOverIdx(arrayIdx);
        }}
        onDragLeave={() => {
          if (!isDraggable) return;
          if (dragOverIdx === arrayIdx) setDragOverIdx(null);
        }}
        onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null); }}
        onDrop={(e) => {
          if (!isDraggable) return;
          e.preventDefault();
          if (draggedIdx !== null && draggedIdx !== arrayIdx) {
            handleReorderFields(draggedIdx!, arrayIdx!);
          }
          setDraggedIdx(null);
          setDragOverIdx(null);
        }}
        className={`group cursor-pointer w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all relative select-none ${
          isActive 
            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100' 
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-800 dark:hover:text-neutral-200'
        } ${isBeingDragOver ? 'ring-1 ring-primary bg-primary/5 dark:bg-primary/10' : ''} ${
          draggedIdx === arrayIdx ? 'opacity-30' : ''
        }`}
      >
        {/* Left accent bar when active */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4/5 bg-primary rounded-full" />
        )}

        {/* Drag grip — only on hover */}
        {isDraggable && (
          <GripVertical className="h-3 w-3 text-neutral-300 dark:text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -ml-0.5" />
        )}

        {/* Field number */}
        {displayIdx !== null && (
          <span className="text-[9px] font-bold text-neutral-400 font-mono w-4 text-right shrink-0">
            {displayIdx}
          </span>
        )}

        {/* Colored icon chip */}
        <span className={`p-1 rounded-md ${colorClass} shrink-0`}>
          {FIELD_ICON[field.type] || <Type className="h-3 w-3" />}
        </span>

        {/* Label */}
        <span className="text-[11px] font-semibold truncate flex-1 leading-tight">
          {field.label || (field.type === 'welcome' ? 'Welcome Screen' : field.type === 'thank_you' ? 'Thank You' : 'Untitled')}
        </span>

        {/* Actions on hover */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              duplicateFormFieldMutation.mutate({ fieldId: field.id });
            }}
            className="text-neutral-400 hover:text-primary dark:text-neutral-500 dark:hover:text-primary p-0.5 rounded transition-all"
            title="Duplicate question"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Remove this field?")) {
                deleteFormFieldMutation.mutate({ id: field.id });
              }
            }}
            className="text-neutral-400 hover:text-red-505 dark:text-neutral-500 dark:hover:text-red-400 p-0.5 rounded transition-all"
            title="Delete question"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-56 border-r border-neutral-150 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col overflow-hidden select-none shrink-0">
      {/* Sidebar header */}
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Form Content</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {/* Start / Welcome */}
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block px-2.5 mb-1.5">Start</span>
          {welcomeFields.map((field) => renderFieldItem(field, null, null))}
          {welcomeFields.length === 0 && (
            <button
              onClick={() => handleAddNewField('welcome')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 hover:border-primary/50 hover:bg-primary/5 text-[11px] font-semibold text-neutral-400 hover:text-primary transition-all"
            >
              <Plus className="h-3 w-3" />
              <span>Add welcome screen</span>
            </button>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block px-2.5 mb-1.5">Questions</span>
          {standardFields.length === 0 ? (
            <p className="text-[11px] text-neutral-400 text-center italic py-3">No questions yet</p>
          ) : (
            standardFields.map((field, idx) => renderFieldItem(field, idx + 1, idx))
          )}
        </div>

        {/* Endings */}
        <div className="space-y-0.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block px-2.5 mb-1.5">Ending</span>
          {thankYouFields.map((field) => renderFieldItem(field, null, null))}
          <button
            onClick={() => handleAddNewField('thank_you')}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 hover:border-primary/50 hover:bg-primary/5 text-[11px] font-semibold text-neutral-400 hover:text-primary transition-all"
          >
            <Plus className="h-3 w-3" />
            <span>Add ending screen</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
