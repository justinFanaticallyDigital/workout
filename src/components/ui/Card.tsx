interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={`bg-ft-surface border border-ft-border p-4 ${
        onClick ? "cursor-pointer hover:border-ft-dim transition-colors" : ""
      } ${className}`}
      style={{ borderRadius: "var(--ft-border-radius, 0.5rem)" }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
