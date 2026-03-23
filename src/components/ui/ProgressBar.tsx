interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValues?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  max,
  label,
  showValues = false,
  className = "",
}: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(label || showValues) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-ft-dim text-[11px] font-body uppercase tracking-wider">
              {label}
            </span>
          )}
          {showValues && (
            <span className="text-ft-dim text-[11px] font-body">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-ft-card rounded-full overflow-hidden">
        <div
          className="h-full bg-ft-light rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
