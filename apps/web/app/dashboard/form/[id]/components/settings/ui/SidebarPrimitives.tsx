/** Consistent section label with tracking — used throughout the sidebar panels */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">
      {children}
    </span>
  );
}

/** Sub-group label (slightly darker, no border) */
export function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block">
      {children}
    </span>
  );
}

/** Standard sidebar panel container with top divider */
export function SidebarSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800 ${className}`}>
      {children}
    </div>
  );
}
