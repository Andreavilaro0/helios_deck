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

## 3. Cosmic View Route (`/cosmic-view`)

- [ ] Page loads and renders the 3D Earth globe
- [ ] CosmicHud bottom panel shows Kp value and QUIET/ACTIVE/STORM status
- [ ] XRAY readout shows flux value, flare class, and FRESH/STALE
- [ ] PROTON readout shows value and QUIET/ELEVATED/RADIATION WATCH and FRESH/STALE
- [ ] WIND readout shows speed, classification, and FRESH/STALE
- [ ] Navigation link "← dashboard" returns to the dashboard
- [ ] 3D scene responds to Kp value (field overlay, glow color)

---

## 4. Pending State (no data ingested)

- [ ] Remove or rename `data/helios.sqlite`, restart server
- [ ] Dashboard shows `EmptyDashboardState` (no data, not a crash)
- [ ] Restore SQLite and re-run `npm run ingest:all`

---

## 5. Data Pipeline

- [ ] `npm run ingest:all` prints a summary table with fetched/saved/skipped/errors per signal
- [ ] Running `ingest:all` a second time shows `saved=0 skipped=N` (deduplication working)
- [ ] No secrets or credentials appear in any output

---

## 6. Code Quality Checks

- [ ] `npm run typecheck` exits 0 (no TypeScript errors)
- [ ] `npm run build` exits 0 (production build succeeds)
- [ ] `npm test` exits 0 (all tests pass)
- [ ] No `console.log` or `debugger` in source files
- [ ] `data/helios.sqlite` is not tracked by git (`git status` should not show it)

---

## 7. Architecture Walkthrough (verbal)

Be ready to explain:
- [ ] Why loaders run on the server and no `fetch` exists in components
- [ ] How `SignalRecord` flows from fetcher → normalizer → SQLite → loader → component
- [ ] Why `ingest:all` is sequential, not parallel
- [ ] What each freshness threshold represents (Kp 3 h cadence, XRS 30 min, etc.)
- [ ] How the 3D Earth knows the current Kp value

---

## 8. Tests Coverage

- [ ] `app/utils/signal-freshness.test.ts` — pure function tests for all signal thresholds
- [ ] `app/components/widgets/ProtonFluxTelemetryPanel.test.tsx` — pending + active + status labels
- [ ] `app/components/widgets/XRayFluxTelemetryPanel.test.tsx` — pending + active + flare class
- [ ] `app/components/cosmic/CosmicHud.test.tsx` — XRAY/PROTON/WIND readouts + freshness
- [ ] CI badge is green on `main`

---

## 9. Documentation Completeness

- [ ] `docs/decisions.md` has ADR-001 through ADR-024
- [ ] `docs/plan.md` shows Phase 2 ✅ COMPLETE with 2A–2I sub-phases listed
- [ ] `docs/architecture.md` reflects the four-signal pipeline
- [ ] `docs/data-contract.md` matches the `SignalRecord` type in `app/types/signal.ts`
- [ ] `README.md` lists all four signals and both route URLs
