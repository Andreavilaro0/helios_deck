# HELIOS_DECK

[![CI](https://github.com/Andreavilaro0/helios_deck/actions/workflows/ci.yml/badge.svg)](https://github.com/Andreavilaro0/helios_deck/actions/workflows/ci.yml)

A fullstack web observatory for heliophysical and geophysical data.

Real signals. Real pipeline. No decorative demos.

---

## What It Does

HELIOS_DECK ingests live data from space weather APIs (NOAA SWPC), stores it in a local SQLite database, and presents it as a server-side-rendered dashboard. Every value on screen is a real measurement from a real instrument.

---

## Available Data Signals

| Signal | Role in causal chain | Source | Unit |
|--------|---------------------|--------|------|
| `kp-index` | Geomagnetic response — planetary K-index, 0–9 scale | NOAA SWPC | index |
| `solar-wind-speed` | Solar driver — bulk solar wind velocity at L1 | NOAA SWPC | km/s |
| `xray-flux-long` | Solar activity — GOES 0.1–0.8 nm, A/B/C/M/X classification | NOAA SWPC | W/m² |
| `proton-flux-10mev` | Solar activity — energetic particle context, ≥10 MeV channel | NOAA SWPC | pfu |

Causal chain: **Solar Activity** (X-Ray + Proton) → **Solar Driver** (Wind) → **Geomagnetic Response** (Kp)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend + SSR | React Router v7 |
| Language | TypeScript (strict) |
| Database | SQLite via `better-sqlite3` |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn _(Phase 2)_ |
| Visual premium | Magic UI _(Phase 5)_ |
| 3D view | Three.js / React Three Fiber _(Phase 5)_ |

---

## Project Status

**Current phase: 2H — demo ready**

Phases 1–2H complete. Four real NOAA signals are live end-to-end. Dashboard presents the full causal chain across three sections (Solar Activity → Solar Driver → Geomagnetic Response). The 3D Cosmic View shows a Kp-driven Earth with all four signal readouts in the HUD. A single `npm run ingest:all` command populates the local database.

See [`docs/plan.md`](docs/plan.md) for the full roadmap and [`docs/checkpoint-1.md`](docs/checkpoint-1.md) for the Phase 1 milestone summary.

---

## Quick Start

```bash
npm install
npm run ingest:all   # Fetch and store all four NOAA signals in one command
npm run dev          # Start dev server with HMR
```

Then open:
- **http://localhost:5173/dashboard** — multi-signal instrument console
- **http://localhost:5173/cosmic-view** — 3D Kp-driven Earth with HUD readouts

The dashboard shows the full causal chain — X-Ray Flux → Proton Flux → Solar Wind Speed → Kp Index — rendered server-side from SQLite. All four signals must be ingested at least once to see every panel populated. Panels show a pending state before first ingest.

**Individual signals** (alternative to `ingest:all`):

```bash
npm run ingest:noaa-kp            # Kp index
npm run ingest:noaa-solar-wind    # Solar wind speed
npm run ingest:noaa-xray-flux     # X-ray flux (short + long channels)
npm run ingest:noaa-proton-flux   # Proton flux (>=10 MeV)
```

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
npm run ingest:all                # Fetch all four signals in one command (recommended)

npm run ingest:noaa-kp            # NOAA SWPC real-time Kp index
npm run ingest:noaa-solar-wind    # NOAA SWPC real-time solar wind speed
npm run ingest:noaa-xray-flux     # NOAA SWPC GOES X-ray flux (both channels)
npm run ingest:noaa-proton-flux   # NOAA SWPC GOES integral proton flux (>=10 MeV)
```

Each command queries the corresponding NOAA SWPC endpoint, normalizes every entry into a `SignalRecord`, and persists new records to `data/helios.sqlite`. Duplicate entries (same timestamp, source, and signal) are skipped automatically.

`ingest:all` runs the four pipelines sequentially and prints a unified summary. `ingest:noaa-xray-flux` populates both `xray-flux-short` and `xray-flux-long` signals in a single run.

The local database lives at `data/helios.sqlite`. The `data/` directory is gitignored — the database is never committed.

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
| [`docs/architecture.md`](docs/architecture.md) | System architecture and deploy considerations |
| [`docs/data-contract.md`](docs/data-contract.md) | `SignalRecord` shape and normalizer contract |
| [`docs/api-sources.md`](docs/api-sources.md) | API source comparison and MVP recommendation |
| [`docs/decisions.md`](docs/decisions.md) | Technical decision log (ADRs) |
| [`docs/ai-usage.md`](docs/ai-usage.md) | AI tool usage policy and session log |
| [`docs/rubric-checklist.md`](docs/rubric-checklist.md) | Quality checklist for evaluation |
| [`docs/demo-checklist.md`](docs/demo-checklist.md) | Step-by-step local demo verification guide |

---

## Development Rules

See [`CLAUDE.md`](CLAUDE.md) for the full set of rules enforced during development, including data flow constraints, library discipline, and code quality standards.
