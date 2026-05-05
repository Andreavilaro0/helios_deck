# HELIOS_DECK

[![CI](https://github.com/Andreavilaro0/helios_deck/actions/workflows/ci.yml/badge.svg)](https://github.com/Andreavilaro0/helios_deck/actions/workflows/ci.yml)

A fullstack web observatory for heliophysical and geophysical data.

Real signals. Real pipeline. No decorative demos.

---

## What It Does

HELIOS_DECK ingests live data from space weather APIs (starting with NOAA SWPC), stores it in a local SQLite database, and presents it as a server-side-rendered dashboard. Every value on screen is a real measurement from a real instrument.

Signals tracked:
- **Kp index** — planetary geomagnetic activity (NOAA SWPC)
- **Solar wind speed** — bulk solar wind velocity (NOAA SWPC)
- **X-ray flux (long channel)** — GOES 0.1–0.8 nm, A/B/C/M/X flare classification (NOAA SWPC)
- **Proton flux (≥10 MeV)** — energetic particle flux, radiation storm context (NOAA SWPC)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend + SSR | React Router v7 |
| Language | TypeScript (strict) |
| Database | SQLite via `better-sqlite3` |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn _(Phase 2)_ |
| Visual premium | Magic UI / custom glass system |
| 3D view | Three.js / React Three Fiber (cosmic-view) |

---

## Project Status

**Current phase: 2L — Final checkpoint ✅**

Phase 2 complete (2A–2L). Four real NOAA signals are live end-to-end: Kp index, solar wind speed, X-ray flux, and proton flux. The dashboard shows the full causal chain (Solar Activity → Solar Driver → Geomagnetic Response). `/cosmic-view` renders the Living Planet Observatory: a full-screen 3D Earth globe with GLSL shaders, Fresnel atmosphere, and 4 floating signal cards with freshness indicators.

### Available Data Signals

| Signal | Source | Unit | Dashboard Panel | Refresh Cadence |
|--------|--------|------|-----------------|-----------------|
| Kp index | NOAA SWPC | index | Geomagnetic Response | 3 h |
| Solar wind speed | NOAA SWPC | km/s | Solar Driver | ~1 min (DSCOVR) |
| X-ray flux (0.1–0.8 nm) | NOAA GOES | W/m² | Solar Activity | ~1 min |
| Proton flux (≥10 MeV) | NOAA GOES | pfu | Solar Activity | ~1 min |

See [`docs/plan.md`](docs/plan.md) for the full roadmap, [`docs/checkpoint-1.md`](docs/checkpoint-1.md) for the Phase 1 milestone summary, and [`docs/checkpoint-2.md`](docs/checkpoint-2.md) for the Phase 2 final state.

---

## Quick Start

```bash
npm install
npm run ingest:all   # Fetch all four NOAA signals in one command
npm run dev          # Start dev server with HMR
```

Then open:
- **http://localhost:5173/dashboard** — instrument console with causal chain layout
- **http://localhost:5173/cosmic-view** — 3D Earth with live Kp field overlay

> **If panels show "STALE":** run `npm run ingest:all` to refresh all signals from NOAA. Freshness thresholds: Kp 3 h, solar wind 1 h, X-ray 30 min, proton flux 1 h.

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

GitHub Actions runs these three checks automatically on every push and pull request. No secrets or external APIs are required — tests use an in-memory SQLite database and the ingest script is never executed in CI.

---

## Manual Ingestion

```bash
npm run ingest:all                # All four signals in one command (recommended)

# Or individually:
npm run ingest:noaa-kp            # NOAA SWPC real-time Kp index
npm run ingest:noaa-solar-wind    # NOAA SWPC real-time solar wind speed
npm run ingest:noaa-xray-flux     # NOAA SWPC GOES X-ray flux (both channels)
npm run ingest:noaa-proton-flux   # NOAA SWPC GOES integral proton flux (>=10 MeV)
```

Each command queries the corresponding NOAA SWPC endpoint, normalizes every entry into a `SignalRecord`, and persists new records to `data/helios.sqlite`. Duplicate entries (same timestamp, source, and signal) are skipped automatically.

`ingest:all` runs all four pipelines sequentially and prints a summary table. It exits with code 1 if any signal fails, code 0 if all succeed. Run at least once before `npm run dev` to populate the dashboard.

---

## Data Flow

```
NOAA SWPC API
  └─ app/services/fetchers/noaa-swpc.server.ts   (raw HTTP)
       └─ app/services/normalizers/noaa-swpc.ts   (→ SignalRecordInput[])
            └─ app/services/ingest/noaa-kp.server.ts  (coordinator + dedup)
                 └─ app/services/signals.server.ts     (saveSignal → SQLite)
                      └─ app/routes/dashboard.tsx       (loader reads DB)
                           └─ app/components/widgets/SignalCard.tsx
```

See [`docs/architecture.md`](docs/architecture.md) for the full diagram.

---

## Documentation

| File | Purpose |
|------|---------|
| [`docs/plan.md`](docs/plan.md) | Phase-by-phase project plan |
| [`docs/checkpoint-1.md`](docs/checkpoint-1.md) | Phase 1 walking skeleton milestone |
| [`docs/checkpoint-2.md`](docs/checkpoint-2.md) | Phase 2 final state — all 4 signals + cosmic-view |
| [`docs/architecture.md`](docs/architecture.md) | System architecture and deploy considerations |
| [`docs/data-contract.md`](docs/data-contract.md) | `SignalRecord` shape and normalizer contract |
| [`docs/api-sources.md`](docs/api-sources.md) | API source comparison and MVP recommendation |
| [`docs/decisions.md`](docs/decisions.md) | Technical decision log (ADRs) |
| [`docs/ai-usage.md`](docs/ai-usage.md) | AI tool usage policy and session log |
| [`docs/rubric-checklist.md`](docs/rubric-checklist.md) | Quality checklist for evaluation |

---

## Development Rules

See [`CLAUDE.md`](CLAUDE.md) for the full set of rules enforced during development, including data flow constraints, library discipline, and code quality standards.
