# HELIOS_DECK — Local Demo Checklist

Use this checklist to verify the project from a clean clone before a demo or evaluation.

---

## 1. Setup

- [ ] Clone the repository
- [ ] `npm install` completes without errors
- [ ] No `.env` file required (no secrets — NOAA SWPC is open, no API key)

---

## 2. Populate the database

```bash
npm run ingest:all
```

Expected output:

```
[helios] ingest:all — fetching all four NOAA signals

[helios] → kp-index...
[helios] → solar-wind-speed...
[helios] → xray-flux-long...
[helios] → proton-flux-10mev...

[helios] ── Summary ─────────────────────────────────────
  ✓  kp-index               fetched=N saved=N skipped=0 errors=0
  ✓  solar-wind-speed       fetched=N saved=N skipped=0 errors=0
  ✓  xray-flux-long         fetched=N saved=N skipped=0 errors=0
  ✓  proton-flux-10mev      fetched=N saved=N skipped=0 errors=0
[helios] ─────────────────────────────────────────────────
```

All four lines must show `✓` and `errors=0`. If any shows `✗`, check your network connection.

- [ ] `ingest:all` exits with code 0
- [ ] `data/helios.sqlite` exists locally (created by ingest)
- [ ] `data/helios.sqlite` is **not** tracked by git (`git status` must not list it)

---

## 3. Start the dev server

```bash
npm run dev
```

- [ ] Server starts at `http://localhost:5173`
- [ ] No compilation errors in terminal output

---

## 4. Dashboard — http://localhost:5173/dashboard

Open the dashboard and verify each panel:

**Solar Activity section**
- [ ] X-Ray Flux panel shows a value in scientific notation (e.g. `1.32e-8`) with `W/m²` unit
- [ ] X-Ray Flux panel shows a status label (A — QUIET / B — MINOR / C — MODERATE / M — SIGNIFICANT / X — EXTREME)
- [ ] Proton Flux panel shows a value in `pfu` with status (QUIET / ELEVATED / RADIATION WATCH)
- [ ] Neither panel shows "awaiting ingest"

**Solar Driver section**
- [ ] Solar Wind Speed panel shows a value in `km/s` with status (CALM / ELEVATED / HIGH SPEED STREAM)
- [ ] Panel does not show "Wind channel awaiting ingest"

**Geomagnetic Response section**
- [ ] Kp Telemetry panel shows a numeric value (0.00 – 9.00)
- [ ] Kp Scale instrument renders the colored scale with the current level highlighted
- [ ] Mission Status panel shows record count, max/min/avg Kp

**History strip**
- [ ] KpHistoryStrip renders a bar chart below the instrument panels

**Section labels**
- [ ] Three labels visible: `SOLAR ACTIVITY`, `SOLAR DRIVER`, `GEOMAGNETIC RESPONSE`

---

## 5. Cosmic View — http://localhost:5173/cosmic-view

- [ ] 3D canvas renders (Earth with star field)
- [ ] Planet shows a glow/field overlay driven by current Kp value
- [ ] HUD (bottom-left overlay) shows:
  - Kp value (e.g. `2.33`) and status (QUIET / ACTIVE / STORM)
  - `XRAY` line with flux value and class
  - `PROTON` line with pfu value and status (or `channel pending` if not ingested)
  - `WIND` line with speed and status
  - `PIPELINE  SQLite → SSR`
- [ ] `← dashboard` link works
- [ ] No blank screen or "Initializing 3D engine…" stuck state

---

## 6. Quality checks

```bash
npm run typecheck   # Must exit 0 — no TypeScript errors
npm run build       # Must exit 0 — production bundle builds cleanly
npm test            # Must pass all tests (213 tests, 17 files)
```

- [ ] `typecheck` exits 0
- [ ] `build` exits 0 and lists all expected chunks
- [ ] `npm test` shows `Tests  213 passed (213)` (or higher if tests were added)
- [ ] No `✗` or `FAIL` in test output

---

## 7. CI verification

- [ ] Open the repository on GitHub → Actions tab
- [ ] Latest CI run on `main` is green (Typecheck · Build · Test)
- [ ] CI does not call any NOAA endpoint (tests use in-memory SQLite only)

---

## 8. Architecture constraints

Verify that no constraints have been violated:

- [ ] No `fetch()` calls inside React components (all data comes through loaders)
- [ ] No mock data — every rendered value comes from SQLite
- [ ] No `console.log` in app code (only in CLI scripts)
- [ ] `data/helios.sqlite` is gitignored and not committed
- [ ] No Live Cloud Overlay or decorative demos

---

## 9. Data provenance

Each panel footer shows:
- `SOURCE  noaa-swpc` — confirms data origin
- `OBSERVED  <UTC timestamp>` — confirms it is a real measurement time
- `CONFIDENCE  90%` — the normalizer-assigned confidence value

These are not hardcoded labels — they come from the `SignalRecord` stored in SQLite.

---

## Known pending states

If a signal panel shows "awaiting ingest", run the individual command:

```bash
npm run ingest:noaa-kp            # for Kp panel
npm run ingest:noaa-solar-wind    # for Solar Wind panel
npm run ingest:noaa-xray-flux     # for X-Ray Flux panel
npm run ingest:noaa-proton-flux   # for Proton Flux panel
```

Then reload the page (`Cmd+R`). No server restart needed — loaders re-read SQLite on every request.
