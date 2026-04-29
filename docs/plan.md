# HELIOS_DECK — Project Plan

## Principle

Walking skeleton first. Visual layer last.
Each phase must be committed and verifiable before the next begins.

---

## Phases

### Phase 0 — Documentation and Architecture
**Goal:** Establish shared understanding before writing a single line of application code.

Deliverables:
- `docs/plan.md` (this file)
- `docs/architecture.md`
- `docs/data-contract.md`
- `docs/api-sources.md`
- `docs/decisions.md`
- `docs/ai-usage.md`
- `docs/rubric-checklist.md`
- `CLAUDE.md`
- `README.md`
- `.gitignore`

Done when: all docs committed, no app code exists.

---

### Phase 1 — Walking Skeleton (one real signal end-to-end)
**Goal:** Prove the full data pipeline works with a single real API, a single signal, and a single widget.

Deliverables:
- React Router v7 SSR scaffold (`npx create-react-router@latest`)
- Tailwind CSS v4 configured
- SQLite connected (`better-sqlite3`)
- `app/db/schema.js` — `signals` table with indexes
- `app/services/fetchers/noaa.js` — fetches Kp index from NOAA SWPC
- `app/services/normalizers/noaa.js` — maps raw response to `SignalRecord`
- `app/routes/index.jsx` — loader reads from DB, component renders one widget
- `app/widgets/KpIndexWidget.jsx` — displays current Kp value and trend
- A cron-style script or route action to ingest data periodically

Done when: visiting `/` shows a real Kp value fetched from NOAA, stored in SQLite, and rendered server-side.

---

### Phase 2 — Base Dashboard
**Goal:** Add more signals and a coherent dashboard layout.

Deliverables:
- Solar wind speed (NOAA SWPC)
- X-ray flux (NOAA SWPC)
- Proton flux (NOAA SWPC)
- `app/routes/dashboard.jsx` — multi-widget layout
- shadcn Card, Badge, Skeleton components installed and used
- Responsive grid layout with Tailwind
- Error boundaries per widget (one widget failing must not break the page)
- Loading states for all widgets

Done when: dashboard shows 4+ real signals with proper loading and error states.

---

### Phase 3 — Real-time Layer
**Goal:** Add WebSocket updates so signals refresh without full page reload.

Deliverables:
- Server-side WebSocket handler
- Client-side WebSocket hook (`app/hooks/useSignalStream.js`)
- Widgets update in-place on new data
- Graceful fallback to polling if WebSocket connection fails

Done when: a new Kp value from NOAA updates the widget without a page reload.

---

### Phase 4 — Auth and User Dashboards
**Goal:** Allow users to configure which signals they track.

Deliverables:
- Auth (session-based, no OAuth for MVP)
- `users` table in SQLite
- Per-user widget preferences stored in DB
- `/dashboard/:userId` protected route
- Login / logout flow

Done when: two different users can log in and see different dashboard configurations.

---

### Phase 5 — Visual Premium Layer
**Goal:** Add the visual quality expected of a professional observatory.

Deliverables:
- Magic UI components replacing raw shadcn cards where appropriate
- `/cosmic-view` route with Three.js / React Three Fiber solar system visualization
- Dark mode (system preference + manual toggle)
- Micro-animations on signal updates (only where meaningful)
- Typography and color system documented in `docs/design-system.md`

Done when: project looks portfolio-ready without sacrificing the data integrity from Phase 2.

---

### Phase 6 — Production, Testing, and Deploy
**Goal:** Ship and defend it.

Deliverables:
- Vitest unit tests for all normalizers and DB helpers
- Playwright e2e test for the main dashboard flow
- Lighthouse score ≥ 90 on Performance, Accessibility, Best Practices
- Deploy to Fly.io or Railway (SSR-compatible)
- `docs/rubric-checklist.md` fully checked
- Final `docs/ai-usage.md` entry

Done when: deployed URL is live and all checklist items are green.

---

## Next Step (from Phase 0)

```bash
npx create-react-router@latest helios-app --template remix
```

Run this from `helios_web/`, then move contents up or work inside `helios-app/`.
Confirm with the user before running this command.
