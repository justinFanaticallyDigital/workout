/**
 * v2 Stamp — small-caps data-font label (ACTIVE, PR, SPECIMEN #, …).
 *
 * Renders the `.ft-stamp` class hook so the per-theme shape in globals.css
 * (iron wide-tracked brass, graffiti rotated tape, arcade pixel, blueprint
 * outline) applies. Theme-agnostic markup.
 */
import type { ReactNode } from "react";

export default function Stamp({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <span className={["ft-stamp", className].join(" ")}>{children}</span>;
}
