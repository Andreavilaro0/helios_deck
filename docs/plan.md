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
- **2A** — Solar wind speed pipeline (fetcher + normalizer + ingest + SQLite)
- **2B** — Solar wind UI panel (`SolarWindTelemetryPanel`, speed classification, pending state)
- **2C** — X-ray flux pipeline (GOES XRS both channels, flare classification A/B/C/M/X)
- **2D** — X-ray flux UI panel + CosmicHud XRAY readout
- **2E** — Proton flux pipeline (GOES ≥10 MeV, `proton-flux-10mev`)
- **2F** — Proton flux UI panel + 3-section dashboard (Solar Activity → Driver → Geomagnetic) + CosmicHud PROTON readout
- **2G** — Unified `npm run ingest:all` command (sequential, summary table, exit 1 on error)
- **2H** — Demo readiness: README signals table, cosmic-view URL, architecture doc update
- **2I** — Data freshness indicators (`getSignalFreshness`, per-signal thresholds, panel badges, HUD labels)
- **2J** — `/cosmic-view` R3F scene: Earth globe with GLSL day/night shader, Fresnel atmosphere, cloud layer, orbital ring
- **2K** — Living Planet Observatory visual system: 4 floating signal cards around planet, liquid-glass topbar/footer, UTC header, full-screen canvas, no Live Cloud Overlay
- **2L** — Final checkpoint: docs updated, ramas mergeadas, typecheck/build/tests verdes, screenshots, checkpoint-2.md

Done when: dashboard shows 4+ real signals with proper loading and error states, `/cosmic-view` renders the planet with all 4 live signals, and full QA checkpoint is complete. ✅

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
