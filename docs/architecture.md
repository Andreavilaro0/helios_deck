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

## Component Tree (Phase 1E — implemented)

```
app/routes/dashboard.tsx  (loader: reads SQLite → SignalRecord[])
  ├─ app/components/widgets/SignalCard.tsx  (latest Kp, interpretation, confidence)
  └─ KpHistoryBars (inline — CSS sparkline, no chart library)
```

Phase 2 target (once more signals are ingested):
```
app/routes/dashboard.tsx
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

Page load (SSR)
  └─ loader: getLatestSignalByName('kp-index') + listRecentSignalsByName('kp-index', 60)
       └─ component receives { latestSignal, recentSignals, hasData }
            └─ SignalCard + KpHistoryBars render server-side, hydrate on client
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

## `/cosmic-view` — Living Planet Observatory (Phase 2J/2K, active)

Three.js / React Three Fiber are isolated to this route. The SSR loader reads the same SQLite signals as `/dashboard` and passes them as props. The 3D scene is mounted client-side only via a dynamic import boundary (`CosmicViewClient`).

```
app/routes/cosmic-view.tsx       (SSR loader — reads SQLite, no Three.js)
  └─ CosmicViewClient.tsx        (client boundary — dynamic import, R3F canvas)
       ├─ EarthScene.tsx          (R3F canvas: globe, atmosphere, cloud layer)
       │    └─ EarthDayNightMaterial.ts  (GLSL day/night + Fresnel shaders)
       └─ ObservatoryShell.tsx    (4 floating signal cards + glass topbar/footer)
```

`/dashboard` never loads Three.js. The `CosmicViewClient` chunk (~918 kB minified, ~245 kB gzip) is only downloaded when the user navigates to `/cosmic-view`.

---

## Phase 3 Addition: WebSocket Layer

```
app/server/ws.ts              (ws library, attached to the Vite dev server)
app/hooks/useSignalStream.ts  (client-side hook, updates widget state on message)
```

WebSocket messages carry the same `SignalRecord` shape. Widgets do not change — they just receive updates via hook instead of only from loader props.

---

## Out of Scope (MVP 1)

- Magic UI (Phase 5 premium layer — beyond current scope)
- OAuth / social login (Phase 4 uses session auth)
- Multi-region / edge deployment
- Service Worker / offline mode

---

## Deployment Considerations

This section documents the constraints introduced by the current stack and the realistic options for Phase 6 deployment. No option has been chosen yet — the decision is recorded in ADR-014.

### What works well locally

`better-sqlite3` with a file-based SQLite database (`data/helios.sqlite`) is the simplest possible setup: zero configuration, zero external services, synchronous reads inside loaders. For development and local evaluation this is ideal.

### Why serverless platforms are problematic for this stack

Serverless functions (Vercel Edge, Netlify Functions, AWS Lambda) run in ephemeral containers that do not have a persistent local filesystem. Any file written to disk during one invocation is gone by the next. This has two direct consequences for HELIOS_DECK:

1. `data/helios.sqlite` cannot persist between requests — the dashboard would show no data.
2. `better-sqlite3` is a native C++ addon compiled for a specific OS/Node/architecture combination. Serverless environments with non-standard runtimes (e.g. Vercel's Edge Runtime, which is V8 Isolates, not Node.js) cannot load native addons at all.

### Deployment options for Phase 6

**Option A — Defend locally (no public deploy)**
Run the project on a laptop or local server for the evaluation demo. No infrastructure changes required. The evaluator runs `npm run ingest:noaa-kp && npm run dev` and sees the dashboard live.

- Pros: zero infra cost, works today, no migration risk.
- Cons: no public URL, harder to share, does not demonstrate production readiness.
- Suitable for: internal academic evaluation where a live URL is not required.

**Option B — Node.js server with persistent disk (Fly.io, Railway, Render)**
Deploy as a long-running Node.js process on a platform that mounts a persistent volume. `data/helios.sqlite` lives on the volume. `better-sqlite3` compiles normally on standard Linux/Node.

- Pros: no code changes required, full parity with local development, persistent data.
- Cons: requires volume configuration, slightly more devops complexity.
- Suitable for: production-quality deploy without changing the database layer.
- Recommended platform: **Fly.io** (free tier with 3 GB volume, supports custom Dockerfiles) or **Railway** (simpler setup, similar constraints).

**Option C — Migrate persistence to a hosted database**
Replace `better-sqlite3` with a hosted SQLite-compatible service (Turso / libSQL) or a hosted Postgres (Supabase, Neon). The `SignalRecord` contract and all service layer code remain unchanged — only `app/db/db.server.ts` is rewritten.

- Pros: works on any platform including serverless, no persistent volume needed.
- Cons: requires rewriting the DB layer, introduces external service dependency, adds latency to synchronous reads (loaders become async).
- Suitable for: Phase 6 if Fly.io/Railway is not available or if multi-region access is needed.
- Best candidate: **Turso** (libSQL, SQLite-compatible wire protocol, free tier).

**Option D — Keep SQLite for evaluation only, migrate in Phase 6**
Ship Phase 2–5 features with the current SQLite setup, then evaluate the deploy target when the feature set is finalized. Avoids premature migration that might constrain Phase 3 (WebSockets) or Phase 4 (auth).

- Pros: no migration risk during active development.
- Cons: defers a real infrastructure decision, could require a larger migration later.
- Suitable for: university project where the evaluation is the deadline.

### Current recommendation

Option B (Fly.io or Railway with persistent disk) is the lowest-risk path for a production deploy without code changes. Option D is the right choice if deployment is not evaluated until Phase 6. The decision is documented in ADR-014.
