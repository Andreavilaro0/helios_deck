# Plan: Dashboard Premium Redesign (Phase 2M)

**Spec:** `docs/superpowers/specs/2026-05-05-dashboard-premium-redesign.md`
**Branch:** `feature/dashboard-apple-polish`
**Started:** 2026-05-05

---

## Tasks

### T1 — Branch + CSS tokens
- [ ] `git checkout -b feature/dashboard-apple-polish`
- [ ] Add to `app/app.css`: `--bg-base`, `--card-border`, `--amber`, `--cyan`, `--blue-signal`, `--violet` tokens
- [ ] Add `@keyframes fadeSlideUp` and `@keyframes slideInRight` in `app/app.css`
- [ ] Add `@keyframes pulse-quiet` for hero badge

**Done when:** tokens and keyframes exist in app.css, no visual change yet.

---

### T2 — DashboardSignalCard
**File:** `app/components/dashboard/DashboardSignalCard.tsx`

Props interface:
```ts
interface DashboardSignalCardProps {
  label: string;
  subtitle: string;
  value: string;
  unit: string;
  status: string;
  statusColor: "amber" | "cyan" | "blue" | "violet";
  fresh: boolean;
  freshLabel: string;
  source: string;
  timestamp: string;
  tooltipText: string;
  animationDelay?: number;  // ms, default 0
  sparklineData?: number[]; // optional, only kp
}
```

Structure:
```
<article class="signal-card" style="animation-delay: {delay}ms">
  <header>
    <span class="signal-label">{label}</span>
    <span class="freshness-badge">{fresh ? "FRESH" : "STALE"} · {freshLabel}</span>
  </header>
  <p class="signal-subtitle">{subtitle}</p>
  <div class="signal-value">{value} <span class="signal-unit">{unit}</span></div>
  <div class="signal-status" data-color={statusColor}>{status}</div>
  {sparklineData && <SparklineBar data={sparklineData} />}
  <footer>{source} · {timestamp}</footer>
  <div class="card-tooltip">{tooltipText}</div>
</article>
```

CSS: card has `position: relative; overflow: hidden`. `.card-tooltip` is `position: absolute; inset: 0; opacity: 0; transition: opacity 200ms`. Card `:hover .card-tooltip { opacity: 1 }`.

**Done when:** component renders in isolation, Storybook-style with static props. No test yet.

---

### T3 — DashboardHero
**File:** `app/components/dashboard/DashboardHero.tsx`

Props: `{ overallStatus: "QUIET" | "ACTIVE" | "STORM"; timestamp: string }`

Renders: large title "HELIOS_DECK", subtitle "Space Weather Observatory", status badge with pulse animation, UTC timestamp.

**Done when:** renders with all 3 status variants.

---

### T4 — SpaceWeatherChain
**File:** `app/components/dashboard/SpaceWeatherChain.tsx`

No props needed (purely visual / educational). Renders:
```
☀ Solar Activity → ⚡ Particle Flux → 🌬 Solar Wind → 🌍 Geomagnetic Response
```
Each node is a pill with icon + label. Connected by animated dashed line (CSS border-dashed + `stroke-dashoffset` animation on SVG or pure CSS).

**Done when:** renders the 4 nodes connected visually.

---

### T5 — AboutPanel (drawer)
**File:** `app/components/dashboard/AboutPanel.tsx`

Props: `{ open: boolean; onClose: () => void }`

Sections inside (all static content):
1. Header: "HELIOS_DECK / Space Weather Observatory" + close ✕ button
2. "What it does" — 3-line description
3. Data pipeline diagram: `NOAA API → Normalizer → SQLite → SSR Loader → UI` (flex row with arrows)
4. "Data Sources & APIs" — 3 cards (NOAA SWPC, NOAA GOES XRS, NOAA DSCOVR/ACE) each with URL + description
5. "Built with" — badge grid: React Router 7, TypeScript, SQLite, Tailwind, Vitest, GitHub Actions
6. Stats bar: Tests 235 ✓ | Signals 4 | Source NOAA | CI GitHub

CSS: `position: fixed; right: 0; top: 0; height: 100vh; width: 480px`. Transform: `translateX(100%)` when closed, `translateX(0)` when open. Transition 300ms. Overlay: `position: fixed; inset: 0; background: black/50` behind panel.

**Done when:** panel opens/closes with animation, all 6 sections render.

---

### T6 — Refactor dashboard.tsx loader output
**File:** `app/routes/dashboard.tsx` — loader only, NO UI changes yet.

Ensure loader returns:
```ts
{
  xray: { value, unit, status, fresh, freshLabel, source, timestamp }
  proton: { ... }
  wind: { ... }
  kp: { value, unit, status, fresh, freshLabel, source, timestamp, recentSignals: number[] }
  overallStatus: "QUIET" | "ACTIVE" | "STORM"
  generatedAt: string // UTC ISO
}
```

`overallStatus` logic: STORM if any signal is critical, ACTIVE if any is elevated, else QUIET. Wire to existing `interpretKp`, `interpretWindSpeed`, `interpretXRayFlux`.

**Done when:** loader type-checks and existing route tests still pass.

---

### T7 — Rewrite dashboard.tsx JSX
**File:** `app/routes/dashboard.tsx` — UI section only.

Replace existing JSX with:
```tsx
<div class="dashboard-root">
  <DashboardNavbar onAboutClick={() => setAboutOpen(true)} />
  <DashboardHero overallStatus={data.overallStatus} timestamp={data.generatedAt} />
  <section class="signal-grid">
    <DashboardSignalCard {...data.xray} statusColor="amber" animationDelay={0} tooltipText="..." />
    <DashboardSignalCard {...data.proton} statusColor="cyan" animationDelay={80} tooltipText="..." />
    <DashboardSignalCard {...data.wind} statusColor="blue" animationDelay={160} tooltipText="..." />
    <DashboardSignalCard {...data.kp} statusColor="violet" animationDelay={240} sparklineData={data.kp.recentSignals} tooltipText="..." />
  </section>
  <SpaceWeatherChain />
  <GeomagneticPanel kp={data.kp} />
  <PipelineFooter stats={data.pipeline} />
  <AboutPanel open={aboutOpen} onClose={() => setAboutOpen(false)} />
</div>
```

Delete: `InstrumentHeader`, `InstrumentShell` usage. Keep `KpScaleInstrument` inside `GeomagneticPanel`.

**Done when:** page renders end-to-end, no TypeScript errors, `npm run dev` shows the new layout.

---

### T8 — DashboardNavbar
**File:** `app/components/dashboard/DashboardNavbar.tsx`

Props: `{ onAboutClick: () => void }`

Slim glassmorphism bar: logo text left, ⓘ button right. `backdrop-filter: blur(8px); background: white/5; border-bottom: 1px solid white/8`.

**Done when:** renders, ⓘ click fires `onAboutClick`.

---

### T9 — Tests: migrate + add
- Migrate `SignalCard.test.tsx` → delete (component deleted)
- Migrate `ProtonFluxTelemetryPanel.test.tsx` → keep passing (panel still used internally or deleted)
- Add `DashboardSignalCard.test.tsx`: renders value, renders status color attr, renders tooltip text, renders stale badge when fresh=false
- Add `AboutPanel.test.tsx`: renders closed (no visible content), renders open (sections visible), close button fires onClose
- Run `npm test` — all green

**Done when:** `npm test` exits 0, no skipped tests.

---

### T10 — Visual QA
- `npm run dev` — open localhost
- Check: cards appear with staggered fade (can slow in DevTools)
- Check: hover on each card shows tooltip
- Check: ⓘ opens About panel, overlay dims dashboard, ✕ closes
- Check: mobile (375px) — grid collapses to 1 column
- Check: no console errors

**Done when:** all 6 checks pass.

---

### T11 — Cleanup + PR
- Delete `InstrumentHeader.tsx`, `InstrumentShell.tsx` (if no other consumers)
- `npm run build` — no errors
- `npm test` — all green
- `git push -u origin feature/dashboard-apple-polish`
- Open PR targeting `main`

---

## Order

T1 → T2 → T3 → T4 → T5 → T6 → T8 → T7 → T9 → T10 → T11

T2–T5 can be done in parallel after T1. T6 must precede T7. T9 runs after T7.

## Files created / modified

| Action | File |
|--------|------|
| NEW | `app/components/dashboard/DashboardSignalCard.tsx` |
| NEW | `app/components/dashboard/DashboardSignalCard.test.tsx` |
| NEW | `app/components/dashboard/DashboardHero.tsx` |
| NEW | `app/components/dashboard/SpaceWeatherChain.tsx` |
| NEW | `app/components/dashboard/AboutPanel.tsx` |
| NEW | `app/components/dashboard/AboutPanel.test.tsx` |
| NEW | `app/components/dashboard/DashboardNavbar.tsx` |
| MODIFY | `app/routes/dashboard.tsx` |
| MODIFY | `app/app.css` |
| DELETE (after T9) | `app/components/dashboard/InstrumentHeader.tsx` |
| DELETE (after T9) | `app/components/dashboard/InstrumentShell.tsx` |
| KEEP | `app/components/dashboard/KpScaleInstrument.tsx` |
| KEEP | `app/components/widgets/KpHistoryStrip.tsx` |
