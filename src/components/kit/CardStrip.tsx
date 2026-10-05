import type { ReactNode } from "react";

interface CardStripProps {
  children: ReactNode;
  /** Inside a card: bleed to the card's padding edge so tiles peek past it. */
  inset?: boolean;
  className?: string;
}

/** Horizontal scroller. The last card peeks past the edge — that peek is the only swipe hint. */
export default function CardStrip({ children, inset = false, className = "" }: CardStripProps) {
  return (
    <div
      className={[
        "no-scrollbar flex overflow-x-auto",
        inset ? "-mx-4 gap-2 px-4" : "gap-3 px-5 pb-1 pt-0.5",
        className,
      ].join(" ")}
      style={{ scrollPaddingLeft: inset ? 16 : 20, WebkitOverflowScrolling: "touch" }}
    >
      {children}
    </div>
  );
}
