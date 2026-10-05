"use client";

import { useEffect, useMemo, useState } from "react";
import { AddCard, Btn, Card, CardStrip, ScreenHeader, SectionHeader, Stamp, StatusStamp } from "@/components/kit";
import { fmtHeaderDate } from "@/lib/dates";
import { currentBlock, plural, type Plan, type PlanBlock } from "@/lib/training";
import TDayCard from "./TDayCard";
import FrameCard from "./FrameCard";
import BlockSwitcher from "./BlockSwitcher";
import ActivitySheet from "./ActivitySheet";

export interface FrameSummary {
  id: string;
  name: string;
  focus: string | null;
  exerciseCount: number;
  used: number;
}

interface TrainingViewProps {
  plans: Plan[];
  frames: FrameSummary[];
  completedByDay: Record<string, string>;
}

export default function TrainingView({ plans, frames, completedByDay }: TrainingViewProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const active = useMemo(() => plans.filter((p) => p.status === "active"), [plans]);
  const archived = useMemo(() => plans.filter((p) => p.status !== "active"), [plans]);

  return (
    <div className="pb-4">
      <ScreenHeader title="Training" right={<Stamp>{fmtHeaderDate()}</Stamp>} />

      {active.length === 0 && (
        <div className="px-5">
          <Card className="px-4 py-4">
            <div className="font-data text-[14.5px] font-bold text-ft-white">No active plans</div>
            <p className="mt-1 font-body text-[13px] text-ft-light">Start from a pre-made plan or build your own.</p>
            <Btn small href="/training/plans" className="mt-3">
              + New plan
            </Btn>
          </Card>
        </div>
      )}

      {active.map((plan, i) => (
        <PlanSection key={plan.id} plan={plan} completedByDay={completedByDay} className={i === 0 && active.length > 0 ? "" : "mt-5"} />
      ))}

      <SectionHeader title="Frames" stamp={frames.length ? `${frames.length} saved` : "Saved"} className={active.length ? "mt-5" : "mt-5"} />
      <CardStrip>
        {frames.map((f) => (
          <FrameCard key={f.id} frame={f} />
        ))}
        <AddCard label="Blank workout" href="/log/new-blank" />
      </CardStrip>
      <div className="mt-2 flex justify-end px-5">
        <button type="button" className="t-link" onClick={() => setActivityOpen(true)}>
          Other activity ›
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3 px-5">
        <Btn kind="ghost" small href="/training/plans" className="flex-1">
          + New plan
        </Btn>
        <button
          type="button"
          onClick={() => setShowArchived((v) => !v)}
          disabled={archived.length === 0}
          className="flex-1 text-center font-data text-[11px] uppercase tracking-[0.14em] text-ft-dim disabled:opacity-60"
        >
          {showArchived ? "Hide archived" : `Show archived · ${archived.length}`}
        </button>
      </div>

      {showArchived &&
        archived.map((plan) => (
          <PlanSection key={plan.id} plan={plan} completedByDay={completedByDay} className="mt-5" archived />
        ))}

      <ActivitySheet open={activityOpen} onClose={() => setActivityOpen(false)} />
    </div>
  );
}

function PlanSection({ plan, completedByDay, className = "", archived = false }: { plan: Plan; completedByDay: Record<string, string>; className?: string; archived?: boolean }) {
  const multi = plan.blocks.length > 1;
  const storageKey = `ft-plan-block:${plan.id}`;
  const [blockId, setBlockId] = useState<string | null>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && plan.blocks.some((b) => b.id === saved)) setBlockId(saved);
    } catch {
      /* no storage */
    }
  }, [storageKey, plan.blocks]);
  const block: PlanBlock | null = (blockId && plan.blocks.find((b) => b.id === blockId)) || currentBlock(plan);
  const pick = (id: string) => {
    setBlockId(id);
    try {
      localStorage.setItem(storageKey, id);
    } catch {
      /* no storage */
    }
  };
  const days = block?.days ?? [];
  return (
    <section className={className}>
      <SectionHeader
        title={
          <span className="inline-flex items-center gap-2">
            {plan.name}
            {archived && <StatusStamp status={plan.status} />}
          </span>
        }
        stamp={multi && block ? <BlockSwitcher blocks={plan.blocks} current={block} onPick={pick} /> : plural(days.length, "day")}
        action={{ label: "Edit", href: `/training/${plan.id}` }}
      />
      {days.length === 0 ? (
        <div className="px-5 font-body text-[13px] text-ft-dim">No days yet. Add them in the editor.</div>
      ) : (
        <CardStrip>
          {days.map((day, i) => (
            <TDayCard key={day.id} planId={plan.id} day={day} index={i + 1} completedOn={completedByDay[day.id]} />
          ))}
        </CardStrip>
      )}
    </section>
  );
}
