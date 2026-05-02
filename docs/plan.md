# HELIOS_DECK — Project Plan

## Principle

Walking skeleton first. Visual layer last.
Each phase must be committed and verifiable before the next begins.

---

## Phases

### Phase 0 — Documentation and Architecture ✅ COMPLETE
**Goal:** Establish shared understanding before writing a single line of application code.

Deliverables:
- `docs/plan.md` (this file)
- `docs/architecture.md`
- `docs/data-contract.md`
- `docs/api-sources.md`
- `docs/decisions.md`
- `docs/ai-usage.md`
- `docs/rubric-checklist.md`
- `CLAUDE.md`
- `README.md`
- `.gitignore`

Done when: all docs committed, no app code exists.

---

### Phase 1 — Walking Skeleton (one real signal end-to-end) ✅ COMPLETE
**Goal:** Prove the full data pipeline works with a single real API, a single signal, and a single widget.

Completed sub-phases:
- **1A** — React Router v7 + TypeScript scaffold, Tailwind CSS v4, project structure
- **1B** — `SignalRecord` type contract, NOAA fetcher, normalizer with unit tests
- **1C** — SQLite schema (`signals` table + composite indices), `openDb`/`getDb`, DB tests
- **1D** — Ingest coordinator (`noaa-kp.server.ts`), `saveSignal`, dedup, `IngestResult`
- **1E** — SSR loader for `/dashboard`, `SignalCard` widget, `KpHistoryBars` sparkline
- **1F** — Visual polish (Kp accent border, `text-5xl`, `<time dateTime>`), 7 component tests
- **1G** — GitHub Actions CI (typecheck + build + test on push/PR, green in 37s)
- **1H** — Checkpoint documentation, deploy strategy analysis (this phase)

Done when: visiting `/dashboard` shows a real Kp value fetched from NOAA, stored in SQLite, rendered server-side, with CI passing. ✅

See [`docs/checkpoint-1.md`](checkpoint-1.md) for the full milestone summary.

---

### Phase 2 — Base Dashboard ✅ COMPLETE
**Goal:** Add more signals and a coherent dashboard layout.

Completed sub-phases:
- **2A** — Solar wind speed pipeline: fetcher, normalizer, ingest coordinator, tests
- **2B** — Solar wind speed UI: `SolarWindPanel`, dashboard integration, CosmicHud secondary readout
- **2C** — X-ray flux pipeline: GOES endpoint, dual-channel normalizer (`xray-flux-short` / `xray-flux-long`), tests
- **2D** — X-ray flux UI: `XRayFluxTelemetryPanel`, A/B/C/M/X classification, CosmicHud XRAY readout
- **2E** — Proton flux pipeline: GOES ≥10 MeV channel, `proton-flux-10mev` signal, tests
- **2F** — Proton flux UI: `ProtonFluxTelemetryPanel`, three-section dashboard layout (Solar Activity → Solar Driver → Geomagnetic Response), CosmicHud PROTON readout
- **2G** — Unified ingest: `npm run ingest:all` script, sequential pipeline runner, unified summary
- **2H** — Demo readiness: updated README, demo checklist, plan and architecture docs updated

Signals live end-to-end: `kp-index`, `solar-wind-speed`, `xray-flux-long`, `proton-flux-10mev`.
Dashboard and Cosmic View both present the full four-signal causal chain.
213 tests passing (17 files). CI green.

Done when: dashboard shows 4+ real signals with proper loading and error states. ✅

---

### Phase 3 — Real-time Layer
**Goal:** Add WebSocket updates so signals refresh without full page reload.

Deliverables:
- Server-side WebSocket handler
- Client-side WebSocket hook (`app/hooks/useSignalStream.ts`)
- Widgets update in-place on new data
- Graceful fallback to polling if WebSocket connection fails

Done when: a new Kp value from NOAA updates the widget without a page reload.

---

### Phase 4 — Auth and User Dashboards
**Goal:** Allow users to configure which signals they track.

Deliverables:
- Auth (session-based, no OAuth for MVP)
- `users` table in SQLite
- Per-user widget preferences stored in DB
- `/dashboard/:userId` protected route
- Login / logout flow

Done when: two different users can log in and see different dashboard configurations.

---

### Phase 5 — Visual Premium Layer
**Goal:** Add the visual quality expected of a professional observatory.

Deliverables:
- Magic UI components replacing raw shadcn cards where appropriate
- `/cosmic-view` route with Three.js / React Three Fiber solar system visualization
- Dark mode (system preference + manual toggle)
- Micro-animations on signal updates (only where meaningful)
- Typography and color system documented in `docs/design-system.md`

Done when: project looks portfolio-ready without sacrificing the data integrity from Phase 2.

---

### Phase 6 — Production, Testing, and Deploy
**Goal:** Ship and defend it.

Deliverables:
- Vitest unit tests for all normalizers and DB helpers
- Playwright e2e test for the main dashboard flow
- Lighthouse score ≥ 90 on Performance, Accessibility, Best Practices
- Deploy to a Node-compatible host with persistent disk (Fly.io, Railway, or Render)
- `docs/rubric-checklist.md` fully checked
- Final `docs/ai-usage.md` entry

Done when: deployed URL is live and all checklist items are green.

See `docs/architecture.md` § Deployment Considerations for the deploy strategy analysis.
