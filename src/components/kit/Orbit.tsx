/** The atomic orbit glyph — the one ornament. Sits before every screen title. */
export default function Orbit({ size = 18, color, className = "" }: { size?: number; color?: string; className?: string }) {
  const c = color ?? "rgb(var(--ft-accent))";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`flex-shrink-0 ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="2.4" fill={c} />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke={c} strokeWidth="1.3" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" stroke={c} strokeWidth="1.3" transform="rotate(60 12 12)" />
      <circle cx="21.2" cy="9.4" r="1.5" fill="rgb(var(--ft-coral))" />
    </svg>
  );
}
