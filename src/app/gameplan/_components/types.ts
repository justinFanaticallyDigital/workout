/* Shared types for the /gameplan dashboard. */

export interface ActiveProgram {
  id: string;
  name: string;
  durationWeeks: number | null;
  startDate: string | null;
}

export interface BlockExercise {
  name: string;
  movementPattern: string | null;
  targetSets: number | null;
  targetRepRange: string | null;
}

export interface BlockDay {
  id: string;
  name: string;
  dayNumber: number;
  dayType: string;
  exercises: BlockExercise[];
}

export interface ActiveBlock {
  id: string;
  name: string;
  blockNumber: number;
  durationWeeks: number | null;
  days: BlockDay[];
}

export interface ScheduledDay {
  id: string;
  name: string;
  dayType: string;
  exercises: BlockExercise[];
}

export interface MetricTarget {
  metricKey: string;
  target: number;
  unit: string;
  current: number | null;
}

export interface StretchItem {
  name: string;
  durationSeconds: number;
  bilateral: boolean;
}

export interface StretchRoutine {
  id: string;
  name: string;
  items: StretchItem[];
}

export interface HomeData {
  activeProgram: ActiveProgram | null;
  activeBlock: ActiveBlock | null;
  scheduledDay: ScheduledDay | null;
  todayCompleted: boolean;
  todaysWorkout: { id: string; exercises: number; sets: number } | null;
  weeklyVolume: { week: string; volume: number }[];
  bodyWeights: { date: string; weight: number }[];
  recentPR: { exercise: string; value: number; reps: number; date: string; type: string } | null;
  goalPulse: MetricTarget[];
  stretchRoutine: StretchRoutine | null;
  currentWeight: number | null;
}

export interface ProgramBlock {
  id: string;
  name: string;
  blockNumber: number;
  durationWeeks: number | null;
  phase: string | null;
  status: string;
}

export interface ProgramDetail {
  id: string;
  name: string;
  durationWeeks: number | null;
  startDate: string | null;
  blocks: ProgramBlock[];
}

export interface MealItem {
  quantity: number;
  foodItem: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface MealsData {
  meals: { id: string; mealType: string; items: MealItem[] }[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface NutritionTarget {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export interface CheckIn {
  id: string;
  date: string;
  energy: number | null;
  sleepQuality: number | null;
  soreness: number | null;
  stress: number | null;
  motivation: number | null;
  liftAdherence: number | null;
  cardioAdherence: number | null;
  nutritionAdherence: number | null;
  wins: string | null;
  struggles: string | null;
  notes: string | null;
}

export type TabId = "training" | "nutrition" | "lifestyle";

/** ScheduleOverride — sourced from `/api/schedule-overrides`. */
export interface ScheduleOverride {
  id: string;
  scope: string;
  action: string;
  weekNumber: number | null;
  dayOfWeek: number | null;
  payload: unknown;
}

/** Today's workout summary surfaced by `NextActionLogged`. */
export interface TodaysWorkoutSummary {
  id: string;
  exercises: number;
  sets: number;
  totalVolume: number;
  topSet: { weight: number; reps: number } | null;
  durationMin: number;
  movementPattern: "push" | "pull" | "legs" | "core";
  shortName: string;
}
