"use client";

/**
 * Presentational helpers for the Training pillar (2.2). Ported from the
 * prototype training-logger screen; theme-agnostic (ft-* tokens), Blueprint-safe.
 */
import Link from "next/link";
import { Card, Button, Chip, Stamp, SectionLabel } from "@/components/v2";

export type LogKind = "lift" | "hiit" | "liss" | "class" | "stretch" | "custom";

export function TypeGlyph({ kind, size = 20 }: { kind: LogKind; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "lift":
      return (
        <svg {...common}>
          <path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" />
        </svg>
      );
    case "hiit":
      return (
        <svg {...common}>
          <path d="M4 15v4M9 9v10M14 12v7M19 5v14" />
        </svg>
      );
    case "liss":
      return (
        <svg {...common}>
          <path d="M3 13c3 0 3-5 6-5s3 5 6 5 3-5 6-5" />
        </svg>
      );
    case "class":
      return (
        <svg {...common}>
          <circle cx="8" cy="9" r="3" />
          <circle cx="16" cy="9" r="3" />
          <path d="M3 20a5 5 0 0 1 10 0M13 20a5 5 0 0 1 8-4" />
        </svg>
      );
    case "stretch":
      return (
        <svg {...common}>
          <path d="M4 19a8 8 0 0 1 16 0" />
          <circle cx="12" cy="6" r="2.4" />
        </svg>
      );
    case "custom":
      return (
        <svg {...common} strokeWidth={2}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
  }
}

/** Resume card — only when a local session is in progress. */
export function ResumeCard({ name, meta, href }: { name: string; meta: string; href: string }) {
  return (
    <div className="px-4 pt-1">
      <Card raised className="px-3.5 py-3" style={{ borderColor: "rgb(var(--ft-accent-border))" }}>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-ft-md bg-ft-accent-faint">
            <span className="h-[9px] w-[9px] rounded-full bg-ft-accent shadow-[0_0_0_4px_rgb(var(--ft-accent-faint))]" />
          </span>
          <div className="min-w-0 flex-1">
            <Chip tone="accent" size="sm">
              In progress
            </Chip>
            <div className="mt-1 truncate font-display text-[15px] font-bold leading-tight text-ft-white">{name}</div>
          </div>
          <Link href={href}>
            <Button kind="primary" size="sm">
              Resume →
            </Button>
          </Link>
        </div>
        <div className="mt-2.5 border-t border-ft-border-faint pt-2 font-data text-[11px] tracking-[0.04em] text-ft-dim">
          {meta}
        </div>
      </Card>
    </div>
  );
}

/** Start hero — begin an empty freestyle session. */
export function StartHero({ lastLine, href = "/log/new-blank" }: { lastLine: string; href?: string }) {
  return (
    <div className="px-4 pt-3">
      <Card raised className="px-4 pb-4 pt-4">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-ft-md bg-ft-accent-faint text-ft-accent">
            <TypeGlyph kind="lift" size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <Stamp>Freestyle</Stamp>
            <div className="mt-1 font-display text-[21px] font-bold leading-tight tracking-[-0.01em] text-ft-white">
              New workout
            </div>
            <div className="mt-1 font-body text-xs leading-snug text-ft-dim">{lastLine}</div>
          </div>
        </div>
        <Link href={href} className="mt-3.5 block">
          <Button kind="primary" size="lg" fullWidth>
            Start workout →
          </Button>
        </Link>
      </Card>
    </div>
  );
}

const TYPE_HREF: Record<LogKind, string> = {
  lift: "/log/new-blank",
  hiit: "/log/activity/hiit",
  liss: "/log/activity/liss",
  class: "/log/activity/class",
  custom: "/log/activity/custom",
  stretch: "/log/stretch-timer",
};

function TypeTile({ kind, label, meta }: { kind: LogKind; label: string; meta: string }) {
  return (
    <Link href={TYPE_HREF[kind]} className="block">
      <Card className="flex flex-col gap-2 px-3 py-3.5">
        <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-ft-md bg-ft-surface-alt text-ft-light">
          <TypeGlyph kind={kind} size={19} />
        </span>
        <div>
          <div className="font-display text-sm font-bold leading-tight text-ft-white">{label}</div>
          <div className="mt-0.5 font-data text-[10px] uppercase tracking-[0.06em] text-ft-dim">{meta}</div>
        </div>
      </Card>
    </Link>
  );
}

export function WaysToLog() {
  const types: { kind: LogKind; label: string; meta: string }[] = [
    { kind: "lift", label: "Lift", meta: "Weights" },
    { kind: "hiit", label: "HIIT", meta: "Intervals" },
    { kind: "liss", label: "Cardio", meta: "Steady" },
    { kind: "class", label: "Class", meta: "Group" },
    { kind: "stretch", label: "Stretch", meta: "Mobility" },
    { kind: "custom", label: "Custom", meta: "Blank" },
  ];
  return (
    <>
      <SectionLabel right="6 loggers">Ways to log</SectionLabel>
      <div className="grid grid-cols-3 gap-2.5 px-4">
        {types.map((t) => (
          <TypeTile key={t.kind} {...t} />
        ))}
      </div>
    </>
  );
}

export function FrameRow({ label, meta, href }: { label: string; meta: string; href: string }) {
  return (
    <Link href={href} className="block">
      <Card className="flex items-center gap-3 px-3.5 py-2.5">
        <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-ft-sm bg-ft-accent-faint font-display text-sm font-bold text-ft-accent">
          {label.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-body text-[13px] font-semibold leading-tight text-ft-white">{label}</div>
          <div className="mt-px font-data text-[10.5px] tracking-[0.04em] text-ft-dim">{meta}</div>
        </div>
        <span className="whitespace-nowrap font-body text-xs font-bold text-ft-accent">Start →</span>
      </Card>
    </Link>
  );
}

export function HistoryPlaceholder() {
  return (
    <div className="px-4 pt-1">
      <div className="rounded-ft-lg border border-dashed border-ft-border p-4 text-center">
        <div className="ft-on-bg font-body text-xs leading-relaxed text-ft-on-bg-ter">
          Recent sessions and saved frames appear here once you log one.
        </div>
      </div>
    </div>
  );
}

/** Structure upsell — locked Program/Gameplan preview. Previews, never gates. */
export function StructureUpsell() {
  const days = [
    { d: "M", on: true },
    { d: "T", on: true },
    { d: "W", on: false },
    { d: "T", on: true },
    { d: "F", on: true },
    { d: "S", on: false },
    { d: "S", on: false },
  ];
  const features = [
    "Pre-built blocks with progression",
    "Today's session picked for you",
    "Nutrition plans, recipes, grocery",
  ];
  return (
    <>
      <SectionLabel>Structure</SectionLabel>
      <div className="px-4 pb-1">
        <Card className="px-4 pb-4 pt-3.5">
          <div className="flex items-center justify-between gap-2.5">
            <Stamp>Program · Gameplan</Stamp>
            <Chip tone="neutral" size="sm">
              Locked
            </Chip>
          </div>
          <div className="mt-1.5 font-display text-base font-bold leading-tight tracking-[-0.01em] text-ft-white">
            Train on a plan
          </div>
          <div className="pointer-events-none mt-3 flex gap-1.5 opacity-50">
            {days.map((d, i) => (
              <div
                key={i}
                className={[
                  "flex h-10 flex-1 items-center justify-center rounded-ft-sm font-data text-[10px] font-bold",
                  d.on
                    ? "bg-ft-accent text-ft-on-accent"
                    : "border border-dashed border-ft-border-faint bg-ft-surface-alt text-ft-dim",
                ].join(" ")}
              >
                {d.d}
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2 font-body text-xs text-ft-light">
                <span className="mt-px text-ft-accent">·</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-3.5 flex gap-2">
            <Link href="/shelf" className="flex-1">
              <Button kind="primary" size="md" fullWidth>
                See Programs →
              </Button>
            </Link>
            <Link href="/shelf/compare">
              <Button kind="secondary" size="md">
                Compare
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
