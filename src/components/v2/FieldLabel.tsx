/**
 * v2 FieldLabel — small uppercase data label above a form control.
 * `onBg` for labels sitting directly on the page bg (Blueprint-safe).
 */
import type { ReactNode } from "react";

export default function FieldLabel({
  onBg = false,
  right,
  className = "",
  children,
}: {
  onBg?: boolean;
  right?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={[
        "flex items-baseline justify-between pb-1.5",
        onBg ? "ft-on-bg" : "",
        className,
      ].join(" ")}
    >
      <span
        className={[
          "font-data text-[10.5px] font-bold uppercase tracking-[0.1em]",
          onBg ? "text-ft-on-bg-sec" : "text-ft-light",
        ].join(" ")}
      >
        {children}
      </span>
      {right != null && (
        <span className={["font-body text-[11px]", onBg ? "text-ft-on-bg-ter" : "text-ft-dim"].join(" ")}>
          {right}
        </span>
      )}
    </div>
  );
}
