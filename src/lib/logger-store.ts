/**
 * Logger-tier local store (MIGRATION_MAP.md §1.3–§1.4 — the highest-risk piece).
 *
 * The free Logger tier writes LOCALLY, never to the database. This module is
 * the persistence layer for that: a small async, Drive-ready backend interface
 * with a localStorage implementation today. When the Google Drive file backend
 * lands, implement `LoggerBackend` against Drive and swap it via `setBackend()`
 * — nothing above this line changes.
 *
 * Domain on top of the backend:
 *   • Frames    — named, re-selectable workout shells (exercises/sets/reps).
 *   • Sessions  — completed local workouts/activities/meals (one at a time).
 *
 * Program/Gameplan tiers continue to use the cloud DB via the API routes; this
 * store is only for the Logger tier. It deliberately mirrors the existing
 * draft-store/offline-queue conventions (localStorage, JSON, no userId).
 */

// ── Backend interface (Drive-ready) ──
export interface LoggerBackend {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  /** All stored keys beginning with `prefix` (prefix included). */
  list(prefix: string): Promise<string[]>;
}

const NS = "fittrack-logger:";

/** Default backend — browser localStorage. SSR-safe (no-ops on the server). */
const localStorageBackend: LoggerBackend = {
  async read(key) {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async write(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* quota / unavailable */
    }
  },
  async remove(key) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* unavailable */
    }
  },
  async list(prefix) {
    if (typeof window === "undefined") return [];
    try {
      return Object.keys(window.localStorage).filter((k) => k.startsWith(prefix));
    } catch {
      return [];
    }
  },
};

let backend: LoggerBackend = localStorageBackend;

/** Swap the persistence backend (e.g. a Google Drive file impl). */
export function setBackend(next: LoggerBackend): void {
  backend = next;
}

// ── Generic collection helpers ──
function collKey(collection: string, id: string): string {
  return `${NS}${collection}:${id}`;
}
function collPrefix(collection: string): string {
  return `${NS}${collection}:`;
}

async function putItem<T>(collection: string, id: string, value: T): Promise<void> {
  await backend.write(collKey(collection, id), JSON.stringify(value));
}

async function getItem<T>(collection: string, id: string): Promise<T | null> {
  const raw = await backend.read(collKey(collection, id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function listItems<T>(collection: string): Promise<T[]> {
  const keys = await backend.list(collPrefix(collection));
  const out: T[] = [];
  for (const k of keys) {
    const raw = await backend.read(k);
    if (!raw) continue;
    try {
      out.push(JSON.parse(raw) as T);
    } catch {
      /* skip corrupt */
    }
  }
  return out;
}

async function removeItem(collection: string, id: string): Promise<void> {
  await backend.remove(collKey(collection, id));
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Domain types ──
/** One exercise slot within a frame/session (open enough for Cluster 2 to refine). */
export interface FrameExercise {
  name: string;
  exerciseId?: string;
  targetSets?: number;
  targetReps?: string;
  notes?: string;
}

/** A named, re-selectable workout shell — stored locally on the Logger tier. */
export interface Frame {
  id: string;
  name: string;
  exercises: FrameExercise[];
  createdAt: number;
  updatedAt: number;
}

/** A completed local workout/activity. `data` is the logged payload (Cluster 2 defines). */
export interface LocalSession {
  id: string;
  frameId?: string;
  kind: "workout" | "activity" | "meal";
  startedAt: number;
  finishedAt?: number;
  data: unknown;
}

// ── Frames ──
export async function listFrames(): Promise<Frame[]> {
  const frames = await listItems<Frame>("frame");
  return frames.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getFrame(id: string): Promise<Frame | null> {
  return getItem<Frame>("frame", id);
}

export async function saveFrame(
  input: Omit<Frame, "id" | "createdAt" | "updatedAt"> & Partial<Pick<Frame, "id">>,
): Promise<Frame> {
  const now = Date.now();
  const existing = input.id ? await getFrame(input.id) : null;
  const frame: Frame = {
    id: input.id ?? uid(),
    name: input.name,
    exercises: input.exercises,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await putItem("frame", frame.id, frame);
  return frame;
}

export async function deleteFrame(id: string): Promise<void> {
  await removeItem("frame", id);
}

// ── Sessions ──
export async function listSessions(): Promise<LocalSession[]> {
  const sessions = await listItems<LocalSession>("session");
  return sessions.sort((a, b) => b.startedAt - a.startedAt);
}

export async function getSession(id: string): Promise<LocalSession | null> {
  return getItem<LocalSession>("session", id);
}

export async function saveSession(
  input: Omit<LocalSession, "id"> & Partial<Pick<LocalSession, "id">>,
): Promise<LocalSession> {
  const session: LocalSession = { ...input, id: input.id ?? uid() };
  await putItem("session", session.id, session);
  return session;
}

export async function deleteSession(id: string): Promise<void> {
  await removeItem("session", id);
}

// ── Preferences (singletons) ──
/** Logger-tier macro targets — set manually (2.7a), stored locally. The
 *  Program/Gameplan tiers read targets from the plan's NutritionTarget. */
export interface LocalMacroTarget {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export async function getMacroTarget(): Promise<LocalMacroTarget | null> {
  return getItem<LocalMacroTarget>("prefs", "macro-target");
}

export async function saveMacroTarget(target: LocalMacroTarget): Promise<void> {
  await putItem("prefs", "macro-target", target);
}
