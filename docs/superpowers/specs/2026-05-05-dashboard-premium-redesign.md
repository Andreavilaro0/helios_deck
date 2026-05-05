# HELIOS_DECK — Dashboard Premium Redesign

**Date:** 2026-05-05  
**Phase:** 2M  
**Branch target:** `feature/dashboard-apple-polish`  
**Status:** Approved for implementation

---

## Goal

Full visual redesign of `/dashboard`. Dark premium style inspired by Apple Weather / VisionOS widgets. References: Sociafy and Revalo dashboard designs (light-theme design language applied to dark theme).

Rules:
- No new npm dependencies
- No changes to fetchers, normalizers, SQLite, ingest, or SignalRecord
- No auto-ingest, no scheduler
- Reuse all interpret functions and getSignalFreshness
- /cosmic-view untouched

---

## Layout Architecture

Five vertical zones with generous vertical spacing (`space-y-12` or equivalent):

```
DashboardPage
├── DashboardNavbar          ← replaces InstrumentHeader
├── DashboardHero            ← new: large title + global status
├── SignalGrid (2×2)         ← 4 × DashboardSignalCard (new unified component)
├── SpaceWeatherChain        ← new: animated causal chain band
├── GeomagneticPanel         ← KpScaleInstrument (refined) + KpHistoryStrip (refined)
└── PipelineFooter           ← replaces MissionStatusPanel (minimal)
```

Plus: `AboutPanel` (slide-in drawer, triggered from navbar `ⓘ` button).

---

## Visual Language

### Background
- Base: `#080c14`
- Radial gradient: `radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.04) 0%, transparent 70%)`
- No texture, no noise — clean depth

### Cards
- `bg-white/[0.04]` + `backdrop-blur-sm`
- Border: `border border-white/[0.08]`
- Radius: `rounded-2xl`
- Shadow: `shadow-xl shadow-black/40`
- Padding: `p-6` minimum

### Typography
- Display numbers: Geist Variable (sans-serif), bold — NOT monospace
- Scientific values that need precision (e.g. `8.70e-7`): `font-mono` only for the value itself
- Labels: `text-xs font-medium text-white/40 uppercase tracking-widest`
- Status: `text-sm font-semibold` in signal accent color

### Signal Accent Colors
| Signal | Color | Tailwind |
|--------|-------|----------|
| X-Ray Flux | Amber | `text-amber-400` / `bg-amber-400/10` |
| Proton Flux | Cyan | `text-cyan-400` / `bg-cyan-400/10` |
| Solar Wind | Blue | `text-blue-400` / `bg-blue-400/10` |
| Kp Index | Violet | `text-violet-400` / `bg-violet-400/10` |

### Freshness Badge
- Fresh: small pill `bg-emerald-400/15 text-emerald-400` — "Fresh · 8m ago"
- Stale: `bg-amber-400/15 text-amber-400` — "Stale · run ingest:all"
- Pending: `bg-white/10 text-white/40` — "Awaiting data"

---

## Components

### 1. `DashboardNavbar`
Replaces `InstrumentHeader`. Slim, glass-style top bar.

- Left: `HELIOS_DECK` logo dot + wordmark
- Center: `• FEED ACTIVE` pulse badge + "Space Weather Observatory" subtitle (hidden mobile)
- Right: UTC clock (static from SSR), `ⓘ` About button, `← home` link
- Style: `border-b border-white/8`, `bg-white/[0.02]`, `backdrop-blur-md`

### 2. `DashboardHero`
New section. Large, breathable.

- H1: "Space Weather Observatory" — large, light weight
- Subline: overall condition badge (derived from Kp value: QUIET / ACTIVE / STORM) with pulse animation
- Last updated: "Data as of May 5 · 07:37 UTC" — small, white/40
- Entry animation: `fadeSlideDown` 400ms

### 3. `DashboardSignalCard`
New unified component replacing all 4 individual telemetry panels.

Props: `signal: SignalRecord | null`, `config: SignalCardConfig`

`SignalCardConfig`:
```ts
{
  label: string           // "X-Ray Flux"
  subtitle: string        // "Solar radiation level"
  accentColor: string     // Tailwind class prefix
  formatValue: (v) => string
  formatStatus: (v) => string
  statusColor: (v) => string
  explanation: string     // hover tooltip text
}
```

Card anatomy (when data present):
```
┌─────────────────────────────────────┐
│  ● X-RAY FLUX     [Fresh · 8m ago]  │ ← dot in accent color + freshness pill
│  Solar radiation level               │ ← subtitle, white/50
├─────────────────────────────────────┤
│        8.70e⁻⁷  W/m²               │ ← display number, large
│        B — MINOR                    │ ← status in accent color
├─────────────────────────────────────┤
│  ▁▂▁▁▂▁▁▁▁▂  (sparkline — Kp only) │ ← only kp-index has recentSignals in loader
├─────────────────────────────────────┤
│  noaa-swpc · May 5, 07:37 AM UTC   │ ← footer, white/30
└─────────────────────────────────────┘
```

On hover: glass overlay panel slides up from bottom of card:
```
┌─────────────────────────────────────┐
│  💡 What is X-Ray Flux?             │
│  Measures solar X-ray emission.     │
│  B-class flares are minor events    │
│  with no significant Earth impact.  │
└─────────────────────────────────────┘
```
Hover animation: `opacity 0→1` + `translateY 8px→0`, 200ms ease-out.

Pending state (signal = null):
- Dimmed card with centered message
- "Run `npm run ingest:all` to load data"
- No error styling — calm instructional state

Entry animation: `fadeSlideUp` with staggered delay (0ms, 100ms, 200ms, 300ms).

### 4. `SpaceWeatherChain`
New horizontal band. Shows the causal chain with animated connector.

```
☀ Solar Activity → ⚡ Particles → 🌬 Solar Wind → 🌍 Earth Response
```

Each step shows:
- Icon (emoji or SVG)
- Label
- Current value excerpt (e.g. "B-class · MINOR")

Animation: steps fade in left-to-right with 100ms stagger after page load.
Connector line draws left-to-right using CSS `scaleX` animation.

Layout: `flex` horizontal on desktop, `grid 2×2` on tablet, stacked list on mobile.

### 5. `KpScaleInstrument` (refined)
Keep existing logic, improve visual:
- Taller track (`h-5` instead of `h-3`)
- Softer zone colors with better opacity
- Current marker: glowing dot instead of thin line
- Labels below more readable
- Explanation line: "Kp 0–9 scale. G1 storm begins at Kp 5."

### 6. `KpHistoryStrip` (refined)
Keep existing logic, improve visual:
- Taller bars (`h-32` container)
- Bars: `rounded-t-sm`, slightly more saturated colors
- Add subtle threshold line labels ("G1" at Kp 5)
- Timestamp labels more readable

### 7. `PipelineFooter`
Replaces `MissionStatusPanel`. Minimal horizontal footer strip.

```
● NOAA SWPC  →  HELIOS_DECK  →  SQLite  →  SSR  →  UI
                   60 readings · Max 2.00 · Avg 1.71
```
Single line, small, `text-white/30`. Not a panel — just a status line.

### 8. `AboutPanel`
Slide-in drawer from right. Triggered by `ⓘ` button in navbar.

State: `isAboutOpen: boolean` in `Dashboard` component (client-side `useState`).

Anatomy:
```
┌─────────────────────────────────────┐  w-[480px] max-w-full
│  ✕   HELIOS_DECK                    │
│      Space Weather Observatory      │
├─────────────────────────────────────┤
│  WHAT IT DOES                       │
│  Prose: real data, SSR pipeline,    │
│  no decorative demos.               │
│                                     │
│  [animated data flow diagram]       │
│  NOAA → Normalizer → SQLite → UI    │
├─────────────────────────────────────┤
│  DATA SOURCES & APIS                │
│  🛰 NOAA SWPC — Kp index            │
│     services.swpc.noaa.gov          │
│  🛰 NOAA GOES XRS — X-ray + Proton  │
│  🛰 NOAA DSCOVR/ACE — Solar wind    │
│  Public domain · No API key needed  │
├─────────────────────────────────────┤
│  BUILT WITH                         │
│  [tech badges grid 3×2]             │
│  React Router v7 · TypeScript       │
│  SQLite · Tailwind CSS v4           │
│  Three.js/R3F · Vitest              │
├─────────────────────────────────────┤
│  BY THE NUMBERS                     │
│  235 tests ✓ · 4 signals · CI ✓    │
│  18 test files · NOAA public data  │
└─────────────────────────────────────┘
```

Animation:
- Backdrop: `opacity 0→0.6` (bg-black)
- Panel: `translateX(100%)→0`, 300ms ease-out
- Close: reverse
- Panel content: items fade in staggered after panel arrives (150ms offset)

Data flow: the `stats` and `latestSignal` props already in the loader are sufficient. No new DB queries.

### 9. `EmptyDashboardState` (redesigned)
Apple-style empty state:
- Large centered icon (satellite/signal SVG)
- "No data yet" in large light text
- Instructional prose: "Run the ingest command to populate the dashboard with live NOAA data."
- Code block: `npm run ingest:all`
- No error-red styling

---

## Animations Summary

All via CSS `@keyframes` in `app/app.css` — zero new dependencies.

| Animation | Keyframes | Duration | Usage |
|-----------|-----------|----------|-------|
| `fadeSlideUp` | `opacity 0→1, translateY 16px→0` | 400ms | Signal cards (staggered) |
| `fadeSlideDown` | `opacity 0→1, translateY -12px→0` | 400ms | Hero section |
| `fadeIn` | `opacity 0→1` | 300ms | Chain steps |
| `drawLine` | `scaleX 0→1` | 600ms | Chain connector |
| `slideInRight` | `translateX 100%→0` | 300ms | About panel |
| `pulse` | `opacity 0.6→1→0.6` | 2s infinite | Feed active dot, status badge |

All animations use `animation-fill-mode: both` and respect `prefers-reduced-motion`.

---

## Responsive

| Breakpoint | Signal Grid | SpaceWeatherChain |
|------------|-------------|-------------------|
| Mobile (<640px) | 1 column | stacked list |
| Tablet (640–1024px) | 2×2 grid | 2×2 grid |
| Desktop (>1024px) | 2×2 grid | horizontal row |

About panel: full-width on mobile (`w-full`), 480px on desktop.

---

## Data Flow — What Changes vs What Stays

### Unchanged (do not touch)
- `app/services/` — all fetchers, normalizers, ingest scripts
- `app/db/` — schema, migrations, query helpers
- `app/types/signal.ts` — SignalRecord, all types
- `app/utils/signal-freshness.ts` — getSignalFreshness, freshnessStatusColor
- `app/routes/dashboard.tsx` loader function
- All interpret functions: `interpretXRayFlux`, `interpretWindSpeed`, `interpretKp`

### Changed
- `app/routes/dashboard.tsx` — component tree only (loader untouched)
- `app/app.css` — add @keyframes, CSS custom properties for animations
- All existing widget/dashboard components — replaced by new components

### New files
```
app/components/dashboard/DashboardNavbar.tsx
app/components/dashboard/DashboardHero.tsx
app/components/dashboard/DashboardSignalCard.tsx
app/components/dashboard/SpaceWeatherChain.tsx
app/components/dashboard/PipelineFooter.tsx
app/components/dashboard/AboutPanel.tsx
app/components/dashboard/EmptyDashboardState.tsx  ← replaces widgets/EmptyDashboardState.tsx
```

### Deleted (after all tests pass on the new components)
```
app/components/dashboard/InstrumentHeader.tsx
app/components/dashboard/InstrumentShell.tsx
app/components/dashboard/MissionStatusPanel.tsx
app/components/widgets/XRayFluxTelemetryPanel.tsx  (logic extracted, view deleted)
app/components/widgets/ProtonFluxTelemetryPanel.tsx
app/components/widgets/SolarWindPanel.tsx
app/components/widgets/KpTelemetryPanel.tsx
app/components/widgets/EmptyDashboardState.tsx
```

---

## Tests

### Keep (update if text changes)
- `KpScaleInstrument.test.tsx` — logic unchanged, minimal text updates
- `MissionStatusPanel.test.tsx` → replace with `PipelineFooter.test.tsx`
- `KpHistoryStrip.test.tsx` — logic unchanged
- `EmptyDashboardState.test.tsx` — update expected text

### New tests
- `DashboardSignalCard.test.tsx`:
  - renders value, status, freshness badge for each signal type
  - renders pending state with ingest instruction
  - renders correct accent color class per signal
- `AboutPanel.test.tsx`:
  - renders tech stack items
  - renders API sources
  - close button works
- `SpaceWeatherChain.test.tsx`:
  - renders all 4 steps
  - renders current value for each step

### Keep untouched (pure logic, no UI change)
- `ProtonFluxTelemetryPanel.test.tsx` → migrate to `DashboardSignalCard.test.tsx`
- `XRayFluxTelemetryPanel.test.tsx` → migrate to `DashboardSignalCard.test.tsx`
- `SolarWindPanel.test.tsx` → migrate to `DashboardSignalCard.test.tsx`
- `SignalCard.test.tsx` → keep or delete depending on whether SignalCard is still used

---

## ADR

Add to `docs/decisions.md`:

**ADR-026 — Dashboard full visual redesign (Phase 2M)**

Context: dashboard functioned correctly but felt generic — dense monospace grid with gap-px layout, no breathing room, no educational context for evaluators.

Decision: full component-layer redesign. Dark premium aesthetic with glass cards, large sans-serif display numbers, staggered entry animations, hover explanations, SpaceWeatherChain causal section, and AboutPanel slide-in drawer.

Constraints: loader and data pipeline unchanged. All interpret functions reused. No new npm dependencies — animations via CSS @keyframes only.

Outcome: /dashboard communicates the same data with premium visual quality matching the /cosmic-view identity. The About panel provides evaluator context without a separate route.

---

## Done When

- [ ] `/dashboard` loads with staggered card animations
- [ ] All 4 signal cards show real data with hover tooltip explanations
- [ ] SpaceWeatherChain section shows 4 steps with current values
- [ ] About panel opens/closes from navbar ⓘ button
- [ ] About panel shows: what it does, APIs, tech stack, test count
- [ ] Freshness badges show "Fresh · Xm ago" or "Stale · run ingest:all"
- [ ] Empty state shows calm instructional message with `npm run ingest:all`
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] `npx vitest run` passes (235+ tests)
- [ ] `/cosmic-view` untouched
- [ ] `prefers-reduced-motion` respected
- [ ] No `console.log` or `debugger` in committed code
