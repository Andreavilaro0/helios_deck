# HELIOS_DECK — Phase 1 Checkpoint

**Date:** 2026-04-30
**Status:** Complete

---

## What Was Built

The full walking skeleton is working end-to-end with real data from NOAA SWPC.

### Pipeline (implemented and verified)

```
NOAA SWPC real API
  └─ app/services/fetchers/noaa-swpc.server.ts
       Fetches: https://services.swpc.noaa.gov/json/planetary_k_index_1m.json
       Returns: raw JSON array (unknown type, validated before normalization)

  └─ app/services/normalizers/noaa-swpc.ts
       Maps each entry to SignalRecordInput (timestamp, source, signal, value, unit, confidence, metadata)
       Rejects malformed entries with collected errors (does not throw on partial failure)

  └─ app/services/ingest/noaa-kp.server.ts
       Coordinator: calls fetcher → normalizer → signalExists() → saveSignal()
       Returns IngestResult { source, signal, fetched, saved, skipped, errors }
       Dependency-injected: fetcher and db are passed in — real NOAA never called from tests

  └─ app/db/db.server.ts + app/db/schema.sql
       openDb(path) — creates connection, runs schema (used in tests with ':memory:')
       getDb()      — singleton for dev/production, defaults to data/helios.sqlite
                      overridable via DATABASE_PATH env var

  └─ app/services/signals.server.ts
       saveSignal()      — INSERT with UUID v4 id
       signalExists()    — dedup check by (timestamp, source, signal)
       getLatestSignalByName()    — single-row query for dashboard latest value
       listRecentSignalsByName()  — N most recent rows for sparkline

  └─ app/routes/dashboard.tsx
       loader()  — synchronous (better-sqlite3 is sync), reads SQLite, no external calls
       Component — renders SignalCard + KpHistoryBars
       EmptyState — shown when DB is empty with instructions to run ingest

  └─ app/components/widgets/SignalCard.tsx
       Receives: SignalRecord (single normalized record)
       Renders:  Kp value (text-5xl), unit, source, <time dateTime>, confidence
                 Status badge (Quiet / Active / Storm) with color-coded border accent
                 data-testid="kp-status" for test targeting
```

---

## Tests (49 passing)

| File | Environment | Tests |
|------|-------------|-------|
| `app/services/normalizers/noaa-swpc.test.ts` | node | normalizer unit tests |
| `app/db/db.server.test.ts` | node | schema, insert, dedup, query |
| `app/services/ingest/noaa-kp.server.test.ts` | node | ingest coordinator with fake fetcher + `:memory:` DB |
| `app/components/widgets/SignalCard.test.tsx` | jsdom | 7 component tests (value, unit, source, timestamp, Quiet/Active/Storm) |

All server-side tests use `openDb(':memory:')` — no dependency on `data/helios.sqlite`.
Component tests use `// @vitest-environment jsdom` per-file annotation.

---

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request:

```
npm ci → npm run typecheck → npm run build → npm test
```

- Runner: ubuntu-latest, Node 20
- No secrets required
- No external API calls
- First run: green in 37 seconds

---

## Key Design Decisions Made in Phase 1

| Decision | ADR |
|----------|-----|
| React Router v7 SSR over Next.js | ADR-001 |
| TypeScript strict, domain-first | ADR-002 |
| SQLite via better-sqlite3 | ADR-003 |
| Normalized SignalRecord contract | ADR-009 |
| SQLite schema (UUID, value_json, composite indices) | ADR-010 |
| Loader never triggers ingest | ADR-012 |
| Ingest coordinator as separate service layer | ADR-011 |
| CI at Phase 1 | ADR-013 |

---

## What Phase 1 Does NOT Include (by design)

- No automatic ingestion — data is fetched manually via `npm run ingest:noaa-kp`
- No WebSockets — data refreshes require a page reload or re-ingest
- No auth — single public dashboard
- No shadcn or Magic UI — raw Tailwind only
- No Three.js — no 3D view
- No deploy — deployment strategy documented but not implemented (see ADR-014)
- No Zod runtime validation — TypeScript types only at this phase (deferred to Phase 1B)

---

## How to Verify the Checkpoint Locally

```bash
npm install
npm run ingest:noaa-kp   # Populate data/helios.sqlite with real NOAA data
npm run dev              # Start dev server
# Open http://localhost:5173/dashboard
```

Expected result: dashboard shows current Kp index, geomagnetic status badge, and 60-bar sparkline with real NOAA data.

```bash
npm run typecheck        # Should exit 0
npm run build            # Should produce build/ with client and server bundles
npm test                 # Should show 4 files, 49 tests, all passing
```
