# Claude Code — kickoff prompt

Paste this into Claude Code, working in the FitTrack repo with this `design_handoff_fittrack_v2/`
folder present. Keep it thin — the bundle carries the detail.

---

You're reskinning and wiring the existing FitTrack app to match the v2 design in
`design_handoff_fittrack_v2/`. This is a **UI reskin + wiring** job: the app's logic, routes,
and data already exist in a primitive state — replace the current UI with the v2 design
language and connect the new screens to the existing data and state. Do **not** redesign the
product or port the prototypes' Babel/JSX wiring; recreate the designs using this repo's own
framework, component library, and patterns.

Before writing any code:
1. Read `design_handoff_fittrack_v2/ARCHITECTURE.md` in full — it's the structural contract
   (theme system, the Blueprint inversion rule, the single `PillarShell`, the single
   `BottomNav`, collapsing header, copy/flow rules). Most bugs come from violating it.
2. Read `design_handoff_fittrack_v2/README.md` for the cluster/screen inventory, design
   tokens, and the recommended build sequence.
3. Read `design_handoff_fittrack_v2/MIGRATION_MAP.md` for what existing code each new screen
   replaces vs. keeps. It's the authority on routing + disposition. Note its **§1.3–§1.4**
   (the free **Logger tier writes locally, not to the DB** — new storage wiring, highest risk)
   and run its **Part 5 live-repo verification checklist** before building.
4. Open the relevant `prototypes/Cluster N ….html` in a browser to see the target — step the
   theme cycler through `lab`, `blueprint`, and a dark theme; toggle the Tweaks panel for
   states.

Then explore the current repo and propose a plan before building. Work **foundation first,
then cluster by cluster** per the README's build sequence: theme tokens → primitives → shells
(`PillarShell` + `BottomNav`) → Cluster 2 (Logger) → 3 → 4 → 5/1/6/7.

Acceptance for every screen: renders correctly in `lab` + `blueprint` (canary) + one dark
theme; uses the shared `PillarShell`/`BottomNav` (no hand-rolled shells); copy obeys the voice
rules; locked tiers preview rather than gate.

Start by confirming the plan and the foundation work (theme bridge + primitives) with me
before touching screens.
