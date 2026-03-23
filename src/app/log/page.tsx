"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  name: string;
  exerciseCount: number;
  movementPattern: string | null;
}

export default function LogPage() {
  const [scheduled, setScheduled] = useState<ScheduledDay | null>(null);
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
            name: data.scheduledDay.name,
            exerciseCount: data.scheduledDay.exercises?.length || 0,
            movementPattern:
              data.scheduledDay.exercises?.[0]?.movementPattern || null,
          });
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
        <Link href="/log/new-blank">
          <div
            className="bg-ft-surface rounded-lg p-4 border border-ft-border flex items-center justify-between"
            style={{
              borderLeftWidth: 4,
              borderLeftColor:
                MOVEMENT_COLORS[
                  scheduled.movementPattern?.toLowerCase() || "push"
                ] || MOVEMENT_COLORS.push,
            }}
          >
            <div>
              <p className="font-display text-base text-ft-white">
                {scheduled.name}
              </p>
              <p className="text-secondary font-body text-sm mt-0.5">
                {scheduled.exerciseCount} exercises
              </p>
            </div>
            <span
              className="font-display text-lg px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: "rgb(var(--ft-accent))" }}
            >
              GO
            </span>
          </div>
        </Link>
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
                window.location.href = "/log/new-blank";
                return;
              }
              if (activity.type === "stretch") {
                window.location.href = "/stretch-timer";
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
