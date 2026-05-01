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

**Current phase: 2D — X-ray flux UI integration complete**

Phases 1–2D complete. Three real NOAA signals are live end-to-end: Kp index, solar wind speed, and X-ray flux. Dashboard shows the full causal chain (XRay → Wind → Kp). CosmicHud overlays all three readouts in the 3D view.

See [`docs/plan.md`](docs/plan.md) for the full roadmap and [`docs/checkpoint-1.md`](docs/checkpoint-1.md) for the Phase 1 milestone summary.

---

## Quick Start

```bash
npm install
npm run ingest:noaa-kp           # Fetch and store real NOAA Kp data
npm run ingest:noaa-solar-wind   # Fetch and store real solar wind speed
npm run ingest:noaa-xray-flux    # Fetch and store GOES X-ray flux (both channels)
npm run dev                      # Start dev server with HMR
```

Then open: **http://localhost:5173/dashboard**

The dashboard shows the causal chain from X-ray flux → solar wind speed → Kp index, all rendered server-side from SQLite. Run at least `ingest:noaa-kp` to populate the Kp panel; the X-ray panel shows a pending state if no flux data has been ingested yet.

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
npm run ingest:noaa-kp           # NOAA SWPC real-time Kp index
npm run ingest:noaa-solar-wind   # NOAA SWPC real-time solar wind speed
npm run ingest:noaa-xray-flux    # NOAA SWPC GOES X-ray flux (both channels)
```

Each command queries the corresponding NOAA SWPC endpoint, normalizes every entry into a `SignalRecord`, and persists new records to `data/helios.sqlite`. Duplicate entries (same timestamp, source, and signal) are skipped automatically.

Run at least `ingest:noaa-kp` once before `npm run dev` to populate the dashboard. `ingest:noaa-xray-flux` populates both `xray-flux-short` and `xray-flux-long` signals in a single run.

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

---

## Development Rules

See [`CLAUDE.md`](CLAUDE.md) for the full set of rules enforced during development, including data flow constraints, library discipline, and code quality standards.
