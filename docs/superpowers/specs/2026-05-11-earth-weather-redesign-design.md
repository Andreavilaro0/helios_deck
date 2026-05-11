# Earth Weather View — Pixel-Perfect Redesign

**Date:** 2026-05-11  
**Route:** `/earth-weather`  
**Goal:** Match reference image exactly. All data must be real (no mocks).

---

## 1. Reference Analysis

The target design has this overall structure:

```
┌─ Topbar ──────────────────────────────────────────────────────────────────┐
│ HELIOS logo · "Earth Weather Explorer" · date/time · status pills         │
├─ Search bar ──────────────────────────────────────────────────────────────┤
│ 🔍 Reykjavik, Iceland [×]                                                 │
│ [Today] [Map View] [3D] [Terrain] [Satellite Solutions]                   │
├─ Left col (300px) ──┬─ Center (1fr) ─────┬─ Right col (240px) ───────────┤
│ CurrentConditions   │ Globe 3D            │ 3-Day Forecast                │
│ ─────────────────── │ "LOCATION ON EARTH" │ WED 7°/3°                     │
│ HourlyForecast      │ pin: Reykjavik      │ THU 8°/2°                     │
│ (chart + icons)     │                     │ FRI 16°/6°                    │
│                     │                     │ SAT  6°/2°                    │
├─ Bottom row (7 cards, equal width) ───────────────────────────────────────┤
│ AuroraSunset │ KpGauge │ PressureGauge │ HumidityGauge │ Moon │ AuroraChart │ SpaceImpact │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Sources (all real)

| Data | Source | Already exists? |
|------|--------|-----------------|
| Temperature, humidity, wind, pressure, UV, hourly, daily | Open-Meteo API (free) | ✅ fetcher exists |
| Kp index (current) | NOAA via HELIOS SQLite | ✅ |
| Kp index history (24h) | NOAA via HELIOS SQLite `listRecentSignalsByName` | ✅ |
| Sunset time | Calculated via sun-position algorithm (lat/lon/date) | ❌ needs `app/utils/sun.ts` |
| Moon phase | Lunar cycle calculation | ✅ `app/utils/moon-phase.ts` |
| Space weather impact | Derived from Kp: LOW(<4), MED(4-5), HIGH(≥5) | ❌ needs `app/utils/space-impact.ts` |

### Sunset Algorithm
Use the NOAA solar calculator formulas (no API needed). Inputs: lat=64.1355, lon=-21.8954, date=today, timezone offset. Output: sunset time as HH:MM string.

---

## 3. Component Inventory

### New / Redesigned

**`app/components/weather/SearchBar.tsx`** (~60 lines)
- Input with magnifier icon + city name
- Clear (×) button
- Tab row: Today · Map View · 3D · Terrain · Satellite Solutions
- Static tabs (no routing) — visual only for now

**`app/components/weather/CurrentConditionsCard.tsx`** (~130 lines)
- Header: location name + LIVE badge + live clock (useEffect, 1s interval)
- Left: large weather illustration SVG + `4°C` + condition label + "X mm expected"
- Right column: five stat rows (Current Time, Wind Speed, Pressure, UV Index, Humidity)
- Border bottom: separates from hourly

**`app/components/weather/HourlyForecastChart.tsx`** (~120 lines)
- SVG polyline chart of temperatures over 8 hours
- Below the chart: row of {time, WeatherIcon, temp} pills
- Chart height: 60px, uses viewBox with auto-scaled Y axis

**`app/components/weather/DailyForecastCard.tsx`** (~80 lines)
- "3-DAY FORECAST" header
- 4 rows (skip today): day abbrev · left icon · condition text · high°/low° · right icon
- Row for THU has blue highlight (current + 1 day)

**`app/components/weather/AuroraSunsetCard.tsx`** (~80 lines)
- Two sections separated by divider:
  - **Aurora Kp:** shows min Kp threshold (5.0) + current Kp status
  - **Sunset:** shows calculated sunset time + countdown "X h YY min"

**`app/components/weather/KpCircleGauge.tsx`** (~70 lines)
- Ring gauge, 0–9 scale
- Large center value + "Low Kp" / "Active" / "Storm" label
- Color: violet/amber/red based on level

**`app/components/weather/PressureGauge.tsx`** (~80 lines)
- Speedometer-style arc (270°)
- Scale: 960–1040 hPa
- Center: value + "hPa"
- Color: blue

**`app/components/weather/HumidityGauge.tsx`** (~60 lines)  
- Simple circle gauge, 0–100%
- Center: value% + "High"/"Normal"/"Low"
- Color: teal

**`app/components/weather/SolarAuroraChart.tsx`** (~90 lines)  
- SVG line chart of Kp history (24h from DB)
- Horizontal threshold line at Kp=5
- Status badge: INACTIVE / ACTIVE based on latest Kp
- "Aurora Level" header

**`app/components/weather/SpaceWeatherImpactCard.tsx`** (~80 lines)
- "SPACE WEATHER IMPACT" header
- Three rows: Radio Blackout · Solar Radiation · Geomagnetic Storm
- Each row: label + colored badge (LOW/MODERATE/HIGH/SEVERE)
- Derived from current Kp:
  - Kp<4: all LOW
  - Kp 4–5: Geomagnetic = MODERATE
  - Kp 5–6: Geomagnetic = HIGH, Radio = MODERATE
  - Kp≥6: all HIGH/SEVERE

**`app/components/weather/WeatherGlobeScene.tsx`** (update existing)
- Keep R3F Earth + pin
- Add "LOCATION ON EARTH" label at top
- Add "Reykjavik" label near pin with pulsing dot

### Existing (keep / minor tweaks)
- `WeatherIcon.tsx` — keep as-is
- `MoonPhaseWidget.tsx` — minor style tweak to match reference
- `app/utils/moon-phase.ts` — keep as-is

---

## 4. New Utility Files

**`app/utils/sun.ts`**
```
getSunsetTime(lat, lon, date) → "23:48"
getSunriseTime(lat, lon, date) → "03:12"
getMinutesUntilSunset(sunsetStr) → number
```
Uses NOAA solar position equations — no external dependency.

**`app/utils/space-impact.ts`**
```
getSpaceWeatherImpact(kp) → {
  radioBlackout: "LOW" | "MODERATE" | "HIGH" | "SEVERE",
  solarRadiation: "LOW" | "MODERATE" | "HIGH" | "SEVERE",
  geomagneticStorm: "LOW" | "MODERATE" | "HIGH" | "SEVERE",
}
```

---

## 5. Route Changes (`app/routes/earth-weather.tsx`)

### Loader additions
```ts
const [weather, kpSignal, kpHistory] = await Promise.all([
  fetchOpenMeteo(DEFAULT_LAT, DEFAULT_LON).catch(() => null),
  Promise.resolve(getLatestSignalByName("kp-index")),
  Promise.resolve(listRecentSignalsByName("kp-index", 48)),  // 24h at 30min intervals
]);
const moon   = getMoonPhase(new Date());
const sunset = getSunsetTime(DEFAULT_LAT, DEFAULT_LON, new Date());
const kp     = typeof kpSignal?.value === "number" ? kpSignal.value : 0;
const impact = getSpaceWeatherImpact(kp);
```

### Layout
```tsx
<div className="flex flex-col h-screen">
  <DashboardTopbar title="Earth Weather Explorer" />
  <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
    <SearchBar city={DEFAULT_CITY} />
    <div className="grid gap-3" style={{ gridTemplateColumns: "300px 1fr 240px", flex: 1 }}>
      <div className="flex flex-col gap-3">
        <CurrentConditionsCard weather={weather} />
        <HourlyForecastChart hourly={weather.hourly} />
      </div>
      <WeatherGlobeScene />   {/* lazy */}
      <DailyForecastCard daily={weather.daily} />
    </div>
    <div className="grid gap-3" style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr 1.4fr 1.4fr" }}>
      <AuroraSunsetCard kp={kp} sunset={sunset} />
      <KpCircleGauge kp={kp} />
      <PressureGauge pressure={weather.current.pressure} />
      <HumidityGauge humidity={weather.current.humidity} />
      <MoonPhaseWidget moon={moon} />
      <SolarAuroraChart history={kpHistory} currentKp={kp} />
      <SpaceWeatherImpactCard impact={impact} />
    </div>
  </main>
</div>
```

---

## 6. Visual Tokens

| Token | Value |
|-------|-------|
| Page background | `#050a12` |
| Card background | `rgba(255,255,255,0.025)` |
| Card border | `1px solid rgba(255,255,255,0.07)` |
| Card radius | `16px` |
| Text primary | `#e2e8f0` |
| Text secondary | `rgba(255,255,255,0.40)` |
| Text muted | `rgba(255,255,255,0.22)` |
| Font | monospace (existing) |
| Accent blue | `#3b82f6` |
| LIVE badge | green `#4ade80` bg `rgba(74,222,128,0.12)` |
| LOW badge | `rgba(74,222,128,0.15)` text `#4ade80` |
| MODERATE badge | `rgba(251,191,36,0.15)` text `#fbbf24` |
| HIGH badge | `rgba(248,113,113,0.15)` text `#f87171` |

---

## 7. Implementation Order

1. `app/utils/sun.ts` + `app/utils/space-impact.ts`
2. `AuroraSunsetCard`, `KpCircleGauge`, `PressureGauge`, `HumidityGauge` (bottom row)
3. `SolarAuroraChart`, `SpaceWeatherImpactCard` (bottom row)
4. `SearchBar` + `CurrentConditionsCard` redesign + `HourlyForecastChart` 
5. `DailyForecastCard` redesign
6. `WeatherGlobeScene` label/pin improvements
7. Route layout assembly + loader additions
8. Visual polish pass (tokens, spacing, typography)

---

## 8. Done When

- [ ] Page matches reference image layout exactly (3-column + 7-card bottom)
- [ ] All 7 bottom cards render with correct data
- [ ] Sunset time is calculated (not mocked)
- [ ] Aurora chart uses real Kp history from HELIOS DB
- [ ] Space weather impact derived from real Kp
- [ ] No placeholder/mock data anywhere
- [ ] TypeScript strict passes, no `any`
- [ ] Build succeeds
