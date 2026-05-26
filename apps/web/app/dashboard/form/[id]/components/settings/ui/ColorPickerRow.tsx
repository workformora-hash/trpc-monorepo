interface ColorPickerRowProps {
  label: string;
  value: string;
  defaultColor?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

const INPUT_CLS =
  'flex-1 bg-white dark:bg-neutral-955 border border-neutral-250 dark:border-neutral-800 ' +
  'rounded-lg px-2.5 py-1.5 text-xs font-semibold dark:text-neutral-100 text-neutral-750 focus:outline-none';

/** Color swatch + hex text input pair — eliminates 6 copy-paste color picker blocks */
export function ColorPickerRow({
  label,
  value,
  defaultColor = '#111827',
  placeholder = 'Inherit theme color',
  onChange,
}: ColorPickerRowProps) {
  const safeColor = value && value.startsWith('#') && value.length === 7 ? value : defaultColor;

  return (
    <div className="space-y-1">
      <label className="text-[9px] font-bold text-neutral-400">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={safeColor}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-neutral-250 dark:border-neutral-800 cursor-pointer overflow-hidden p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value || '')}
          placeholder={placeholder}
          className={INPUT_CLS}
        />
      </div>
    </div>
  );
}
