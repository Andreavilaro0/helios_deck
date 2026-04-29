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
│  ├─ schema.sql    (canonical table + index definitions)  │
│  └─ db.server.ts  (openDb / getDb — better-sqlite3)      │
│                                                          │
│  SQLite file: data/helios.sqlite                             │
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

## Database Schema (implemented in Phase 1C)

```sql
CREATE TABLE IF NOT EXISTS signals (
  id            TEXT NOT NULL,
  timestamp     TEXT NOT NULL CHECK(length(timestamp) > 0),
  source        TEXT NOT NULL CHECK(length(source)    > 0),
  signal        TEXT NOT NULL CHECK(length(signal)    > 0),
  value_json    TEXT NOT NULL CHECK(length(value_json)    > 0),
  unit          TEXT NOT NULL,
  confidence    REAL NOT NULL CHECK(confidence >= 0.0 AND confidence <= 1.0),
  metadata_json TEXT NOT NULL CHECK(length(metadata_json) > 0),
  created_at    TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_signals_signal_timestamp ON signals (signal, timestamp);
CREATE INDEX IF NOT EXISTS idx_signals_source_timestamp ON signals (source, timestamp);
```

`id` is a UUID v4 (TEXT). `value_json` and `metadata_json` are explicit JSON blobs —
the column names make the serialization visible at every call site. See ADR-010.

---

## Data Ingestion Flow

External APIs are not called on every page load. Data is pre-fetched and stored:

```
Ingest trigger (npm run ingest:noaa-kp, or future cron route)
  └─ app/services/ingest/noaa-kp.server.ts  (coordinator)
       └─ fetcher: GET https://services.swpc.noaa.gov/json/planetary_k_index_1m.json
            └─ normalizer: raw JSON → SignalRecordInput[]
                 └─ signalExists() — skip if (timestamp, source, signal) already stored
                      └─ saveSignal() → data/helios.sqlite

Page load
  └─ loader: listSignals() / getLatestSignalByName('kp-index')
       └─ component receives clean SignalRecord[]
```

This separation means the UI is never blocked by a slow external API.

The ingest coordinator (`ingest/noaa-kp.server.ts`) returns an `IngestResult`
summary (`fetched`, `saved`, `skipped`, `errors`) so callers can report or act
on partial failures without crashing the entire ingest run.

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
| `services/fetchers/<source>.server.ts` | `fetchers/noaa-swpc.server.ts` | One file per API source |
| `services/normalizers/<source>.ts` | `normalizers/noaa-swpc.ts` | One normalizer per source |
| `services/signals.server.ts` | — | Server-only data access facade (saveSignal, listSignals, signalExists, …) |
| `services/ingest/<source>.server.ts` | `ingest/noaa-kp.server.ts` | Pipeline coordinator: fetcher → normalizer → saveSignal |
| `db/schema.sql` | — | Canonical SQLite table and index definitions |
| `db/db.server.ts` | — | `openDb()` / `getDb()` — better-sqlite3 connection |
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
