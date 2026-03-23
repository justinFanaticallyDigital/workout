interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <div className="flex items-center gap-3">
        <h3 className="text-ft-light text-sm font-body uppercase tracking-wider font-bold">
          {title}
        </h3>
        {subtitle && (
          <span className="text-ft-dim text-xs font-body">{subtitle}</span>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
