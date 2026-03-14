interface StatProps {
  label: string;
  value: string | number;
  sub?: string;
  small?: boolean;
}

export default function Stat({ label, value, sub, small = false }: StatProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-ft-dim text-[10px] uppercase tracking-widest font-mono">
        {label}
      </span>
      <span
        className={`text-ft-white font-mono font-bold ${
          small ? "text-lg" : "text-2xl"
        }`}
      >
        {value}
      </span>
      {sub && (
        <span className="text-ft-dim text-xs font-mono">{sub}</span>
      )}
    </div>
  );
}
