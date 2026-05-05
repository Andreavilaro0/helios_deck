# HELIOS_DECK — Checkpoint 2

**Date:** 2026-05-05  
**Phase:** 2L — Final checkpoint  
**Branch:** `main`  
**Commit:** see `git log --oneline -1`

---

## Project State

Phase 2 is complete. The project has a working fullstack space-weather observatory with:
- A server-side-rendered instrument dashboard at `/dashboard`
- A 3D Living Planet Observatory at `/cosmic-view`
- Four real NOAA signals ingested manually via `npm run ingest:all`
- Per-signal freshness indicators throughout both views
- 235 passing tests across 18 test files, CI green

---

## Supported Signals

| Signal | Key | Source | Unit | Freshness threshold |
|--------|-----|--------|------|---------------------|
| Kp index | `kp-index` | NOAA SWPC | index | 180 min (3 h cadence) |
| Solar wind speed | `solar-wind-speed` | NOAA SWPC / DSCOVR | km/s | 60 min |
| X-ray flux (long) | `xray-flux-long` | NOAA GOES XRS | W/m² | 30 min |
| Proton flux ≥10 MeV | `proton-flux-10mev` | NOAA GOES | pfu | 60 min |

---

## Demo Commands

```bash
# 1. Install dependencies
npm install

# 2. Ingest all four signals from NOAA (~10–30 s, requires internet)
npm run ingest:all

# 3. Start dev server
npm run dev

# 4. Open in browser
#   http://localhost:5173/dashboard    — instrument console
#   http://localhost:5173/cosmic-view  — Living Planet Observatory (3D)

# 5. Quality checks
npm run typecheck   # react-router typegen + tsc strict — PASS
npm run build       # production build — PASS
npm test            # vitest — 235/235 PASS
```

---

## Architecture

### Data Flow

```
NOAA SWPC API
  └─ app/services/fetchers/noaa-swpc.server.ts      (raw HTTP, no logic)
       └─ app/services/normalizers/noaa-swpc.ts      (→ SignalRecord[])
            └─ app/services/ingest/*.server.ts        (dedup + save coordinator)
                 └─ app/services/signals.server.ts    (saveSignal → SQLite)
                      └─ app/routes/dashboard.tsx     (SSR loader, read-only)
                           └─ app/widgets/*           (pure render, no fetch)
```

The cosmic-view loader follows the same pattern: reads SQLite, passes data as props to `CosmicViewClient` (client-only boundary for Three.js).

### Key Architectural Constraints

- **No fetch in components.** All data flows through React Router loaders.
- **No auto-ingest.** Loaders are read-only. Ingest is an explicit operator action (ADR-012, ADR-025).
- **No Three.js outside `/cosmic-view`.** R3F is isolated behind a dynamic import.
- **No new dependencies** added in Phase 2K/2L beyond what the build already included.

### Freshness System

`app/utils/signal-freshness.ts` exports `getSignalFreshness(signal, observedAt)`, which returns `"FRESH"` or `"STALE"` based on per-signal thresholds. Called in loaders; badge rendered in panel widgets and Observatory cards.

---

## Routes

| Route | Rendering | Description |
|-------|-----------|-------------|
| `/` | SSR | Home / landing |
| `/dashboard` | SSR | Instrument console, 4-signal causal chain layout |
| `/cosmic-view` | SSR shell + CSR 3D | Living Planet Observatory |

---

## Tests

- **18 test files, 235 tests, 0 failures**
- Pure function tests: signal freshness, normalizers, DB helpers
- Component tests: `SignalCard`, `KpHistoryBars`, `SolarWindTelemetryPanel`, `XRayFluxTelemetryPanel`, `ProtonFluxTelemetryPanel`, `CosmicHud`
- No mocked DB — tests use in-memory SQLite
- No Playwright e2e (deferred to Phase 6)

---

## CI

GitHub Actions (`.github/workflows/ci.yml`):
- Triggers on push and pull request to `main`
- Steps: `npm ci` → `typecheck` → `build` → `npx vitest run`
- No secrets, no external API calls in CI
- Badge: `[![CI](https://github.com/Andreavilaro0/helios_deck/actions/workflows/ci.yml/badge.svg)](https://github.com/Andreavilaro0/helios_deck/actions/workflows/ci.yml)`

---

## Key Decisions

| ADR | Decision |
|-----|----------|
| ADR-001 | React Router v7 SSR over Next.js — explicit loader data flow |
| ADR-004 | Three.js isolated to `/cosmic-view` route only |
| ADR-012 | Loaders are read-only; no side effects on render |
| ADR-024 | Per-signal freshness thresholds; STALE badge is correct behavior |
| ADR-025 | No automatic ingestion; manual ingest is the intentional model |

Full decision log: `docs/decisions.md` (ADR-001 through ADR-025).

---

## Assets and Licensing

All third-party assets are documented in `docs/credits.md`:

- **Earth textures**: Solar System Scope, CC BY 4.0 © Inove
- **Fresnel atmosphere shader**: adapted from bobbyroe/threejs-earth (MIT)
- **Visual inspiration**: Atlas26 by Abdul Wasay Khan (MIT) — concept only, no code or assets copied

---

## What Is NOT Included

- No WebSocket / real-time updates (Phase 3, deferred)
- No user authentication or per-user dashboards (Phase 4, deferred)
- No automatic cron-based ingest (ADR-025)
- No Playwright e2e tests (Phase 6)
- No production deployment (Phase 6)
- No dark/light mode toggle (shadcn theming available but not wired to a user preference toggle)

---

## Known Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| NOAA API changes response format | Medium | Normalizer tests catch shape drift; `unknown` + type narrowing at boundary |
| SQLite file absent at startup | Low | `EmptyDashboardState` shown; no crash |
| CosmicViewClient chunk size (918 KB) | Low | Expected for Three.js scene; gzip brings to ~245 KB; deferred code-split |
| macOS-only texture path assumptions | Low | Textures are in `public/textures/`; standard static serving |
| Safari WebGL performance | Low | Tested and functional; no known issue |

---

## Suggested Next Steps (Phase 3+)

1. **Phase 3 — WebSocket / SSE layer**: push new signal readings to the browser without a full page reload. Candidate: Server-Sent Events (simpler than WS for one-directional flow).
2. **Lighthouse audit**: run `npm run build && npm start` and check Performance/Accessibility score. CosmicViewClient may need code-splitting.
3. **Phase 6 deploy**: Fly.io or Railway for a persistent-disk Node host. `data/helios.sqlite` needs a volume mount or migration to Turso.
4. **Playwright e2e**: smoke test for `/dashboard` load + signal count (can run against `npm start`).

---

*See `docs/checkpoint-1.md` for the Phase 1 milestone record.*
