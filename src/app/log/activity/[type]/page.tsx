"use client";

/**
 * 2.13 Activity loggers — HIIT / Cardio / Class / Custom (Cluster 2, Logger tier).
 *
 * One dynamic full-screen logger driven by [type]. Working stopwatch hero +
 * type-specific fields + universal effort + auto/manual calories + notes.
 * Saves a LocalSession (kind:"activity") to the local logger-store — never the
 * DB. Replaces the Ways-to-log placeholders that routed to the blank logger.
 */
import { useEffect, useRef, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import {
  Header,
  Card,
  Button,
  Stamp,
  Stepper,
  Segmented,
  TextField,
  FieldLabel,
} from "@/components/v2";
import { useToast } from "@/components/ui/Toast";
import { saveSession } from "@/lib/logger-store";

export const dynamic = "force-dynamic";

type ActType = "hiit" | "liss" | "class" | "custom";
type Effort = "easy" | "mod" | "hard" | "max";

const CFG: Record<ActType, { label: string; sub: string; tone: string; met: number }> = {
  hiit: { label: "HIIT", sub: "Interval session", tone: "core", met: 9.5 },
  liss: { label: "Cardio", sub: "Steady-state", tone: "push", met: 7.0 },
  class: { label: "Class", sub: "Group session", tone: "pull", met: 6.0 },
  custom: { label: "Custom", sub: "Anything else", tone: "legs", met: 5.0 },
};

const EFFORTS: { value: Effort; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "mod", label: "Moderate" },
  { value: "hard", label: "Hard" },
  { value: "max", label: "Max" },
];

function fmtClock(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function ActivityLoggerPage({ params }: { params: { type: string } }) {
  const router = useRouter();
  const toast = useToast();
  const type = params.type as ActType;
  if (!CFG[type]) notFound();
  const cfg = CFG[type];

  // stopwatch
  const [sec, setSec] = useState(0);
  const [running, setRunning] = useState(true);
  const startedAt = useRef(Date.now());
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSec((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // type-specific fields
  const [rounds, setRounds] = useState(8);
  const [mode, setMode] = useState<"run" | "bike" | "row" | "walk">("run");
  const [distance, setDistance] = useState(5);
  const [hr, setHr] = useState(138);
  const [name, setName] = useState("");
  const [studio, setStudio] = useState("");
  const [typeIntensity, setTypeIntensity] = useState<Effort>("hard");

  // universal
  const [effort, setEffort] = useState<Effort>("mod");
  const [notes, setNotes] = useState("");
  const [kcalAuto, setKcalAuto] = useState(true);
  const [kcalManual, setKcalManual] = useState(0);
  const autoKcal = Math.round((cfg.met * 78 * sec) / 3600);
  const kcal = kcalAuto ? autoKcal : kcalManual;

  const save = async () => {
    const fields: Record<string, unknown> =
      type === "hiit"
        ? { rounds, intensity: typeIntensity }
        : type === "liss"
          ? { mode, distance, hr }
          : type === "class"
            ? { name, studio, intensity: typeIntensity }
            : { name, effort: typeIntensity };
    const sessionName =
      type === "class" || type === "custom"
        ? name.trim() || cfg.label
        : type === "liss"
          ? `${mode[0].toUpperCase()}${mode.slice(1)} · ${distance.toFixed(1)} km`
          : cfg.label;

    await saveSession({
      kind: "activity",
      startedAt: startedAt.current,
      finishedAt: Date.now(),
      data: { name: sessionName, activityType: type, fields, effort, kcal, durationSec: sec, notes: notes || undefined },
    });
    toast.success(`${cfg.label} saved on this device`);
    router.push("/training");
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ft-bg">
      <Header kind="sub" title={cfg.label} subtitle={cfg.sub} right={null} onBack={() => router.back()} />

      <div className="min-w-0 flex-1 overflow-y-auto px-4 pb-[92px] pt-1">
        {/* duration hero */}
        <Card raised className="px-4 pb-4 pt-4">
          <div className="flex items-center justify-between">
            <Stamp>Duration</Stamp>
            <span className="inline-flex items-center gap-1.5">
              <span className={["h-[7px] w-[7px] rounded-full", running ? `bg-ft-${cfg.tone}` : "bg-ft-dim"].join(" ")} />
              <span className="font-data text-[10.5px] uppercase tracking-[0.08em] text-ft-dim">
                {running ? "Running" : "Paused"}
              </span>
            </span>
          </div>
          <div className="my-2 font-number text-[52px] font-bold leading-none tracking-[0.01em] text-ft-white [font-variant-numeric:tabular-nums]">
            {fmtClock(sec)}
          </div>
          <div className="mt-2.5 flex gap-2">
            <Button kind={running ? "secondary" : "primary"} size="lg" fullWidth onClick={() => setRunning((r) => !r)}>
              {running ? "Pause" : "Resume"}
            </Button>
            <Button kind="secondary" size="lg" onClick={() => { setRunning(false); setSec(0); }}>
              Reset
            </Button>
          </div>
        </Card>

        {/* type-specific fields */}
        <Card className="mt-3 px-3.5 py-1">
          {type === "hiit" && (
            <>
              <Row label="Rounds">
                <Stepper value={rounds} step={1} min={1} onChange={setRounds} />
              </Row>
              <FullRow label="Intensity">
                <Segmented options={EFFORTS} value={typeIntensity} onChange={setTypeIntensity} />
              </FullRow>
            </>
          )}
          {type === "liss" && (
            <>
              <FullRow label="Type">
                <Segmented
                  options={[
                    { value: "run", label: "Run" },
                    { value: "bike", label: "Bike" },
                    { value: "row", label: "Row" },
                    { value: "walk", label: "Walk" },
                  ]}
                  value={mode}
                  onChange={setMode}
                />
              </FullRow>
              <Row label="Distance">
                <Stepper value={distance} step={0.1} min={0} onChange={(v) => setDistance(Math.round(v * 10) / 10)} fmt={(v) => `${v.toFixed(1)} km`} />
              </Row>
              <Row label="Avg heart rate">
                <Stepper value={hr} step={1} min={40} onChange={setHr} fmt={(v) => `${v} bpm`} />
              </Row>
            </>
          )}
          {type === "class" && (
            <>
              <FullRow label="Class">
                <TextField value={name} onChange={setName} placeholder="e.g. Vinyasa Flow" />
              </FullRow>
              <FullRow label="Studio">
                <TextField value={studio} onChange={setStudio} placeholder="Optional" />
              </FullRow>
              <FullRow label="Intensity">
                <Segmented options={EFFORTS.slice(0, 3)} value={typeIntensity} onChange={setTypeIntensity} />
              </FullRow>
            </>
          )}
          {type === "custom" && (
            <>
              <FullRow label="Activity">
                <TextField value={name} onChange={setName} placeholder="e.g. Rock climbing" />
              </FullRow>
              <FullRow label="Effort">
                <Segmented options={EFFORTS} value={typeIntensity} onChange={setTypeIntensity} />
              </FullRow>
            </>
          )}
        </Card>

        {/* universal effort */}
        <div className="mt-3.5">
          <FieldLabel onBg right="How it felt">Effort</FieldLabel>
          <Segmented options={EFFORTS} value={effort} onChange={setEffort} />
        </div>

        {/* calories */}
        <Card className="mt-3.5 flex items-center justify-between gap-3 px-3.5 py-3">
          <div className="min-w-0">
            <div className="font-body text-sm font-semibold text-ft-white">Calories</div>
            <div className="mt-0.5 font-body text-[11.5px] text-ft-dim">
              {kcalAuto ? "Estimated from duration + effort" : "Manual"}
            </div>
          </div>
          {kcalAuto ? (
            <button type="button" onClick={() => { setKcalManual(autoKcal); setKcalAuto(false); }} className="flex items-baseline gap-1.5">
              <span className="font-number text-lg font-bold text-ft-white">{kcal}</span>
              <span className="font-body text-[11px] font-bold text-ft-accent underline">Edit</span>
            </button>
          ) : (
            <Stepper value={kcalManual} step={10} min={0} onChange={setKcalManual} fmt={(v) => `${v} kcal`} />
          )}
        </Card>

        {/* notes */}
        <div className="mt-3.5">
          <FieldLabel onBg>Notes</FieldLabel>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
            className="min-h-16 w-full resize-none rounded-ft-md border border-ft-border bg-ft-surface-alt px-3.5 py-2.5 font-body text-[13.5px] leading-snug text-ft-white outline-none placeholder:text-ft-dim"
          />
        </div>
      </div>

      {/* footer */}
      <div className="absolute inset-x-0 bottom-0 flex gap-2 border-t border-ft-border-faint bg-ft-surface px-4 pb-4 pt-3">
        <Button kind="ghost" size="lg" onClick={() => router.back()}>
          Discard
        </Button>
        <Button kind="primary" size="lg" fullWidth onClick={save}>
          Save activity →
        </Button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-ft-border-faint py-3 first:border-t-0">
      <span className="font-body text-sm font-semibold text-ft-white">{label}</span>
      {children}
    </div>
  );
}

function FullRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-ft-border-faint py-3 first:border-t-0">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}
