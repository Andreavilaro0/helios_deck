# Dashboard Visual Redesign — Hero · Pipeline · Signals Table

## Goal

Replace the centered-text hero, single-line pipeline footer, and absent signals table with three new components that visually match the reference design: a rich hero card, a 6-node pipeline visual, and a recent-signals table with a "View All" modal.

## Scope

Three components, all in `app/components/dashboard/`:

| Component | Status | Action |
|-----------|--------|--------|
| `DashboardHero` | exists | rewrite |
| `PipelineFooter` | exists | delete → replaced by `DataPipelinePanel` |
| `DataPipelinePanel` | new | create |
| `RecentSignalsTable` | new | create |
| `SignalsModal` | new | create (sibling file or inner component) |

`app/routes/dashboard.tsx` loader and JSX are updated to wire data to the new components.

---

## 1. DashboardHero (rewrite)

### Visual design

Left column (flex: 1):
- Label: `"Space Weather Condition"` — monospace, 10px, uppercase, 0.25em tracking, `white/35`
- Status headline: e.g. `"QUIET"` + `<br/>` + `"CONDITIONS"` — monospace, 42px, weight 900, color per status, line-height 1, letter-spacing -0.02em
- Description: one sentence per status (see below), 13px, `white/45`, max-width 340px, margin-top 12px
- Timestamp: `"May 5 · 07:37 UTC"` — 11px, monospace, `white/25`, margin-top 16px

Right column (shrink: 0), 2×2 grid, gap 12px — each cell is a mini card with border:
- **Risk Level** — label "RISK LEVEL", value "LOW" / "MODERATE" / "HIGH", color: green / amber / red
- **Freshness** — label "FRESHNESS", value formatted age of the most recent signal (e.g. `"6h 19m"`), always white
- **Last Ingested** — label "LAST INGESTED", value `"07:37 AM UTC"`, sub `"05/05/2026"`, white
- **Source** — label "SOURCE", value `"NOAA SWPC"`, sub `"Primary feed"`, white

Container: rounded-2xl card with `border-white/8`, `bg-white/3`, `backdrop-blur-8px`, `padding 24px`, flex row, gap 24px.

Storm variant: border and background tinted red (`border-red-500/20`, `bg-red-500/4`), status color red (#f87171), risk badge red.

### Status config

```ts
const STATUS_CONFIG: Record<OverallStatus, HeroConfig> = {
  QUIET: {
    headlineLines: ["QUIET", "CONDITIONS"],
    color: "#22d3ee",           // cyan
    borderColor: "rgba(255,255,255,0.08)",
    bgColor: "rgba(255,255,255,0.03)",
    description: "Geomagnetic activity is at quiet levels. No space weather alerts in effect.",
    riskLabel: "LOW",
    riskColor: "#4ade80",
  },
  ACTIVE: {
    headlineLines: ["ACTIVE", "CONDITIONS"],
    color: "#fbbf24",           // amber
    borderColor: "rgba(245,158,11,0.2)",
    bgColor: "rgba(245,158,11,0.04)",
    description: "Elevated geomagnetic activity. Minor disruptions to HF radio possible.",
    riskLabel: "MODERATE",
    riskColor: "#fbbf24",
  },
  STORM: {
    headlineLines: ["GEOMAGNETIC", "STORM"],
    color: "#f87171",           // red
    borderColor: "rgba(239,68,68,0.2)",
    bgColor: "rgba(239,68,68,0.04)",
    description: "Geomagnetic storm in progress. Significant satellite and grid impacts possible.",
    riskLabel: "HIGH",
    riskColor: "#f87171",
  },
};
```

### New props

```ts
interface DashboardHeroProps {
  overallStatus: OverallStatus;
  /** Formatted UTC age string — e.g. "6h 19m" */
  freshnessAge: string;
  /** Formatted UTC time — e.g. "07:37 AM UTC" */
  lastIngestedTime: string;
  /** Formatted UTC date — e.g. "05/05/2026" */
  lastIngestedDate: string;
  /** Formatted label — e.g. "May 5 · 07:37 UTC" */
  timestamp: string;
}
```

### Loader additions

Compute `freshnessAge`, `lastIngestedTime`, `lastIngestedDate` in the loader using the most recently ingested of the 4 signals. `formatAge` already exists in `dashboard.tsx`.

```ts
// find the most recent signal
const candidates = [kpSignal, xraySignal, protonSignal, windSignal].filter(Boolean);
const mostRecent = candidates.reduce((a, b) =>
  (a && b && a.timestamp > b.timestamp) ? a : b ?? a
, candidates[0] ?? null);

const heroFreshness = getSignalFreshness(mostRecent, now);
const heroAge = formatAge(heroFreshness.ageMinutes);
const heroIngestedTime = mostRecent
  ? new Date(mostRecent.timestamp).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" })
  : "—";
const heroIngestedDate = mostRecent
  ? new Date(mostRecent.timestamp).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric", timeZone: "UTC" })
  : "—";
```

---

## 2. DataPipelinePanel (new — replaces PipelineFooter)

### Visual design

Section header: `"Data Pipeline — Real-Time Architecture"` — 9px monospace, uppercase, 0.25em tracking, `white/30`.

Six nodes in a flex row, each separated by an SVG arrow (`→`). Nodes stretch to equal width.

Each node card: `bg-white/4`, `border-white/10`, `border-radius 10px`, `padding 16px 14px`.
Inside: icon box (32×32, bg tinted cyan/12, radius 8px), SVG icon teal (#22d3ee), name (11px bold mono), subtitle (9px, `white/35`), status badge at the bottom.

Status badge:
- OK: `bg-green-500/12`, `border-green-500/30`, text `#4ade80`, dot `#4ade80`, label `"OK"`
- STALE: `bg-red-500/12`, `border-red-500/30`, text `#f87171`, dot `#f87171`, label `"STALE — last seen Xh Ym ago"`

Node definitions:

| # | Name | Subtitle | Icon |
|---|------|----------|------|
| 1 | NOAA SWPC | Primary Source · feeds.swpc.noaa.gov | globe (circle + latitude/longitude lines) |
| 2 | Fetchers | Data Ingestion · 5m intervals | cloud-download |
| 3 | Normalizers | Data Processing · Validation & Parse | activity/waveform |
| 4 | SQLite | Local Database · helios.db | database (cylinder) |
| 5 | SSR Loaders | Signal Registry · Real-time Push | zap/bolt |
| 6 | UI | Frontend · Cosmic View | monitor |

### Status logic

`pipelineOk: boolean` passed as prop. True when at least one signal is fresh.
- Nodes 1–5 show status based on `pipelineOk`.
- Node 6 (UI) always shows OK.
- If `pipelineOk === false`, the STALE badge includes the age string.

### Props

```ts
interface DataPipelinePanelProps {
  pipelineOk: boolean;
  /** Formatted age of most stale signal — shown in STALE badge */
  staleAge: string;
}
```

### Loader addition

```ts
const pipelineOk = [kpFresh, xrayFresh, protonFresh, windFresh]
  .some((f) => f.status === "fresh");

const staleAges = [kpFresh, xrayFresh, protonFresh, windFresh]
  .map((f) => f.ageMinutes)
  .filter((m): m is number => m !== null);
const maxStaleMinutes = staleAges.length ? Math.max(...staleAges) : null;
const staleAge = formatAge(maxStaleMinutes);
```

### Placement in route

Replaces `<PipelineFooter>`. Placed after the geomagnetic section and before the end of `<main>`. `PipelineFooter.tsx` is deleted after `DataPipelinePanel` is verified.

---

## 3. RecentSignalsTable + SignalsModal (new)

### RecentSignalsTable visual design

Section header row: `"Recent Signals"` label (9px mono uppercase white/30) + `"View All Signals →"` button (ghost, 10px mono).

Column headers: SIGNAL · VALUE · STATUS · SOURCE · LAST INGESTED (UTC) · AGE (6-col grid: `2fr 1.2fr 1fr 1fr 1.5fr 0.7fr`).

Four signal rows (one per signal), border-separated. Each row:
- **SIGNAL cell**: 28×28 icon box (tinted bg), SVG icon, name bold 11px mono, subtitle 9px `white/30`
- **VALUE cell**: numeric value white 11px mono + unit 9px `white/35`
- **STATUS cell**: colored badge (bg + border + text per status)
- **SOURCE cell**: `white/50`, 10px mono
- **LAST INGESTED cell**: `"05/05/2026, 07:37:00"`, `white/50`, 10px mono
- **AGE cell**: `"7h"`, `white/40`, 10px mono

Signal row definitions:

| Signal | Icon color | Icon | Name | Subtitle |
|--------|-----------|------|------|---------|
| xray-flux-long | amber `#f59e0b` | sun (circle + rays) | X-Ray Flux Long | 1–8 Å |
| solar-wind-speed | blue `#60a5fa` | wind | Solar Wind Speed | ACE / DSCOVR |
| proton-flux-10mev | cyan `#22d3ee` | zap/bolt | Proton Flux 10 MeV | Integral |
| kp-index | violet `#a78bfa` | activity/waveform | Kp Index | NOAA / GFZ |

Status badge color per status string:
- `"QUIET"` / `"NOMINAL"` / `"SLOW"` → green (`#4ade80`)
- `"B — MINOR"` / `"ACTIVE"` / `"FAST"` / `"ELEVATED"` → amber (`#fbbf24`)
- `"STORM"` / `"RADIATION WATCH"` / `"EXTREME"` / `"X — EXTREME"` → red (`#f87171`)
- else → blue (`#93c5fd`)

The badge mapping lives in `RecentSignalsTable.tsx` as a pure helper:
```ts
function statusBadgeColor(status: string): { bg: string; border: string; text: string } { ... }
```

### Props

```ts
interface SignalRow {
  name: string;          // "X-Ray Flux Long"
  subtitle: string;      // "1–8 Å"
  value: string;         // "8.70e-7"
  unit: string;          // "W/m²"
  statusLabel: string;   // "B — Minor"
  source: string;        // "NOAA SWPC"
  ingestedAt: string;    // "05/05/2026, 07:37:00"
  age: string;           // "7h"
  iconColor: string;     // "#f59e0b"
  iconVariant: "sun" | "wind" | "zap" | "activity";
}

interface RecentSignalsTableProps {
  rows: SignalRow[];
  allSignals: SignalRecord[];   // for modal — all recent records combined
}
```

The parent (`dashboard.tsx`) builds `rows` from loader data. `allSignals` is the merged, timestamp-desc sorted union of the 4 recent signal arrays (already fetched by loader, just not returned yet).

### Loader additions

Return the raw recent arrays and pipeline status:
```ts
return {
  // ... existing fields ...
  recentXraySignals,
  recentProtonSignals,
  recentWindSignals,
  pipelineOk,
  staleAge,
  heroAge,
  heroIngestedTime,
  heroIngestedDate,
};
// recentKpSignals already returned
```

Build `allSignals` in the component (not the loader) to avoid serialization overhead — sort `[...recentKpSignals, ...recentXraySignals, ...recentProtonSignals, ...recentWindSignals]` by `timestamp` desc, take first 60.

### SignalsModal visual design

Full-screen backdrop: `rgba(0,0,0,0.7)`, flex center, z-50. Click outside to close.

Inner panel: `bg-[#0d1220]`, `border-white/12`, `rounded-2xl`, `w-[90%] max-w-[700px] max-h-[80vh] overflow-y-auto`, padding 24px.

Header: `"All Signals — Last 60 records"` (13px mono bold white) + `"✕ Close"` button.

Body: same 6-col table structure as `RecentSignalsTable`, listing `allSignals` (up to 60 records), sorted timestamp desc. Rows follow the same badge/color logic.

`SignalsModal` is a named export from `RecentSignalsTable.tsx`.

### State

`RecentSignalsTable` owns `const [modalOpen, setModalOpen] = useState(false)`. No state lives in `dashboard.tsx`.

### Placement in route

Inserted after `<SpaceWeatherChain />` and before the geomagnetic section, replacing nothing. Receives `rows` and `allSignals` built inline in the component body.

---

## Error handling

- Null signals: if a signal record is null, the corresponding row shows `"—"` for value and `"NO DATA"` as the status badge (neutral gray).
- Missing timestamps: `formatTimestamp` already handles invalid dates via `new Date(iso)`.
- Empty `allSignals`: modal shows `"No records yet."` centered.

---

## Testing

| File | Tests |
|------|-------|
| `DashboardHero.test.tsx` | renders QUIET/ACTIVE/STORM variants; shows correct description, risk label, freshnessAge |
| `DataPipelinePanel.test.tsx` | all nodes render; pipelineOk=true → all show OK; pipelineOk=false → nodes 1–5 show STALE with age; node 6 always OK |
| `RecentSignalsTable.test.tsx` | renders all 4 rows; "View All Signals" click opens modal; modal close button hides modal; click outside closes modal; null signal row shows "NO DATA" |

No snapshot tests. All assertions target visible text or ARIA roles.

---

## Files touched

| File | Action |
|------|--------|
| `app/components/dashboard/DashboardHero.tsx` | Rewrite |
| `app/components/dashboard/DashboardHero.test.tsx` | Create |
| `app/components/dashboard/DataPipelinePanel.tsx` | Create |
| `app/components/dashboard/DataPipelinePanel.test.tsx` | Create |
| `app/components/dashboard/RecentSignalsTable.tsx` | Create (exports `RecentSignalsTable` + `SignalsModal`) |
| `app/components/dashboard/RecentSignalsTable.test.tsx` | Create |
| `app/components/dashboard/PipelineFooter.tsx` | Delete |
| `app/components/dashboard/PipelineFooter.test.tsx` | Delete |
| `app/routes/dashboard.tsx` | Update loader return + JSX wiring |
