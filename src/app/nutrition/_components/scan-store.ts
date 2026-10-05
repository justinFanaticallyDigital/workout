/** Hand-off from the label scan screen to the review screen (sessionStorage, same tab). */

export interface ScanHandoff {
  /** JPEG data URL, or null for manual entry. */
  image: string | null;
  mediaType: string | null;
  /** Meal (and slot role) that started the scan — the saved food fills it. */
  mealId: string | null;
  role: string | null;
  /** Where to go once the food is saved. */
  back: string | null;
}

const KEY = "fittrack-label-scan";

export function saveScan(h: ScanHandoff): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(h));
  } catch {
    /* private mode / quota — the review screen falls back to manual entry */
  }
}

export function loadScan(): ScanHandoff | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ScanHandoff) : null;
  } catch {
    return null;
  }
}

export function clearScan(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Builds the scan URL for a meal slot (or a plain library scan when mealId is null). */
export function scanHref(opts: { mealId?: string | null; role?: string | null; back?: string | null }): string {
  const p = new URLSearchParams();
  if (opts.mealId) p.set("mealId", opts.mealId);
  if (opts.role) p.set("role", opts.role);
  if (opts.back) p.set("back", opts.back);
  const q = p.toString();
  return q ? `/nutrition/scan?${q}` : "/nutrition/scan";
}
