import { ReactNode } from "react";

/**
 * Numbered section header used across the planning-mode editor.
 * Renders the "01. goals // 2 active goals · all editable" pattern
 * from `design-prototypes/planning-screens.jsx`.
 *
 * Title sits in the theme's display font; sub-text uses body type.
 * The dashed rule fills the row remainder so the header reads as a
 * spec sheet entry. No background — sits directly on the page.
 */
export function PlanningSectionHeader({
  num,
  title,
  sub,
  className = "",
}: {
  num: string;
  title: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={`mb-2 ${className}`}>
      <div className="flex items-baseline gap-2">
        <span className="font-body text-[10px] tracking-[0.16em] text-ft-light font-bold">
          {num}.
        </span>
        <span className="font-display text-base text-ft-white tracking-[0.04em] uppercase">
          {title}
        </span>
        <div
          className="flex-1 h-px ml-1"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgb(var(--ft-border)) 50%, transparent 50%)",
            backgroundSize: "6px 1px",
          }}
        />
      </div>
      {sub && (
        <div className="font-body text-[10px] tracking-[0.06em] text-ft-light ml-5 font-medium mt-0.5">
          <span aria-hidden>{"// "}</span>
          {sub}
        </div>
      )}
    </div>
  );
}

/**
 * Wraps a section's content with consistent vertical rhythm.
 */
export function PlanningSection({
  num,
  title,
  sub,
  children,
  className = "",
}: {
  num: string;
  title: string;
  sub?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-6 ${className}`}>
      <PlanningSectionHeader num={num} title={title} sub={sub} />
      <div>{children}</div>
    </section>
  );
}

/**
 * "PLANNING MODE" rotated stamp used as a header badge.
 */
export function PlanningStamp({ children = "PLANNING MODE" }: { children?: ReactNode }) {
  return (
    <span
      className="ft-stamp inline-block bg-ft-accent/10"
      style={{ transform: "rotate(-3deg)", borderColor: "rgb(var(--ft-accent) / 0.6)" }}
    >
      {children}
    </span>
  );
}
