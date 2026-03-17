import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = "+",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-ft-dim text-3xl mb-3">{icon}</span>
      <p className="text-ft-light font-mono font-bold text-sm">{title}</p>
      {description && (
        <p className="text-ft-muted font-mono text-xs mt-1 max-w-xs">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 bg-ft-accent text-ft-bg font-mono text-xs font-bold px-4 py-2 rounded hover:opacity-90 transition-colors"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="mt-4 bg-ft-accent text-ft-bg font-mono text-xs font-bold px-4 py-2 rounded hover:opacity-90 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
