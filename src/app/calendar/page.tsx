"use client";

import { useState, useEffect, useMemo } from "react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MOVEMENT_COLORS: Record<string, string> = {
  push: "rgb(var(--ft-push))",
  pull: "rgb(var(--ft-pull))",
  legs: "rgb(var(--ft-legs))",
  core: "rgb(var(--ft-core))",
  mixed: "rgb(var(--ft-dim))",
};

interface DaySummary {
  date: string;
  workoutType: string | null;
  completed: boolean;
  mealLogged: boolean;
  workoutId: string | null;
  workoutName: string | null;
  exerciseCount: number;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [daySummaries, setDaySummaries] = useState<Record<string, DaySummary>>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const { year, month } = currentMonth;
    const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const to = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay}`;

    Promise.all([
      fetch(`/api/workouts?from=${from}&to=${to}`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([workouts]) => {
        const summaries: Record<string, DaySummary> = {};
        for (const w of workouts) {
          const date = w.date?.split("T")[0] || new Date(w.date).toISOString().split("T")[0];
          summaries[date] = {
            date,
            workoutType: w.blockDay?.dayType || "lifting",
            completed: !!w.endTime,
            mealLogged: false,
            workoutId: w.id,
            workoutName: w.blockDay?.name || "Workout",
            exerciseCount: w.exercises?.length || 0,
          };
        }
        setDaySummaries(summaries);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentMonth]);

  const calendarDays = useMemo(() => {
    const { year, month } = currentMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7; // Mon=0

    const days: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
    // Fill remaining to complete rows
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [currentMonth]);

  const today = new Date().toISOString().split("T")[0];
  const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => {
    setCurrentMonth((m) => {
      const d = new Date(m.year, m.month - 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentMonth((m) => {
      const d = new Date(m.year, m.month + 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    setSelectedDay(null);
  };

  const selectedSummary = selectedDay ? daySummaries[selectedDay] : null;

  return (
    <div className="space-y-4 tab-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ft-white tracking-wide">Calendar</h1>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="text-tertiary hover:text-ft-light text-lg px-2">&lsaquo;</button>
          <span className="font-body text-sm text-secondary min-w-[140px] text-center">{monthName}</span>
          <button onClick={nextMonth} className="text-tertiary hover:text-ft-light text-lg px-2">&rsaquo;</button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-ft-surface rounded-lg border border-ft-border p-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-tertiary font-body text-[10px] uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="h-10" />;
            }

            const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const summary = daySummaries[dateStr];
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDay;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDay(dateStr === selectedDay ? null : dateStr)}
                className={`h-10 rounded-md flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                  isSelected
                    ? "bg-ft-card border border-ft-accent/50"
                    : isToday
                      ? "bg-ft-card/50 border border-ft-accent/30"
                      : "hover:bg-ft-card/30"
                }`}
              >
                <span className={`font-body text-xs ${isToday ? "text-ft-white font-semibold" : "text-secondary"}`}>
                  {day}
                </span>
                <div className="flex gap-0.5">
                  {summary && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: summary.completed
                          ? MOVEMENT_COLORS[summary.workoutType || "mixed"] || MOVEMENT_COLORS.mixed
                          : "rgb(var(--ft-muted))",
                      }}
                    />
                  )}
                  {summary?.completed && (
                    <span className="text-ft-success text-[6px]">✓</span>
                  )}
                  {summary?.mealLogged && (
                    <span className="w-1.5 h-1.5 rounded-full bg-ft-core/50" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {Object.entries(MOVEMENT_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-tertiary font-body text-[9px] capitalize">{key}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-ft-core/50" />
          <span className="text-tertiary font-body text-[9px]">Meal</span>
        </div>
      </div>

      {/* Day Detail Card */}
      {selectedDay && (
        <div className="bg-ft-surface rounded-lg p-4 border border-ft-border tab-enter">
          <p className="font-display text-sm text-ft-white mb-2">
            {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>

          {selectedSummary ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-secondary font-body text-sm">{selectedSummary.workoutName}</span>
                <span className={`font-body text-xs ${selectedSummary.completed ? "text-ft-success" : "text-ft-warn"}`}>
                  {selectedSummary.completed ? "Completed" : "In progress"}
                </span>
              </div>
              <p className="text-tertiary font-body text-xs">
                {selectedSummary.exerciseCount} exercises
              </p>
              {selectedSummary.workoutId && (
                <a
                  href={`/history/${selectedSummary.workoutId}`}
                  className="cta-underline text-ft-white font-display text-xs mt-2 inline-block"
                >
                  View Workout
                </a>
              )}
            </div>
          ) : (
            <div>
              <p className="text-tertiary font-body text-sm">No workout logged</p>
              <p className="text-tertiary font-body text-xs mt-1">No meal plan</p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center">
          <span className="text-tertiary font-body text-xs">Loading...</span>
        </div>
      )}
    </div>
  );
}
