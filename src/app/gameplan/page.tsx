"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "./_components/Header";
import TabBar from "./_components/TabBar";
import TodayCard from "./_components/TodayCard";
import WeekStrip from "./_components/WeekStrip";
import BlockTimeline from "./_components/BlockTimeline";
import NutritionPanel from "./_components/NutritionPanel";
import LifestylePanel from "./_components/LifestylePanel";
import type {
  HomeData,
  ProgramDetail,
  MealsData,
  NutritionTarget,
  CheckIn,
  TabId,
} from "./_components/types";

export const dynamic = "force-dynamic";

/**
 * /gameplan — active program dashboard.
 *
 * Data sources (parallel fetch on mount):
 *   - GET /api/home               → active program, active block, today's
 *                                   schedule, today's workout if logged,
 *                                   stretch routine, current weight
 *   - GET /api/programs/{id}      → all program blocks (for the timeline)
 *   - GET /api/nutrition/meals?date=today
 *   - GET /api/nutrition/targets
 *   - GET /api/checkins?weeks=4
 *
 * Tabs: Training | Nutrition | Lifestyle. Tab state lives in URL hash
 * (#training / #nutrition / #lifestyle) so deep links survive reloads.
 */
export default function GameplanPage() {
  const [home, setHome] = useState<HomeData | null>(null);
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [meals, setMeals] = useState<MealsData | null>(null);
  const [nutritionTarget, setNutritionTarget] = useState<NutritionTarget | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>(() => readHashTab());

  /* Hash sync — keep tab state in URL for shareable deep links. */
  useEffect(() => {
    const onHash = () => setTab(readHashTab());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const updateTab = (t: TabId) => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${t}`);
    }
    setTab(t);
  };

  /* Initial data fetch. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const homeRes = await fetch("/api/home");
        if (homeRes.status === 401) {
          if (!cancelled) {
            setError("auth");
            setLoading(false);
          }
          return;
        }
        const homeData: HomeData = await homeRes.json();
        if (cancelled) return;
        setHome(homeData);

        const today = new Date().toISOString().split("T")[0];
        const [programRes, mealsRes, targetRes, checkInsRes] = await Promise.all([
          homeData.activeProgram
            ? fetch(`/api/programs/${homeData.activeProgram.id}`)
            : Promise.resolve(null),
          fetch(`/api/nutrition/meals?date=${today}`),
          fetch("/api/nutrition/targets"),
          fetch("/api/checkins?weeks=4"),
        ]);

        const [programDataRaw, mealsData, targetData, checkInsData] = await Promise.all([
          programRes?.ok ? programRes.json() : null,
          mealsRes.ok ? mealsRes.json() : null,
          targetRes.ok ? targetRes.json() : null,
          checkInsRes.ok ? checkInsRes.json() : { checkIns: [] },
        ]);

        if (cancelled) return;
        setProgram(programDataRaw ? normalizeProgram(programDataRaw) : null);
        setMeals(mealsData ? normalizeMeals(mealsData) : null);
        setNutritionTarget(targetData ? normalizeTarget(targetData) : null);
        setCheckIns(checkInsData?.checkIns ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-ft-bg text-ft-white min-h-screen flex items-center justify-center">
        <div className="font-body text-sm text-ft-dim uppercase tracking-[0.15em]">Loading…</div>
      </div>
    );
  }

  if (error === "auth") {
    return (
      <div className="bg-ft-bg text-ft-white min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-body text-sm text-ft-dim mb-4">You need to sign in to see your gameplan.</p>
          <Link
            href="/signin"
            className="font-body text-[12px] uppercase tracking-[0.15em] text-ft-accent border border-ft-accent px-4 py-2"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!home?.activeProgram) {
    return (
      <div className="bg-ft-bg text-ft-white min-h-screen px-6 py-10 max-w-xl mx-auto">
        <h1 className="font-display text-3xl text-ft-white mb-3">No active gameplan.</h1>
        <p className="font-body text-sm text-ft-light mb-6">
          Pick or build a program to start training. The picker walks you through goals, schedule,
          and equipment in five quick steps.
        </p>
        <Link
          href="/programs/new"
          className="inline-block cta-underline font-display text-base text-ft-accent"
        >
          Pick a Gameplan →
        </Link>
      </div>
    );
  }

  const todayDow = (new Date().getDay() + 6) % 7; // 0=Mon
  const dayLabel = (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const)[todayDow];

  return (
    <div className="bg-ft-bg text-ft-white -mx-4 -my-4 -mb-24 min-h-screen">
      <Header program={home.activeProgram} block={home.activeBlock} />
      <TabBar active={tab} onChange={updateTab} />

      <div className="px-5 py-5 space-y-5">
        {tab === "training" && (
          <>
            <TodayCard
              scheduledDay={home.scheduledDay}
              todayCompleted={home.todayCompleted}
              todaysWorkoutId={home.todaysWorkout?.id ?? null}
            />
            {home.activeBlock && (
              <section>
                <SectionHeader kicker="THIS WEEK" title={`Schedule · ${dayLabel} today`} />
                <WeekStrip block={home.activeBlock} todayDayOfWeek={todayDow} />
              </section>
            )}
            {program && (
              <section>
                <SectionHeader kicker="STRUCTURE" title="Program map" />
                <BlockTimeline blocks={program.blocks} activeBlockId={home.activeBlock?.id ?? null} />
              </section>
            )}
            <Link
              href={home.activeProgram?.id ? `/programs/${home.activeProgram.id}` : "/programs"}
              className="block text-center font-body text-[11px] uppercase tracking-[0.18em] text-ft-dim border-t border-dashed border-ft-border pt-3 hover:text-ft-light"
            >
              Edit gameplan →
            </Link>
          </>
        )}

        {tab === "nutrition" && (
          <NutritionPanel meals={meals} target={nutritionTarget} />
        )}

        {tab === "lifestyle" && (
          <LifestylePanel stretchRoutine={home.stretchRoutine} recentCheckIns={checkIns} />
        )}
      </div>
    </div>
  );
}

function SectionHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-2">
      <div className="font-body text-[9px] uppercase tracking-[0.22em] text-ft-dim">{kicker}</div>
      <div className="font-display text-lg text-ft-white tracking-wide leading-tight">{title}</div>
    </div>
  );
}

function readHashTab(): TabId {
  if (typeof window === "undefined") return "training";
  const h = window.location.hash.replace("#", "");
  if (h === "nutrition" || h === "lifestyle") return h;
  return "training";
}

/* ─── Normalization helpers (API responses → component types) ──── */

interface RawProgramBlock {
  id: string;
  name: string;
  blockNumber: number;
  durationWeeks: number | null;
  phase: string | null;
  status: string;
}
interface RawProgram {
  id: string;
  name: string;
  durationWeeks: number | null;
  startDate: string | null;
  blocks: RawProgramBlock[];
}

function normalizeProgram(raw: RawProgram): ProgramDetail {
  return {
    id: raw.id,
    name: raw.name,
    durationWeeks: raw.durationWeeks,
    startDate: raw.startDate,
    blocks: (raw.blocks ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      blockNumber: b.blockNumber,
      durationWeeks: b.durationWeeks,
      phase: b.phase,
      status: b.status,
    })),
  };
}

interface RawMealItem {
  quantity: number | string;
  foodItem: { name: string; calories: number | string; protein: number | string; carbs: number | string; fat: number | string };
}
interface RawMeals {
  meals: { id: string; mealType: string; items: RawMealItem[] }[];
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
}

function normalizeMeals(raw: RawMeals): MealsData {
  return {
    meals: (raw.meals ?? []).map((m) => ({
      id: m.id,
      mealType: m.mealType,
      items: (m.items ?? []).map((it) => ({
        quantity: Number(it.quantity),
        foodItem: {
          name: it.foodItem.name,
          calories: Number(it.foodItem.calories),
          protein: Number(it.foodItem.protein),
          carbs: Number(it.foodItem.carbs),
          fat: Number(it.foodItem.fat),
        },
      })),
    })),
    totals: {
      calories: Number(raw.totalCalories ?? 0),
      protein: Number(raw.totalProtein ?? 0),
      carbs: Number(raw.totalCarbs ?? 0),
      fat: Number(raw.totalFat ?? 0),
    },
  };
}

interface RawTarget {
  calories: number | string | null;
  protein: number | string | null;
  carbs: number | string | null;
  fat: number | string | null;
}

function normalizeTarget(raw: RawTarget | null): NutritionTarget | null {
  if (!raw) return null;
  const has =
    raw.calories != null || raw.protein != null || raw.carbs != null || raw.fat != null;
  if (!has) return null;
  return {
    calories: raw.calories != null ? Number(raw.calories) : null,
    protein: raw.protein != null ? Number(raw.protein) : null,
    carbs: raw.carbs != null ? Number(raw.carbs) : null,
    fat: raw.fat != null ? Number(raw.fat) : null,
  };
}
