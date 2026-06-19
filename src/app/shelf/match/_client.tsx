"use client";

/**
 * 5.6 — guided plan matcher (client). Four questions → ranks the catalog by
 * goal overlap (weighted) + experience / equipment / frequency fit → shows the
 * best match plus runners-up, each linking to its card detail. Reversible:
 * every answer is editable, nothing is committed. Full-screen sub-flow.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header, Card, Button, Chip, Stamp } from "@/components/v2";

export interface MatchItem {
  slug: string;
  name: string;
  tagline: string;
  level: "beginner" | "intermediate" | "advanced" | "any";
  equipment: "full_gym" | "home_dumbbells" | "minimal";
  daysMin: number;
  daysMax: number;
  goalWeighting: Record<string, number>;
}

type GoalKey = "muscle" | "fat" | "strength" | "general";
type DaysKey = "2-3" | "4" | "5+";
type LevelKey = "beginner" | "intermediate" | "advanced";
type EquipKey = "full_gym" | "home_dumbbells" | "minimal";

/** User goal → template goalWeighting keywords it should match. */
const GOAL_KEYWORDS: Record<GoalKey, string[]> = {
  muscle: ["muscle", "hypertrophy", "muscle_preservation", "size", "aesthetic"],
  fat: ["fat_loss", "cut", "lean", "conditioning"],
  strength: ["strength", "power", "powerlifting"],
  general: ["general", "health", "athletic", "work_capacity", "longevity", "mobility"],
};

interface Answers {
  goal: GoalKey | null;
  days: DaysKey | null;
  level: LevelKey | null;
  equipment: EquipKey | null;
}

const STEPS: {
  key: keyof Answers;
  title: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "goal",
    title: "Primary goal",
    options: [
      { value: "muscle", label: "Build muscle" },
      { value: "fat", label: "Lose fat" },
      { value: "strength", label: "Get stronger" },
      { value: "general", label: "General fitness" },
    ],
  },
  {
    key: "days",
    title: "Days per week",
    options: [
      { value: "2-3", label: "2–3 days" },
      { value: "4", label: "4 days" },
      { value: "5+", label: "5+ days" },
    ],
  },
  {
    key: "level",
    title: "Gym comfort",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
  },
  {
    key: "equipment",
    title: "Equipment access",
    options: [
      { value: "full_gym", label: "Full gym" },
      { value: "home_dumbbells", label: "Dumbbells" },
      { value: "minimal", label: "Minimal" },
    ],
  },
];

function targetDays(d: DaysKey): number {
  return d === "2-3" ? 3 : d === "4" ? 4 : 5;
}

function score(item: MatchItem, a: Answers): number {
  let s = 0;
  if (a.goal) {
    const kws = GOAL_KEYWORDS[a.goal];
    for (const [g, w] of Object.entries(item.goalWeighting)) {
      if (kws.some((k) => g.includes(k) || k.includes(g))) s += w; // weighted overlap
    }
  }
  if (a.level && (item.level === a.level || item.level === "any")) s += 25;
  if (a.equipment && item.equipment === a.equipment) s += 25;
  if (a.days) {
    const d = targetDays(a.days);
    if (d >= item.daysMin && d <= item.daysMax) s += 25;
    else s -= 10 * Math.min(Math.abs(d - item.daysMin), Math.abs(d - item.daysMax));
  }
  return s;
}

export default function MatchClient({ catalog }: { catalog: MatchItem[] }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({ goal: null, days: null, level: null, equipment: null });
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const ranked = useMemo(
    () => [...catalog].map((item) => ({ item, s: score(item, answers) })).sort((a, b) => b.s - a.s),
    [catalog, answers],
  );

  const current = STEPS[step];
  const answered = (current.key && answers[current.key]) != null;

  const pick = (value: string) => {
    setAnswers((p) => ({ ...p, [current.key]: value }));
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else setDone(true);
  };

  const back = () => {
    if (done) setDone(false);
    else if (step > 0) setStep(step - 1);
    else router.push("/shelf");
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ft-bg">
      <div className="flex-shrink-0">
        <Header
          kind="sub"
          title={done ? "Your match" : "Find a plan"}
          subtitle={done ? "Recommendation" : `Step ${step + 1} of ${STEPS.length}`}
          right={null}
          onBack={back}
        />
      </div>

      {!done ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Progress */}
          <div className="ft-on-bg flex gap-1.5 px-5 pt-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{ background: i <= step ? "rgb(var(--ft-accent))" : "rgb(var(--ft-surface-alt))" }}
              />
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-5">
            <div className="ft-on-bg mb-3 px-1 font-display text-2xl font-bold tracking-[-0.01em] text-ft-on-bg">
              {current.title}
            </div>
            <div className="flex flex-col gap-2.5">
              {current.options.map((o) => {
                const sel = answers[current.key] === o.value;
                return (
                  <button key={o.value} type="button" onClick={() => pick(o.value)} className="text-left">
                    <Card
                      className="flex items-center justify-between px-4 py-3.5"
                      style={sel ? { borderColor: "rgb(var(--ft-accent-border))", background: "rgb(var(--ft-accent-faint))" } : undefined}
                    >
                      <span className="font-body text-[14px] font-semibold text-ft-white">{o.label}</span>
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full border"
                        style={{
                          borderColor: sel ? "rgb(var(--ft-accent))" : "rgb(var(--ft-border))",
                          background: sel ? "rgb(var(--ft-accent))" : "transparent",
                          color: "rgb(var(--ft-on-accent))",
                        }}
                      >
                        {sel ? "✓" : ""}
                      </span>
                    </Card>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-ft-border bg-ft-surface px-4 pb-4 pt-3">
            <Button kind="primary" size="lg" fullWidth disabled={!answered} onClick={next}>
              {step < STEPS.length - 1 ? "Next →" : "See match →"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-3" style={{ paddingBottom: 24 }}>
          {ranked.slice(0, 1).map(({ item }) => (
            <Card key={item.slug} raised className="px-4 py-4" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
              <div className="flex items-center justify-between">
                <Stamp>Best match</Stamp>
                <Chip tone="accent" size="sm">
                  Top pick
                </Chip>
              </div>
              <div className="mt-1.5 font-display text-2xl font-bold leading-tight tracking-[-0.01em] text-ft-white">{item.name}</div>
              <p className="mt-1.5 font-body text-[13px] leading-snug text-ft-light">{item.tagline}</p>
              <Link href={`/shelf/gameplan/${item.slug}`} className="mt-3.5 block">
                <Button kind="primary" size="lg" fullWidth>
                  View this plan →
                </Button>
              </Link>
            </Card>
          ))}

          {ranked.length > 1 && (
            <>
              <div className="ft-on-bg px-1 pb-2 pt-5 font-data text-[10.5px] font-bold uppercase tracking-[0.1em] text-ft-on-bg">
                Also worth a look
              </div>
              <div className="flex flex-col gap-2">
                {ranked.slice(1, 3).map(({ item }) => (
                  <Link key={item.slug} href={`/shelf/gameplan/${item.slug}`}>
                    <Card className="flex items-center justify-between px-3.5 py-3">
                      <div className="min-w-0">
                        <div className="font-body text-[13.5px] font-semibold text-ft-white">{item.name}</div>
                        <div className="mt-px truncate font-body text-[11.5px] text-ft-dim">{item.tagline}</div>
                      </div>
                      <span className="font-body text-[12px] font-bold text-ft-accent">View →</span>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setDone(false);
              setStep(0);
            }}
            className="ft-on-bg mt-5 w-full rounded-ft-lg border border-dashed border-ft-border-strong py-3 font-body text-[12.5px] font-semibold text-ft-accent-on-bg"
          >
            Start over
          </button>
        </div>
      )}
    </div>
  );
}
