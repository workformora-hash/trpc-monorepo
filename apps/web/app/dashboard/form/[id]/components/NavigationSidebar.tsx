import {
  ChevronDown,
  Plus,
  Trash2,
  Type,
  FileText,
  Mail,
  Hash,
  ListIcon,
  CheckSquare,
  Star,
  Calendar,
} from "lucide-react";

export function NavigationSidebar({ 
  selectedFields, 
  activeFieldId, 
  setActiveFieldId, 
  deleteFormFieldMutation,
  handleAddNewField
}: { 
  selectedFields: any[], 
  activeFieldId: string | null, 
  setActiveFieldId: (id: string) => void,
  deleteFormFieldMutation: any,
  handleAddNewField: (type: string) => void
}) {
  return (
    <aside className="w-72 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col overflow-hidden select-none">
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="relative">
          <button className="w-full flex items-center justify-between bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-350">
            <span>Universal mode</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-1">
          {selectedFields.length === 0 ? (
            <p className="text-[11px] text-neutral-400 text-center italic py-4">No fields added yet</p>
          ) : (
            selectedFields.map((field, idx) => {
              const isActive = field.id === activeFieldId || (!activeFieldId && idx === 0);
              return (
                <div 
                  key={field.id}
                  onClick={() => setActiveFieldId(field.id)}
                  className={`group cursor-pointer w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 shadow-xs' 
                      : 'bg-transparent border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-955'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-neutral-400 font-mono">
                      {idx + 1}
                    </span>
                    <span className="p-1 rounded bg-neutral-100 dark:bg-neutral-950 text-neutral-500">
                      {field.type === 'short_text' && <Type className="h-3 w-3" />}
                      {field.type === 'long_text' && <FileText className="h-3 w-3" />}
                      {field.type === 'email' && <Mail className="h-3 w-3" />}
                      {field.type === 'number' && <Hash className="h-3 w-3" />}
                      {field.type === 'single_select' && <ListIcon className="h-3 w-3" />}
                      {field.type === 'multi_select' && <CheckSquare className="h-3 w-3" />}
                      {field.type === 'checkbox' && <CheckSquare className="h-3 w-3" />}
                      {field.type === 'rating' && <Star className="h-3 w-3" />}
                      {field.type === 'date' && <Calendar className="h-3 w-3" />}
                    </span>
                    <span className="text-xs font-semibold truncate max-w-[130px] dark:text-neutral-250 text-neutral-750">
                      {field.label || "Untitled field"}
                    </span>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Remove this question?")) {
                        deleteFormFieldMutation.mutate({ id: field.id });
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 p-1 transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">Endings</span>
          <button
            onClick={() => handleAddNewField('statement')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-950 text-[11px] font-semibold text-neutral-500 transition-all"
          >
            <span>Add ending screen</span>
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
