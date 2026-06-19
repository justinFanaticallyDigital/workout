"use client";

/**
 * /canary — throwaway theme-foundation harness (NOT a product screen).
 *
 * Purpose: enforce the Blueprint inversion rule (ARCHITECTURE.md §1) and the
 * on-bg token contract from day one. Step the theme cycler through every theme
 * — especially `blueprint` (the canary) — and confirm:
 *   • On-bg chrome (left column, on the page bg) stays legible in every theme.
 *   • Card chrome (right column) stays legible in every theme.
 *   • Accent chrome on the page bg uses the on-bg accent (navy on Blueprint),
 *     never bare accent (white on Blueprint → invisible).
 *
 * Delete once the foundation is locked and screens are landing.
 */

import { useTheme } from "@/providers/ThemeProvider";
import { themes, themeList } from "@/themes";

export default function CanaryPage() {
  const { themeId, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-ft-bg px-4 py-6">
      {/* Theme cycler */}
      <div className="mb-6 flex flex-wrap gap-2">
        {themeList.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            className="rounded-ft-md border px-3 py-1.5 text-xs font-body font-semibold transition-colors"
            style={{
              borderColor:
                themeId === t.id
                  ? "rgb(var(--ft-accent-on-bg))"
                  : "rgb(var(--ft-border) / 0.5)",
              color:
                themeId === t.id
                  ? "rgb(var(--ft-accent-on-bg))"
                  : "rgb(var(--ft-text-on-bg-ter))",
              background:
                themeId === t.id ? "rgb(var(--ft-accent-faint-on-bg))" : "transparent",
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      <h1 className="ft-on-bg font-display text-2xl mb-1">Theme canary</h1>
      <p className="ft-on-bg-ter font-body text-sm mb-6">
        Active: <span className="font-semibold">{themes[themeId].name}</span> ·{" "}
        {themes[themeId].isDark ? "dark" : "light"} · chrome={themes[themeId].chrome}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* ── Column A: chrome directly on the page bg (on-bg tokens) ── */}
        <section>
          <div className="ft-on-bg-ter font-data text-[10px] uppercase tracking-wider mb-2">
            On page bg — uses on-bg tokens
          </div>
          <div className="space-y-2">
            <p className="ft-on-bg font-body text-base font-semibold">
              Primary on-bg text
            </p>
            <p className="ft-on-bg-sec font-body text-sm">Secondary on-bg text</p>
            <p className="ft-on-bg-ter font-body text-xs">Tertiary on-bg text</p>

            {/* Accent chrome on the page bg — MUST use the on-bg accent */}
            <div
              className="mt-3 inline-flex items-center gap-2 rounded-ft-md border px-3 py-1.5 text-xs font-body font-semibold"
              style={{
                color: "rgb(var(--ft-accent-on-bg))",
                background: "rgb(var(--ft-accent-faint-on-bg))",
                borderColor: "rgb(var(--ft-accent-border-on-bg))",
              }}
            >
              Accent chip (on-bg accent)
            </div>

            {/* Deliberate contrast probe: bare accent on bg. On Blueprint this
                goes (correctly) near-invisible — proving why on-bg exists. */}
            <p className="mt-2 text-[11px] font-body text-ft-accent">
              ↑ bare text-ft-accent on bg — vanishes on Blueprint by design
            </p>
          </div>
        </section>

        {/* ── Column B: chrome inside a Card (normal card tokens) ── */}
        <section>
          <div className="ft-on-bg-ter font-data text-[10px] uppercase tracking-wider mb-2">
            Inside a card — uses normal tokens
          </div>
          <div
            className="rounded-ft-lg border p-4 shadow-ft-sm"
            style={{
              background: "rgb(var(--ft-surface))",
              borderColor: "rgb(var(--ft-border-faint))",
            }}
          >
            <p className="text-ft-white font-body text-base font-semibold">
              Primary card text
            </p>
            <p className="text-ft-light font-body text-sm">Secondary card text</p>
            <p className="text-ft-dim font-body text-xs">Tertiary card text</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full px-2.5 py-1 text-[11px] font-body font-semibold text-ft-accent bg-ft-accent-faint border border-ft-accent-border">
                Accent
              </span>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-body font-semibold text-ft-success-fg bg-ft-success-bg border border-ft-success-border">
                Success
              </span>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-body font-semibold text-ft-warn-fg bg-ft-warn-bg border border-ft-warn-border">
                Warn
              </span>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-body font-semibold text-ft-danger-fg bg-ft-danger-bg border border-ft-danger-border">
                Danger
              </span>
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-ft-md py-2.5 text-sm font-body font-semibold"
              style={{
                background: "rgb(var(--ft-accent))",
                color: "rgb(var(--ft-text-on-accent))",
              }}
            >
              Primary button (accent fill)
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
