# Earth Weather Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/earth-weather` match the reference image pixel-perfectly with 7-card bottom row and all real data.

**Architecture:** The route loader fetches Open-Meteo weather + NOAA Kp (current + 24h history) from the HELIOS DB; sunset time and space-weather impact are derived server-side via pure utility functions. Every widget receives only the data it needs as props — no client-side fetching.

**Tech Stack:** React Router v7 SSR, TypeScript strict, Tailwind CSS v4, vitest, SVG for charts/gauges, R3F (Three.js) for globe.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| CREATE | `app/utils/sun.ts` | NOAA sunset/sunrise calculation |
| CREATE | `app/utils/sun.test.ts` | Unit tests for sun utilities |
| CREATE | `app/utils/space-impact.ts` | Derive space weather impact from Kp |
| CREATE | `app/utils/space-impact.test.ts` | Unit tests |
| CREATE | `app/components/weather/SearchBar.tsx` | Location search bar + tabs |
| REPLACE | `app/components/weather/CurrentConditionsCard.tsx` | Full-width current weather |
| REPLACE | `app/components/weather/HourlyForecastChart.tsx` | SVG line chart + hourly pills |
| REPLACE | `app/components/weather/DailyForecastCard.tsx` | 3-day forecast column |
| CREATE | `app/components/weather/KpCircleGauge.tsx` | Kp ring gauge widget |
| CREATE | `app/components/weather/PressureGauge.tsx` | Pressure speedometer gauge |
| CREATE | `app/components/weather/HumidityGauge.tsx` | Humidity circle gauge |
| CREATE | `app/components/weather/AuroraSunsetCard.tsx` | Aurora threshold + sunset card |
| CREATE | `app/components/weather/SolarAuroraChart.tsx` | Kp history SVG line chart |
| CREATE | `app/components/weather/SpaceWeatherImpactCard.tsx` | Impact table (Radio/Radiation/Geo) |
| UPDATE | `app/components/weather/WeatherGlobeScene.tsx` | "LOCATION ON EARTH" label + pulsing pin |
| REPLACE | `app/routes/earth-weather.tsx` | Full loader + layout assembly |
| DELETE | `app/components/weather/CircleGauge.tsx` | Superseded by specific gauges |

---

## Task 1: Utilities — sun.ts and space-impact.ts

**Files:**
- Create: `app/utils/sun.ts`
- Create: `app/utils/sun.test.ts`
- Create: `app/utils/space-impact.ts`
- Create: `app/utils/space-impact.test.ts`

- [ ] **Step 1: Write failing tests for sun.ts**

```typescript
// app/utils/sun.test.ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import { getSunsetTime, getSunriseTime, minutesUntilSunset } from "./sun";

describe("getSunsetTime", () => {
  it("returns HH:MM string for Reykjavik in summer", () => {
    // June 21 — midnight sun area, sunset very late
    const result = getSunsetTime(64.1355, -21.8954, new Date("2026-06-21"));
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it("returns HH:MM string for London", () => {
    const result = getSunsetTime(51.5074, -0.1278, new Date("2026-05-11"));
    expect(result).toMatch(/^\d{2}:\d{2}$/);
    // London sunset in May is roughly 20:00–21:00 UTC
    const [h] = result.split(":").map(Number);
    expect(h).toBeGreaterThanOrEqual(19);
    expect(h).toBeLessThanOrEqual(22);
  });

  it("returns a valid time for equator on equinox", () => {
    const result = getSunsetTime(0, 0, new Date("2026-03-20"));
    expect(result).toMatch(/^18:\d{2}$/); // ~18:00 UTC at equator/prime meridian
  });
});

describe("minutesUntilSunset", () => {
  it("returns positive number when sunset is in the future", () => {
    // Provide a time 2 hours from now
    const futureH = (new Date().getUTCHours() + 2) % 24;
    const str = `${String(futureH).padStart(2, "0")}:00`;
    const result = minutesUntilSunset(str);
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(0);
  });

  it("returns null when sunset has passed", () => {
    const result = minutesUntilSunset("00:00");
    // 00:00 UTC is always in the past unless it's exactly midnight
    const nowMin = new Date().getUTCHours() * 60 + new Date().getUTCMinutes();
    if (nowMin > 0) expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd "/Volumes/DiscoAndrea/Area de trabajo/03-Universidad/proyectos-clase/helios_web"
npx vitest run app/utils/sun.test.ts
```
Expected: FAIL — "Cannot find module './sun'"

- [ ] **Step 3: Implement sun.ts**

```typescript
// app/utils/sun.ts

function toJulianDay(date: Date): number {
  let Y = date.getUTCFullYear();
  let M = date.getUTCMonth() + 1;
  const D = date.getUTCDate();
  if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
}

function calcSunEvent(lat: number, lon: number, date: Date, isSunset: boolean): string {
  const JD = toJulianDay(date);
  const n  = JD - 2451545.0;

  const DEG = Math.PI / 180;
  const L  = ((280.460 + 0.9856474 * n) % 360 + 360) % 360;
  const g  = ((357.528 + 0.9856003 * n) % 360 + 360) % 360 * DEG;
  const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * DEG;
  const eps  = (23.439 - 0.0000004 * n) * DEG;
  const alpha = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda));
  const delta = Math.asin(Math.sin(eps) * Math.sin(lambda));
  const EoT   = 4 * (L * DEG - alpha) * (180 / Math.PI); // minutes

  const latRad = lat * DEG;
  const cosHA  = (Math.cos(90.833 * DEG) - Math.sin(latRad) * Math.sin(delta))
               / (Math.cos(latRad) * Math.cos(delta));

  if (cosHA < -1) return "00:00"; // midnight sun — no sunset
  if (cosHA >  1) return "N/A";   // polar night — no sunrise

  const HA = Math.acos(cosHA) * (180 / Math.PI); // degrees
  const solarNoon = 720 - 4 * lon - EoT;
  const eventMin  = isSunset ? solarNoon + 4 * HA : solarNoon - 4 * HA;
  const clamped   = ((eventMin % 1440) + 1440) % 1440;
  const h = Math.floor(clamped / 60) % 24;
  const m = Math.floor(clamped % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getSunsetTime(lat: number, lon: number, date: Date): string {
  return calcSunEvent(lat, lon, date, true);
}

export function getSunriseTime(lat: number, lon: number, date: Date): string {
  return calcSunEvent(lat, lon, date, false);
}

export function minutesUntilSunset(sunsetStr: string): number | null {
  if (sunsetStr === "N/A") return null;
  const [h, m] = sunsetStr.split(":").map(Number);
  const now = new Date();
  const sunsetTotalMin = h * 60 + m;
  const nowTotalMin    = now.getUTCHours() * 60 + now.getUTCMinutes();
  const diff = sunsetTotalMin - nowTotalMin;
  return diff > 0 ? diff : null;
}
```

- [ ] **Step 4: Write failing tests for space-impact.ts**

```typescript
// app/utils/space-impact.test.ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import { getSpaceWeatherImpact } from "./space-impact";

describe("getSpaceWeatherImpact", () => {
  it("returns all LOW for quiet Kp < 4", () => {
    const r = getSpaceWeatherImpact(1.5);
    expect(r.radioBlackout).toBe("LOW");
    expect(r.solarRadiation).toBe("LOW");
    expect(r.geomagneticStorm).toBe("LOW");
  });

  it("returns MODERATE geomagnetic at Kp 4", () => {
    const r = getSpaceWeatherImpact(4.2);
    expect(r.geomagneticStorm).toBe("MODERATE");
    expect(r.radioBlackout).toBe("LOW");
  });

  it("returns HIGH geomagnetic at Kp 5", () => {
    const r = getSpaceWeatherImpact(5.5);
    expect(r.geomagneticStorm).toBe("HIGH");
  });

  it("returns SEVERE at Kp >= 8", () => {
    const r = getSpaceWeatherImpact(9);
    expect(r.geomagneticStorm).toBe("SEVERE");
    expect(r.solarRadiation).toBe("SEVERE");
  });
});
```

- [ ] **Step 5: Implement space-impact.ts**

```typescript
// app/utils/space-impact.ts

export type ImpactLevel = "LOW" | "MODERATE" | "HIGH" | "SEVERE";

export interface SpaceWeatherImpact {
  radioBlackout: ImpactLevel;
  solarRadiation: ImpactLevel;
  geomagneticStorm: ImpactLevel;
}

export function getSpaceWeatherImpact(kp: number): SpaceWeatherImpact {
  if (kp >= 8) return { radioBlackout: "HIGH",     solarRadiation: "SEVERE",   geomagneticStorm: "SEVERE"   };
  if (kp >= 6) return { radioBlackout: "MODERATE",  solarRadiation: "HIGH",     geomagneticStorm: "HIGH"     };
  if (kp >= 5) return { radioBlackout: "LOW",        solarRadiation: "MODERATE", geomagneticStorm: "HIGH"     };
  if (kp >= 4) return { radioBlackout: "LOW",        solarRadiation: "LOW",      geomagneticStorm: "MODERATE" };
  return               { radioBlackout: "LOW",        solarRadiation: "LOW",      geomagneticStorm: "LOW"      };
}
```

- [ ] **Step 6: Run all utility tests**

```bash
npx vitest run app/utils/sun.test.ts app/utils/space-impact.test.ts
```
Expected: All PASS.

- [ ] **Step 7: Commit**

```bash
git add app/utils/sun.ts app/utils/sun.test.ts app/utils/space-impact.ts app/utils/space-impact.test.ts
git commit -m "feat(utils): add sun position calculator and space weather impact deriver"
```

---

## Task 2: Bottom Row Gauges — KpCircleGauge, PressureGauge, HumidityGauge

**Files:**
- Create: `app/components/weather/KpCircleGauge.tsx`
- Create: `app/components/weather/PressureGauge.tsx`
- Create: `app/components/weather/HumidityGauge.tsx`
- Delete: `app/components/weather/CircleGauge.tsx`

- [ ] **Step 1: Create KpCircleGauge.tsx**

```tsx
// app/components/weather/KpCircleGauge.tsx
interface Props { kp: number }

const R = 38, CX = 56, CY = 56, SW = 8;
const START = 135, SPAN = 270;
const CIRC = 2 * Math.PI * R;

function xy(deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}
function arc(a1: number, a2: number): string {
  const s = xy(a1), e = xy(a2);
  const span = ((a2 - a1) + 360) % 360;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 ${span > 180 ? 1 : 0} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

export function KpCircleGauge({ kp }: Props) {
  const safe  = Math.min(9, Math.max(0, kp));
  const color = safe >= 5 ? "#f87171" : safe >= 4 ? "#fbbf24" : "#818cf8";
  const label = safe >= 5 ? "Storm" : safe >= 4 ? "Active" : "Low Kp";
  const fillEnd = START + (safe / 9) * SPAN;

  return (
    <div className="rounded-2xl p-3 flex flex-col items-center gap-1"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-[9px] font-mono uppercase tracking-widest self-start" style={{ color: "rgba(255,255,255,0.28)" }}>
        Kp Index
      </p>
      <svg width="112" height="112" viewBox="0 0 112 112">
        <path d={arc(START, START + SPAN)} fill="none"
          stroke="rgba(255,255,255,0.07)" strokeWidth={SW} strokeLinecap="round" />
        {safe > 0.01 && (
          <path d={arc(START, fillEnd)} fill="none"
            stroke={color} strokeWidth={SW} strokeLinecap="round" opacity="0.9" />
        )}
        <text x={CX} y={CY - 2} textAnchor="middle" fill="#fff" fontSize="22" fontFamily="monospace" fontWeight="700">
          {safe.toFixed(1)}
        </text>
        <text x={CX} y={CY + 14} textAnchor="middle" fill={color} fontSize="9" fontFamily="monospace" letterSpacing="1">
          {label}
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Create PressureGauge.tsx**

```tsx
// app/components/weather/PressureGauge.tsx
interface Props { pressure: number }

// Speedometer style: 960–1040 hPa range, 270° arc
const R = 38, CX = 56, CY = 56, SW = 8;
const MIN_P = 960, MAX_P = 1040;

function pressureArc(pressure: number): string {
  const START = 135, SPAN = 270;
  const pct = Math.min(1, Math.max(0, (pressure - MIN_P) / (MAX_P - MIN_P)));
  const endDeg = START + pct * SPAN;
  const toXY = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
  };
  const s = toXY(START), e = toXY(endDeg);
  const span = pct * SPAN;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 ${span > 180 ? 1 : 0} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}
function trackArc(): string {
  const START = 135, SPAN = 270;
  const toXY = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
  };
  const s = toXY(START), e = toXY(START + SPAN);
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 1 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

export function PressureGauge({ pressure }: Props) {
  return (
    <div className="rounded-2xl p-3 flex flex-col items-center gap-1"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-[9px] font-mono uppercase tracking-widest self-start" style={{ color: "rgba(255,255,255,0.28)" }}>
        Pressure
      </p>
      <svg width="112" height="112" viewBox="0 0 112 112">
        <path d={trackArc()} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} strokeLinecap="round" />
        <path d={pressureArc(pressure)} fill="none" stroke="#60a5fa" strokeWidth={SW} strokeLinecap="round" opacity="0.9" />
        <text x={CX} y={CY - 2} textAnchor="middle" fill="#fff" fontSize="18" fontFamily="monospace" fontWeight="700">
          {pressure}
        </text>
        <text x={CX} y={CY + 14} textAnchor="middle" fill="#60a5fa" fontSize="9" fontFamily="monospace" letterSpacing="1">
          hPa
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: Create HumidityGauge.tsx**

```tsx
// app/components/weather/HumidityGauge.tsx
interface Props { humidity: number }

export function HumidityGauge({ humidity }: Props) {
  const R = 38, CX = 56, CY = 56, SW = 8;
  const circumference = 2 * Math.PI * R;
  const dashOffset = circumference * (1 - humidity / 100);
  const color = humidity >= 80 ? "#34d399" : humidity >= 60 ? "#60a5fa" : "#818cf8";
  const label = humidity >= 80 ? "High" : humidity >= 40 ? "Normal" : "Low";

  return (
    <div className="rounded-2xl p-3 flex flex-col items-center gap-1"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-[9px] font-mono uppercase tracking-widest self-start" style={{ color: "rgba(255,255,255,0.28)" }}>
        Humidity
      </p>
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={SW} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={color} strokeWidth={SW}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${CX} ${CY})`} opacity="0.9" />
        <text x={CX} y={CY - 2} textAnchor="middle" fill="#fff" fontSize="20" fontFamily="monospace" fontWeight="700">
          {humidity}%
        </text>
        <text x={CX} y={CY + 14} textAnchor="middle" fill={color} fontSize="9" fontFamily="monospace" letterSpacing="1">
          {label}
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Delete old CircleGauge.tsx**

```bash
rm "app/components/weather/CircleGauge.tsx"
```

- [ ] **Step 5: Typecheck**

```bash
npm run typecheck
```
Expected: 0 errors (CircleGauge was not imported anywhere else yet).

- [ ] **Step 6: Commit**

```bash
git add app/components/weather/KpCircleGauge.tsx app/components/weather/PressureGauge.tsx app/components/weather/HumidityGauge.tsx
git rm app/components/weather/CircleGauge.tsx
git commit -m "feat(weather): add specific bottom-row gauges, remove generic CircleGauge"
```

---

## Task 3: AuroraSunsetCard

**Files:**
- Create: `app/components/weather/AuroraSunsetCard.tsx`

- [ ] **Step 1: Create AuroraSunsetCard.tsx**

```tsx
// app/components/weather/AuroraSunsetCard.tsx
interface Props {
  kp: number;
  sunset: string;       // "HH:MM" UTC
  sunrise: string;      // "HH:MM" UTC
  minutesToSunset: number | null;
}

export function AuroraSunsetCard({ kp, sunset, sunrise, minutesToSunset }: Props) {
  const auroraThreshold = 5;
  const canSeek = kp >= auroraThreshold;
  const kpColor = canSeek ? "#f87171" : "#4ade80";

  const hours   = minutesToSunset != null ? Math.floor(minutesToSunset / 60) : null;
  const minutes = minutesToSunset != null ? minutesToSunset % 60 : null;
  const countdown = hours != null && minutes != null
    ? `${hours}h ${String(minutes).padStart(2, "0")}m`
    : "—";

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 h-full"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        Aurora &amp; Sunset
      </p>

      {/* Aurora section */}
      <div className="flex flex-col gap-1">
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
          AURORA Kp
        </span>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: "monospace", color: "#fff" }}>
            {kp.toFixed(1)}
          </span>
          <div className="flex flex-col">
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>
              Min: {auroraThreshold}.0
            </span>
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: kpColor, fontWeight: 600 }}>
              {canSeek ? "VISIBLE" : "NOT VISIBLE"}
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

      {/* Sunset section */}
      <div className="flex flex-col gap-1">
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
          SUNSET
        </span>
        <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: "monospace", color: "#fff" }}>
          {sunset}
        </span>
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>
          {minutesToSunset != null ? `in ${countdown}` : "has passed"}
        </span>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

      {/* Sunrise */}
      <div className="flex items-center justify-between">
        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)" }}>Sunrise</span>
        <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.60)", fontWeight: 600 }}>{sunrise}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/weather/AuroraSunsetCard.tsx
git commit -m "feat(weather): add AuroraSunsetCard with real Kp + calculated sunset"
```

---

## Task 4: SolarAuroraChart

**Files:**
- Create: `app/components/weather/SolarAuroraChart.tsx`

- [ ] **Step 1: Create SolarAuroraChart.tsx**

```tsx
// app/components/weather/SolarAuroraChart.tsx
import type { SignalRecord } from "~/types/signal";

interface Props {
  history: SignalRecord[];
  currentKp: number;
}

const W = 200, H = 80;
const THRESHOLD = 5;

export function SolarAuroraChart({ history, currentKp }: Props) {
  const isActive = currentKp >= THRESHOLD;
  const statusColor = isActive ? "#f87171" : "#4ade80";
  const statusLabel = isActive ? "ACTIVE" : "INACTIVE";

  // Build polyline points from last 24 entries
  const pts = history.slice(-24).filter((r) => typeof r.value === "number");
  const maxKp = Math.max(9, ...pts.map((r) => r.value as number));

  const points = pts.map((r, i) => {
    const x = pts.length < 2 ? W / 2 : (i / (pts.length - 1)) * W;
    const y = H - ((r.value as number) / maxKp) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const thresholdY = H - (THRESHOLD / maxKp) * H;

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2 h-full"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
          Solar Aurora
        </p>
        <div className="flex items-center gap-1.5">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, boxShadow: `0 0 5px ${statusColor}`, display: "inline-block" }} />
          <span style={{ fontSize: "9px", fontFamily: "monospace", color: statusColor, fontWeight: 700, letterSpacing: "0.1em" }}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 80 }}>
        {pts.length > 1 ? (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none">
            {/* Threshold line at Kp=5 */}
            <line x1="0" y1={thresholdY.toFixed(1)} x2={W} y2={thresholdY.toFixed(1)}
              stroke="rgba(248,113,113,0.35)" strokeWidth="1" strokeDasharray="4 3" />
            {/* Area fill */}
            <linearGradient id="aurora-fill" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor={statusColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={statusColor} stopOpacity="0.02" />
            </linearGradient>
            <polygon
              points={`0,${H} ${points} ${W},${H}`}
              fill="url(#aurora-fill)" />
            {/* Line */}
            <polyline points={points} fill="none" stroke={statusColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.2)" }}>No history</span>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <span style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>24h</span>
        <span style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>now</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and commit**

```bash
npm run typecheck
git add app/components/weather/SolarAuroraChart.tsx
git commit -m "feat(weather): add SolarAuroraChart with real Kp history from DB"
```

---

## Task 5: SpaceWeatherImpactCard

**Files:**
- Create: `app/components/weather/SpaceWeatherImpactCard.tsx`

- [ ] **Step 1: Create SpaceWeatherImpactCard.tsx**

```tsx
// app/components/weather/SpaceWeatherImpactCard.tsx
import type { SpaceWeatherImpact, ImpactLevel } from "~/utils/space-impact";

interface Props { impact: SpaceWeatherImpact }

const BADGE_STYLE: Record<ImpactLevel, { bg: string; color: string }> = {
  LOW:      { bg: "rgba(74,222,128,0.12)",  color: "#4ade80" },
  MODERATE: { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24" },
  HIGH:     { bg: "rgba(248,113,113,0.12)", color: "#f87171" },
  SEVERE:   { bg: "rgba(239,68,68,0.20)",   color: "#ef4444" },
};

function ImpactRow({ label, level }: { label: string; level: ImpactLevel }) {
  const s = BADGE_STYLE[level];
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.45)" }}>{label}</span>
      <span style={{ fontSize: "9px", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.06em",
        color: s.color, background: s.bg, padding: "2px 8px", borderRadius: 99 }}>
        {level}
      </span>
    </div>
  );
}

export function SpaceWeatherImpactCard({ impact }: Props) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2 h-full"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        Space Weather Impact
      </p>
      <div className="flex flex-col">
        <ImpactRow label="Radio Blackout"    level={impact.radioBlackout} />
        <ImpactRow label="Solar Radiation"   level={impact.solarRadiation} />
        <ImpactRow label="Geomagnetic Storm" level={impact.geomagneticStorm} />
      </div>
      <p style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.20)", marginTop: "auto" }}>
        Data Source: NOAA SWPC · HELIOS DB
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and commit**

```bash
npm run typecheck
git add app/components/weather/SpaceWeatherImpactCard.tsx
git commit -m "feat(weather): add SpaceWeatherImpactCard derived from real Kp"
```

---

## Task 6: SearchBar

**Files:**
- Create: `app/components/weather/SearchBar.tsx`

- [ ] **Step 1: Create SearchBar.tsx**

```tsx
// app/components/weather/SearchBar.tsx
const TABS = ["Today", "Map View", "3D", "Terrain", "Satellite Solutions"];

interface Props { city: string }

export function SearchBar({ city }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {/* Input */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-2.5"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.40)"
          strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <span style={{ flex: 1, fontSize: "13px", fontFamily: "monospace", color: "rgba(255,255,255,0.70)" }}>
          {city}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.30)"
          strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </div>
      {/* Tabs */}
      <div className="flex gap-1">
        {TABS.map((tab, i) => (
          <button key={tab}
            className="px-3 py-1 rounded-lg text-[10px] font-mono tracking-wide transition-colors"
            style={{
              background: i === 0 ? "rgba(59,130,246,0.20)" : "rgba(255,255,255,0.04)",
              border: i === 0 ? "1px solid rgba(59,130,246,0.35)" : "1px solid rgba(255,255,255,0.07)",
              color: i === 0 ? "#93c5fd" : "rgba(255,255,255,0.35)",
            }}>
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and commit**

```bash
npm run typecheck
git add app/components/weather/SearchBar.tsx
git commit -m "feat(weather): add SearchBar with location display and view tabs"
```

---

## Task 7: CurrentConditionsCard + HourlyForecastChart

**Files:**
- Create: `app/components/weather/CurrentConditionsCard.tsx`
- Create: `app/components/weather/HourlyForecastChart.tsx`

- [ ] **Step 1: Create CurrentConditionsCard.tsx**

```tsx
// app/components/weather/CurrentConditionsCard.tsx
import { useEffect, useState } from "react";
import type { WeatherData } from "~/services/fetchers/open-meteo.server";
import { wmoLabel, wmoIcon } from "~/utils/wmo";
import { WeatherIcon } from "./WeatherIcon";

interface Props { weather: WeatherData; city: string }

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 600, color: "rgba(255,255,255,0.70)" }}>
        {value}
      </span>
    </div>
  );
}

export function CurrentConditionsCard({ weather, city }: Props) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => setClock(new Date().toISOString().slice(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const { current } = weather;
  const icon  = wmoIcon(current.weatherCode);
  const label = wmoLabel(current.weatherCode);

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.28)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Current Conditions
          </p>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", marginTop: 2 }}>{city}</p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span style={{ fontSize: "9px", fontFamily: "monospace", color: "#4ade80",
            background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)",
            padding: "2px 8px", borderRadius: 99, letterSpacing: "0.1em" }}>
            LIVE
          </span>
          <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>
            {clock}
          </span>
        </div>
      </div>

      {/* Temp + icon */}
      <div className="flex items-center gap-4">
        <WeatherIcon type={icon} size={64} color="rgba(148,163,184,0.85)" />
        <div>
          <div style={{ fontSize: 56, fontWeight: 700, fontFamily: "monospace", color: "#fff", lineHeight: 1 }}>
            {current.temperature}°
          </div>
          <div style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            {label}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-1.5 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <StatItem label="Wind Speed" value={`${current.windSpeed} km/h`} />
        <StatItem label="Pressure"   value={`${current.pressure} hPa`} />
        <StatItem label="Humidity"   value={`${current.humidity}%`} />
        <StatItem label="UV Index"   value={String(current.uvIndex)} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create HourlyForecastChart.tsx**

```tsx
// app/components/weather/HourlyForecastChart.tsx
import type { WeatherData } from "~/services/fetchers/open-meteo.server";
import { wmoIcon } from "~/utils/wmo";
import { WeatherIcon } from "./WeatherIcon";

interface Props { hourly: WeatherData["hourly"] }

const CHART_H = 50;
const CHART_W = 280;

export function HourlyForecastChart({ hourly }: Props) {
  const temps = hourly.map((h) => h.temperature);
  const minT  = Math.min(...temps) - 2;
  const maxT  = Math.max(...temps) + 2;
  const range = maxT - minT || 1;

  const toY = (t: number) => CHART_H - ((t - minT) / range) * CHART_H;
  const toX = (i: number) => hourly.length < 2 ? CHART_W / 2 : (i / (hourly.length - 1)) * CHART_W;

  const points = hourly.map((h, i) => `${toX(i).toFixed(1)},${toY(h.temperature).toFixed(1)}`).join(" ");
  const areaPoints = `0,${CHART_H} ${points} ${CHART_W},${CHART_H}`;

  return (
    <div className="rounded-2xl p-3 flex flex-col gap-2"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        Hourly Forecast
      </p>

      {/* Temperature line chart */}
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} width="100%" height={CHART_H} preserveAspectRatio="none">
        <defs>
          <linearGradient id="hourly-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#hourly-fill)" />
        <polyline points={points} fill="none" stroke="#60a5fa" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Temp dots */}
        {hourly.map((h, i) => (
          <circle key={i} cx={toX(i).toFixed(1)} cy={toY(h.temperature).toFixed(1)}
            r="2.5" fill="#60a5fa" opacity="0.8" />
        ))}
      </svg>

      {/* Icon + time pills */}
      <div className="flex gap-1 overflow-x-auto">
        {hourly.map((h, i) => {
          const hour = new Date(h.time).toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC",
          });
          return (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0 px-2 py-1 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", minWidth: 48 }}>
              <span style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.30)" }}>{hour}</span>
              <WeatherIcon type={wmoIcon(h.weatherCode)} size={18} color="rgba(148,163,184,0.8)" />
              <span style={{ fontSize: "10px", fontFamily: "monospace", fontWeight: 600, color: "#e2e8f0" }}>
                {h.temperature}°
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck and commit**

```bash
npm run typecheck
git add app/components/weather/CurrentConditionsCard.tsx app/components/weather/HourlyForecastChart.tsx
git commit -m "feat(weather): redesign CurrentConditionsCard and HourlyForecastChart with SVG line"
```

---

## Task 8: DailyForecastCard

**Files:**
- Create: `app/components/weather/DailyForecastCard.tsx`

- [ ] **Step 1: Create DailyForecastCard.tsx**

```tsx
// app/components/weather/DailyForecastCard.tsx
import type { WeatherData } from "~/services/fetchers/open-meteo.server";
import { wmoIcon, wmoLabel } from "~/utils/wmo";
import { WeatherIcon } from "./WeatherIcon";

interface Props { daily: WeatherData["daily"] }

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function DailyForecastCard({ daily }: Props) {
  const todayIdx = new Date().getDay();

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2 h-full"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
        3-Day Forecast
      </p>
      <div className="flex flex-col gap-2 flex-1">
        {daily.slice(1).map((d, i) => {
          const dow   = DAYS[(todayIdx + i + 1) % 7];
          const isNxt = i === 0;
          return (
            <div key={d.date}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 flex-1"
              style={{
                background: isNxt ? "rgba(59,130,246,0.10)" : "rgba(255,255,255,0.03)",
                border: isNxt ? "1px solid rgba(59,130,246,0.25)" : "1px solid rgba(255,255,255,0.05)",
              }}>
              <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 700,
                color: isNxt ? "#93c5fd" : "rgba(255,255,255,0.45)", minWidth: 30 }}>
                {dow}
              </span>
              <WeatherIcon type={wmoIcon(d.weatherCode)} size={22} color="rgba(148,163,184,0.8)" />
              <span style={{ fontSize: "9px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)", flex: 1 }}>
                {wmoLabel(d.weatherCode)}
              </span>
              <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 600, color: "#e2e8f0" }}>
                {d.tempMax}°
                <span style={{ color: "rgba(255,255,255,0.30)", marginLeft: 4 }}>{d.tempMin}°</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and commit**

```bash
npm run typecheck
git add app/components/weather/DailyForecastCard.tsx
git commit -m "feat(weather): add DailyForecastCard with highlighted next-day row"
```

---

## Task 9: WeatherGlobeScene — label + pulsing pin

**Files:**
- Modify: `app/components/weather/WeatherGlobeScene.tsx`

- [ ] **Step 1: Add "LOCATION ON EARTH" label and pulse ring to the globe**

Replace the label section at the bottom of `WeatherGlobeScene.tsx` (the `<div className="absolute top-4...">` block and the inner `EarthWithPin` pin code) with:

In `EarthWithPin`, replace the two pin meshes with three (add a pulsing outer ring):

```tsx
{/* Pin core */}
<mesh ref={pinRef} position={pinPos}>
  <sphereGeometry args={[0.020, 12, 12]} />
  <meshBasicMaterial color="#38bdf8" />
</mesh>
{/* Inner glow */}
<mesh position={pinPos}>
  <sphereGeometry args={[0.034, 12, 12]} />
  <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} />
</mesh>
{/* Outer pulse ring */}
<mesh position={pinPos}>
  <sphereGeometry args={[0.050, 12, 12]} />
  <meshBasicMaterial color="#38bdf8" transparent opacity={0.10} />
</mesh>
```

Replace the HTML overlay block:

```tsx
{/* Location label overlay */}
<div className="absolute inset-x-0 top-3 pointer-events-none flex flex-col items-center gap-1">
  <span style={{ fontSize: "8px", fontFamily: "monospace", color: "rgba(255,255,255,0.35)",
    letterSpacing: "0.16em", textTransform: "uppercase" }}>
    Location on Earth
  </span>
  <div className="flex items-center gap-1.5">
    <svg width="8" height="10" viewBox="0 0 8 10" fill="#38bdf8">
      <path d="M4 0C2.07 0 .5 1.57.5 3.5 .5 6.13 4 10 4 10s3.5-3.87 3.5-6.5C7.5 1.57 5.93 0 4 0zm0 4.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"/>
    </svg>
    <span style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: 600, color: "#e2e8f0" }}>
      Reykjavik, Iceland
    </span>
  </div>
</div>
```

- [ ] **Step 2: Typecheck and commit**

```bash
npm run typecheck
git add app/components/weather/WeatherGlobeScene.tsx
git commit -m "feat(weather): improve globe with 'Location on Earth' label and triple-ring pin"
```

---

## Task 10: Route Assembly

**Files:**
- Replace: `app/routes/earth-weather.tsx`

- [ ] **Step 1: Rewrite the route**

```tsx
// app/routes/earth-weather.tsx
import { lazy, Suspense } from "react";
import type { Route } from "./+types/earth-weather";
import { fetchOpenMeteo } from "~/services/fetchers/open-meteo.server";
import { getLatestSignalByName, listRecentSignalsByName } from "~/services/signals.server";
import { getMoonPhase } from "~/utils/moon-phase";
import { getSunsetTime, getSunriseTime, minutesUntilSunset } from "~/utils/sun";
import { getSpaceWeatherImpact } from "~/utils/space-impact";
import { DashboardTopbar } from "~/components/layout/DashboardTopbar";
import { SearchBar } from "~/components/weather/SearchBar";
import { CurrentConditionsCard } from "~/components/weather/CurrentConditionsCard";
import { HourlyForecastChart } from "~/components/weather/HourlyForecastChart";
import { DailyForecastCard } from "~/components/weather/DailyForecastCard";
import { KpCircleGauge } from "~/components/weather/KpCircleGauge";
import { PressureGauge } from "~/components/weather/PressureGauge";
import { HumidityGauge } from "~/components/weather/HumidityGauge";
import { AuroraSunsetCard } from "~/components/weather/AuroraSunsetCard";
import { MoonPhaseWidget } from "~/components/weather/MoonPhaseWidget";
import { SolarAuroraChart } from "~/components/weather/SolarAuroraChart";
import { SpaceWeatherImpactCard } from "~/components/weather/SpaceWeatherImpactCard";

const DEFAULT_LAT  = 64.1355;
const DEFAULT_LON  = -21.8954;
const DEFAULT_CITY = "Reykjavik, Iceland";

const WeatherGlobeScene = lazy(() =>
  import("~/components/weather/WeatherGlobeScene").then((m) => ({ default: m.WeatherGlobeScene }))
);

export function meta(_: Route.MetaArgs) {
  return [{ title: "HELIOS — Earth Weather Explorer" }];
}

export async function loader(_: Route.LoaderArgs) {
  const now = new Date();
  const [weather, kpSignal, kpHistory] = await Promise.all([
    fetchOpenMeteo(DEFAULT_LAT, DEFAULT_LON).catch(() => null),
    Promise.resolve(getLatestSignalByName("kp-index")),
    Promise.resolve(listRecentSignalsByName("kp-index", 48)),
  ]);
  const kp      = typeof kpSignal?.value === "number" ? kpSignal.value : 0;
  const moon    = getMoonPhase(now);
  const sunset  = getSunsetTime(DEFAULT_LAT, DEFAULT_LON, now);
  const sunrise = getSunriseTime(DEFAULT_LAT, DEFAULT_LON, now);
  const minsToSunset = minutesUntilSunset(sunset);
  const impact  = getSpaceWeatherImpact(kp);
  return { weather, kp, kpHistory, moon, sunset, sunrise, minsToSunset, impact };
}

export default function EarthWeatherPage({ loaderData }: Route.ComponentProps) {
  const { weather, kp, kpHistory, moon, sunset, sunrise, minsToSunset, impact } = loaderData;

  return (
    <div className="flex flex-col h-screen" style={{ background: "#050a12" }}>
      <DashboardTopbar title="Earth Weather Explorer" />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <SearchBar city={DEFAULT_CITY} />

        {/* 3-column main section */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "300px 1fr 240px", flex: 1, minHeight: 0 }}>
          {/* Left: current + hourly */}
          <div className="flex flex-col gap-3">
            {weather ? (
              <>
                <CurrentConditionsCard weather={weather} city={DEFAULT_CITY} />
                <HourlyForecastChart hourly={weather.hourly} />
              </>
            ) : (
              <div className="rounded-2xl p-4 flex items-center justify-center flex-1"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>
                  Weather unavailable
                </span>
              </div>
            )}
          </div>

          {/* Center: globe */}
          <div className="rounded-2xl overflow-hidden relative"
            style={{ background: "#060b14", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <span style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(255,255,255,0.2)" }}>
                  Loading globe…
                </span>
              </div>
            }>
              <WeatherGlobeScene />
            </Suspense>
          </div>

          {/* Right: 3-day forecast */}
          {weather ? (
            <DailyForecastCard daily={weather.daily} />
          ) : (
            <div className="rounded-2xl p-4 flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(255,255,255,0.25)" }}>
                Forecast unavailable
              </span>
            </div>
          )}
        </div>

        {/* 7-card bottom row */}
        <div className="grid gap-3"
          style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr 1.4fr 1.4fr" }}>
          <AuroraSunsetCard
            kp={kp}
            sunset={sunset}
            sunrise={sunrise}
            minutesToSunset={minsToSunset}
          />
          <KpCircleGauge kp={kp} />
          {weather ? <PressureGauge pressure={weather.current.pressure} /> : <div />}
          {weather ? <HumidityGauge humidity={weather.current.humidity} /> : <div />}
          <MoonPhaseWidget moon={moon} />
          <SolarAuroraChart history={kpHistory} currentKp={kp} />
          <SpaceWeatherImpactCard impact={impact} />
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```
Expected: 0 errors.

- [ ] **Step 3: Run full test suite**

```bash
npm test
```
Expected: All pass.

- [ ] **Step 4: Build**

```bash
npm run build
```
Expected: Build succeeds, no warnings about missing modules.

- [ ] **Step 5: Commit**

```bash
git add app/routes/earth-weather.tsx
git commit -m "feat(earth-weather): assemble full pixel-perfect layout with 7-card bottom row and real data"
```

---

## Task 11: Visual Polish Pass

**Files:**
- Modify: All weather components (minor tweaks only — no logic changes)

- [ ] **Step 1: Verify against reference image — check each region**

Open `http://localhost:5173/earth-weather` (or port 3001 if in use) and compare:

| Region | Reference | Check |
|--------|-----------|-------|
| Search bar | Blue "Today" tab active, white input | ✓/✗ |
| Current temp | 4°C large, condition below | ✓/✗ |
| Stats rows | 5 rows, right-aligned values | ✓/✗ |
| Hourly chart | Blue line, dot per hour | ✓/✗ |
| Globe | Night texture, Reykjavik pin, "Location on Earth" label | ✓/✗ |
| 3-Day | Next day highlighted blue | ✓/✗ |
| Aurora card | Kp + sunset time both present | ✓/✗ |
| Kp gauge | Ring gauge with Low Kp label | ✓/✗ |
| Pressure | Speedometer style, hPa label | ✓/✗ |
| Humidity | Circle, % value, High/Normal/Low | ✓/✗ |
| Moon | Crescent SVG + phase name | ✓/✗ |
| Aurora chart | Line chart + ACTIVE/INACTIVE | ✓/✗ |
| Impact card | 3 rows + LOW/MODERATE/HIGH badges | ✓/✗ |

- [ ] **Step 2: Fix any pixel-level mismatches** (card padding, font sizes, border opacity)

Adjust specific values inline until visual match is achieved. Run `npm run typecheck` after each change.

- [ ] **Step 3: Final commit**

```bash
git add -p   # stage only polish changes
git commit -m "style(earth-weather): visual polish pass to match reference image"
```

---

## Self-Review

**Spec coverage:**
- ✅ Search bar + tabs → Task 6
- ✅ CurrentConditionsCard redesign → Task 7
- ✅ HourlyForecastChart with SVG line → Task 7
- ✅ DailyForecastCard → Task 8
- ✅ AuroraSunsetCard with real sunset → Task 3
- ✅ KpCircleGauge → Task 2
- ✅ PressureGauge → Task 2
- ✅ HumidityGauge → Task 2
- ✅ SolarAuroraChart with DB data → Task 4
- ✅ SpaceWeatherImpactCard → Task 5
- ✅ Globe improvements → Task 9
- ✅ sun.ts + space-impact.ts utilities → Task 1
- ✅ Route loader with all real data → Task 10
- ✅ Visual polish → Task 11

**Type consistency:**
- `WeatherData` from `open-meteo.server` used consistently in Tasks 7, 8, 10
- `SpaceWeatherImpact` / `ImpactLevel` from `space-impact.ts` used in Tasks 5, 10
- `SignalRecord[]` for kpHistory used in Tasks 4, 10
- `MoonPhaseResult` from `moon-phase.ts` used in Tasks (MoonPhaseWidget already typed)

**No placeholders:** All steps contain complete code.
