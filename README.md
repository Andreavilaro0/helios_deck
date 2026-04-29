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
| Language | JavaScript (ES modules) |
| Database | SQLite via `better-sqlite3` |
| Styling | Tailwind CSS v4 |
| UI primitives | shadcn |
| Visual premium (Phase 5) | Magic UI |
| 3D view (Phase 5) | Three.js / React Three Fiber |

---

## Project Status

**Current phase: 0 — Documentation and Architecture**

See [`docs/plan.md`](docs/plan.md) for the full roadmap.

---

## Setup (Phase 1 onwards)

> Phase 0 contains only documentation. The React app scaffold will be created at the start of Phase 1.

```bash
# Install dependencies (Phase 1)
npm install

# Run development server
npm run dev

# Run database migrations
npm run db:migrate

# Ingest initial data
npm run ingest
```

---

## Data Flow

```
NOAA SWPC API
  └─ app/services/fetchers/noaa.js
       └─ app/services/normalizers/noaa.js  →  SignalRecord
            └─ app/db/signals.js  (SQLite)
                 └─ app/routes/dashboard.jsx  (loader)
                      └─ KpIndexWidget, SolarWindWidget, ...
```

See [`docs/architecture.md`](docs/architecture.md) for the full diagram.

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

## Development Rules

See [`CLAUDE.md`](CLAUDE.md) for the full set of rules enforced during development, including data flow constraints, library discipline, and code quality standards.
