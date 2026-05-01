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

---

## ADR-014 — Deployment strategy deferred after local walking skeleton

**Date:** 2026-04-30
**Status:** Accepted

**Context:**
Phase 1 is complete. The walking skeleton works end-to-end with real NOAA data, CI is green, and the first question that naturally follows is "where does this run in production?" The answer is not obvious because `better-sqlite3` is a native addon and SQLite is a local file — both are constraints that rule out the most common hosting choices.

**Decision:** No deployment target is chosen at the end of Phase 1. The deploy decision is deferred to Phase 6 (Production, Testing, and Deploy). The constraints and options are fully documented in `docs/architecture.md` § Deployment Considerations.

**Why not deploy immediately after Phase 1:**

1. **The stack has real constraints that must be understood before committing to a platform.** `better-sqlite3` uses a native C++ addon compiled for a specific OS/Node/architecture. Serverless platforms (Vercel Edge, Netlify Edge Functions) run V8 Isolates, not Node.js — they cannot load native addons at all. Choosing one of these platforms without understanding this would require an emergency migration mid-project.

2. **SQLite is a local file.** A platform without persistent disk storage (most serverless environments) would lose all data between requests. The dashboard would always show the empty state. This makes the application meaningless as a deployed product until the storage question is resolved.

3. **CI already guarantees correctness on clean machines.** GitHub Actions runs typecheck + build + test on every push with `npm ci` from scratch. The quality gate is already in place. A rushed deploy adds risk without adding verification.

4. **Deployment decisions affect future architecture choices.** If Phase 3 adds WebSockets, the host must support long-lived connections. If Phase 4 adds auth, session storage must be persistent. Choosing a host after Phase 1 risks being locked into a platform that cannot support later phases.

**Conditions that must be true before deploying:**

- The storage question is resolved: either a persistent volume (Fly.io, Railway, Render) or a migration to a hosted database (Turso, Supabase, Neon).
- The WebSocket strategy for Phase 3 is compatible with the chosen host.
- `npm run build` produces a deployable artifact that passes on the target platform's Node version.
- CI includes a smoke test or health check that confirms the deployed instance is serving data.

**Options documented for Phase 6 (in `docs/architecture.md`):**

| Option | Approach | Code changes |
|--------|----------|-------------|
| A | Local demo only | None |
| B | Fly.io or Railway with persistent disk | None (Docker + volume config) |
| C | Turso / libSQL or Supabase | Rewrite `db.server.ts` |
| D | Defer until Phase 6 | None now |

**Current recommendation:** Option B (Node.js server with persistent disk) if a public URL is required for evaluation. Option D (defer) if the evaluation is internal. The choice depends on the course requirement — not on technical preference.

**Alternatives considered:**
- **Deploy to Vercel immediately** — rejected. Vercel's Edge Runtime does not support native Node.js addons. The serverless functions runtime supports Node.js but has no persistent filesystem. Both break `better-sqlite3` in different ways.
- **Switch to Turso now** — deferred. Migrating the DB layer before Phase 2 is premature optimization. The `SignalRecord` contract and service layer are stable; the DB transport is not load-bearing yet.
- **Use a Docker container on a VPS** — valid, subsumed by Option B. Fly.io and Railway are Docker-based platforms with a simpler UX than managing a raw VPS.

---

## ADR-015 — Minimal shadcn UI primitives (Phase 2A)

**Date:** 2026-04-30
**Status:** Accepted

**Context:**
Phase 1 is complete with raw Tailwind CSS. The dashboard is functional but uses ad-hoc styling for every element: the SignalCard outer div, the empty state container, and the Kp status badge are all hand-crafted with inline class strings. Phase 2A introduces a UI system to establish visual consistency without changing the data architecture.

**Decision:** Add shadcn UI with the minimal component set needed for the current dashboard: `Card`, `CardContent`, and `Badge`. No other components are added in this phase.

**Why shadcn now and not earlier:**
Phase 1's goal was to prove the data pipeline — every line was about getting real data from NOAA to the screen via SQLite. Adding a UI library before the pipeline was proven would have introduced risk without benefit. The CLAUDE.md rule "Magic UI: only after MVP 1 is working end-to-end with real data" captures the same principle for shadcn: UI polish comes after substance. Phase 1 is now committed and CI is green.

**Why only Card and Badge (not the full component set):**
YAGNI. The dashboard at Phase 2A has: one data card (SignalCard), one status indicator (Kp badge), one empty state, and a CSS sparkline. Card + Badge covers all three presentational primitives. Adding Button, Alert, Skeleton, Tabs, or Dialog now would mean installing and maintaining components that serve no current purpose. They will be added in later phases as the dashboard expands.

**Why not Magic UI yet:**
Magic UI provides animated premium components built on top of shadcn. Using it before the base shadcn layer is stable would add both animation complexity and a dependency on library-specific APIs before the component structure is settled. CLAUDE.md explicitly defers Magic UI to Phase 5.

**Architecture impact (none):**
The data flow is unchanged: `loader → SignalCard → Card/Badge`. Card and Badge are purely presentational — they receive no data, call no services, and have no side effects. They are exactly what the architecture requires: components that render.

**Implementation details:**
- `app/lib/utils.ts` — `cn()` helper via `clsx` + `tailwind-merge`. Replaces ad-hoc string concatenation for className merging.
- `app/components/ui/card.tsx` — simplified shadcn Card using CSS variables (`bg-card`, `border-border`). The `CardContent` sub-component provides consistent padding.
- `app/components/ui/badge.tsx` — `cva`-based Badge with four domain-specific variants: `quiet` (green), `active` (yellow), `storm` (red), `default` (gray). Variants directly map to the Kp status interpretation. Removes the `kpStatusColor()` function from SignalCard — color is now part of the Badge contract.
- `app/app.css` — CSS variables added by shadcn init (nova preset). Dark mode configured via `@media (prefers-color-scheme: dark)` to preserve the existing system-preference-based dark mode without a JavaScript toggle.

**New dependencies and justification:**
| Package | Replaces | Why |
|---------|----------|-----|
| `clsx` | Template literals for conditional classes | Type-safe conditional className construction |
| `tailwind-merge` | No equivalent | Deduplicates conflicting Tailwind utilities when merging className props |
| `class-variance-authority` | Manual variant objects | Typed variant API for Badge; eliminates `if/else` chains for color variants |
| `radix-ui` | none | Required by shadcn registry; not directly used in Card or Badge |
| `@fontsource-variable/geist` | System fonts | Professional typography; Geist is optimized for code-heavy UIs |
| `tw-animate-css` | none | Installed by shadcn init for future animation utilities |
| `lucide-react` | none | Icon library used by shadcn components; not yet used in the dashboard |

**Alternatives considered:**
- **Keep raw Tailwind only** — valid, but ad-hoc class strings in SignalCard for the border color, status text color, and outer container styling are harder to maintain as the dashboard grows. A typed variant system (`cva`) is safer than free-form string concatenation.
- **Use shadcn's full Card component (with `data-slot`, `group/card`, `size` variants)** — rejected. The CLI generates a 100-line Card with container queries and slot-based layout. For SignalCard's flat single-block layout, this complexity adds no value. A 19-line simplified Card is the right scope.
- **Use Radix UI Badge directly** — not needed. The shadcn Badge is a plain `<span>` with `cva` variants. No accessibility semantics require a Radix primitive for a color-coded status label.

---

## ADR-016 — Solar Instrument Console layout (Phase 2E)

**Date:** 2026-04-30
**Status:** Accepted

**Context:**
Phase 2B attempted a cosmic/glassmorphism dashboard redesign (dark-card grid, `rounded-xl`, `border-white/10`, gradient overlays). The user rejected it: "no nos ha gustado el dashboard." The aesthetic was closer to a SaaS product landing page than to a scientific instrument. It was discarded completely.

**Decision:** Replace the Phase 2B design with a Solar Instrument Console aesthetic inspired by NOAA SWPC mission control interfaces and the Atlas26 visual reference. All four instrument panels (KpTelemetryPanel, KpScaleInstrument, MissionStatusPanel, KpHistoryStrip) are built from scratch with a consistent scientific instrument language.

**Design language:**
- Shell background: `#030712` (near-black, applied via `.instrument-shell` CSS class)
- Panel background: `#070d1a` (dark navy)
- Panel border: `border-cyan-900/30` — 1px, very low opacity cyan. Not decorative, structural.
- `rounded-sm` only. No `rounded-xl`, no `rounded-lg`.
- Typography: `font-mono` throughout, `uppercase tracking-widest` for section labels, tabular-nums for data values.
- Status colors: sky-400 (QUIET), yellow-400 (ACTIVE), red-400 (STORM). Same Kp thresholds as before (4, 5).
- Active data indicators: `bg-emerald-400 animate-pulse` dots. Used only where data is genuinely flowing (InstrumentHeader feed status, MissionStatusPanel pipeline steps).

**New components:**
- `InstrumentShell` — `<main>` wrapper applying `.instrument-shell` class
- `InstrumentHeader` — title bar with feed status, source attribution, responsive status row
- `KpScaleInstrument` — visual zone track (quiet/active/storm regions) with position marker, threshold lines at Kp 4 and Kp 5, scale ticks 0–9, zone key
- `MissionStatusPanel` — data pipeline visualization (NOAA SWPC → HELIOS_DECK → SQLite → SSR) plus session stats (max, min, avg Kp)
- `KpTelemetryPanel` — large Kp readout with left accent border, status, source, timestamp, confidence
- `KpHistoryStrip` — bar chart of last N readings with threshold reference lines, newest-right orientation
- `EmptyDashboardState` — instrument-styled empty state with ingest instructions

**Architecture: zero changes to data layer.** All data still flows through the `dashboard.tsx` loader. The loader now computes `stats` (count, max, min, avg) from `recentSignals` before returning — this is valid loader logic, not business logic in a component.

**Why `.instrument-shell` as a CSS class (not Tailwind utilities):**
The shell color `#030712` is not a Tailwind color token. Using an arbitrary value `bg-[#030712]` directly on a root element that renders inside the React Router document would work, but a named CSS class makes it clear this is a system-level concern (the entire UI shell) not a one-off utility. One class, one place to change.

**Why discard Phase 2B completely:**
Partial reverting would leave inconsistent aesthetics. The Phase 2B components and the Phase 2E components use incompatible visual vocabularies (glassmorphism vs instrument console). A partial merge would be visually incoherent.

**Alternatives considered:**
- **Keep Phase 2B with adjustments** — rejected. The user's feedback was "no nos ha gustado" (we didn't like it). Incremental adjustment of a rejected design is not the right response.
- **Use Magic UI animated components** — deferred. CLAUDE.md rule: Magic UI only after MVP 1 is working end-to-end. The console aesthetic using plain Tailwind achieves the visual goal without new dependencies.
- **Three.js planet in the header** — explicitly deferred to `/cosmic-view` route (ADR-004). No Three.js outside that route.

---

## ADR-017 — Experimental planet-centered Cosmic View (Phase 2F)

**Date:** 2026-04-30
**Status:** Accepted (experimental route)

**Context:**
Phase 2E established `/dashboard` as a scientific instrument console. Phase 2F adds a second, optional route (`/cosmic-view`) that presents the same real Kp data through a 3D immersive visualization. The reference for the visual concept is Atlas26 (MIT © Abdul Wasay Khan 2026), a Next.js spatial observatory. No code or assets were copied from Atlas26.

**Why the planet is the central instrument:**
In HELIOS_DECK, the Kp index measures Earth's geomagnetic field disturbance. A planet sphere that visually responds to Kp — changing color, atmosphere opacity, and field ring intensity — is not decoration: it IS the instrument. The user reads the field state from the visual, not from a table. This is the same data as `/dashboard` but encoded spatially.

**Why `/cosmic-view` is separate from `/dashboard`:**
The two routes serve different purposes and different rendering constraints. `/dashboard` is an SSR-first data console, optimized for fast load, accessibility, and reliable data readout. `/cosmic-view` is a client-only WebGL experience that requires a modern GPU. Merging them would force `/dashboard` to load Three.js (~170KB gzip) on every page visit, which violates the performance guarantee in CLAUDE.md. Separate routes = separate bundles.

**Why Three.js is isolated to `/cosmic-view`:**
`CosmicViewClient.tsx` (and its 3D sub-components: `EarthInstrument`, `KpFieldOverlay`, `StarField`) are only loaded via a dynamic `import()` inside a `useEffect`. This import runs only in the browser, after hydration. Vite splits this into a separate chunk. No file outside `app/components/cosmic/` and `app/routes/cosmic-view.tsx` imports Three.js or `@react-three/fiber`. The CI build confirms this isolation.

**SSR strategy — `useState + useEffect` lazy import:**
React Router v7 renders all routes on the server by default. Three.js references browser APIs (`window`, WebGL context) that do not exist in Node.js. The chosen pattern:
1. On the server, `useState` initializes `Client` to `null` → fallback loading screen is rendered.
2. Client receives the same loading screen during hydration → no mismatch.
3. After hydration, `useEffect` fires → `import("~/components/cosmic/CosmicViewClient")` resolves → `Client` is set → Canvas mounts.

This is simpler and more reliable than `React.lazy + Suspense` for SSR contexts because it guarantees the server never executes the dynamic import.

**Why @react-three/drei was not installed:**
Drei is a large helper library (~200KB additional). Our needs are covered by raw R3F + Three.js primitives: `<sphereGeometry>`, `<torusGeometry>`, `<meshStandardMaterial>`, `<ambientLight>`, `<directionalLight>`, `<pointLight>`, `<points>`. Installing Drei for conveniences we don't need violates the YAGNI principle and the library discipline rule in CLAUDE.md.

**How the planet represents real Kp data:**
All visual parameters are derived exclusively from `latestSignal.value` (the Kp index from SQLite):
- Sphere emissive color and intensity: dark/neutral at low Kp → red/bright at storm
- Atmosphere layer color: cyan (QUIET) → amber (ACTIVE) → red (STORM)
- Atmosphere opacity: increases with Kp
- Field ring color and opacity: increases with Kp
- Extra storm ring: only renders when Kp ≥ 5

No mock data. No invented signals. One `getLatestSignalByName("kp-index")` call in the loader. If the database is empty, `CosmicEmptyState` is shown.

**How invented data is prevented:**
The loader has a single data source: `getLatestSignalByName("kp-index")`. There is no fallback Kp value, no hardcoded demo signal, and no call to the NOAA API. If the database is empty, the route shows `CosmicEmptyState` with the ingest instructions.

**How performance is protected:**
- No textures: procedural geometry only (no HTTP requests for assets)
- No postprocessing: no bloom, no depth of field, no SSAO
- No Framer Motion
- Star field: 1500 points via `THREE.Points`, not individual meshes
- Planet sphere: 64×64 segments (not 128×128)
- Three.js chunk is only fetched when the user navigates to `/cosmic-view`

**Attribution:**
Atlas26 by Abdul Wasay Khan (MIT 2026) was used as conceptual inspiration only. No code, textures, assets, or components were copied. See `docs/credits.md`.

**Alternatives considered:**
- **Embedded Three.js in `/dashboard`** — rejected. Violates bundle isolation; Three.js would load on every dashboard visit.
- **React.lazy + Suspense instead of useEffect** — viable but risks SSR execution of the lazy factory in streaming SSR contexts. The `useEffect` pattern is more explicit and guaranteed.
- **@react-three/drei Stars component** — rejected. Adds ~200KB for a helper we can replace with 30 lines of Three.js `Points` geometry.
- **External texture maps** — deferred. Would require asset hosting strategy and increase bundle/network cost. Procedural materials are sufficient for the current data-driven instrument concept.
- **Copy Atlas26 Earth.tsx under MIT** — rejected. Atlas26's Earth depends on 5 texture files, a custom day/night shader, TimeManager orbital mechanics, and Framer Motion — all incompatible with HELIOS_DECK's architecture. Rewriting from scratch was faster and produces a cleaner, simpler component.

---

## ADR-018 — NOAA Solar Wind Speed as second normalized signal (Phase 2A)

**Date:** 2026-05-01
**Status:** Accepted

**Context:**
Phase 1 is complete. The walking skeleton proves the full pipeline (NOAA SWPC → fetcher → normalizer → SQLite → SSR loader → dashboard → tests → CI) with one signal: Kp index. Phase 2A must add a second real signal to prove that `SignalRecord` scales beyond Kp — that the contract works for any space weather measurement, not just the first one.

**Decision:** Add solar wind speed (`solar-wind-speed`, `km/s`) from NOAA SWPC `rtsw_wind.json` as the second normalized signal. The pipeline is implemented in full (fetcher, normalizer, ingest coordinator, tests, ingest script) without adding any dashboard UI in this phase.

**Why solar wind speed after Kp:**

1. **Same source, no new auth.** `rtsw_wind.json` is served by the same NOAA SWPC infrastructure as `planetary_k_index_1m.json`. No new API key, no new base URL, no new network configuration. The fetcher extension is a single function and a single constant.

2. **Proves the contract generalizes.** Kp index is dimensionless (unit: `"index"`), updated every minute, and comes as an array of simple objects. Solar wind speed is measured in km/s, has a different timestamp format (space-separated with milliseconds instead of T-separated without), and frequently contains `null` values for data gaps. If `SignalRecord` handles both, it handles most time-series signals.

3. **Different normalization challenge.** The Kp normalizer's single challenge is rounding (`estimated_kp` vs `kp_index`). The solar wind normalizer has two new problems: timestamp format conversion and nullable values. Solving both without changing the contract or the DB schema proves the architecture is not brittle.

4. **Contextually related to Kp.** Solar wind speed is a direct physical driver of geomagnetic activity: a fast, dense solar wind compresses Earth's magnetosphere and raises the Kp index. Displaying both signals side by side in Phase 2B will be scientifically coherent, not arbitrary.

5. **Feeds future `/cosmic-view` enhancement.** The `/cosmic-view` route currently drives planet visuals from Kp alone. Solar wind speed adds a second channel — e.g. orbit ring speed, atmosphere density overlay — when Phase 5 enhances the 3D view.

**Why no dashboard UI in Phase 2A:**
Phase 2A is strictly a data layer milestone. Adding a `SolarWindSpeedWidget` now would conflate pipeline correctness with UI decisions. The dashboard currently shows Kp across four instrument panels; adding a fifth panel requires a layout decision. That decision belongs to Phase 2B after the data is confirmed to be flowing correctly.

**Null handling decision:**
NOAA's `rtsw_wind.json` sends `proton_speed: null` for minutes when the DSCOVR spacecraft has no valid measurement. These gaps are normal and expected. The normalizer filters them silently (returns `[]` for that entry) rather than throwing. The data contract says "null must not be stored" — filtering is the correct implementation of that rule for a nullable measurement field. Storing nulls would pollute the DB; throwing would abort the entire batch on the first gap.

**Confidence: 0.9 (same as Kp):**
Both signals are real-time provisional NOAA data before final QC processing. The same confidence value is correct and consistent.

**Timestamp normalization:**
`rtsw_wind.json` uses `"2026-05-01 12:00:00.000"` (space, milliseconds, no Z). The normalizer converts this to `"2026-05-01T12:00:00Z"` via `.replace(" ", "T").replace(/\.\d+$/, "")`. The same `parseTimeTag()` helper is also applied retroactively to the Kp normalizer, which already used ISO format — making the helper a single shared utility in `noaa-swpc.ts`.

**Alternatives considered:**
- **X-ray flux as second signal** — valid candidate, but uses a different endpoint (`xray-fluxes-6-hour.json`) with 6-hour resolution instead of real-time. Lower value for demonstrating that the pipeline handles different update cadences. Deferred to Phase 2B.
- **Proton flux as second signal** — similar argument; same GOES endpoint family. Deferred.
- **Show solar wind speed in the dashboard immediately** — rejected for Phase 2A. The task's explicit constraint is "data + tests + persistence first, no UI redesign."
- **Separate fetcher file for solar wind** — rejected. The fetcher function is identical in structure to `fetchKpIndex()` — one URL constant, one `fetch()` call, one `response.ok` check. Splitting into a second file would add a module boundary with no benefit. Both functions live in `noaa-swpc.server.ts`.
