"use client";

import { useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

interface ReorderListProps<T extends { id: string }> {
  rows: T[];
  onReorder: (order: string[]) => void;
  children: (row: T, grip: HTMLAttributes<HTMLElement>, index: number) => ReactNode;
}

/** Pointer-driven reorder: drag from the grip, siblings slide, the new order commits on release. */
export default function ReorderList<T extends { id: string }>({ rows, onReorder, children }: ReorderListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ id: string; from: number; to: number; dy: number } | null>(null);
  const ids = useMemo(() => rows.map((r) => r.id), [rows]);

  const start = (id: string, from: number, e: ReactPointerEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const rowEls = Array.from(listRef.current?.querySelectorAll<HTMLElement>("[data-row]") ?? []);
    const centers = rowEls.map((el) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - startY;
      const y = centers[from] + dy;
      let to = 0;
      for (let i = 0; i < centers.length; i++) if (y > centers[i]) to = i;
      setDrag({ id, from, to, dy });
    };
    const up = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      setDrag((d) => {
        if (d && d.to !== d.from) {
          const next = ids.slice();
          const [m] = next.splice(d.from, 1);
          next.splice(d.to, 0, m);
          onReorder(next);
        }
        return null;
      });
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };

  return (
    <div ref={listRef}>
      {rows.map((row, i) => {
        let style: CSSProperties | undefined;
        if (drag) {
          if (row.id === drag.id) style = { transform: `translateY(${drag.dy}px)`, opacity: 0.75, position: "relative", zIndex: 2 };
          else if (drag.from < drag.to && i > drag.from && i <= drag.to) style = { transform: "translateY(-100%)", transition: "transform 120ms" };
          else if (drag.from > drag.to && i >= drag.to && i < drag.from) style = { transform: "translateY(100%)", transition: "transform 120ms" };
        }
        return (
          <div key={row.id} data-row style={style}>
            {children(row, { onPointerDown: (e) => start(row.id, i, e), className: "cursor-grab touch-none select-none active:cursor-grabbing" }, i)}
          </div>
        );
      })}
    </div>
  );
}
