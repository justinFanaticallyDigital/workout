/** Expand chevron: ▾ closed, ▴ open. 12px, tertiary. */
export default function Chev({ open, className = "" }: { open?: boolean; className?: string }) {
  return (
    <span className={`w-3 flex-shrink-0 text-center font-data text-[12px] text-ft-dim ${className}`} aria-hidden="true">
      {open ? "▴" : "▾"}
    </span>
  );
}
