interface TagProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warn" | "danger";
  className?: string;
}

export default function Tag({ children, variant = "default", className = "" }: TagProps) {
  const variants = {
    default: "bg-ft-card text-ft-light",
    success: "bg-ft-success/20 text-ft-success",
    warn: "bg-ft-warn/20 text-ft-warn",
    danger: "bg-ft-danger/20 text-ft-danger",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-body rounded ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
