/**
 * Unified draft storage utility.
 * Saves/loads drafts from localStorage with automatic TTL expiry.
 */

const PREFIX = "fittrack-draft-";
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface DraftEntry<T> {
  data: T;
  savedAt: number;
  ttl: number;
}

export function saveDraft<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  if (typeof window === "undefined") return;
  try {
    const entry: DraftEntry<T> = { data, savedAt: Date.now(), ttl };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage full or unavailable
  }
}

export function loadDraft<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry: DraftEntry<T> = JSON.parse(raw);
    // Check TTL
    if (Date.now() - entry.savedAt > entry.ttl) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function clearDraft(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PREFIX + key);
}

export function clearAllDrafts(): void {
  if (typeof window === "undefined") return;
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
  for (const k of keys) {
    localStorage.removeItem(k);
  }
}
