import { PlanningStamp } from "@/components/ui/PlanningSection";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Phase-1 placeholder. The "Build custom" wrapper around the existing
 * Program Engine. The legacy advanced hub at /programs/new/advanced
 * redirects here. Full content (engine launcher + entry-paths nav)
 * lands in R12.
 */
export default function GameplanBuildPlaceholder() {
  return (
    <div className="min-h-screen bg-ft-bg text-ft-on-bg max-w-2xl mx-auto p-6">
      <div className="ft-card relative bg-ft-surface border border-ft-border p-5">
        <div className="absolute top-3 right-3">
          <PlanningStamp>PLANNED</PlanningStamp>
        </div>
        <h1 className="font-display text-3xl text-ft-on-bg tracking-wide leading-tight">
          Build custom Gameplan
        </h1>
        <p className="text-ft-on-bg-sec font-body text-sm mt-3 leading-relaxed">
          Coming soon — the wrapper around the existing Program Engine.
          For now, the engine remains reachable at the legacy paths
          while we relocate.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href="/programs/new/generate"
            className="font-body text-[12px] uppercase tracking-[0.15em] text-ft-accent border-b border-ft-accent inline-block self-start"
          >
            Smart Generator (legacy path) →
          </Link>
          <Link
            href="/programs/new/builder"
            className="font-body text-[12px] uppercase tracking-[0.15em] text-ft-accent border-b border-ft-accent inline-block self-start"
          >
            Visual Builder (legacy path) →
          </Link>
          <Link
            href="/programs/new/templates"
            className="font-body text-[12px] uppercase tracking-[0.15em] text-ft-accent border-b border-ft-accent inline-block self-start"
          >
            Template Picker (legacy path) →
          </Link>
          <Link
            href="/programs/new/goal"
            className="font-body text-[12px] uppercase tracking-[0.15em] text-ft-accent border-b border-ft-accent inline-block self-start"
          >
            Goal Wizard (legacy path) →
          </Link>
        </div>
      </div>
    </div>
  );
}
