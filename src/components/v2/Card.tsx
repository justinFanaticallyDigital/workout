/**
 * v2 Card — the canonical surface primitive (ARCHITECTURE.md §5).
 *
 * Renders the `.ft-card` class hook so the per-theme chrome in globals.css
 * (iron knurled rib, arcade bezel, graffiti tilt, blueprint corner marks, …)
 * applies automatically. Uses `bg-ft-surface` — several theme-scoped rules
 * target `.ft-card.bg-ft-surface`, so keep that class pairing.
 *
 * Inside a Card, foreground is white-on-surface in every theme (incl.
 * Blueprint's dark navy card) — use the normal text-ft-white / -light / -dim
 * tokens, NOT the on-bg tokens.
 */
import { forwardRef, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Elevated surface (modals, popovers) — uses surface-raised + md shadow. */
  raised?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { raised = false, className = "", children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        "ft-card",
        raised ? "bg-ft-surface-raised shadow-ft-md" : "bg-ft-surface shadow-ft-sm",
        "border border-ft-border-faint rounded-ft-lg",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
});

export default Card;
