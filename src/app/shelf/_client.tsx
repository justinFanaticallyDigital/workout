"use client";

/**
 * 5.1 — Universal Shelf · /shelf (Cluster 5).
 *
 * The commerce/marketing surface, reached as an affordance from every tier's
 * slot-1 home. Tabs split the catalog into Programs (one-time) and Gameplans
 * (adaptive subscription) — per the tier model (MIGRATION_MAP §1.3) the same
 * plan is offered at both tiers, so the tab carries a `type` through to the
 * card detail. A collapsible filter rail (one question expanded at a time,
 * persistent across tabs) narrows the grid client-side.
 *
 * Backed by the real `programTemplates` registry (mapped to a lightweight
 * catalog server-side). Non-pillar surface → HomeShell + the global BottomNav.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HomeShell, Header, Card, Button, Chip } from "@/components/v2";

export interface ShelfItem {
  slug: string;
  name: string;
  tagline: string;
  weeks: number;
  daysPerWeek: number;
  level: "beginner" | "intermediate" | "advanced" | "any";
  equipment: "full_gym" | "home_dumbbells" | "minimal";
  periodization: string;
  goals: string[];
  goalWeighting: Record<string, number>;
  sessionMin: number;
  sessionMax: number;
}

type Tab = "gameplans" | "programs";

const EQUIP_LABEL: Record<ShelfItem["equipment"], string> = {
  full_gym: "Full gym",
  home_dumbbells: "Dumbbells",
  minimal: "Minimal",
};
const LEVELS: ShelfItem["level"][] = ["beginner", "intermediate", "advanced"];
const EQUIPS: ShelfItem["equipment"][] = ["full_gym", "home_dumbbells", "minimal"];

function goalLabel(g: string): string {
  return g.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Filters {
  level: ShelfItem["level"] | null;
  equipment: ShelfItem["equipment"] | null;
  goals: string[];
}
const EMPTY_FILTERS: Filters = { level: null, equipment: null, goals: [] };

export default function ShelfClient({ catalog }: { catalog: ShelfItem[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("gameplans");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const allGoals = useMemo(() => {
    const s = new Set<string>();
    for (const c of catalog) for (const g of c.goals) s.add(g);
    return Array.from(s);
  }, [catalog]);

  const filtered = useMemo(
    () =>
      catalog.filter((c) => {
        if (filters.level && c.level !== filters.level && c.level !== "any") return false;
        if (filters.equipment && c.equipment !== filters.equipment) return false;
        if (filters.goals.length && !filters.goals.some((g) => c.goals.includes(g))) return false;
        return true;
      }),
    [catalog, filters],
  );

  const activeCount = (filters.level ? 1 : 0) + (filters.equipment ? 1 : 0) + filters.goals.length;
  const type = tab === "programs" ? "program" : "gameplan";

  return (
    <HomeShell
      header={<Header kind="sub" title="Shelf" subtitle="Browse" right="gear" onBack={() => router.back()} onGear={() => router.push("/settings")} />}
    >
      {/* Tab strip */}
      <div className="ft-on-bg flex gap-2 px-4 pt-1">
        {(["gameplans", "programs"] as Tab[]).map((t) => {
          const sel = t === tab;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={[
                "flex-1 rounded-ft-md border px-3 py-2 font-body text-[13px] font-bold capitalize tracking-[0.02em] transition-colors",
                sel
                  ? "border-ft-accent-border-on-bg bg-ft-accent-faint-on-bg text-ft-accent-on-bg"
                  : "border-ft-border-faint bg-transparent text-ft-on-bg-sec",
              ].join(" ")}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Sort + filter bar */}
      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <span className="ft-on-bg font-data text-[10.5px] font-bold uppercase tracking-[0.1em] text-ft-on-bg-ter">
          {filtered.length} {tab}
        </span>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="ft-on-bg inline-flex items-center gap-1.5 rounded-ft-md border border-ft-accent-border-on-bg px-3 py-1.5 font-body text-[12px] font-semibold text-ft-accent-on-bg"
        >
          Filters{activeCount > 0 ? ` · ${activeCount}` : ""}
          <span>›</span>
        </button>
      </div>

      {/* Card grid */}
      <div className="px-4 pt-2">
        {filtered.length === 0 ? (
          <Card className="px-5 py-8 text-center">
            <div className="font-display text-lg font-bold tracking-[-0.01em] text-ft-white">No matches</div>
            <p className="mt-1.5 font-body text-[12.5px] text-ft-dim">Loosen a constraint to see more {tab}.</p>
            <Button kind="secondary" size="sm" className="mt-3" onClick={() => setFilters(EMPTY_FILTERS)}>
              Reset filters
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((item) => (
              <ShelfCard key={item.slug} item={item} type={type} />
            ))}
          </div>
        )}
      </div>

      {filtered.length >= 2 && (
        <div className="px-4 pt-4">
          <Link href="/shelf/compare" className="block">
            <Card className="flex items-center justify-between px-3.5 py-3">
              <span className="font-body text-[13px] font-semibold text-ft-light">Compare plans side by side</span>
              <span className="font-body text-base text-ft-dim">›</span>
            </Card>
          </Link>
        </div>
      )}

      {filtersOpen && (
        <FilterRail
          filters={filters}
          allGoals={allGoals}
          resultCount={filtered.length}
          totalCount={catalog.length}
          tab={tab}
          onChange={setFilters}
          onClose={() => setFiltersOpen(false)}
        />
      )}
    </HomeShell>
  );
}

function ShelfCard({ item, type }: { item: ShelfItem; type: string }) {
  const goalEntries = Object.entries(item.goalWeighting).sort((a, b) => b[1] - a[1]);
  return (
    <Link href={`/shelf/${type}/${item.slug}`}>
      <Card className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0">
            <div className="font-display text-lg font-bold leading-tight tracking-[-0.01em] text-ft-white">{item.name}</div>
            <p className="mt-1 font-body text-[12.5px] leading-snug text-ft-light">{item.tagline}</p>
          </div>
          <Chip tone={type === "gameplan" ? "accent" : "neutral"} size="sm">
            {type === "gameplan" ? "Adaptive" : "One-time"}
          </Chip>
        </div>

        <div className="mt-2.5 font-data text-[11px] uppercase tracking-[0.05em] text-ft-dim">
          {item.weeks} wk · {item.daysPerWeek}×/wk · {item.level} · {EQUIP_LABEL[item.equipment]}
        </div>

        {/* Goal-weighting bar */}
        <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full">
          {goalEntries.map(([g, w], i) => (
            <span
              key={g}
              title={`${goalLabel(g)} ${w}%`}
              className="h-full"
              style={{ width: `${w}%`, background: i === 0 ? "rgb(var(--ft-accent))" : `rgb(var(--ft-accent) / ${0.6 - i * 0.18})` }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
          {goalEntries.slice(0, 3).map(([g, w]) => (
            <span key={g} className="font-data text-[10px] tracking-[0.03em] text-ft-dim">
              {goalLabel(g)} {w}%
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-ft-border-faint pt-2.5">
          <span className="font-body text-[11.5px] text-ft-dim">{item.periodization}</span>
          <span className="font-body text-[12px] font-bold text-ft-accent">View →</span>
        </div>
      </Card>
    </Link>
  );
}

// ── Filter rail — accordion, one question expanded at a time ──
function FilterRail({
  filters,
  allGoals,
  resultCount,
  totalCount,
  tab,
  onChange,
  onClose,
}: {
  filters: Filters;
  allGoals: string[];
  resultCount: number;
  totalCount: number;
  tab: Tab;
  onChange: (f: Filters) => void;
  onClose: () => void;
}) {
  const [open, setOpen] = useState<"goals" | "level" | "equipment" | null>("goals");

  const toggleGoal = (g: string) =>
    onChange({ ...filters, goals: filters.goals.includes(g) ? filters.goals.filter((x) => x !== g) : [...filters.goals, g] });

  return (
    <div className="fixed inset-0 z-50 flex">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="relative ml-auto flex h-full w-[88%] max-w-[340px] flex-col border-l border-ft-border bg-ft-surface">
        <div className="flex items-center justify-between border-b border-ft-border-faint px-4 py-3.5">
          <div>
            <div className="font-display text-lg font-bold tracking-[-0.01em] text-ft-white">Filters</div>
            <div className="mt-0.5 font-data text-[10px] uppercase tracking-[0.1em] text-ft-dim">
              {resultCount} / {totalCount} {tab}
            </div>
          </div>
          <button type="button" onClick={onClose} className="font-body text-sm text-ft-dim">
            Done
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          <AccordionRow
            label="Goals"
            answer={filters.goals.length ? filters.goals.map(goalLabel).join(" · ") : "Any"}
            expanded={open === "goals"}
            onToggle={() => setOpen(open === "goals" ? null : "goals")}
          >
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {allGoals.map((g) => {
                const sel = filters.goals.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGoal(g)}
                    className={[
                      "rounded-full border px-3 py-1.5 font-body text-[12px] font-semibold",
                      sel ? "border-ft-accent bg-ft-accent-faint text-ft-accent" : "border-ft-border bg-ft-surface-alt text-ft-light",
                    ].join(" ")}
                  >
                    {goalLabel(g)}
                  </button>
                );
              })}
            </div>
          </AccordionRow>

          <AccordionRow
            label="Gym comfort"
            answer={filters.level ? filters.level : "Any"}
            expanded={open === "level"}
            onToggle={() => setOpen(open === "level" ? null : "level")}
          >
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {LEVELS.map((l) => {
                const sel = filters.level === l;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onChange({ ...filters, level: sel ? null : l })}
                    className={[
                      "rounded-full border px-3 py-1.5 font-body text-[12px] font-semibold capitalize",
                      sel ? "border-ft-accent bg-ft-accent-faint text-ft-accent" : "border-ft-border bg-ft-surface-alt text-ft-light",
                    ].join(" ")}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </AccordionRow>

          <AccordionRow
            label="Equipment"
            answer={filters.equipment ? EQUIP_LABEL[filters.equipment] : "Any"}
            expanded={open === "equipment"}
            onToggle={() => setOpen(open === "equipment" ? null : "equipment")}
          >
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {EQUIPS.map((e) => {
                const sel = filters.equipment === e;
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => onChange({ ...filters, equipment: sel ? null : e })}
                    className={[
                      "rounded-full border px-3 py-1.5 font-body text-[12px] font-semibold",
                      sel ? "border-ft-accent bg-ft-accent-faint text-ft-accent" : "border-ft-border bg-ft-surface-alt text-ft-light",
                    ].join(" ")}
                  >
                    {EQUIP_LABEL[e]}
                  </button>
                );
              })}
            </div>
          </AccordionRow>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-ft-border-faint px-4 py-3.5">
          <Button kind="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
            Reset
          </Button>
          <Button kind="primary" size="sm" onClick={onClose}>
            Show {resultCount} →
          </Button>
        </div>
      </div>
    </div>
  );
}

function AccordionRow({
  label,
  answer,
  expanded,
  onToggle,
  children,
}: {
  label: string;
  answer: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-ft-border-faint">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <div className="min-w-0">
          <div className="font-body text-[13px] font-bold text-ft-white">{label}</div>
          <div className="mt-px truncate font-body text-[11.5px] text-ft-dim">{answer}</div>
        </div>
        <span className="font-body text-sm text-ft-dim transition-transform" style={{ transform: expanded ? "rotate(90deg)" : "none" }}>
          ›
        </span>
      </button>
      {expanded && children}
    </div>
  );
}
