"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authCheck } from "@/lib/fetch-helpers";

/**
 * +Log activity-picker bottom sheet. Triggered from the BottomNav
 * center FAB. Replaces the prior /log page-navigation pattern with
 * an in-place sheet per fittrack-v2-spec.md §6.4.
 *
 * Two states:
 *   1. picker — 6 activity-type tiles + 1 library tile
 *   2. form — inline activity-log form for HIIT / LISS / Class /
 *             Custom (carries over the schema and submit logic from
 *             the prior /log page; POSTs to /api/activity-logs)
 *
 * Routing rules:
 *   - Lifting → if active gameplan + today is scheduled, deep-link to
 *     /log/[blockDayId]; otherwise /log/new-blank
 *   - Stretch → /log/stretch-timer
 *   - HIIT / LISS / Class / Custom → switch to inline form
 *   - Single workout from library → /log/library
 */

type ActivityType = "lifting" | "stretch" | "hiit" | "liss" | "class" | "custom" | "library";

const ACTIVITY_TILES: {
  type: ActivityType;
  label: string;
  desc: string;
  color: string;
}[] = [
  { type: "lifting",  label: "Lifting",          desc: "Weight training session",          color: "rgb(var(--ft-push))" },
  { type: "stretch",  label: "Stretch",          desc: "Mobility / recovery routine",      color: "rgb(var(--ft-core))" },
  { type: "hiit",     label: "HIIT",             desc: "High-intensity intervals",         color: "rgb(var(--ft-legs))" },
  { type: "liss",     label: "LISS / Cardio",    desc: "Walk, jog, ride",                  color: "rgb(var(--ft-pull))" },
  { type: "class",    label: "Class",            desc: "Pilates, yoga, Peloton, spin",     color: "rgb(var(--ft-accent))" },
  { type: "custom",   label: "Custom",           desc: "Build your own session",           color: "rgb(var(--ft-dim))" },
];

interface ScheduledDay {
  id: string;
  name: string;
}

export default function LogActivitySheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [scheduled, setScheduled] = useState<ScheduledDay | null>(null);
  const [formType, setFormType] = useState<ActivityType | null>(null);
  const [formData, setFormData] = useState({
    durationMin: "",
    subType: "",
    intensity: "",
    distanceKm: "",
    avgHeartRate: "",
    instructor: "",
    studio: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch scheduled day on open (cheap; one shot per opening)
  useEffect(() => {
    if (!open) return;
    fetch("/api/home")
      .then(authCheck)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { scheduledDay?: { id: string; name: string } } | null) => {
        if (data?.scheduledDay) {
          setScheduled({ id: data.scheduledDay.id, name: data.scheduledDay.name });
        }
      })
      .catch(() => undefined);
  }, [open]);

  // Reset form state when sheet closes
  useEffect(() => {
    if (open) return;
    setFormType(null);
    setSubmitted(false);
    setFormData({
      durationMin: "",
      subType: "",
      intensity: "",
      distanceKm: "",
      avgHeartRate: "",
      instructor: "",
      studio: "",
      notes: "",
    });
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (formType) setFormType(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, formType, onClose]);

  if (!open) return null;

  const handlePick = (t: ActivityType) => {
    switch (t) {
      case "lifting":
        return scheduled
          ? router.push(`/log/${scheduled.id}`)
          : router.push("/log/new-blank");
      case "stretch":
        return router.push("/log/stretch-timer");
      case "library":
        return router.push("/log/library");
      case "hiit":
      case "liss":
      case "class":
      case "custom":
        setFormType(t);
        return;
    }
  };

  const handleSubmit = async () => {
    if (!formType || !formData.durationMin) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/activity-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString(),
          activityType: formType.toUpperCase(),
          subType: formData.subType || undefined,
          durationMin: parseInt(formData.durationMin, 10),
          intensity: formData.intensity || undefined,
          distanceKm: formData.distanceKm ? parseFloat(formData.distanceKm) : undefined,
          avgHeartRate: formData.avgHeartRate ? parseInt(formData.avgHeartRate, 10) : undefined,
          instructor: formData.instructor || undefined,
          studio: formData.studio || undefined,
          notes: formData.notes || undefined,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => onClose()}
        className="fixed inset-0 bg-black/50 z-[80]"
        aria-hidden
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-label="Log an activity"
        className="fixed bottom-0 left-0 right-0 z-[81] bg-ft-surface border-t border-ft-border max-w-2xl mx-auto rounded-t-ft-lg max-h-[85vh] overflow-y-auto"
      >
        {/* grabber */}
        <div className="w-10 h-1 bg-ft-on-bg-ter/40 rounded mx-auto mt-2.5 mb-3" aria-hidden />

        {formType ? (
          <ActivityForm
            type={formType}
            data={formData}
            setData={setFormData}
            submitting={submitting}
            submitted={submitted}
            onBack={() => setFormType(null)}
            onSubmit={handleSubmit}
            onClose={() => onClose()}
          />
        ) : (
          <PickerView
            scheduled={scheduled}
            onPick={handlePick}
            onClose={() => onClose()}
          />
        )}
      </div>
    </>
  );
}

/* ─── Picker view ──────────────────────────────────────────── */

function PickerView({
  scheduled,
  onPick,
  onClose,
}: {
  scheduled: ScheduledDay | null;
  onPick: (t: ActivityType) => void;
  onClose: () => void;
}) {
  return (
    <div className="px-4 pb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="ft-stamp">+ LOG</span>
          <h2 className="font-display text-xl text-ft-on-bg tracking-wide leading-tight mt-1">
            What are you logging?
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-ft-on-bg-sec hover:text-ft-on-bg text-2xl leading-none px-2 py-1"
        >
          ×
        </button>
      </div>

      {/* Scheduled-today banner */}
      {scheduled && (
        <button
          onClick={() => onPick("lifting")}
          className="ft-card w-full text-left bg-ft-accent-faint border border-ft-accent-border p-3 mb-3"
        >
          <div className="font-body text-[10px] uppercase tracking-[0.18em] text-ft-accent">
            TODAY · SCHEDULED
          </div>
          <div className="font-display text-lg text-ft-on-bg leading-tight mt-1">
            {scheduled.name}
          </div>
          <div className="font-body text-xs text-ft-on-bg-sec mt-1">
            Tap to start the scheduled lifting session →
          </div>
        </button>
      )}

      {/* Activity tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        {ACTIVITY_TILES.map((tile) => (
          <button
            key={tile.type}
            onClick={() => onPick(tile.type)}
            className="ft-card text-left bg-ft-surface border border-ft-border p-3 border-l-4 hover:border-ft-accent/60 transition-colors"
            style={{ borderLeftColor: tile.color }}
          >
            <div
              className="font-body text-[9px] uppercase tracking-[0.2em]"
              style={{ color: tile.color }}
            >
              {tile.label}
            </div>
            <div className="font-body text-xs text-ft-on-bg-sec mt-1.5 leading-tight">
              {tile.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Library tile */}
      <button
        onClick={() => onPick("library")}
        className="ft-card w-full text-left bg-ft-surface border border-ft-border p-3 mt-2.5 hover:border-ft-accent/60 transition-colors"
      >
        <div className="font-body text-[9px] uppercase tracking-[0.2em] text-ft-on-bg-sec">
          SINGLE WORKOUT FROM LIBRARY
        </div>
        <div className="font-body text-xs text-ft-on-bg-sec mt-1.5 leading-tight">
          One-off pulled from the library — no Gameplan adherence impact.
        </div>
      </button>
    </div>
  );
}

/* ─── Inline activity-log form (HIIT / LISS / Class / Custom) ─── */

interface FormData {
  durationMin: string;
  subType: string;
  intensity: string;
  distanceKm: string;
  avgHeartRate: string;
  instructor: string;
  studio: string;
  notes: string;
}

function ActivityForm({
  type,
  data,
  setData,
  submitting,
  submitted,
  onBack,
  onSubmit,
  onClose,
}: {
  type: ActivityType;
  data: FormData;
  setData: (d: FormData | ((prev: FormData) => FormData)) => void;
  submitting: boolean;
  submitted: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData((p) => ({ ...p, [key]: value }));

  const showDistance = type === "liss";
  const showInstructorStudio = type === "class";
  const titleLabel = ACTIVITY_TILES.find((t) => t.type === type)?.label ?? "Activity";

  if (submitted) {
    return (
      <div className="px-4 pb-6 text-center">
        <div className="font-display text-2xl text-ft-success leading-tight mt-6 mb-2">
          Logged.
        </div>
        <p className="font-body text-sm text-ft-on-bg-sec">
          {titleLabel} session saved.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-ft-on-bg-sec hover:text-ft-on-bg text-base leading-none"
            aria-label="Back to picker"
          >
            ‹
          </button>
          <div>
            <span className="ft-stamp">+ LOG</span>
            <h2 className="font-display text-xl text-ft-on-bg tracking-wide leading-tight mt-1">
              {titleLabel}
            </h2>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-ft-on-bg-sec hover:text-ft-on-bg text-2xl leading-none px-2 py-1"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <Field label="Duration" required>
          <input
            type="number"
            inputMode="numeric"
            value={data.durationMin}
            onChange={(e) => update("durationMin", e.target.value)}
            placeholder="min"
            className="w-full bg-ft-bg border border-ft-border rounded-ft px-3 py-2 text-base font-data text-ft-on-bg focus:outline-none focus:border-ft-accent"
          />
        </Field>

        {type !== "custom" && (
          <Field label="Sub-type">
            <input
              type="text"
              value={data.subType}
              onChange={(e) => update("subType", e.target.value)}
              placeholder={
                type === "hiit" ? "Tabata / EMOM / 30-30…"
                : type === "liss" ? "Walk / Jog / Bike…"
                : type === "class" ? "Pilates / Yoga / Spin…"
                : ""
              }
              className="w-full bg-ft-bg border border-ft-border rounded-ft px-3 py-2 text-sm font-body text-ft-on-bg focus:outline-none focus:border-ft-accent"
            />
          </Field>
        )}

        <Field label="Intensity">
          <div className="grid grid-cols-3 gap-1.5">
            {(["LIGHT", "MODERATE", "HARD"] as const).map((lvl) => {
              const isOn = data.intensity === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => update("intensity", isOn ? "" : lvl)}
                  className={[
                    "py-2 font-body text-[11px] uppercase tracking-[0.1em] rounded-ft border transition-colors",
                    isOn
                      ? "bg-ft-accent text-ft-on-accent border-ft-accent"
                      : "bg-transparent text-ft-on-bg-sec border-ft-border hover:border-ft-on-bg-sec",
                  ].join(" ")}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </Field>

        {showDistance && (
          <Field label="Distance">
            <input
              type="number"
              inputMode="decimal"
              value={data.distanceKm}
              onChange={(e) => update("distanceKm", e.target.value)}
              placeholder="km"
              className="w-full bg-ft-bg border border-ft-border rounded-ft px-3 py-2 text-base font-data text-ft-on-bg focus:outline-none focus:border-ft-accent"
            />
          </Field>
        )}

        <Field label="Avg heart rate">
          <input
            type="number"
            inputMode="numeric"
            value={data.avgHeartRate}
            onChange={(e) => update("avgHeartRate", e.target.value)}
            placeholder="bpm"
            className="w-full bg-ft-bg border border-ft-border rounded-ft px-3 py-2 text-base font-data text-ft-on-bg focus:outline-none focus:border-ft-accent"
          />
        </Field>

        {showInstructorStudio && (
          <>
            <Field label="Instructor">
              <input
                type="text"
                value={data.instructor}
                onChange={(e) => update("instructor", e.target.value)}
                className="w-full bg-ft-bg border border-ft-border rounded-ft px-3 py-2 text-sm font-body text-ft-on-bg focus:outline-none focus:border-ft-accent"
              />
            </Field>
            <Field label="Studio">
              <input
                type="text"
                value={data.studio}
                onChange={(e) => update("studio", e.target.value)}
                className="w-full bg-ft-bg border border-ft-border rounded-ft px-3 py-2 text-sm font-body text-ft-on-bg focus:outline-none focus:border-ft-accent"
              />
            </Field>
          </>
        )}

        <Field label="Notes">
          <textarea
            rows={2}
            value={data.notes}
            onChange={(e) => update("notes", e.target.value)}
            className="w-full bg-ft-bg border border-ft-border rounded-ft px-3 py-2 text-sm font-body text-ft-on-bg focus:outline-none focus:border-ft-accent resize-none"
          />
        </Field>
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting || !data.durationMin}
        className="cta-underline mt-4 w-full text-center font-display text-base text-ft-accent py-2 disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Log session"}
      </button>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-body text-[10px] uppercase tracking-[0.18em] text-ft-on-bg-sec block mb-1">
        {label}
        {required && <span className="text-ft-danger ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
