# HELIOS_DECK

[![CI](https://github.com/Andreavilaro0/helios_deck/actions/workflows/ci.yml/badge.svg)](https://github.com/Andreavilaro0/helios_deck/actions/workflows/ci.yml)

A fullstack web observatory for heliophysical and geophysical data.

Real signals. Real pipeline. No decorative demos.

---

## What It Does

HELIOS_DECK ingests live data from space weather APIs (starting with NOAA SWPC), stores it in a local SQLite database, and presents it as a server-side-rendered dashboard. Every value on screen is a real measurement from a real instrument.

Signals tracked:
- Kp index (planetary geomagnetic activity)
- Solar wind speed and density _(Phase 2)_
- X-ray flux (solar flare indicator) _(Phase 2)_
- Proton flux _(Phase 2)_

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

**Current phase: 1H — Checkpoint and deploy strategy**

Walking skeleton complete: NOAA SWPC real data flows end-to-end through fetcher → normalizer → SQLite → SSR loader → dashboard → component tests → CI.

See [`docs/plan.md`](docs/plan.md) for the full roadmap and [`docs/checkpoint-1.md`](docs/checkpoint-1.md) for the Phase 1 milestone summary.

---

## Quick Start

```bash
npm install
npm run ingest:noaa-kp   # Fetch and store real NOAA Kp data
npm run dev              # Start dev server with HMR
```

Then open: **http://localhost:5173/dashboard**

The dashboard shows the latest Kp index, a geomagnetic activity status (Quiet / Active / Storm), confidence rating, and a 60-reading CSS sparkline — all rendered server-side from SQLite.

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
npm run ingest:noaa-kp
```

Queries the NOAA SWPC real-time Kp index endpoint, normalizes each entry into a `SignalRecord`, and persists new records to `data/helios.sqlite`. Duplicate entries (same timestamp, source, and signal) are skipped automatically.

Run this once before `npm run dev` to populate the dashboard, then re-run whenever you want fresh data.

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
