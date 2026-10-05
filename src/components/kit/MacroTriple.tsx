interface MacroTripleProps {
  f: number;
  c: number;
  p: number;
  size?: number;
  className?: string;
  gap?: number;
}

/** Fat · carb · protein in grams. Fixed colours: fat = gold, carb = teal, protein = coral. */
export default function MacroTriple({ f, c, p, size = 13, className = "", gap = 14 }: MacroTripleProps) {
  const item = (dot: string, val: number, lab: string) => (
    <span className="inline-flex items-center gap-[5px]">
      <span className={`inline-block h-[7px] w-[7px] rounded-full ${dot}`} />
      <span className="font-data font-bold" style={{ fontSize: size }}>
        {Math.round(val)}g
      </span>
      <span className="font-body text-ft-dim" style={{ fontSize: size - 1 }}>
        {lab}
      </span>
    </span>
  );
  return (
    <div className={`flex items-center ${className}`} style={{ gap }}>
      {item("bg-ft-gold", f, "fat")}
      {item("bg-ft-accent", c, "carb")}
      {item("bg-ft-coral", p, "protein")}
    </div>
  );
}
