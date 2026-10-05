"use client";

import { Sheet, Stamp } from "@/components/kit";
import type { TemplateView } from "@/lib/nutrition-view";
import { RoleTag } from "./meal-ui";

interface TemplateSheetProps {
  open: boolean;
  onClose: () => void;
  templates: TemplateView[];
  currentId: string | null;
  onPick: (template: TemplateView | null) => void;
}

/** Pick the meal's frame (archetype) or drop it for a free ingredient list. */
export default function TemplateSheet({ open, onClose, templates, currentId, onPick }: TemplateSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Frame">
      <ul className="divide-y divide-ft-border-faint">
        {templates.map((t) => (
          <li key={t.id}>
            <button type="button" onClick={() => onPick(t)} className="flex w-full items-start gap-3 py-3 text-left">
              <div className="min-w-0 flex-1">
                <div className="font-data text-[13.5px] font-semibold text-ft-white">{t.name}</div>
                {t.description && <div className="mt-0.5 font-body text-[12px] text-ft-light">{t.description}</div>}
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                  {t.slots.map((s) => (
                    <span key={s.role} className="flex items-center gap-1">
                      <RoleTag role={s.role} />
                      {!s.required && <span className="font-data text-[8.5px] uppercase tracking-[0.1em] text-ft-dim">opt</span>}
                    </span>
                  ))}
                </div>
              </div>
              {currentId === t.id && <Stamp>Current</Stamp>}
            </button>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => onPick(null)} className="flex w-full items-center gap-3 py-3 text-left">
            <div className="min-w-0 flex-1">
              <div className="font-data text-[13.5px] font-semibold text-ft-white">No frame</div>
              <div className="mt-0.5 font-body text-[12px] text-ft-light">A free ingredient list — shakes, snacks, anything that isn&apos;t a plate.</div>
            </div>
            {currentId === null && <Stamp>Current</Stamp>}
          </button>
        </li>
      </ul>
    </Sheet>
  );
}
