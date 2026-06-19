"use client";

/**
 * 3.2 Training — Program tier. Rail-driven layers (Today / Block / Program /
 * Gameplan-locked) through the shared PillarShell. On the program tier the
 * rail unlocks Block + Program; Gameplan stays locked (tappable → upsell
 * preview, never a gate). Data from /api/home + /api/programs/[id].
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { PillarShell, Header, Card, Button, Chip, Stamp, SectionLabel } from "@/components/v2";
import type { RailKey } from "@/components/v2";
import { WeekStrip, setLine, weekOf, type HomeData, type HomeExercise } from "../my-program/_components";

interface ProgramBlock {
  id: string;
  name: string;
  blockNumber: number;
  durationWeeks: number | null;
  phase: string | null;
  status: string;
}

export default function ProgramTrainingTab() {
  const [home, setHome] = useState<HomeData | null>(null);
  const [blocks, setBlocks] = useState<ProgramBlock[]>([]);
  const [activeKey, setActiveKey] = useState<RailKey>("today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    fetch("/api/home")
      .then((r) => (r.ok ? r.json() : null))
      .then(async (h: HomeData | null) => {
        if (!live) return;
        setHome(h);
        if (h?.activeProgram?.id) {
          const p = await fetch(`/api/programs/${h.activeProgram.id}`).then((r) => (r.ok ? r.json() : null));
          if (live && p?.blocks) setBlocks(p.blocks);
        }
        setLoading(false);
      })
      .catch(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  const program = home?.activeProgram ?? null;
  const block = home?.activeBlock ?? null;
  const today = home?.scheduledDay ?? null;

  const layer = loading ? (
    <div className="px-4 pt-6 font-body text-sm text-ft-dim">Loading…</div>
  ) : activeKey === "block" ? (
    <BlockLayer block={block} today={today} />
  ) : activeKey === "model" ? (
    <ProgramLayer program={program} blocks={blocks} block={block} />
  ) : activeKey === "gameplan" ? (
    <GameplanLocked />
  ) : (
    <TodayLayer today={today} program={program} block={block} completed={!!home?.todayCompleted} />
  );

  return (
    <PillarShell
      pillar="training"
      activeKey={activeKey}
      onSelectRail={setActiveKey}
      header={<Header kind="home" title="Training" subtitle="Program" right="gear" />}
    >
      {layer}
    </PillarShell>
  );
}

// ── Today layer ──
function TodayLayer({
  today,
  program,
  block,
  completed,
}: {
  today: HomeData["scheduledDay"];
  program: HomeData["activeProgram"];
  block: HomeData["activeBlock"];
  completed: boolean;
}) {
  if (!today) {
    return (
      <div className="px-4 pt-2">
        <p className="rounded-ft-lg border border-dashed border-ft-border px-4 py-6 text-center font-body text-xs text-ft-dim">
          No session scheduled today.
        </p>
      </div>
    );
  }
  return (
    <div className="px-4 pt-2">
      <Card raised className="px-4 pb-4 pt-4">
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0">
            <Stamp>{completed ? "Today · done" : "Today"}</Stamp>
            <div className="mt-1 font-display text-xl font-bold leading-tight tracking-[-0.01em] text-ft-white">{today.name}</div>
            <div className="mt-1 font-body text-xs text-ft-dim">{today.exercises.length} exercises</div>
          </div>
          {block && (
            <Chip tone="accent" size="sm">
              Block {block.blockNumber}
            </Chip>
          )}
        </div>
        <Link href={`/log/${today.id}`} className="mt-3.5 block">
          <Button kind="primary" size="lg" fullWidth>
            {completed ? "Log again →" : "Start workout →"}
          </Button>
        </Link>
      </Card>

      <SectionLabel right={`${today.exercises.length} lifts`}>Plan</SectionLabel>
      <LiftList exercises={today.exercises} />

      {program && (
        <p className="ft-on-bg px-1 pb-4 pt-3 font-body text-[11px] text-ft-on-bg-ter">
          {program.name} · week {weekOf(program.startDate, program.durationWeeks)}
          {program.durationWeeks ? ` of ${program.durationWeeks}` : ""}
        </p>
      )}
    </div>
  );
}

// ── Block layer ──
function BlockLayer({ block, today }: { block: HomeData["activeBlock"]; today: HomeData["scheduledDay"] }) {
  if (!block) {
    return <div className="px-4 pt-6 font-body text-sm text-ft-dim">No active block.</div>;
  }
  const wk = block.durationWeeks ?? 0;
  return (
    <div className="px-4 pt-2">
      <Card className="flex items-center justify-between gap-2.5 px-3.5 py-3">
        <div>
          <Stamp>
            Block {block.blockNumber}
            {block.name ? ` · ${block.name}` : ""}
          </Stamp>
          <div className="mt-1 font-display text-base font-bold tracking-[-0.01em] text-ft-white">
            {wk ? `${wk} week block` : "Active block"}
          </div>
        </div>
        {wk > 0 && (
          <div className="flex gap-1">
            {Array.from({ length: Math.min(wk, 6) }).map((_, i) => (
              <span key={i} className={["h-1.5 w-5 rounded-full", i === 0 ? "bg-ft-accent" : "bg-ft-surface-alt"].join(" ")} />
            ))}
          </div>
        )}
      </Card>

      <SectionLabel right="Tap a day">Days</SectionLabel>
      <WeekStrip days={block.days} todayId={today?.id ?? null} />

      {today && (
        <>
          <SectionLabel right={`${today.exercises.length} lifts`}>{today.name}</SectionLabel>
          <LiftList exercises={today.exercises} />
        </>
      )}
    </div>
  );
}

// ── Program (model) layer ──
function ProgramLayer({
  program,
  blocks,
  block,
}: {
  program: HomeData["activeProgram"];
  blocks: ProgramBlock[];
  block: HomeData["activeBlock"];
}) {
  if (!program) return <div className="px-4 pt-6 font-body text-sm text-ft-dim">No active program.</div>;
  return (
    <div className="px-4 pt-2">
      <Card raised className="relative overflow-hidden px-4 py-3.5">
        <span className="absolute inset-y-0 left-0 w-[3px] bg-ft-accent" />
        <div className="flex items-start justify-between gap-2.5 pl-1.5">
          <div className="min-w-0">
            <Stamp>Active template</Stamp>
            <div className="mt-1 font-display text-lg font-bold leading-tight tracking-[-0.01em] text-ft-white">{program.name}</div>
            <div className="mt-1 font-body text-xs text-ft-dim">
              {blocks.length} block{blocks.length === 1 ? "" : "s"}
              {program.durationWeeks ? ` · ${program.durationWeeks} wk` : ""}
            </div>
          </div>
          <Chip tone="neutral" size="sm">
            Wk {weekOf(program.startDate, program.durationWeeks)}/{program.durationWeeks ?? "—"}
          </Chip>
        </div>
      </Card>

      {blocks.length > 0 && (
        <>
          <SectionLabel right={`${blocks.length} blocks`}>Block progression</SectionLabel>
          <Card className="overflow-hidden p-0">
            {blocks.map((b, i) => {
              const current = b.id === block?.id;
              const done = b.status === "completed";
              return (
                <div
                  key={b.id}
                  className={[
                    "flex items-center gap-3 px-3.5 py-3",
                    i === 0 ? "" : "border-t border-ft-border-faint",
                    current ? "bg-ft-accent-faint" : "",
                    done ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-number text-[11px] font-bold",
                      current ? "bg-ft-accent text-ft-on-accent" : "bg-ft-surface-alt text-ft-dim",
                    ].join(" ")}
                  >
                    {done ? "✓" : b.blockNumber}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={["font-body text-[13px] text-ft-white", current ? "font-bold" : "font-semibold"].join(" ")}>
                      {b.name}
                    </div>
                    <div className="mt-px font-data text-[11px] tracking-[0.03em] text-ft-dim">
                      {b.durationWeeks ? `${b.durationWeeks} wk` : ""}
                      {b.phase ? ` · ${b.phase}` : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        </>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <Link href={`/programs/${program.id}/planning`} className="block">
          <div className="flex items-center gap-3 rounded-ft-lg border border-dashed border-ft-border-strong bg-ft-surface px-3.5 py-3">
            <span className="inline-flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-ft-md bg-ft-accent-faint font-display text-[17px] font-bold text-ft-accent">
              ◇
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-body text-[13px] font-semibold text-ft-white">Edit program · Planning Mode</div>
              <div className="mt-px font-body text-[11.5px] text-ft-dim">Sandbox · diff · confirm · undo</div>
            </div>
            <span className="font-body text-base text-ft-dim">›</span>
          </div>
        </Link>
        <Link href="/shelf" className="block">
          <Card className="flex items-center justify-between px-3.5 py-3">
            <span className="font-body text-[13px] font-semibold text-ft-light">Browse program templates</span>
            <span className="font-body text-base text-ft-dim">›</span>
          </Card>
        </Link>
      </div>
    </div>
  );
}

// ── Gameplan locked layer ──
function GameplanLocked() {
  const features = [
    "Weekly check-in tunes your volume + loads",
    "Goal-pulse trajectory vs target",
    "Recommendation feed, accept or dismiss",
  ];
  return (
    <div>
      <div className="pointer-events-none px-4 pt-2 opacity-45">
        <Card className="px-4 py-3.5">
          <Stamp>Goal pulse · projected</Stamp>
          <svg viewBox="0 0 280 84" className="mt-2 block h-[84px] w-full">
            <path d="M6 70 Q90 30 150 40 T274 16" stroke="rgb(var(--ft-accent))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M6 70 Q90 30 150 40 T274 16 L274 84 L6 84 Z" fill="rgb(var(--ft-accent-faint))" />
          </svg>
        </Card>
      </div>
      <div className="px-4 pt-4">
        <Card raised className="px-4 py-4" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
          <div className="flex items-center justify-between">
            <Stamp>Gameplan tier</Stamp>
            <Chip tone="neutral" size="sm">
              Locked
            </Chip>
          </div>
          <div className="mt-1.5 font-display text-lg font-bold tracking-[-0.01em] text-ft-white">Adaptive training</div>
          <div className="mt-3 flex flex-col gap-1.5">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2 font-body text-[12.5px] text-ft-light">
                <span className="mt-px text-ft-accent">·</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-3.5 flex gap-2">
            <Link href="/shelf" className="flex-1">
              <Button kind="primary" size="md" fullWidth>
                See Gameplan →
              </Button>
            </Link>
            <Link href="/shelf/compare">
              <Button kind="secondary" size="md">
                Compare
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function LiftList({ exercises }: { exercises: HomeExercise[] }) {
  if (exercises.length === 0) {
    return <p className="px-1 font-body text-xs text-ft-dim">No exercises in this session.</p>;
  }
  return (
    <Card className="overflow-hidden p-0">
      {exercises.map((e, i) => (
        <div key={i} className={["flex items-center gap-3 px-3.5 py-2.5", i === 0 ? "" : "border-t border-ft-border-faint"].join(" ")}>
          <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-ft-sm bg-ft-surface-alt font-number text-[11px] font-bold text-ft-dim">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-body text-[13px] font-semibold text-ft-white">{e.name}</div>
            <div className="mt-px font-data text-[11px] tracking-[0.03em] text-ft-dim">{setLine(e)}</div>
          </div>
          {e.movementPattern && <span className="font-data text-[10px] uppercase tracking-[0.05em] text-ft-dim">{e.movementPattern}</span>}
        </div>
      ))}
    </Card>
  );
}
