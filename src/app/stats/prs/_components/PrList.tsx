"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, ScreenHeader, Stamp } from "@/components/kit";
import { fmtStamp } from "@/lib/dates";

export interface PrRowData {
  id: string;
  exerciseId: string;
  name: string;
  type: string;
  value: string;
  date: string;
}

const TYPES: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "weight", label: "Weight" },
  { value: "reps", label: "Reps" },
  { value: "e1rm", label: "e1RM" },
  { value: "volume", label: "Volume" },
];

export default function PrList({ rows }: { rows: PrRowData[] }) {
  const [type, setType] = useState("all");
  const list = useMemo(() => rows.filter((r) => type === "all" || r.type === type), [rows, type]);
  return (
    <div className="pb-8">
      <ScreenHeader title="PRs" back={{ href: "/stats", label: "Stats" }} right={<Stamp tone="coral">{rows.length} total</Stamp>} />
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-5 pb-3.5">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={[
              "flex-shrink-0 rounded-full border px-[11px] py-[5px] font-data text-[10.5px] font-bold uppercase tracking-[0.1em]",
              type === t.value ? "border-ft-accent-deep bg-ft-accent text-ft-on-accent" : "border-ft-border bg-ft-surface text-ft-light",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="px-5">
        <Card className="px-4 py-1">
          {list.length === 0 && <div className="py-3 font-body text-[13px] text-ft-dim">No PRs of this kind yet.</div>}
          {list.map((r, i) => (
            <div key={r.id} className={["flex items-center gap-2.5 py-[9px]", i < list.length - 1 ? "border-b border-ft-border-faint" : ""].join(" ")}>
              <Stamp tone="coral">{r.type === "e1rm" ? "e1RM" : r.type}</Stamp>
              <Link href={`/stats/exercise/${r.exerciseId}`} className="min-w-0 flex-1 truncate font-data text-[13.5px] font-semibold text-ft-white">
                {r.name}
              </Link>
              <div className="font-data text-[13.5px] font-bold text-ft-white">{r.value}</div>
              <div className="w-[52px] text-right font-data text-[11px] text-ft-dim">{fmtStamp(r.date)}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
