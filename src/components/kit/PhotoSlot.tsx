import Link from "next/link";

interface PhotoSlotProps {
  label: string;
  src?: string | null;
  href?: string;
  w?: number;
  h?: number;
  className?: string;
}

/** Progress-photo tile: the image with its date, or a striped placeholder. */
export default function PhotoSlot({ label, src, href, w = 78, h = 104, className = "" }: PhotoSlotProps) {
  const cls = `relative block flex-shrink-0 overflow-hidden rounded-ft-md border border-ft-border ${className}`;
  const style = { width: w, height: h, background: src ? undefined : "repeating-linear-gradient(45deg, rgb(var(--ft-surface-alt)) 0 8px, rgb(var(--ft-surface)) 8px 16px)" };
  const inner = src ? (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ft-cam-bg/70 to-transparent px-1 pb-1.5 pt-4 text-center font-data text-[9px] tracking-[0.1em] text-ft-cam-text">{label}</span>
    </>
  ) : (
    <span className="absolute inset-x-0 bottom-1.5 text-center font-data text-[9px] tracking-[0.1em] text-ft-dim">{label}</span>
  );
  return href ? (
    <Link href={href} className={cls} style={style}>
      {inner}
    </Link>
  ) : (
    <div className={cls} style={style}>
      {inner}
    </div>
  );
}
