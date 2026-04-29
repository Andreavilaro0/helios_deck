# HELIOS_DECK — Data Contract

## Purpose

Every piece of data that enters HELIOS_DECK — regardless of which external API it comes from — must be normalized into a `SignalRecord` before it touches the database or any React component.

This contract is the single source of truth for data shape across the entire system.

---

## SignalRecord Shape

```js
{
  timestamp:  string,   // ISO 8601 UTC — "2024-05-12T14:30:00Z"
  source:     string,   // API identifier — "noaa-swpc" | "nasa-donki" | "gfz"
  signal:     string,   // Signal type — "kp-index" | "solar-wind-speed" | "xray-flux-long"
  value:      number,   // Numeric measurement
  unit:       string,   // SI or domain unit — "nT" | "km/s" | "W/m²" | "index"
  confidence: number,   // 0.0–1.0 (1.0 = authoritative source, no estimation)
  metadata:   object    // Source-specific extras, kept as JSON blob in DB
}
```

---

## Field Rules

### `timestamp`
- Always UTC. Never local time.
- Always ISO 8601 with Z suffix.
- The observation time, not the ingestion time. Ingestion time is stored separately as `created_at` in the DB.

### `source`
- Kebab-case identifier of the originating API.
- Never change a source ID once data is in the DB — it breaks historical queries.
- Allowed values (extend as new sources are added):

  | Value | API |
  |-------|-----|
  | `noaa-swpc` | NOAA Space Weather Prediction Center |
  | `nasa-donki` | NASA DONKI |
  | `gfz-potsdam` | GFZ Potsdam Kp index |

### `signal`
- Kebab-case descriptor of what is being measured.
- Must be unique per source+timestamp combination.
- Allowed values (extend as signals are added):

  | Value | Description | Unit |
  |-------|-------------|------|
  | `kp-index` | Planetary K-index (geomagnetic activity) | `index` (0–9) |
  | `solar-wind-speed` | Solar wind bulk speed | `km/s` |
  | `solar-wind-density` | Solar wind proton density | `p/cm³` |
  | `xray-flux-short` | X-ray flux 0.05–0.4 nm | `W/m²` |
  | `xray-flux-long` | X-ray flux 0.1–0.8 nm | `W/m²` |
  | `proton-flux-10mev` | Proton flux > 10 MeV | `pfu` |
  | `dst-index` | Disturbance Storm Time index | `nT` |

### `value`
- Always a plain number. Never a string, never null.
- If the source reports a range, store the midpoint and document the range in `metadata`.
- If the source reports an estimate or upper limit, set `confidence < 1.0`.

### `unit`
- Use standard domain abbreviations. See signal table above.
- Never change a unit for an existing signal — it breaks all historical comparisons.

### `confidence`
- `1.0` — directly measured, authoritative.
- `0.9` — real-time provisional data (common for NOAA 1-minute data before final processing).
- `0.7` — estimated or modeled value.
- `0.0` — data quality flag from source indicates suspect reading.

### `metadata`
- Optional. Must be serializable to JSON.
- Store source-specific fields here that do not fit the common contract.
- Examples:

  ```js
  // NOAA Kp index
  metadata: {
    kp_letter: "G2",          // NOAA storm category
    estimated: false,
    forecast_period: null
  }

  // NOAA solar wind
  metadata: {
    proton_speed: 452.1,
    bulk_speed: 451.8,
    data_quality: "ok"
  }
  ```

---

## Normalizer Contract

Every file in `app/services/normalizers/` must export:

```js
/**
 * @param {object} rawApiResponse  — the raw JSON from the API
 * @returns {SignalRecord[]}       — array of normalized records
 */
export function normalize(rawApiResponse) { ... }
```

The normalizer must:
- Never throw. Return `[]` if the input is unexpected.
- Never mutate the input.
- Never make network calls.
- Filter out records where `value` is `null`, `NaN`, or `undefined`.

---

## Validation Helper (to be implemented in Phase 1)

```js
// app/services/normalizers/validate.js

export function isValidSignalRecord(record) {
  return (
    typeof record.timestamp === 'string' &&
    typeof record.source    === 'string' &&
    typeof record.signal    === 'string' &&
    typeof record.value     === 'number' &&
    !isNaN(record.value) &&
    typeof record.unit      === 'string' &&
    typeof record.confidence === 'number' &&
    record.confidence >= 0 &&
    record.confidence <= 1
  );
}
```

---

## Example: Kp Index Record

```js
{
  timestamp:  "2024-05-12T15:00:00Z",
  source:     "noaa-swpc",
  signal:     "kp-index",
  value:      4.33,
  unit:       "index",
  confidence: 0.9,
  metadata: {
    kp_letter: "G1",
    estimated: false
  }
}
```
