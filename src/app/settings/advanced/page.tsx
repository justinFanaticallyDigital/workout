import Link from "next/link";
import { Card, ScreenHeader, SectionHeader } from "@/components/kit";

export const dynamic = "force-dynamic";

/** Advanced — library maintenance, seeds, debug links. */
export default function SettingsAdvancedPage() {
  return (
    <div className="pb-8">
      <ScreenHeader title="Advanced" back={{ href: "/settings", label: "Settings" }} />
      <SectionHeader title="Library" />
      <div className="flex flex-col gap-2 px-5">
        <Row href="/exercises" label="Exercise library" sub="Browse, search and fix categories" />
        <Row href="/exercises/new" label="Create custom exercise" sub="Name · category · equipment" />
      </div>
      <SectionHeader title="Seeds" className="mt-5" />
      <div className="px-5">
        <Card className="px-4 py-3.5">
          <p className="font-body text-[12.5px] text-ft-light">Run from the repo in PowerShell with DATABASE_URL set. Each seed is idempotent.</p>
          <pre className="mt-2 overflow-x-auto rounded-ft-md bg-ft-surface-alt px-3 py-2.5 font-data text-[11px] leading-relaxed text-ft-white">
            {`npx prisma db push
npx tsx scripts/seed-frames.ts --user you@x.com
npx tsx scripts/seed-meal-guide.ts --user you@x.com
npx tsx scripts/seed-program-templates.ts`}
          </pre>
        </Card>
      </div>
      <SectionHeader title="Debug" className="mt-5" />
      <div className="flex flex-col gap-2 px-5">
        <Row href="/api/auth/debug" label="Auth debug" sub="Session and provider state (JSON)" />
      </div>
    </div>
  );
}

function Row({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <Link href={href} className="block">
      <Card band={false} className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="font-data text-[13.5px] font-semibold text-ft-white">{label}</div>
          <div className="mt-px font-body text-[11.5px] text-ft-dim">{sub}</div>
        </div>
        <span className="font-data text-[14px] text-ft-accent">›</span>
      </Card>
    </Link>
  );
}
