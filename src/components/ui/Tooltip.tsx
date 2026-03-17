"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<"above" | "below">("above");
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition(rect.top < 80 ? "below" : "above");
    }
  }, [show]);

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
      role="button"
      aria-label={content}
    >
      {children}
      {show && (
        <span
          className={`absolute z-50 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-ft-card border border-ft-border rounded text-ft-light text-[11px] font-mono leading-snug whitespace-normal w-56 text-center shadow-lg pointer-events-none ${
            position === "above" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
