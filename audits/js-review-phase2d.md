# /js-review report — Phase 2D (2026-05-02)

**Target:** branch — all changes since `main` (feature/xray-flux-ui)
**Files reviewed:** 7
**Lenses loaded:** javascript-pro, typescript-pro, react-best-practices, code-reviewer

---

## P0 — must fix (0 findings)

None.

---

## P1 — should fix (1 finding) — FIXED

### `app/routes/cosmic-view.tsx:52` — dynamic import `.then()` with no `.catch()` — unhandled rejection

**Problem:** The `useEffect` called `import(...)` and chained `.then()` with no rejection handler. If the dynamic import failed at runtime (bundler misconfiguration, chunk load error), `setClient` would never run, leaving the user on "Initializing 3D engine…" indefinitely and producing a silent unhandled promise rejection. CLAUDE.md requires all async operations to use explicit error handling.

**Fix applied:**
```tsx
// before
useEffect(() => {
  import("~/components/cosmic/CosmicViewClient").then((m) => {
    setClient(() => m.default);
  });
}, []);

// after
useEffect(() => {
  import("~/components/cosmic/CosmicViewClient")
    .then((m) => { setClient(() => m.default); })
    .catch(() => { /* chunk load failed — loading fallback remains visible */ });
}, []);
```

**Status:** Fixed in this branch.

---

## P2 — consider (1 finding) — no action taken

### `app/components/widgets/XRayFluxTelemetryPanel.tsx:1` — 170 lines vs CLAUDE.md ~150 guideline

**Problem:** Total file is 170 lines. Main exported component is ~60 lines; the remaining lines are correctly extracted private sub-components (`FooterRow`, `PanelHeader`, `PendingState`). No functional issue — the extraction is the right pattern and keeps the component readable.

**Decision:** No action. The ~150 guideline targets monolithic components, not files with clean helper extraction. Re-evaluate if the file grows beyond ~200 lines.

---

## Summary

- One P1 gap: `.catch()` missing on dynamic import (fixed)
- All new Phase 2D code is type-safe: no `any`, proper `unknown`/`typeof` narrowing throughout
- `interpretXRayFlux` export-for-reuse pattern is clean — no utility module duplication
- No hooks rule violations, no missing `useEffect` deps, no `key={index}` issues
- No barrel imports — all imports reference specific module files

## Clean files

- `app/components/widgets/XRayFluxTelemetryPanel.tsx`
- `app/components/widgets/XRayFluxTelemetryPanel.test.tsx`
- `app/components/cosmic/CosmicHud.tsx`
- `app/components/cosmic/CosmicHud.test.tsx`
- `app/components/cosmic/CosmicViewClient.tsx`
- `app/routes/dashboard.tsx`
