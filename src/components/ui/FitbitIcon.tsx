/**
 * Fitbit dots logo as an inline SVG component.
 * Uses the classic diamond-shaped dot pattern.
 */
export default function FitbitIcon({
  size = 16,
  className = "",
  color = "currentColor",
}: {
  size?: number;
  className?: string;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill={color}
      className={className}
      aria-label="Fitbit"
    >
      {/* Row 1 (top) - 1 dot */}
      <circle cx="50" cy="8" r="6" />
      {/* Row 2 - 3 dots */}
      <circle cx="32" cy="24" r="7" />
      <circle cx="50" cy="24" r="8" />
      <circle cx="68" cy="24" r="8.5" />
      {/* Row 3 (middle) - 5 dots */}
      <circle cx="14" cy="42" r="5.5" />
      <circle cx="30" cy="42" r="7" />
      <circle cx="50" cy="42" r="8.5" />
      <circle cx="70" cy="42" r="9" />
      <circle cx="88" cy="42" r="8" />
      {/* Row 4 - 3 dots */}
      <circle cx="32" cy="62" r="7" />
      <circle cx="50" cy="62" r="8.5" />
      <circle cx="70" cy="62" r="9" />
      {/* Row 5 (bottom) - 1 dot */}
      <circle cx="50" cy="82" r="7" />
    </svg>
  );
}
