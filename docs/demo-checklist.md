# HELIOS_DECK — Demo Checklist

Use before any live evaluation or demo. Each section maps to a grading criterion.

---

## 1. Pre-demo Setup

- [ ] `npm install` — dependencies are up to date
- [ ] `npm run ingest:all` — all four signals are populated in SQLite
- [ ] `npm run dev` — dev server starts without errors on port 5173
- [ ] `data/helios.sqlite` exists and is **not** in git (`.gitignore` covers `data/`)

---

## 2. Dashboard Route (`/dashboard`)

- [ ] Page loads without errors or blank panels
- [ ] **Kp index** panel shows a numeric value, unit "index", and QUIET/ACTIVE/STORM status
- [ ] **Solar Wind** panel shows a speed in km/s and CALM/ELEVATED/HIGH SPEED STREAM status
- [ ] **X-Ray Flux** panel shows a value in W/m² in scientific notation and A/B/C/M/X class
- [ ] **Proton Flux** panel shows a value in pfu and QUIET/ELEVATED/RADIATION WATCH status
- [ ] All four panels show a DATA AGE row with FRESH or STALE badge
- [ ] Kp history strip renders a bar chart at the bottom
- [ ] Section labels "Solar Activity", "Solar Driver", "Geomagnetic Response" are visible
- [ ] Causal-chain layout: XRay+Proton | Wind | Kp+Scale+Status

---

## 3. Cosmic View Route (`/cosmic-view`) — Living Planet Observatory

- [ ] Page loads and renders the full-screen 3D Earth globe with GLSL day/night shader
- [ ] Planet has Fresnel atmosphere rim glow and animated cloud layer
- [ ] 4 floating signal cards are positioned around the planet (top-left, top-right, bottom-left, bottom-right)
- [ ] X-Ray Flux card shows flux value, flare class, sparkline, and FRESH/STALE badge
- [ ] Proton Flux card shows value, QUIET/ELEVATED status, sparkline, and FRESH/STALE badge
- [ ] Solar Wind card shows speed, CALM/ELEVATED classification, sparkline, and FRESH/STALE badge
- [ ] Kp Index card shows index value, QUIET/ACTIVE/STORM status, bar chart, and FRESH/STALE badge
- [ ] Liquid-glass topbar shows HELIOS_DECK logo, source badges (NOAA SWPC, UTC, SQLITE, SSR, FRESH)
- [ ] UTC timestamp and "Real-time Space Weather Overview" subtitle are visible
- [ ] Bottom status bar shows DATA INGESTED, FRESHNESS, DATA SOURCE, PIPELINE, SYSTEM STATUS
- [ ] Navigation link "← dashboard" returns to the dashboard
- [ ] No Live Cloud Overlay (removed in Phase 2K)

---

## 4. If You See STALE Badges

STALE badges are **expected behavior**, not a bug. They mean the ingest script has not been run recently enough relative to the per-signal freshness threshold.

**To restore fresh data:**

```bash
npm run ingest:all        # fetch all four signals from NOAA (~10–30 s)
```

Then **hard-reload the browser** (`Cmd+Shift+R` on macOS, `Ctrl+Shift+R` on Windows/Linux) to force the SSR loader to re-read the updated SQLite rows.

**Why there is no auto-refresh:**
The loader never triggers ingest automatically — see ADR-012 and ADR-025. Loaders are read-only: they read SQLite and return data. Ingest is an explicit operator action. This keeps page load latency predictable and keeps the pipeline stages separate and testable.

**Freshness thresholds** (STALE appears when data is older than):

| Signal | Threshold |
|--------|-----------|
| Kp index | 180 min (Kp is published every 3 h by NOAA) |
| Solar wind speed | 60 min |
| X-ray flux | 30 min |
| Proton flux | 60 min |

**In a future production deployment** a cron job or external worker would call `npm run ingest:all` automatically. That infrastructure is out of scope for this academic phase — see ADR-025.

---

## 6. Pending State (no data ingested)

- [ ] Remove or rename `data/helios.sqlite`, restart server
- [ ] Dashboard shows `EmptyDashboardState` (no data, not a crash)
- [ ] Restore SQLite and re-run `npm run ingest:all`

---

## 7. Data Pipeline

- [ ] `npm run ingest:all` prints a summary table with fetched/saved/skipped/errors per signal
- [ ] Running `ingest:all` a second time shows `saved=0 skipped=N` (deduplication working)
- [ ] No secrets or credentials appear in any output

---

## 8. Code Quality Checks

- [ ] `npm run typecheck` exits 0 (no TypeScript errors)
- [ ] `npm run build` exits 0 (production build succeeds)
- [ ] `npm test` exits 0 (all tests pass)
- [ ] No `console.log` or `debugger` in source files
- [ ] `data/helios.sqlite` is not tracked by git (`git status` should not show it)

---

## 9. Architecture Walkthrough (verbal)

Be ready to explain:
- [ ] Why loaders run on the server and no `fetch` exists in components
- [ ] How `SignalRecord` flows from fetcher → normalizer → SQLite → loader → component
- [ ] Why `ingest:all` is sequential, not parallel
- [ ] What each freshness threshold represents (Kp 3 h cadence, XRS 30 min, etc.)
- [ ] How the 3D Earth knows the current Kp value
- [ ] Why STALE badges appear and what the correct response is (`npm run ingest:all` + hard reload)
- [ ] Why the loader does not auto-ingest stale data (ADR-012 / ADR-025)

---

## 10. Tests Coverage

- [ ] `app/utils/signal-freshness.test.ts` — pure function tests for all signal thresholds
- [ ] `app/components/widgets/ProtonFluxTelemetryPanel.test.tsx` — pending + active + status labels
- [ ] `app/components/widgets/XRayFluxTelemetryPanel.test.tsx` — pending + active + flare class
- [ ] `app/components/cosmic/CosmicHud.test.tsx` — XRAY/PROTON/WIND readouts + freshness
- [ ] CI badge is green on `main`

---

## 11. Documentation Completeness

- [ ] `docs/decisions.md` has ADR-001 through ADR-025
- [ ] `docs/plan.md` shows Phase 2 ✅ COMPLETE with 2A–2L sub-phases listed
- [ ] `docs/checkpoint-2.md` exists and summarises current project state
- [ ] `docs/architecture.md` reflects the four-signal pipeline
- [ ] `docs/data-contract.md` matches the `SignalRecord` type in `app/types/signal.ts`
- [ ] `README.md` lists all four signals and both route URLs
