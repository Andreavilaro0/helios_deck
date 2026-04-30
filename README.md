# HELIOS_DECK

A fullstack web observatory for heliophysical and geophysical data.

Real signals. Real pipeline. No decorative demos.

---

## What It Does

HELIOS_DECK ingests live data from space weather APIs (starting with NOAA SWPC), stores it in a local SQLite database, and presents it as a server-side-rendered dashboard. Every value on screen is a real measurement from a real instrument.

Signals tracked:
- Kp index (planetary geomagnetic activity)
- Solar wind speed and density
- X-ray flux (solar flare indicator)
- Proton flux

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend + SSR | React Router v7 |
| Language | TypeScript (strict) |
| Database | SQLite via `better-sqlite3` |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn |
| Visual premium (Phase 5) | Magic UI |
| 3D view (Phase 5) | Three.js / React Three Fiber |

---

## Project Status

**Current phase: 1G — CI with GitHub Actions**

See [`docs/plan.md`](docs/plan.md) for the full roadmap.

---

## Setup

```bash
npm install
```

### Development

```bash
npm run dev        # Dev server with HMR — http://localhost:5173
```

### Production

```bash
npm run build      # Compile for production
npm run start      # Serve the production build
```

### Type checking

```bash
npm run typecheck  # react-router typegen + tsc
```

> Run `typecheck` after adding routes or modifying loader return shapes.
> React Router generates route types automatically — never write them by hand.

### Database (Phase 1)

```bash
npm run db:migrate   # Run SQLite migrations
npm run ingest       # Fetch and store initial signal data
```

### Docker

```bash
docker build -t helios-deck .
docker run -p 3000:3000 helios-deck
```

---

## Data Flow

```
NOAA SWPC API
  └─ app/services/fetchers/noaa-swpc.server.ts   (raw HTTP)
       └─ app/services/normalizers/noaa-swpc.ts   (→ SignalRecordInput[])
            └─ app/services/ingest/noaa-kp.server.ts  (coordinator + dedup)
                 └─ app/services/signals.server.ts     (saveSignal → SQLite)
                      └─ app/routes/<page>.tsx          (loader reads DB)
                           └─ app/widgets/<Widget>.tsx  (renders SignalRecord[])
```

See [`docs/architecture.md`](docs/architecture.md) for the full diagram.

---

## Dashboard

```bash
npm run ingest:noaa-kp   # Populate the local database (first time or to refresh)
npm run dev              # Start dev server
# Open http://localhost:5173/dashboard
```

The dashboard shows the latest Kp index, a geomagnetic activity status
(Quiet / Active / Storm), and a 60-reading CSS sparkline. The loader reads from
the local SQLite file only — no external fetch on page load.

## Manual Ingestion

```bash
npm run ingest:noaa-kp
```

Queries the NOAA SWPC real-time Kp index endpoint, normalizes each entry into
a `SignalRecord`, and persists new records to `data/helios.sqlite`. Duplicate
entries (same timestamp, source, and signal) are skipped automatically.

---

## Documentation

| File | Purpose |
|------|---------|
| [`docs/plan.md`](docs/plan.md) | Phase-by-phase project plan |
| [`docs/architecture.md`](docs/architecture.md) | System architecture and layer diagram |
| [`docs/data-contract.md`](docs/data-contract.md) | `SignalRecord` shape and normalizer contract |
| [`docs/api-sources.md`](docs/api-sources.md) | API source comparison and MVP recommendation |
| [`docs/decisions.md`](docs/decisions.md) | Technical decision log (ADRs) |
| [`docs/ai-usage.md`](docs/ai-usage.md) | AI tool usage policy and session log |
| [`docs/rubric-checklist.md`](docs/rubric-checklist.md) | Quality checklist for evaluation |

---

## Quality Checks

```bash
npm run typecheck   # react-router typegen + tsc (strict mode)
npm run build       # production build (client + SSR)
npm test            # Vitest — unit and component tests
```

GitHub Actions runs these three checks automatically on every push and pull request. No secrets or external APIs are required — tests use an in-memory SQLite database and the ingest script is never executed in CI.

---

## Development Rules

See [`CLAUDE.md`](CLAUDE.md) for the full set of rules enforced during development, including data flow constraints, library discipline, and code quality standards.
