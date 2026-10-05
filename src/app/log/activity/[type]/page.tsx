"use client";

/**
 * Activity loggers — HIIT / Cardio / Class / Custom. Stopwatch + per-type fields;
 * saving writes an ActivityLog row via POST /api/activity-logs.
 */
import { useEffect, useRef, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Btn, Card, ScreenHeader, Seg, Stepper, StickyBar } from "@/components/kit";
import { useToast } from "@/components/ui/Toast";

export const dynamic = "force-dynamic";

type ActType = "hiit" | "liss" | "class" | "custom";
type Effort = "easy" | "mod" | "hard" | "max";

const CFG: Record<ActType, { label: string; sub: string; dot: string; met: number }> = {
  hiit: { label: "HIIT", sub: "Interval session", dot: "bg-ft-core", met: 9.5 },
  liss: { label: "Cardio", sub: "Steady-state", dot: "bg-ft-push", met: 7.0 },
  class: { label: "Class", sub: "Group session", dot: "bg-ft-pull", met: 6.0 },
  custom: { label: "Custom", sub: "Anything else", dot: "bg-ft-legs", met: 5.0 },
};

const EFFORTS: { value: Effort; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "mod", label: "Moderate" },
  { value: "hard", label: "Hard" },
  { value: "max", label: "Max" },
];

const inputCls = "w-full rounded-ft-sm border border-ft-border bg-ft-surface-raised px-3 py-2.5 font-body text-[14px] text-ft-white outline-none placeholder:text-ft-muted focus:border-ft-accent";

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

  const [sec, setSec] = useState(0);
  const [running, setRunning] = useState(true);
  const startedAt = useRef(Date.now());
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSec((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const [rounds, setRounds] = useState(8);
  const [mode, setMode] = useState<"run" | "bike" | "row" | "walk">("run");
  const [distance, setDistance] = useState(5);
  const [hr, setHr] = useState(138);
  const [name, setName] = useState("");
  const [studio, setStudio] = useState("");
  const [typeIntensity, setTypeIntensity] = useState<Effort>("hard");
  const [effort, setEffort] = useState<Effort>("mod");
  const [notes, setNotes] = useState("");
  const [kcalAuto, setKcalAuto] = useState(true);
  const [kcalManual, setKcalManual] = useState(0);
  const [saving, setSaving] = useState(false);
  const autoKcal = Math.round((cfg.met * 78 * sec) / 3600);
  const kcal = kcalAuto ? autoKcal : kcalManual;

  const save = async () => {
    if (saving) return;
    setSaving(true);
    const fields: Record<string, unknown> = type === "hiit" ? { rounds, intensity: typeIntensity } : type === "liss" ? { mode, distance, hr } : type === "class" ? { name, studio, intensity: typeIntensity } : { name, effort: typeIntensity };
    const sessionName = type === "class" || type === "custom" ? name.trim() || cfg.label : type === "liss" ? `${mode[0].toUpperCase()}${mode.slice(1)} · ${distance.toFixed(1)} km` : cfg.label;
    const intensity = effort === "easy" ? "LIGHT" : effort === "mod" ? "MODERATE" : "HARD";
    const res = await fetch("/api/activity-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: new Date(startedAt.current).toISOString(),
        activityType: type.toUpperCase(),
        subType: sessionName,
        durationMin: Math.max(1, Math.round(sec / 60)),
        intensity,
        distanceKm: type === "liss" ? Number(distance) || null : null,
        avgHeartRate: type === "liss" ? Number(hr) || null : null,
        caloriesBurned: kcal ? Math.round(Number(kcal)) : null,
        studio: type === "class" ? studio || null : null,
        notes: [notes, Object.keys(fields).length ? JSON.stringify(fields) : ""].filter(Boolean).join("\n") || null,
      }),
    });
    if (!res.ok) {
      toast.error(`Couldn't save the ${cfg.label.toLowerCase()} session.`);
      setSaving(false);
      return;
    }
    toast.success(`${cfg.label} saved`);
    router.push("/training");
    router.refresh();
  };

  return (
    <div className="pb-32">
      <ScreenHeader title={cfg.label} back={{ href: "/training", label: "Training", onClick: () => router.back() }} sub={cfg.sub} />
      <div className="flex flex-col gap-3 px-5">
        <Card className="px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="t-eyebrow">Duration</span>
            <span className="inline-flex items-center gap-1.5">
              <span className={["h-[7px] w-[7px] rounded-full", running ? cfg.dot : "bg-ft-dim"].join(" ")} />
              <span className="font-data text-[10px] uppercase tracking-[0.12em] text-ft-dim">{running ? "Running" : "Paused"}</span>
            </span>
          </div>
          <div className="my-2 font-data text-[52px] font-bold leading-none tabular-nums text-ft-white">{fmtClock(sec)}</div>
          <div className="mt-2.5 flex gap-2">
            <Btn kind={running ? "quiet" : "primary"} className="flex-1" onClick={() => setRunning((r) => !r)}>
              {running ? "Pause" : "Resume"}
            </Btn>
            <Btn
              kind="quiet"
              onClick={() => {
                setRunning(false);
                setSec(0);
              }}
            >
              Reset
            </Btn>
          </div>
        </Card>

        <Card band={false} className="px-4 py-1">
          {type === "hiit" && (
            <>
              <Row label="Rounds">
                <Stepper value={rounds} min={1} max={60} onChange={setRounds} />
              </Row>
              <FullRow label="Intensity">
                <Seg options={EFFORTS} value={typeIntensity} onChange={setTypeIntensity} />
              </FullRow>
            </>
          )}
          {type === "liss" && (
            <>
              <FullRow label="Type">
                <Seg
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
                <Stepper value={distance} step={0.1} min={0} max={200} onChange={(v) => setDistance(Math.round(v * 10) / 10)} fmt={(v) => `${v.toFixed(1)} km`} />
              </Row>
              <Row label="Avg heart rate">
                <Stepper value={hr} min={40} max={230} onChange={setHr} fmt={(v) => `${v} bpm`} />
              </Row>
            </>
          )}
          {type === "class" && (
            <>
              <FullRow label="Class">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Vinyasa Flow" className={inputCls} />
              </FullRow>
              <FullRow label="Studio">
                <input value={studio} onChange={(e) => setStudio(e.target.value)} placeholder="Optional" className={inputCls} />
              </FullRow>
              <FullRow label="Intensity">
                <Seg options={EFFORTS.slice(0, 3)} value={typeIntensity} onChange={setTypeIntensity} />
              </FullRow>
            </>
          )}
          {type === "custom" && (
            <>
              <FullRow label="Activity">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rock climbing" className={inputCls} />
              </FullRow>
              <FullRow label="Effort">
                <Seg options={EFFORTS} value={typeIntensity} onChange={setTypeIntensity} />
              </FullRow>
            </>
          )}
        </Card>

        <div>
          <div className="t-eyebrow mb-1.5 flex items-center justify-between">
            <span>Effort</span>
            <span className="normal-case tracking-normal text-ft-dim">How it felt</span>
          </div>
          <Seg options={EFFORTS} value={effort} onChange={setEffort} />
        </div>

        <Card band={false} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="font-data text-[13.5px] font-semibold text-ft-white">Calories</div>
            <div className="mt-0.5 font-body text-[11.5px] text-ft-dim">{kcalAuto ? "Estimated from duration + effort" : "Manual"}</div>
          </div>
          {kcalAuto ? (
            <button
              type="button"
              onClick={() => {
                setKcalManual(autoKcal);
                setKcalAuto(false);
              }}
              className="flex items-baseline gap-1.5"
            >
              <span className="font-data text-[18px] font-bold tabular-nums text-ft-white">{kcal}</span>
              <span className="t-link">Edit</span>
            </button>
          ) : (
            <Stepper value={kcalManual} step={10} min={0} max={5000} onChange={setKcalManual} fmt={(v) => `${v} kcal`} />
          )}
        </Card>

        <div>
          <div className="t-eyebrow mb-1.5">Notes</div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" className={`${inputCls} min-h-16 resize-none leading-snug`} />
        </div>
      </div>

      <StickyBar className="flex gap-2">
        <Btn kind="quiet" onClick={() => router.back()}>
          Discard
        </Btn>
        <Btn fullWidth onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save activity"}
        </Btn>
      </StickyBar>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-ft-border-faint py-3 first:border-t-0">
      <span className="font-data text-[13.5px] font-semibold text-ft-white">{label}</span>
      {children}
    </div>
  );
}

function FullRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-ft-border-faint py-3 first:border-t-0">
      <div className="t-eyebrow mb-1.5">{label}</div>
      {children}
    </div>
  );
}
