# HELIOS_DECK — Architecture

## Overview

HELIOS_DECK is a server-side rendered web application that ingests heliophysical and geophysical data from public APIs, stores it in a local SQLite database, and presents it as an interactive observatory dashboard.

The architecture is deliberately layered: each layer has a single responsibility, and no layer may import from a layer above it.

---

## Layer Diagram

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                 │
│  React components (render only, no data logic)          │
└────────────────────────┬────────────────────────────────┘
                         │ HTML / hydration
┌────────────────────────▼────────────────────────────────┐
│  React Router v7 SSR                                     │
│  Route modules: loader() + action() + Component         │
│  Handles: routing, SSR, data passing to components      │
└────────────────────────┬────────────────────────────────┘
                         │ calls
┌────────────────────────▼────────────────────────────────┐
│  Services Layer                                          │
│  app/services/                                           │
│  ├─ fetchers/     (raw HTTP calls to external APIs)      │
│  └─ normalizers/  (maps raw → SignalRecord)              │
└─────────┬───────────────────────────────────────────────┘
          │ reads/writes
┌─────────▼───────────────────────────────────────────────┐
│  Database Layer                                          │
│  app/db/                                                 │
│  ├─ schema.js     (table definitions, migrations)        │
│  ├─ signals.js    (INSERT, SELECT helpers)               │
│  └─ db.js         (better-sqlite3 singleton)             │
│                                                          │
│  SQLite file: data/helios.db                             │
└─────────────────────────────────────────────────────────┘
```

---

## Component Tree (Phase 2 target)

```
app/routes/dashboard.tsx  (loader: reads DB → passes SignalRecord[])
  └─ app/components/DashboardLayout.tsx
       ├─ app/widgets/KpIndexWidget.tsx
       ├─ app/widgets/SolarWindWidget.tsx
       ├─ app/widgets/XRayFluxWidget.tsx
       └─ app/widgets/ProtonFluxWidget.tsx
```

Widgets receive normalized `SignalRecord` props. They do not fetch anything themselves.

---

## Database Schema (target)

```sql
CREATE TABLE signals (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT    NOT NULL,
  source    TEXT    NOT NULL,
  signal    TEXT    NOT NULL,
  value     REAL    NOT NULL,
  unit      TEXT    NOT NULL,
  confidence REAL,
  metadata  TEXT,             -- JSON blob
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_signals_timestamp ON signals(timestamp);
CREATE INDEX idx_signals_signal    ON signals(signal);
CREATE INDEX idx_signals_source    ON signals(source);
```

---

## Data Ingestion Flow

External APIs are not called on every page load. Data is pre-fetched and stored:

```
Ingest trigger (cron route or scheduled action)
  └─ fetcher: GET https://services.swpc.noaa.gov/...
       └─ normalizer: raw JSON → SignalRecord[]
            └─ db.insertSignals(records)

Page load
  └─ loader: db.getLatestSignals({ signal: 'kp-index', limit: 24 })
       └─ component receives clean SignalRecord[]
```

This separation means the UI is never blocked by a slow external API.

---

## Domain Contract

`app/types/signal.ts` is the single source of truth for the `SignalRecord` shape.

Every layer imports from there. Types are never redefined in fetchers, normalizers, DB helpers, loaders, or widgets. If a type needs to change, it changes in one place and TypeScript surfaces every affected call site.

```
app/types/signal.ts
  exports: ISOTimestamp, SignalValue, SignalMetadata
           SignalSource, SignalName, SignalUnit
           SignalRecord, SignalRecordInput
```

See `docs/data-contract.md` for the full field-level specification.

---

## File Naming Conventions

| Pattern | Example | Purpose |
|---------|---------|---------|
| `types/<domain>.ts` | `types/signal.ts` | Domain type definitions |
| `services/fetchers/<source>.ts` | `fetchers/noaa.ts` | One file per API source |
| `services/normalizers/<source>.ts` | `normalizers/noaa.ts` | One normalizer per source |
| `services/signals.server.ts` | — | Server-only data access facade |
| `db/schema.ts` | — | SQLite table and index definitions |
| `db/signals.ts` | — | Signal INSERT / SELECT helpers |
| `widgets/<Signal>Widget.tsx` | `KpIndexWidget.tsx` | One widget per signal type |
| `routes/<name>.tsx` | `routes/dashboard.tsx` | Route module (loader + component) |

---

## Technology Decisions Summary

See `docs/decisions.md` for full rationale. Short version:

- **React Router v7 SSR** — loaders give us server-side data without Next.js overhead
- **TypeScript (strict)** — domain types in `app/types/` make the pipeline self-documenting
- **SQLite via better-sqlite3** — synchronous, zero-config, perfect for a single-server observatory
- **Tailwind CSS v4** — utility-first, no runtime CSS-in-JS cost
- **No Redux / Zustand** — loader data + React state is sufficient for this domain

---

## Phase 3 Addition: WebSocket Layer

```
app/server/ws.ts              (ws library, attached to the Vite dev server)
app/hooks/useSignalStream.ts  (client-side hook, updates widget state on message)
```

WebSocket messages carry the same `SignalRecord` shape. Widgets do not change — they just receive updates via hook instead of only from loader props.

---

## Out of Scope (MVP 1)

- Three.js / React Three Fiber (Phase 5 only, inside `/cosmic-view`)
- Magic UI (Phase 5)
- OAuth / social login (Phase 4 uses session auth)
- Multi-region / edge deployment
- Service Worker / offline mode
