"use client";

/**
 * EditPlanBtn — small underlined CTA that links to the program detail
 * (existing `/programs/[id]` editor; inline schedule-override editing
 * is **R7** territory).
 *
 * Verbatim port of gameplan-active.jsx#EditPlanBtn (lines 1368–1380),
 * with the static "EDIT PLAN" upgraded to a Next.js Link.
 */

import Link from "next/link";
import { Archivo } from "./typography";
import { ButtonSpray } from "./Ornaments";

export function EditPlanBtn({
  align = "flex-end",
  href,
  label = "EDIT PLAN",
}: {
  align?: "flex-start" | "center" | "flex-end";
  href: string;
  label?: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: align, marginTop: 12 }}>
      <Link
        href={href}
        style={{ position: "relative", display: "inline-block", textDecoration: "none" }}
      >
        <Archivo
          size={11}
          color="rgb(var(--ft-text-secondary))"
          style={{ letterSpacing: ".18em", textTransform: "uppercase" }}
        >
          {label}
        </Archivo>
        <ButtonSpray width={Math.max(70, label.length * 8)} color="rgb(var(--ft-text-secondary))" style={{ marginTop: -1 }} />
      </Link>
    </div>
  );
}
