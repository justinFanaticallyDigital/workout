"use client";

/** Exercise library — search, category-group chips, one row per exercise. */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Btn, Card, CategoryChip, ScreenHeader, SearchIcon, Stamp } from "@/components/kit";
import { authCheck } from "@/lib/fetch-helpers";
import { categoryFor, GROUP_LABEL, type CategoryGroup } from "@/lib/categories";

interface Exercise {
  id: string;
  name: string;
  movementPattern: string | null;
  primaryMuscle: string | null;
  equipment: string | null;
  isCustom?: boolean;
}

const GROUPS: ("all" | CategoryGroup)[] = ["all", "push", "pull", "legs", "core", "other"];
const PAGE = 80;

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<"all" | CategoryGroup>("all");
  const [pattern, setPattern] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("pattern");
    if (p) setPattern(p);
  }, []);
  useEffect(() => {
    fetch("/api/exercises")
      .then(authCheck)
      .then((res) => res.json())
      .then((data) => setExercises(data.exercises ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((e) => {
      if (pattern && e.movementPattern !== pattern) return false;
      if (group !== "all" && categoryFor(e.movementPattern, e.primaryMuscle).group !== group) return false;
      if (q && !e.name.toLowerCase().includes(q) && !(e.equipment ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [exercises, query, group, pattern]);

  return (
    <div className="pb-8">
      <ScreenHeader
        title="Exercises"
        back={{ href: "/settings", label: "Settings" }}
        right={
          <Btn small href="/exercises/new">
            + New
          </Btn>
        }
      />
      <div className="px-5">
        <label className="flex items-center gap-2 rounded-ft-md border border-ft-border bg-ft-surface-raised px-3 py-2.5">
          <SearchIcon size={16} className="text-ft-dim" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exercises" className="w-full bg-transparent font-body text-[14px] text-ft-white outline-none placeholder:text-ft-muted" />
        </label>
      </div>
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-5 pb-3.5 pt-3">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => {
              setGroup(g);
              setPattern(null);
              setShown(PAGE);
            }}
            className={["flex-shrink-0 rounded-full border px-[11px] py-[5px] font-data text-[10.5px] font-bold uppercase tracking-[0.1em]", group === g && !pattern ? "border-ft-accent-deep bg-ft-accent text-ft-on-accent" : "border-ft-border bg-ft-surface text-ft-light"].join(" ")}
          >
            {g === "all" ? "All" : GROUP_LABEL[g]}
          </button>
        ))}
        {pattern && (
          <button type="button" onClick={() => setPattern(null)} className="flex-shrink-0 rounded-full border border-ft-accent-deep bg-ft-accent px-[11px] py-[5px] font-data text-[10.5px] font-bold uppercase tracking-[0.1em] text-ft-on-accent">
            {pattern} ✕
          </button>
        )}
      </div>
      <div className="mb-1.5 flex items-center gap-2 px-5">
        <span className="t-eyebrow">{loading ? "Loading" : `${filtered.length} of ${exercises.length}`}</span>
      </div>
      <div className="flex flex-col gap-1.5 px-5">
        {!loading && filtered.length === 0 && (
          <Card className="px-4 py-4">
            <div className="font-data text-[14.5px] font-bold text-ft-white">No exercises match</div>
            <p className="mt-1 font-body text-[13px] text-ft-light">Try another word or group, or add a custom exercise.</p>
            <Btn small href="/exercises/new" className="mt-3">
              + New exercise
            </Btn>
          </Card>
        )}
        {filtered.slice(0, shown).map((e) => (
          <Link key={e.id} href={`/exercises/${e.id}`} className="block">
            <Card band={false} className="flex items-center gap-2.5 px-3.5 py-2.5">
              <CategoryChip variant="solid" movementPattern={e.movementPattern} primaryMuscle={e.primaryMuscle} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-data text-[13.5px] font-semibold text-ft-white">{e.name}</div>
                <div className="truncate font-body text-[11.5px] text-ft-dim">{[e.equipment, e.primaryMuscle].filter(Boolean).join(" · ") || "—"}</div>
              </div>
              {e.isCustom && <Stamp tone="muted">Custom</Stamp>}
              <span className="font-data text-[14px] text-ft-accent">›</span>
            </Card>
          </Link>
        ))}
        {filtered.length > shown && (
          <button type="button" onClick={() => setShown((n) => n + PAGE)} className="mt-1 w-full rounded-ft-lg border-[1.6px] border-dashed border-ft-border px-4 py-[11px] text-center font-data text-[11.5px] font-bold uppercase tracking-[0.12em] text-ft-light">
            Show {Math.min(PAGE, filtered.length - shown)} more
          </button>
        )}
      </div>
    </div>
  );
}
