import { ToggleLeft, ToggleRight } from 'lucide-react';

interface SettingsToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
  /** If true, wraps in a bordered card (for validation rule rows) */
  card?: boolean;
}

/** Reusable labeled toggle row — eliminates 12+ duplicate flex/toggle blocks */
export function SettingsToggleRow({
  label,
  description,
  checked,
  onToggle,
  card = false,
}: SettingsToggleRowProps) {
  const inner = (
    <div className="flex items-center justify-between">
      <div className="text-left pr-3">
        <span className="text-xs font-bold dark:text-neutral-200 text-neutral-750 block">{label}</span>
        {description && (
          <span className="text-[9px] text-neutral-400 block leading-tight">{description}</span>
        )}
      </div>
      <button
        onClick={onToggle}
        className="p-1 focus:outline-none transition-all active:scale-95 shrink-0"
        aria-label={`Toggle ${label}`}
      >
        {checked
          ? <ToggleRight className="h-8 w-8 text-primary" />
          : <ToggleLeft className="h-8 w-8 text-neutral-400" />}
      </button>
    </div>
  );

  if (card) {
    return (
      <div className="p-3 bg-neutral-50 dark:bg-neutral-955/20 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        {inner}
      </div>
    );
  }
  return inner;
}
