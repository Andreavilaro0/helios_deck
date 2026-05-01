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

## NOAA Kp Endpoint Details (Phase 1 — implemented ✓)

```
GET https://services.swpc.noaa.gov/json/planetary_k_index_1m.json
```

**Response shape (verified live 2026-04-29):**
```json
[
  { "time_tag": "2026-04-29T16:26:00", "kp_index": 0, "estimated_kp": 0.33, "kp": "0P" },
  { "time_tag": "2026-04-29T16:27:00", "kp_index": 1, "estimated_kp": 0.67, "kp": "1M" },
  ...
]
```

Fields per entry:
- `time_tag` — ISO 8601 timestamp, no timezone suffix (implicitly UTC)
- `kp_index` — integer Kp (0–9), the rounded planetary K-index
- `estimated_kp` — float estimated Kp (more precise, used as `value`)
- `kp` — Kp string class, e.g. `"0P"`, `"1M"`, `"2+"` (letter indicates sub-index)

**Normalizer target:**
```ts
{
  timestamp:  "2026-04-29T16:26:00Z",   // time_tag + "Z"
  source:     "noaa-swpc",
  signal:     "kp-index",
  value:      0.33,                      // estimated_kp
  unit:       "index",
  confidence: 0.9,
  metadata:   { kp_index: 0, kp_class: "0P" }
}
```

---

## Phase 2 Additional Sources (NOAA only)

All reuse the same fetcher infrastructure:

| Signal | Endpoint | Status |
|--------|----------|--------|
| Solar wind speed | `/json/rtsw/rtsw_wind.json` | ✅ Phase 2A — implemented |
| X-ray flux (short + long) | `/json/goes/secondary/xrays-6-hour.json` | ✅ Phase 2C — implemented |
| Proton flux | `/json/goes/secondary/integral-proton-fluxes-6-hour.json` | planned |
| Geomagnetic storm level | `/json/noaa_scales.json` | planned |

---

## NOAA Solar Wind Speed Endpoint (Phase 2A — implemented ✓)

```
GET https://services.swpc.noaa.gov/json/rtsw/rtsw_wind.json
```

**Response shape (real-time solar wind plasma data):**
```json
[
  {
    "time_tag": "2026-05-01 12:00:00.000",
    "proton_speed": 452.1,
    "proton_density": 5.2,
    "proton_temperature": 87523.0,
    "bx_gsm": -2.3,
    "by_gsm": 4.1,
    "bz_gsm": -1.8,
    "bt": 4.9,
    "lat_gsm": -9.3,
    "lon_gsm": 171.2
  },
  ...
]
```

Fields per entry:
- `time_tag` — UTC timestamp with space separator and milliseconds, e.g. `"2026-05-01 12:00:00.000"`. Normalizer converts to ISO 8601: `"2026-05-01T12:00:00Z"`.
- `proton_speed` — solar wind bulk speed in km/s. Can be `null` when the measurement is unavailable (data gap); these entries are filtered silently by the normalizer, not stored.
- `proton_density` — proton density in p/cm³ (stored in metadata).
- `proton_temperature` — proton temperature in K (stored in metadata).
- `bt` — total interplanetary magnetic field magnitude in nT (stored in metadata).
- `bz_gsm` — southward B-field component in GSM coordinates — key indicator of geomagnetic storm onset (stored in metadata).

**Normalizer target:**
```ts
{
  timestamp:  "2026-05-01T12:00:00Z",
  source:     "noaa-swpc",
  signal:     "solar-wind-speed",
  value:      452.1,
  unit:       "km/s",
  confidence: 0.9,
  metadata: {
    proton_density:      5.2,
    proton_temperature:  87523.0,
    bt:                  4.9,
    bz_gsm:              -1.8,
  }
}
```

---

## NOAA X-Ray Flux Endpoint (Phase 2C — implemented ✓)

```
GET https://services.swpc.noaa.gov/json/goes/secondary/xrays-6-hour.json
```

Response shape verified 2026-05-02:
```json
[
  {
    "time_tag": "2026-05-01T16:11:00Z",
    "satellite": 19,
    "flux": 1.316572362242141e-08,
    "observed_flux": 3.840084161765844e-08,
    "electron_correction": 2.5235118883415453e-08,
    "electron_contaminaton": true,
    "energy": "0.05-0.4nm"
  },
  {
    "time_tag": "2026-05-01T16:11:00Z",
    "satellite": 19,
    "flux": 1.0128478606930003e-06,
    "observed_flux": 1.062917590388679e-06,
    "electron_correction": 5.006974745924708e-08,
    "electron_contaminaton": false,
    "energy": "0.1-0.8nm"
  }
]
```

Fields per entry:
- `time_tag` — ISO 8601 UTC with Z suffix. No conversion needed.
- `satellite` — GOES satellite number (int).
- `flux` — electron-corrected X-ray flux in W/m². Used as `value`. This is the scientifically preferred value.
- `observed_flux` — raw measured flux before electron correction (stored in metadata).
- `electron_correction` — the correction amount applied (stored in metadata).
- `electron_contaminaton` — boolean flag. Note: API typo preserved verbatim (missing "i" in "contamination").
- `energy` — channel identifier: `"0.05-0.4nm"` (short) or `"0.1-0.8nm"` (long).

The endpoint returns two entries per minute: one per energy channel. The normalizer maps each to a separate `SignalRecord`:

| `energy` | `signal` | Notes |
|----------|----------|-------|
| `"0.05-0.4nm"` | `"xray-flux-short"` | GOES channel A; used for some flare sub-classifications |
| `"0.1-0.8nm"` | `"xray-flux-long"` | GOES channel B; standard NOAA flare classification (A/B/C/M/X) |

Normalizer target (xray-flux-long example):
```ts
{
  timestamp:  "2026-05-01T16:11:00Z",
  source:     "noaa-swpc",
  signal:     "xray-flux-long",
  value:      1.0128478606930003e-06,
  unit:       "W/m²",
  confidence: 0.9,
  metadata: {
    satellite:            19,
    energy:               "0.1-0.8nm",
    observed_flux:        1.062917590388679e-06,
    electron_correction:  5.006974745924708e-08,
    electron_contaminaton: false,
  }
}
```
