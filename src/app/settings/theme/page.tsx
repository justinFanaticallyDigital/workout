"use client";

/**
 * Cluster 6 — Theme switcher · /settings/theme.
 *
 * The dedicated theme picker (the gear → More → Theme destination). Reuses the
 * live ThemeProvider so a tap applies + persists immediately (same path as the
 * first-visit ThemePickerModal). Built in the v2 vocabulary (HomeShell + Header
 * 'sub' + Card) so it matches the rest of the reskin; swatch chrome derives from
 * THEME_SWATCHES so the preview always tracks the theme configs.
 */
import Link from "next/link";
import { HomeShell, Header, Card, Chip, SectionLabel } from "@/components/v2";
import { useTheme } from "@/providers/ThemeProvider";
import { themeList } from "@/themes";
import { THEME_SWATCHES } from "@/themes/swatches";

export default function SettingsThemePage() {
  const { themeId, setTheme } = useTheme();

  return (
    <HomeShell header={<Header kind="sub" title="Theme" subtitle="Visual style" right={null} />}>
      <SectionLabel right={`${themeList.length} themes`}>Choose a theme</SectionLabel>
      <div className="grid grid-cols-2 gap-2.5 px-4">
        {themeList.map((t) => {
          const sw = THEME_SWATCHES[t.id] ?? { bg: "#333", accent: "#888", text: "#fff" };
          const selected = themeId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              aria-pressed={selected}
              className="text-left"
            >
              <Card
                className={[
                  "overflow-hidden p-0 transition-colors",
                  selected ? "border-ft-accent" : "",
                ].join(" ")}
              >
                {/* Live mini-preview painted from the theme's own colors */}
                <div
                  className="flex h-16 items-end gap-1.5 p-2.5"
                  style={{ background: sw.bg }}
                >
                  <span
                    className="h-6 w-6 flex-shrink-0 rounded-full"
                    style={{ background: sw.accent, boxShadow: selected ? `0 0 10px ${sw.accent}` : "none" }}
                  />
                  <span className="flex flex-1 flex-col gap-1">
                    <span className="block h-1.5 w-3/4 rounded-full" style={{ background: sw.text, opacity: 0.85 }} />
                    <span className="block h-1.5 w-1/2 rounded-full" style={{ background: sw.text, opacity: 0.4 }} />
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <span className="truncate font-body text-[13px] font-semibold text-ft-white">
                    {t.name}
                  </span>
                  {selected && (
                    <Chip tone="accent" size="sm">
                      Active
                    </Chip>
                  )}
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="px-4 pt-4">
        <p className="font-body text-[11.5px] leading-snug text-ft-on-bg-ter ft-on-bg">
          Themes change instantly and save to this device. Each theme restyles
          fonts, chrome, and color across the whole app.
        </p>
        <Link
          href="/settings"
          className="mt-3 inline-block font-body text-[12px] font-semibold uppercase tracking-[0.08em] text-ft-accent-on-bg"
        >
          ‹ Back to Settings
        </Link>
      </div>
    </HomeShell>
  );
}
