/** Inline SVG icon set for the kit. Geometry from the Atompunk canvas. */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size: number, rest: SVGProps<SVGSVGElement>) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, ...rest });

export function TrainingIcon({ size = 22, ...rest }: P) {
  return (
    <svg {...base(size, rest)}>
      <rect x="2" y="9" width="3.4" height="6" rx="1" fill="currentColor" />
      <rect x="18.6" y="9" width="3.4" height="6" rx="1" fill="currentColor" />
      <rect x="6" y="6.5" width="3" height="11" rx="1" fill="currentColor" />
      <rect x="15" y="6.5" width="3" height="11" rx="1" fill="currentColor" />
      <rect x="9" y="11" width="6" height="2" fill="currentColor" />
    </svg>
  );
}
export function NutritionIcon({ size = 22, ...rest }: P) {
  return (
    <svg {...base(size, rest)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
export function StatsIcon({ size = 22, ...rest }: P) {
  return (
    <svg {...base(size, rest)}>
      <rect x="4" y="12" width="3.6" height="8" rx="1" fill="currentColor" />
      <rect x="10.2" y="7" width="3.6" height="13" rx="1" fill="currentColor" />
      <rect x="16.4" y="10" width="3.6" height="10" rx="1" fill="currentColor" />
    </svg>
  );
}
export function SettingsIcon({ size = 22, ...rest }: P) {
  return (
    <svg {...base(size, rest)}>
      <rect x="3" y="6" width="18" height="1.8" rx=".9" fill="currentColor" />
      <circle cx="9" cy="7" r="2.6" fill="rgb(var(--ft-surface))" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="16" width="18" height="1.8" rx=".9" fill="currentColor" />
      <circle cx="15.5" cy="17" r="2.6" fill="rgb(var(--ft-surface))" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
export function CameraIcon({ size = 18, ...rest }: P) {
  return (
    <svg {...base(size, rest)} className={`flex-shrink-0 ${rest.className ?? ""}`}>
      <path d="M4 8h3l1.6-2.4h6.8L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="13.2" r="3.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
export function CheckIcon({ size = 12, ...rest }: P) {
  return (
    <svg {...base(size, rest)}>
      <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function XIcon({ size = 16, ...rest }: P) {
  return (
    <svg {...base(size, rest)}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
export function PlusIcon({ size = 16, ...rest }: P) {
  return (
    <svg {...base(size, rest)}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
export function SearchIcon({ size = 16, ...rest }: P) {
  return (
    <svg {...base(size, rest)}>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
export function ChevronLeftIcon({ size = 14, ...rest }: P) {
  return (
    <svg {...base(size, rest)}>
      <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
