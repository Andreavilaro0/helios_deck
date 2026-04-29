# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

HELIOS_DECK — fullstack web observatory for heliophysical and geophysical data.
Stack: React Router v7 SSR · JavaScript · SQLite · Tailwind CSS v4 · shadcn

---

## Rules for Every Session

### Before writing any code
- Confirm the current phase (see `docs/plan.md`).
- State what you are about to implement and why.
- If no plan exists for the task, write one first. No code without a plan.
- Read relevant docs in `docs/` before touching the codebase.

### Architecture constraints (non-negotiable)
- No `fetch` calls inside React components. All data flows through loaders/actions.
- No business logic in components. Components render; services fetch and transform.
- No component may exceed ~150 lines. Split first, implement second.
- Layers must not be crossed: `component → loader → service → fetcher → normalizer → SQLite`.
- Every external API response must pass through a normalizer before reaching the DB or loader.

### Library discipline
- Do not add a new dependency without stating: what it replaces, why the existing stack cannot handle it, and what its bundle cost is.
- Magic UI: only after MVP 1 is working end-to-end with real data.
- Three.js / React Three Fiber: only inside `/cosmic-view`, never elsewhere.
- No utility libraries (lodash, ramda, etc.) unless a native alternative does not exist.

### Code quality
- No `console.log`, `alert`, or `debugger` in any committed file.
- No commented-out code blocks left behind.
- No `TODO` without a GitHub issue number or a phase reference.
- All async operations must use `try/catch` with explicit error handling.
- Validate inputs at system boundaries (API responses, form data). Never inside pure functions.

### Commits
- One logical change per commit.
- Commit message format: `type(scope): description` — e.g. `feat(fetcher): add NOAA Kp index fetch`.
- Never commit `.env`, credentials, or secrets.

### Performance
- No unoptimized images. Use WebP or AVIF.
- No render-blocking scripts.
- Loaders must handle errors and loading states explicitly.
- SQLite queries must be indexed on `timestamp` and `signal`.

### AI usage in this project
- Document every significant prompt in `docs/ai-usage.md`.
- Every AI-generated code block must be reviewed and understood before committing.
- If you cannot explain a line, do not commit it.
- See `docs/ai-usage.md` for the full policy.

---

## Key File Locations (once scaffold exists)

| Path | Purpose |
|------|---------|
| `app/routes/` | React Router v7 route modules (loader + component together) |
| `app/services/` | Fetchers and normalizers — no React here |
| `app/db/` | SQLite schema, migrations, query helpers |
| `app/components/` | Presentational components only |
| `app/widgets/` | Self-contained data widgets (receive normalized data as props) |
| `docs/` | Architecture, decisions, data contracts |

---

## Data Flow (mandatory pattern)

```
External API
  └─ app/services/fetchers/<source>.js     (raw HTTP call)
       └─ app/services/normalizers/<source>.js  (→ SignalRecord shape)
            └─ app/db/signals.js               (INSERT / SELECT)
                 └─ app/routes/<page>.jsx       (loader reads DB)
                      └─ app/widgets/<Widget>.jsx  (renders normalized data)
```

The `SignalRecord` shape is defined in `docs/data-contract.md`. Never deviate from it without updating that doc.

---

## Current Phase

**Phase 0 — Documentation and architecture** (active)

Do not scaffold the React app until Phase 0 is complete and committed.
Next command when ready: see "Próximo paso" in `docs/plan.md`.
