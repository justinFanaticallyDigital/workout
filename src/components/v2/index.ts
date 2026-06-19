/**
 * v2 primitives — the shared component vocabulary for the FitTrack v2 reskin
 * (ARCHITECTURE.md §5). Match this set; do not invent parallel components.
 *
 * All primitives are theme-agnostic: they read CSS-var-backed `ft-*` Tailwind
 * tokens, so every theme "just works". Chrome rendered directly on the page bg
 * uses the on-bg token family (`.ft-on-bg`, `text-ft-on-bg*`, `*-accent-on-bg`)
 * so it stays legible on Blueprint (the inverted theme). See ARCHITECTURE §1.
 */
export { default as Card } from "./Card";
export { default as Button } from "./Button";
export { default as Chip } from "./Chip";
export { default as Stamp } from "./Stamp";
export { default as SectionLabel } from "./SectionLabel";
export { default as Header } from "./Header";
export { default as Stepper } from "./Stepper";
