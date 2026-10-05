import Link from "next/link";

export const dynamic = "force-dynamic";

/** Advanced settings — library maintenance + debug links. Restyled in the kit in P9. */
export default function SettingsAdvancedPage() {
  return (
    <div className="mx-auto max-w-2xl p-6 text-ft-on-bg">
      <h1 className="font-display text-2xl leading-tight tracking-wide text-ft-on-bg">Advanced</h1>
      <div className="mt-4 flex flex-col gap-2">
        <Link href="/exercises" className="inline-block self-start border-b border-ft-accent font-body text-[12px] uppercase tracking-[0.15em] text-ft-accent">
          Exercise library →
        </Link>
        <Link href="/exercises/new" className="inline-block self-start border-b border-ft-accent font-body text-[12px] uppercase tracking-[0.15em] text-ft-accent">
          Create custom exercise →
        </Link>
        <Link href="/api/auth/debug" className="inline-block self-start border-b border-ft-accent font-body text-[12px] uppercase tracking-[0.15em] text-ft-accent">
          Auth debug →
        </Link>
      </div>
    </div>
  );
}
