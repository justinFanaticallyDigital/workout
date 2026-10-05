import { categoryFor, GROUP_BG, type CategoryGroup } from "@/lib/categories";
import Chev from "./Chev";

interface CategoryChipProps {
  movementPattern: string | null | undefined;
  primaryMuscle?: string | null;
  /** solid = logger lane chip · pill = editor picker trigger · label = dot + text */
  variant?: "solid" | "pill" | "label";
  className?: string;
}

export function CategoryDot({ group, size = 7 }: { group: CategoryGroup; size?: number }) {
  return <span className={`inline-block flex-shrink-0 rounded-full ${GROUP_BG[group]}`} style={{ width: size, height: size }} />;
}

/** Exercise category — colour from the group, text from the pattern or muscle. */
export default function CategoryChip({ movementPattern, primaryMuscle, variant = "label", className = "" }: CategoryChipProps) {
  const cat = categoryFor(movementPattern, primaryMuscle);
  if (variant === "solid") {
    return (
      <span className={`inline-flex items-center whitespace-nowrap rounded-ft-sm px-2 py-[2px] font-data text-[9px] font-bold uppercase tracking-[0.14em] text-ft-on-accent ${GROUP_BG[cat.group]} ${className}`}>
        {cat.label}
      </span>
    );
  }
  if (variant === "pill") {
    return (
      <span className={`inline-flex items-center gap-[5px] rounded-full border border-ft-border bg-ft-surface-alt px-[9px] py-[2px] ${className}`}>
        <CategoryDot group={cat.group} />
        <span className="font-data text-[9.5px] font-bold uppercase tracking-[0.12em] text-ft-light">{cat.label}</span>
        <Chev className="!w-auto text-[9px]" />
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-[5px] ${className}`}>
      <CategoryDot group={cat.group} />
      <span className="font-data text-[9.5px] font-bold uppercase tracking-[0.12em] text-ft-light">{cat.label}</span>
    </span>
  );
}
