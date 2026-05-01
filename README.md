# HELIOS_DECK

[![CI](https://github.com/Andreavilaro0/helios_deck/actions/workflows/ci.yml/badge.svg)](https://github.com/Andreavilaro0/helios_deck/actions/workflows/ci.yml)

A fullstack web observatory for heliophysical and geophysical data.

Real signals. Real pipeline. No decorative demos.

---

## What It Does

HELIOS_DECK ingests live data from space weather APIs (starting with NOAA SWPC), stores it in a local SQLite database, and presents it as a server-side-rendered dashboard. Every value on screen is a real measurement from a real instrument.

Signals tracked:
- **Kp index** — planetary geomagnetic activity (0–9 scale)
- **Solar wind speed** — bulk solar wind speed from DSCOVR spacecraft (km/s)
- Solar wind density, X-ray flux, proton flux _(Phase 3 — planned)_

The dashboard explains a basic space weather relationship:
**Solar wind speed** (incoming solar driver) → **Kp index** (Earth's geomagnetic response).

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend + SSR | React Router v7 |
| Language | TypeScript (strict) |
| Database | SQLite via `better-sqlite3` |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn |
| 3D view | Three.js / React Three Fiber (`/cosmic-view`) |

---

## Project Status

**Current phase: 2B — Solar wind speed UI**

Phase 2A added the full solar wind speed pipeline (fetcher → normalizer → SQLite → ingest script).
Phase 2B integrates both signals into the dashboard and Cosmic View HUD.

See [`docs/plan.md`](docs/plan.md) for the full roadmap.

---

## Quick Start

```bash
npm install
npm run ingest:noaa-kp            # Fetch and store real NOAA Kp data
npm run ingest:noaa-solar-wind    # Fetch and store real NOAA solar wind speed
npm run dev                       # Start dev server with HMR
```

Then open: **http://localhost:5173/dashboard**

The dashboard shows four instrument panels:
- **Kp Index** — latest geomagnetic activity reading with QUIET / ACTIVE / STORM status
- **Solar Wind Speed** — latest solar wind reading with CALM / ELEVATED / HIGH SPEED STREAM status
- **Kp Scale** — visual zone track showing where the current Kp falls (0–9)
- **Mission Status** — pipeline diagram and session stats (max, min, avg Kp)

Below all panels: a 60-reading CSS sparkline of recent Kp history.

If `ingest:noaa-solar-wind` has not been run yet, the Solar Wind panel shows a pending state with the ingest instruction — it does not invent data.

---

## Development

```bash
npm run dev        # Dev server with HMR — http://localhost:5173
npm run start      # Serve the production build
```

---

## Quality Checks

```bash
npm run typecheck   # react-router typegen + tsc (strict mode)
npm run build       # Production build (client + SSR)
npm test            # Vitest — unit and component tests
```

GitHub Actions runs these three checks automatically on every push and pull request. No secrets or external APIs are required — tests use an in-memory SQLite database and the ingest scripts are never executed in CI.

---

## Manual Ingestion

```bash
npm run ingest:noaa-kp           # NOAA SWPC real-time Kp index
npm run ingest:noaa-solar-wind   # NOAA SWPC real-time solar wind speed (DSCOVR)
```

Each command queries the corresponding NOAA SWPC endpoint, normalizes every entry into a `SignalRecord`, and persists new records to `data/helios.sqlite`. Duplicate entries (same timestamp, source, and signal) are skipped automatically.

Run both commands before `npm run dev` to see the full dashboard. Running only `ingest:noaa-kp` shows Kp data with the solar wind panel in its pending state.

---

## Data Flow

```
NOAA SWPC API
  └─ app/services/fetchers/noaa-swpc.server.ts     (raw HTTP)
       └─ app/services/normalizers/noaa-swpc.ts     (→ SignalRecordInput[])
            └─ app/services/ingest/noaa-*.server.ts  (coordinator + dedup)
                 └─ app/services/signals.server.ts   (saveSignal → SQLite)
                      └─ app/routes/dashboard.tsx     (loader reads DB)
                           ├─ KpTelemetryPanel         (Kp readout)
                           └─ SolarWindTelemetryPanel  (Solar wind readout)
```

See [`docs/architecture.md`](docs/architecture.md) for the full diagram.

---

## Documentation

| File | Purpose |
|------|---------|
| [`docs/plan.md`](docs/plan.md) | Phase-by-phase project plan |
| [`docs/checkpoint-1.md`](docs/checkpoint-1.md) | Phase 1 walking skeleton milestone |
| [`docs/architecture.md`](docs/architecture.md) | System architecture and deploy considerations |
| [`docs/data-contract.md`](docs/data-contract.md) | `SignalRecord` shape and normalizer contract |
| [`docs/api-sources.md`](docs/api-sources.md) | API source comparison and MVP recommendation |
| [`docs/decisions.md`](docs/decisions.md) | Technical decision log (ADRs) |
| [`docs/ai-usage.md`](docs/ai-usage.md) | AI tool usage policy and session log |
| [`docs/rubric-checklist.md`](docs/rubric-checklist.md) | Quality checklist for evaluation |

---

## Development Rules

See [`CLAUDE.md`](CLAUDE.md) for the full set of rules enforced during development, including data flow constraints, library discipline, and code quality standards.
