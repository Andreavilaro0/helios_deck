# HELIOS_DECK — Technical Decision Log

Format: each entry has a context, decision, alternatives considered, and rationale.
Append new entries; never delete or modify existing ones.

---

## ADR-001 — Use React Router v7 SSR (not Next.js)

**Date:** 2025-04-29
**Status:** Accepted

**Context:**
The project requires server-side rendering so that data widgets arrive pre-populated (no loading flash, good for SEO, simpler data flow). Two obvious SSR options exist: Next.js and React Router v7 (formerly Remix).

**Decision:** Use React Router v7 SSR.

**Alternatives considered:**
- **Next.js 14/15 App Router** — industry dominant, but App Router mental model (Server Components vs Client Components) adds significant cognitive overhead. Server Actions are powerful but obscure the data flow that needs to be visible and explainable for a technical evaluation.
- **Astro** — excellent for content sites, but not suited for interactive real-time widgets.
- **SvelteKit** — different language, out of scope.

**Rationale:**
React Router v7 loaders and actions make the data flow explicit: `loader()` runs on the server, returns data, component receives it. Every line is traceable. This is exactly what a technical evaluation rewards. The project also benefits from the Remix/React Router ecosystem without the complexity of Next.js App Router.

---

## ADR-002 — Use TypeScript (pragmatic, domain-first)

**Date:** 2025-04-29
**Revised:** 2026-04-30
**Status:** Accepted

**Context:**
The original decision was to use JavaScript to reduce tooling friction. However, when scaffolding with `create-react-router@latest`, the only official template is TypeScript. React Router v7 also ships first-class type inference for loaders, actions, and route params — types that directly describe the data domain.

**Decision:** Use TypeScript with a pragmatic, domain-first discipline:
- Types must describe the domain (e.g. `SignalRecord`, loader return shapes, route params). If a type does not help explain the data, it is not needed.
- No complex generics, no utility type gymnastics, no `as unknown as X` escape hatches.
- `any` is forbidden. Use `unknown` + narrowing when the shape is genuinely uncertain (e.g. raw API responses).
- The `SignalRecord` interface in `docs/data-contract.md` is the canonical type — it replaces the JSDoc approach.
- Keeping `strict: true` in `tsconfig.json` is non-negotiable.

**Alternatives considered:**
- **Eject to JavaScript** — manually rename `.tsx → .jsx`, remove `tsconfig.json`. Extra work with no benefit; loses React Router's route type inference entirely.
- **TypeScript with heavy abstractions** — rejected. Every type must be explainable in one sentence.

**Rationale:**
React Router v7 generates types for loaders and actions via `react-router typegen`. This means route files get typed `params`, typed loader data, and typed `action` returns automatically — directly useful for this project's data pipeline. The tooling cost is zero because the scaffold already configures it. For a technical evaluation, TypeScript with domain-relevant types is a stronger signal than JavaScript with JSDoc comments.

---

## ADR-003 — Use SQLite via better-sqlite3

**Date:** 2025-04-29
**Status:** Accepted

**Context:**
The project ingests time-series signals and must store them for dashboard queries. Options: PostgreSQL, MySQL, SQLite, or in-memory only.

**Decision:** SQLite with `better-sqlite3`.

**Alternatives considered:**
- **PostgreSQL** — more scalable, but requires a running server, connection pooling, and environment variables. Overkill for a single-server project.
- **In-memory only** — data is lost on restart; breaks the "real observatory" narrative.
- **Prisma ORM** — adds abstraction that makes queries harder to explain and inspect.

**Rationale:**
SQLite is a single file, zero configuration, and `better-sqlite3` is synchronous (fits React Router loaders naturally). For the expected data volume (a few signals, 1-minute resolution, days of history), SQLite is more than sufficient. The schema is simple enough to write raw SQL.

---

## ADR-004 — No Three.js in MVP 1

**Date:** 2025-04-29
**Status:** Accepted

**Context:**
HELIOS_DECK could feature a 3D solar system view (`/cosmic-view`) as a compelling visual.

**Decision:** Three.js / React Three Fiber is deferred to Phase 5, isolated to the `/cosmic-view` route.

**Rationale:**
Three.js adds significant bundle weight and development time. Including it before the data pipeline is proven would make the project a visual demo with no substance — the opposite of what a technical evaluation rewards. Walking skeleton first.

---

## ADR-005 — No Magic UI until MVP 1 is working

**Date:** 2025-04-29
**Status:** Accepted

**Context:**
Magic UI provides premium animated React components that could make the project look professional quickly.

**Decision:** Magic UI is not installed or used until a real signal is flowing end-to-end (Phase 1 complete).

**Rationale:**
Animated components on top of fake or missing data gives a false impression of completeness. The evaluator will look at data flow first, visuals second. Magic UI is the reward for completing Phase 1, not the starting point.

---

## ADR-006 — No Redux or global state manager

**Date:** 2025-04-29
**Status:** Accepted

**Context:**
React applications often reach for Redux, Zustand, or Jotai for state management.

**Decision:** No global state library. Data flows from loaders to components via props. React `useState` for local UI state only.

**Rationale:**
React Router v7 loaders handle all server data. The only client-side state needed is transient UI state (open/closed panels, selected time range). A global store would add indirection with no benefit at this scale. WebSocket updates in Phase 3 will be managed by a custom hook, not a store.

---

## ADR-007 — Tailwind CSS v4 (not CSS Modules or CSS-in-JS)

**Date:** 2025-04-29
**Status:** Accepted

**Context:**
CSS strategy choice affects development speed, bundle size, and maintainability.

**Decision:** Tailwind CSS v4.

**Rationale:**
Utility-first CSS eliminates context switching between files. Tailwind v4's new engine has zero runtime cost. shadcn components are built on Tailwind, making the integration seamless. CSS Modules would require naming every class; CSS-in-JS (styled-components, emotion) has runtime overhead.

---

## ADR-008 — shadcn for base UI components, Magic UI for premium layer

**Date:** 2025-04-29
**Status:** Accepted

**Context:**
The project needs accessible, composable UI primitives (Card, Badge, Skeleton, Dialog) and later premium visual components.

**Decision:** shadcn installs component source directly into the project (not a dependency). Magic UI added on top in Phase 5.

**Rationale:**
shadcn components are owned — they can be modified without overriding a library. This is explicitly what a technical evaluation expects: code you understand and can explain. Magic UI extends shadcn's visual style, making the two layers composable.

---

## ADR-009 — Normalized Signal Contract (`SignalRecord`)

**Date:** 2026-04-30
**Status:** Accepted

**Context:**
HELIOS_DECK integrates data from multiple external APIs (NOAA SWPC, NASA DONKI, GFZ Potsdam, ISS, Open-Meteo). Each API returns data in its own format: NOAA Kp returns `[[timestamp, value], ...]`, NOAA solar wind returns a JSON object with dozens of named fields, NASA DONKI returns event arrays with nested impact lists. Without a normalization layer, every widget would need to know the format of every API it might ever display.

**Decision:** All external API responses are converted to a single `SignalRecord` shape before touching the database or any component. The contract is defined in `app/types/signal.ts` and documented in `docs/data-contract.md`.

**The shape:**
```ts
interface SignalRecord {
  timestamp:  ISOTimestamp;   // observation time, always UTC ISO 8601
  source:     SignalSource;   // originating API identifier
  signal:     SignalName;     // physical quantity measured
  value:      SignalValue;    // JsonValue — scalar or structured JSON
  unit:       SignalUnit;     // measurement unit, stable per signal name
  confidence: number;         // 0.0–1.0 reliability rating
  metadata:   SignalMetadata; // Record<string, JsonValue> — source-specific extras
}
```

**Why all APIs map to a common model:**
A widget like `KpIndexWidget` should work regardless of whether the Kp data came from NOAA or GFZ. If widgets depended on the source format, swapping APIs would require rewriting UI code. With a normalized contract, swapping a source only requires a new normalizer — the widget, the loader, and the DB schema stay unchanged.

**Why `value` is `JsonValue` (not `number`):**
Most heliophysical signals are scalar numbers (Kp index, solar wind speed, X-ray flux), but HELIOS_DECK also needs to represent structured measurements: ISS position requires `{ latitude, longitude, altitude }`, solar flare events from NASA DONKI carry `{ classType, beginTime, peakTime }`, and atmospheric summaries from Open-Meteo bundle multiple fields together. Forcing all of these into a single number would either lose data or require a second field. `JsonValue` allows both scalar and structured signals to share the same `SignalRecord` shape without breaking the contract. The tradeoff: widgets consuming structured signals must use a type guard before rendering — they cannot assume `typeof value === "number"`. This is an explicit contract, not a hidden assumption.

`value` is stored as `TEXT` (JSON-serialized) in SQLite. The DB helper does `JSON.stringify` on write and `JSON.parse` on read. Scalar values (`4.33`) serialize to their string representations (`"4.33"`) and parse back correctly.

**Why `metadata` is `Record<string, JsonValue>` (flexible):**
Different sources include different supplementary data (NOAA Kp includes a storm category letter; NOAA solar wind includes proton speed and bulk speed separately). Forcing all of these into the common contract would either bloat the schema or lose information. `metadata` stores source-specific context without polluting the core contract. Using `JsonValue` (instead of `unknown`) ensures all metadata values are JSON-serializable — this is required because metadata is stored as a JSON blob in SQLite.

**Why TypeScript types help but don't replace runtime validation:**
TypeScript types are erased at runtime. When a NOAA HTTP response arrives, it is `unknown` — the types in `app/types/signal.ts` do not protect against a malformed or changed API response. Runtime validation (to be implemented in `app/services/normalizers/validate.ts` in Phase 1B) is the actual safety net. TypeScript handles the internal contract; the validator handles the boundary.

**Alternatives considered:**
- **No normalization, each widget handles its own format** — rejected. Creates tight coupling between UI and API formats. Adding a new signal source would require changes across multiple component files.
- **GraphQL or tRPC schema as the contract** — rejected for MVP. Adds a layer of abstraction before the pipeline is proven. The contract can be promoted to a formal schema in Phase 6 if needed.
- **Use Zod for type definition and validation** — deferred to Phase 1B. Using Zod for the schema would give us both compile-time types and runtime validation from one definition. Decision: plain TypeScript interfaces first (simpler, fully explainable), Zod added in Phase 1B after the structure is stable.

---

## ADR-010 — SQLite persistence schema for normalized signals

**Date:** 2026-04-30
**Status:** Accepted

**Context:**
The normalizer layer produces `SignalRecordInput[]`. These records need to be persisted so that loaders can read them without blocking on external API calls. The schema must store the full `SignalRecord` contract including `value` (any `JsonValue`) and `metadata` (a `Record<string, JsonValue>` blob).

**Decision:**
Store normalized signals in a single `signals` table with the following key design choices:

1. `id TEXT PRIMARY KEY` — UUID v4 generated by the service layer (`crypto.randomUUID()`). Not `INTEGER AUTOINCREMENT` because insertion order is not meaningful for time-series data; UUID avoids implicit assumptions about ordering.

2. `value_json TEXT NOT NULL` and `metadata_json TEXT NOT NULL` — explicit JSON column names instead of `value` and `metadata`. The suffix `_json` makes the serialization contract visible at every call site: anyone reading the column name immediately knows it contains a JSON string that must be parsed.

3. `CHECK(confidence >= 0.0 AND confidence <= 1.0)` — enforced at the DB level as a belt-and-suspenders constraint. The service layer also validates before inserting to give a clearer error message.

4. Composite indices `(signal, timestamp)` and `(source, timestamp)` — the two most frequent query patterns are "latest reading of signal X" and "all readings from source Y in a time range". Single-column indices on `signal` or `source` alone would be less efficient for these patterns.

**Why no ORM (Prisma, Drizzle) at this phase:**
The schema is simple enough that raw SQL is more readable and explainable than ORM abstractions. For a technical evaluation, raw SQL queries in `signals.server.ts` are immediately understandable without knowledge of any ORM DSL. An ORM adds indirection (schema files, generated client, migration commands) before the pipeline is proven.

**Why the DB layer knows nothing about NOAA/NASA/GFZ:**
`app/db/db.server.ts` only opens a connection and runs the schema. It has no imports from `app/services/` and no knowledge of signal sources. This means the entire data layer is generic: adding a second source (GFZ, NASA DONKI) requires only a new normalizer and fetcher — not a schema change or a new DB function.

**Why `app/services/signals.server.ts` is the boundary:**
Loaders should not import from `app/db/` directly. `signals.server.ts` is the single point that translates between the domain vocabulary (`SignalRecord`, `SignalName`) and the DB vocabulary (`value_json`, `metadata_json`, UUID). If we ever switch from SQLite to PostgreSQL, only `signals.server.ts` and `db.server.ts` change — every loader and every widget stays unchanged.

**Alternatives considered:**
- **`id INTEGER PRIMARY KEY AUTOINCREMENT`** — simpler, but couples record identity to insertion order. UUID is the safer default for a system that may eventually replicate or merge datasets.
- **`value REAL NOT NULL`** — rejected. Would force structured signals (ISS position object, flare event object) to break the contract. `TEXT` (JSON blob) accommodates both scalar and structured values.
- **`metadata TEXT` (nullable)** — considered. Rejected in favour of `NOT NULL DEFAULT '{}'` to keep the read path simple: callers always get a valid JSON object, never `null`.
- **Drizzle ORM** — deferred. Once the schema is stable and Phase 2 adds more complex queries, Drizzle provides type-safe SQL without the overhead of Prisma's generated client. Not needed yet.

---

## ADR-012 — Loader does not auto-ingest; ingest is a separate manual step

**Date:** 2026-04-30
**Status:** Accepted

**Context:**
Phase 1E adds the first SSR loader for `/dashboard`. The loader reads from SQLite. A question arose: should the loader also trigger `ingestNoaaKpSignals()` if no data is found, or if data is stale?

**Decision:** The loader never calls the ingest pipeline. It reads what is in SQLite and returns it as-is, including a `hasData: false` flag when the table is empty.

**Why not auto-ingest in the loader?**
1. **Every page load would call NOAA.** Even if rate-limited, this couples UI availability to external API availability. If NOAA is slow, the page is slow.
2. **Loaders should be fast.** React Router loaders run on every navigation. A network call in a loader defeats the architecture decision recorded in ADR-001 (SSR data via loaders, not fetch-on-render).
3. **Ingest is an operational concern.** Deciding when and how often to fetch NOAA data belongs to a scheduler (cron, Phase 3), not to the render path.
4. **Graceful empty state is better.** The dashboard shows a clear message ("No data yet, run `npm run ingest:noaa-kp`") rather than silently blocking.

**Alternatives considered:**
- **Auto-ingest when `hasData === false`** — rejected. Makes the first page load slow and unpredictable.
- **Auto-ingest on a background thread via `setImmediate`** — rejected. Node.js single-threaded model plus better-sqlite3 being sync makes this fragile and hard to reason about.

---

## ADR-011 — Ingest coordinator as a separate service layer

**Date:** 2026-04-30
**Status:** Accepted

**Context:**
Phase 1D connects the full pipeline: fetcher → normalizer → `saveSignal()`. This coordination logic needs to live somewhere. Options are: inline in a route action, inside `signals.server.ts`, or as a dedicated ingest service.

**Decision:** A dedicated `app/services/ingest/<source>.server.ts` file per source. Each exports a single async function (`ingestNoaaKpSignals`) that coordinates the pipeline and returns an `IngestResult` summary.

**What `IngestResult` contains:**
```ts
{ source, signal, fetched, saved, skipped, errors }
```
Errors are collected (not thrown) so a partial failure in one record does not abort the entire ingest run. The caller (script or future cron route) decides what to do with errors.

**Duplicate detection:** `signalExists({ timestamp, source, signal })` added to `signals.server.ts`. Checked before every `saveSignal()` call. Avoids `INSERT OR IGNORE` (which would silently swallow unrelated constraint violations) while keeping the logic explicit.

**Dependency injection:** Both `fetcher` and `db` are injectable parameters. Tests pass a fake fetcher and `openDb(':memory:')` — the real NOAA API is never called from tests.

**Why not inline in a route action?**
Route actions run per HTTP request. Ingest is a background operation triggered on demand (script today, cron route in Phase 3). Keeping it as a standalone function makes it reusable across both contexts.

**Why not add coordination to `signals.server.ts`?**
`signals.server.ts` is the DB boundary — it knows SQL, not NOAA. Adding fetcher/normalizer calls there would violate the layer contract: `signals.server.ts` must not import from `services/fetchers/` or `services/normalizers/`.

**Alternatives considered:**
- **Inline in a `+server` route** — couples pipeline logic to an HTTP handler; harder to test.
- **Throw on first error instead of collecting** — rejected. NOAA returns up to 500 entries per call; a single bad entry would silently discard valid data. Collecting errors and continuing is safer for bulk ingestion.

---

## ADR-013 — Continuous Integration with GitHub Actions

**Date:** 2026-04-30
**Status:** Accepted

**Context:**
Phase 1G closes the walking skeleton. The pipeline is end-to-end: fetcher → normalizer → SQLite → loader → dashboard → component tests. Without CI, every push could silently break any of these layers — TypeScript errors, a build that fails, or a test regression.

**Decision:** Add a minimal GitHub Actions workflow (`.github/workflows/ci.yml`) that runs on every push and pull request.

**What CI protects:**
1. `npm run typecheck` — runs `react-router typegen` then `tsc --noEmit`. Catches type errors across loaders, routes, and components. React Router's typegen must run first because route types are generated, not hand-written.
2. `npm run build` — full production build (client bundle + SSR bundle). Catches import errors, missing modules, and Rollup issues that TypeScript alone does not detect.
3. `npm test` — Vitest runs all unit tests (normalizer, DB helpers, signal service) and component tests (SignalCard). Catches regressions in the data pipeline and UI contract.

**Why CI at Phase 1, not later:**
The earlier CI is introduced, the cheaper it is. A project with 49 tests and 3 verification commands takes under 2 minutes to check. Delaying CI until Phase 3 or 4 would mean accepting weeks of unverified pushes and then retrofitting green builds — which is harder than starting green.

**Why the ingest script is never called in CI:**
`npm run ingest:noaa-kp` makes a real HTTP request to `https://services.swpc.noaa.gov`. Running it in CI would:
- Create a dependency on an external API being available.
- Make CI flaky if NOAA is slow or rate-limits GitHub's IP range.
- Store real signal data in the runner's filesystem, which is discarded after every run anyway.
CI only verifies that the code compiles and tests pass — it does not need data.

**Why tests use SQLite in memory (`openDb(':memory:')`), not `data/helios.sqlite`:**
`data/helios.sqlite` is a local operational file, gitignored, and absent on a fresh runner. Tests that depend on it would always fail in CI. Using `:memory:` ensures every test run starts from a clean, schema-correct database regardless of local state. This is also why `data/` is in `.gitignore` — committing the SQLite file would couple the test environment to whatever data was present at commit time.

**Why no secrets are needed:**
All three CI commands operate on the codebase itself. No API keys, no environment variables beyond what `npm ci` provides. A zero-secret CI pipeline is simpler to audit and cannot leak credentials.

**Environment: ubuntu-latest, Node 20:**
`ubuntu-latest` matches typical production Linux environments and is the cheapest GitHub Actions runner. Node 20 is the current LTS. `better-sqlite3` ships prebuilt binaries for linux-x64-node-20, so `npm ci` installs without needing a C++ compiler in most cases (falls back to compilation if no prebuilt matches).

**Alternatives considered:**
- **Run ingest in CI with a mock server** — rejected. Adds complexity (mock HTTP server setup) with no benefit; the normalizer and ingest service are already tested with injected fakes.
- **Cache the SQLite file between runs** — rejected. The file is gitignored and runtime-generated; caching it in CI creates a hidden dependency on previous run state.
- **Add deploy step (Vercel, Netlify)** — deferred. Deployment automation belongs to Phase 2 after the MVP is stable. CI verifies quality; deployment is a separate concern.
