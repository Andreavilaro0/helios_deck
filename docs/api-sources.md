# HELIOS_DECK — API Sources

## Candidates Evaluated for MVP 1

| # | Source | Auth | Rate limit | Format | CORS | Reliability | Latency |
|---|--------|------|-----------|--------|------|-------------|---------|
| 1 | NOAA SWPC | None | None documented | JSON | Yes | Very high (NOAA) | Low |
| 2 | NASA DONKI | API key (free) | 1000/hour | JSON | Yes | High (NASA) | Medium |
| 3 | GFZ Potsdam | None | None documented | JSON/CSV | Partial | High | Low–Medium |
| 4 | ISS Tracker | None | None | JSON | Yes | High | Very low |
| 5 | Open-Meteo | None | 10k/day | JSON | Yes | High | Low |

---

## Source Profiles

### 1. NOAA SWPC
**URL:** https://www.swpc.noaa.gov/products/real-time-solar-wind

**Key endpoints:**
```
GET https://services.swpc.noaa.gov/json/planetary_k_index_1m.json
GET https://services.swpc.noaa.gov/json/rtsw/rtsw_wind.json
GET https://services.swpc.noaa.gov/json/goes/secondary/xray-fluxes-6-hour.json
GET https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json
```

**Signals available:** Kp index, solar wind speed/density, X-ray flux, proton flux, geomagnetic storm levels
**Update frequency:** 1-minute for real-time, 3-hour for Kp
**Strengths:** No auth, no rate limit, CORS-enabled, official US government data, extensive signal catalog
**Weaknesses:** JSON schema is not versioned (can change without notice), some endpoints return arrays without keys

---

### 2. NASA DONKI
**URL:** https://kauai.ccmc.gsfc.nasa.gov/DONKI/

**Key endpoints:**
```
GET https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/CME?startDate=...&endDate=...&api_key=...
GET https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/GST?startDate=...&endDate=...&api_key=...
GET https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR?startDate=...&endDate=...&api_key=...
```

**Signals available:** CME events, geomagnetic storms, solar flares, radiation belt enhancements
**Update frequency:** Event-driven (not real-time streaming)
**Strengths:** Rich event metadata, great for historical analysis and alerts
**Weaknesses:** Requires free API key, event-based (not continuous time series), more complex response structures

---

### 3. GFZ Potsdam
**URL:** https://www.gfz-potsdam.de/en/section/geomagnetism/data-products-services/kp-index/

**Key endpoints:**
```
GET https://kp.gfz-potsdam.de/app/json/?start=...&end=...&index=Kp&status=def
```

**Signals available:** Kp index (definitive and provisional), Ap index
**Update frequency:** 3-hour Kp, daily Ap
**Strengths:** Considered the most authoritative Kp source globally; good JSON API
**Weaknesses:** Only Kp/Ap; CORS behavior inconsistent; server-side fetch required

---

### 4. ISS Tracker (Open Notify)
**URL:** http://open-notify.org/Open-APIs/Open-Notify-API/

**Key endpoints:**
```
GET http://api.open-notify.org/iss-now.json
GET http://api.open-notify.org/astros.json
```

**Signals available:** ISS position (lat/lon/altitude), crew list
**Update frequency:** ~5 seconds (position)
**Strengths:** Zero auth, simple schema, interesting visual potential (Phase 5)
**Weaknesses:** HTTP only (no TLS), not heliophysical data, limited scientific value; maintainer unclear

---

### 5. Open-Meteo
**URL:** https://open-meteo.com/

**Key endpoints:**
```
GET https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&hourly=temperature_2m
```

**Signals available:** Atmospheric weather (temperature, wind, precipitation, UV index, etc.)
**Update frequency:** Hourly model runs
**Strengths:** No auth, generous free tier, excellent JSON schema, reliable
**Weaknesses:** Atmospheric weather, not space weather — tangential to HELIOS_DECK's core identity

---

## Recommendation: MVP 1 Source

### Selected: **NOAA SWPC**
### Primary signal: **Kp index** (`planetary_k_index_1m.json`)

**Justification:**

1. **Zero friction.** No API key, no registration, no rate limits. Scaffolding the pipeline is immediate.
2. **CORS-enabled.** Though we fetch server-side (loaders), CORS support means no proxy is needed during development.
3. **Signal quality.** Kp index is the canonical measure of global geomagnetic activity — directly relevant to the observatory concept.
4. **Rich ecosystem.** Once the NOAA pipeline exists, adding solar wind, X-ray flux, and proton flux requires only new normalizer functions — the fetcher infrastructure is identical.
5. **JSON format.** Straightforward array structure, easy to normalize.
6. **Official source.** Defensible in a technical evaluation: NOAA SWPC is the US government's operational space weather agency.

**Why not NASA DONKI first?** Requires an API key (extra setup step, secret management in Phase 0) and returns events rather than continuous time series — harder to display as a real-time widget.

**Why not GFZ?** More authoritative for Kp long-term, but CORS issues require server-side proxy even in dev; NOAA real-time Kp is sufficient for MVP 1.

---

## NOAA Kp Endpoint Details (for Phase 1)

```
GET https://services.swpc.noaa.gov/json/planetary_k_index_1m.json
```

**Response shape (abbreviated):**
```json
[
  ["2024-05-12 15:00:00.000", 4.33],
  ["2024-05-12 15:01:00.000", 4.33],
  ...
]
```

Each element: `[timestamp_string, kp_value]`

**Normalizer target:**
```js
{
  timestamp:  "2024-05-12T15:00:00Z",
  source:     "noaa-swpc",
  signal:     "kp-index",
  value:      4.33,
  unit:       "index",
  confidence: 0.9,
  metadata:   { raw_timestamp: "2024-05-12 15:00:00.000" }
}
```

---

## Phase 2 Additional Sources (NOAA only)

All reuse the same fetcher infrastructure:

| Signal | Endpoint |
|--------|----------|
| Solar wind speed | `/json/rtsw/rtsw_wind.json` |
| X-ray flux (long) | `/json/goes/secondary/xray-fluxes-6-hour.json` |
| Proton flux | `/json/goes/secondary/integral-proton-fluxes-6-hour.json` |
| Geomagnetic storm level | `/json/noaa_scales.json` |
