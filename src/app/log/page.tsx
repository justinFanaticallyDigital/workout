"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authCheck } from "@/lib/fetch-helpers";

const ACTIVITY_TYPES = [
  {
    type: "lifting",
    label: "Lifting",
    icon: "🏋️",
    color: "rgb(var(--ft-push))",
    desc: "Weight training session",
  },
  {
    type: "stretch",
    label: "Stretch / Mobility",
    icon: "🧘",
    color: "rgb(var(--ft-core))",
    desc: "Morning routine or recovery",
  },
  {
    type: "hiit",
    label: "HIIT",
    icon: "⚡",
    color: "rgb(var(--ft-legs))",
    desc: "High intensity intervals",
  },
  {
    type: "liss",
    label: "LISS / Cardio",
    icon: "🏃",
    color: "rgb(var(--ft-pull))",
    desc: "Walking, jogging, cycling",
  },
  {
    type: "class",
    label: "Class",
    icon: "🎯",
    color: "rgb(167 139 250)",
    desc: "Spin, Pilates, yoga, Peloton",
  },
  {
    type: "custom",
    label: "Custom",
    icon: "✏️",
    color: "rgb(var(--ft-muted))",
    desc: "Build your own session",
  },
];

const MOVEMENT_COLORS: Record<string, string> = {
  push: "rgb(var(--ft-push))",
  pull: "rgb(var(--ft-pull))",
  legs: "rgb(var(--ft-legs))",
  core: "rgb(var(--ft-core))",
};

interface ScheduledDay {
  id: string;
  name: string;
  exerciseCount: number;
  movementPattern: string | null;
}

interface AvailableDay {
  id: string;
  name: string;
  dayType: string;
  exerciseCount: number;
  movementPattern: string | null;
}

export default function LogPage() {
  const router = useRouter();
  const [scheduled, setScheduled] = useState<ScheduledDay | null>(null);
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);
  const [activeBlockName, setActiveBlockName] = useState<string | null>(null);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showForm, setShowForm] = useState<string | null>(null);
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

  useEffect(() => {
    fetch("/api/home")
      .then(authCheck)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.scheduledDay) {
          setScheduled({
            id: data.scheduledDay.id,
            name: data.scheduledDay.name,
            exerciseCount: data.scheduledDay.exercises?.length || 0,
            movementPattern:
              data.scheduledDay.exercises?.[0]?.movementPattern || null,
          });
        }
        if (data?.activeBlock) {
          setActiveBlockName(data.activeBlock.name || null);
          const days: AvailableDay[] = (data.activeBlock.days || []).map(
            (d: {
              id: string;
              name: string;
              dayType: string;
              exercises: { movementPattern: string | null }[];
            }) => ({
              id: d.id,
              name: d.name,
              dayType: d.dayType,
              exerciseCount: d.exercises?.length || 0,
              movementPattern: d.exercises?.[0]?.movementPattern || null,
            })
          );
          setAvailableDays(days);
        }
      })
      .catch(() => {});
  }, []);

  const resetForm = () => {
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
  };

  const handleSubmitActivity = async (activityType: string) => {
    if (!formData.durationMin) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/activity-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString(),
          activityType: activityType.toUpperCase(),
          subType: formData.subType || undefined,
          durationMin: parseInt(formData.durationMin, 10),
          intensity: formData.intensity || undefined,
          distanceKm: formData.distanceKm
            ? parseFloat(formData.distanceKm)
            : undefined,
          avgHeartRate: formData.avgHeartRate
            ? parseInt(formData.avgHeartRate, 10)
            : undefined,
          instructor: formData.instructor || undefined,
          studio: formData.studio || undefined,
          notes: formData.notes || undefined,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setShowForm(null);
          resetForm();
          setSubmitted(false);
        }, 1500);
      }
    } catch {
      // Silently handle
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 tab-enter">
      <h1 className="font-display text-2xl text-ft-white tracking-wide">Log</h1>

      {/* Scheduled Workout Banner */}
      {scheduled && !showForm && (
        <div
          className="bg-ft-surface rounded-lg p-4 border border-ft-border"
          style={{
            borderLeftWidth: 4,
            borderLeftColor:
              MOVEMENT_COLORS[
                scheduled.movementPattern?.toLowerCase() || "push"
              ] || MOVEMENT_COLORS.push,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-tertiary font-body text-[10px] uppercase tracking-wider">
                Today&rsquo;s Workout
              </p>
              <p className="font-display text-base text-ft-white mt-0.5 truncate">
                {scheduled.name}
              </p>
              <p className="text-secondary font-body text-sm mt-0.5">
                {scheduled.exerciseCount} exercises
              </p>
            </div>
            <Link
              href={`/log/${scheduled.id}`}
              className="font-display text-lg px-4 py-2 rounded-lg text-white shrink-0"
              style={{ backgroundColor: "rgb(var(--ft-accent))" }}
            >
              GO
            </Link>
          </div>
          {availableDays.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDayPicker(true)}
              className="mt-3 text-tertiary font-body text-xs hover:text-ft-light transition-colors"
            >
              Change workout &rarr;
            </button>
          )}
        </div>
      )}

      {/* Workout Picker Modal — choose a different day from the active block */}
      {showDayPicker && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ft-bg/60"
            onClick={() => setShowDayPicker(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Choose workout"
            className="fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:top-[10%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg bg-ft-surface border-t sm:border border-ft-border sm:rounded-lg flex flex-col max-h-[85vh] sm:max-h-[70vh]"
          >
            <div className="flex justify-center pt-2 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-ft-border" />
            </div>
            <div className="px-4 pt-2 sm:pt-4 pb-3 flex items-center justify-between border-b border-ft-border">
              <div className="min-w-0">
                <h2 className="font-body text-base font-bold text-ft-white">
                  Choose Workout
                </h2>
                {activeBlockName && (
                  <p className="text-tertiary font-body text-xs mt-0.5 truncate">
                    {activeBlockName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowDayPicker(false)}
                className="text-ft-dim hover:text-ft-light text-lg font-body transition-colors px-1"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 pb-safe">
              {availableDays.map((day) => {
                const isScheduled = scheduled?.id === day.id;
                return (
                  <Link
                    key={day.id}
                    href={`/log/${day.id}`}
                    onClick={() => setShowDayPicker(false)}
                    className="w-full flex items-center justify-between px-3 py-3 border-b border-ft-card hover:bg-ft-card/50 transition-colors touch-target rounded"
                    style={{
                      borderLeftWidth: 3,
                      borderLeftColor:
                        MOVEMENT_COLORS[
                          day.movementPattern?.toLowerCase() || "push"
                        ] || "rgb(var(--ft-border))",
                    }}
                  >
                    <div className="min-w-0">
                      <p className="text-ft-white text-sm font-body truncate">
                        {day.name}
                      </p>
                      <p className="text-tertiary text-xs font-body mt-0.5 capitalize">
                        {day.dayType} &middot; {day.exerciseCount} exercises
                      </p>
                    </div>
                    {isScheduled && (
                      <span className="text-[10px] font-body uppercase tracking-wider text-ft-accent shrink-0 ml-2">
                        Today
                      </span>
                    )}
                  </Link>
                );
              })}
              <Link
                href="/log/new-blank"
                onClick={() => setShowDayPicker(false)}
                className="w-full flex items-center justify-between px-3 py-3 border border-dashed border-ft-card hover:border-ft-dim transition-colors touch-target rounded mt-3"
              >
                <div>
                  <p className="text-ft-white text-sm font-body">
                    Start Blank / Improv
                  </p>
                  <p className="text-tertiary text-xs font-body mt-0.5">
                    Build the session as you go
                  </p>
                </div>
                <span className="text-ft-dim text-lg font-body">+</span>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Activity logging form */}
      {showForm && (
        <div className="bg-ft-surface rounded-lg p-4 border border-ft-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base text-ft-white capitalize">
              {showForm.replace("_", " ")}
            </h2>
            <button
              onClick={() => {
                setShowForm(null);
                resetForm();
              }}
              className="text-tertiary font-body text-sm hover:text-ft-light"
            >
              Cancel
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-4">
              <p className="text-ft-success font-display text-lg">Logged!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-tertiary font-body text-[10px] uppercase tracking-wider">
                    Duration (min)*
                  </label>
                  <input
                    type="number"
                    value={formData.durationMin}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, durationMin: e.target.value }))
                    }
                    className="w-full bg-ft-card border border-ft-border rounded px-3 py-2 text-ft-white font-body text-sm mt-1"
                    placeholder="30"
                  />
                </div>

                {(showForm === "liss" || showForm === "class") && (
                  <div>
                    <label className="text-tertiary font-body text-[10px] uppercase tracking-wider">
                      {showForm === "liss" ? "Type" : "Class Type"}
                    </label>
                    <input
                      type="text"
                      value={formData.subType}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, subType: e.target.value }))
                      }
                      className="w-full bg-ft-card border border-ft-border rounded px-3 py-2 text-ft-white font-body text-sm mt-1"
                      placeholder={
                        showForm === "liss" ? "walking, running..." : "spin, yoga..."
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="text-tertiary font-body text-[10px] uppercase tracking-wider">
                    Intensity
                  </label>
                  <select
                    value={formData.intensity}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, intensity: e.target.value }))
                    }
                    className="w-full bg-ft-card border border-ft-border rounded px-3 py-2 text-ft-white font-body text-sm mt-1"
                  >
                    <option value="">—</option>
                    <option value="LIGHT">Light</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                {showForm === "liss" && (
                  <div>
                    <label className="text-tertiary font-body text-[10px] uppercase tracking-wider">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.distanceKm}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, distanceKm: e.target.value }))
                      }
                      className="w-full bg-ft-card border border-ft-border rounded px-3 py-2 text-ft-white font-body text-sm mt-1"
                    />
                  </div>
                )}

                {showForm === "class" && (
                  <>
                    <div>
                      <label className="text-tertiary font-body text-[10px] uppercase tracking-wider">
                        Instructor
                      </label>
                      <input
                        type="text"
                        value={formData.instructor}
                        onChange={(e) =>
                          setFormData((f) => ({
                            ...f,
                            instructor: e.target.value,
                          }))
                        }
                        className="w-full bg-ft-card border border-ft-border rounded px-3 py-2 text-ft-white font-body text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-tertiary font-body text-[10px] uppercase tracking-wider">
                        Studio
                      </label>
                      <input
                        type="text"
                        value={formData.studio}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, studio: e.target.value }))
                        }
                        className="w-full bg-ft-card border border-ft-border rounded px-3 py-2 text-ft-white font-body text-sm mt-1"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="text-tertiary font-body text-[10px] uppercase tracking-wider">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, notes: e.target.value }))
                  }
                  className="w-full bg-ft-card border border-ft-border rounded px-3 py-2 text-ft-white font-body text-sm mt-1 h-16 resize-none"
                />
              </div>

              <button
                onClick={() =>
                  handleSubmitActivity(
                    showForm === "liss"
                      ? "LISS"
                      : showForm === "class"
                        ? "CLASS"
                        : showForm === "hiit"
                          ? "HIIT"
                          : "CUSTOM"
                  )
                }
                disabled={submitting || !formData.durationMin}
                className="cta-underline text-ft-white font-display text-sm disabled:opacity-50"
              >
                {submitting ? "Logging..." : "Log Activity"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Activity Type Grid */}
      {!showForm && (
        <div className="grid grid-cols-2 gap-3">
          {ACTIVITY_TYPES.map((activity) => {
            const handleClick = () => {
              if (activity.type === "lifting") {
                if (availableDays.length > 0) {
                  setShowDayPicker(true);
                } else {
                  router.push("/log/new-blank");
                }
                return;
              }
              if (activity.type === "stretch") {
                router.push("/stretch-timer");
                return;
              }
              setShowForm(activity.type);
            };

            return (
              <button
                key={activity.type}
                onClick={handleClick}
                className="bg-ft-surface rounded-lg p-4 border border-ft-border text-left hover:border-ft-dim transition-colors"
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: activity.color,
                }}
              >
                <span className="text-2xl">{activity.icon}</span>
                <p className="font-display text-sm text-ft-white mt-2">
                  {activity.label}
                </p>
                <p className="text-tertiary font-body text-xs mt-0.5">
                  {activity.desc}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Quick Log */}
      {!showForm && (
        <div className="section-divider pt-4">
          <button
            onClick={() => setShowForm("custom")}
            className="w-full text-center py-3"
          >
            <span className="text-tertiary font-body text-sm">
              Did something not listed?{" "}
              <span className="cta-underline text-ft-white font-display text-sm">
                Quick log
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
