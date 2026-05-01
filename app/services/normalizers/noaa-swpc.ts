import type { SignalMetadata, SignalName, SignalRecordInput } from "~/types/signal";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Normalizes NOAA time_tag strings to ISO 8601 UTC.
 * Handles both "2026-05-01T12:00:00" and "2026-05-01 12:00:00.000".
 */
function parseTimeTag(raw: string): string {
  const iso = raw.replace(" ", "T").replace(/\.\d+$/, "");
  return iso.endsWith("Z") ? iso : `${iso}Z`;
}

// ---------------------------------------------------------------------------
// Kp index normalizer
// ---------------------------------------------------------------------------

function toSignalRecord(entry: unknown, index: number): SignalRecordInput {
  if (typeof entry !== "object" || entry === null) {
    throw new Error(`NOAA Kp entry[${index}]: expected an object`);
  }

  // Safe: we've already verified entry is a non-null object above
  const e = entry as Record<string, unknown>;
  const time_tag = e.time_tag;
  const estimated_kp = e.estimated_kp;

  if (typeof time_tag !== "string") {
    throw new Error(
      `NOAA Kp entry[${index}]: time_tag must be a string, got ${typeof time_tag}`
    );
  }

  if (typeof estimated_kp !== "number" || !isFinite(estimated_kp)) {
    throw new Error(
      `NOAA Kp entry[${index}]: estimated_kp must be a finite number, got ${String(estimated_kp)}`
    );
  }

  const metadata: SignalMetadata = {};
  if (typeof e.kp_index === "number") metadata.kp_index = e.kp_index;
  if (typeof e.kp === "string") metadata.kp_class = e.kp;

  return {
    timestamp: parseTimeTag(time_tag),
    source: "noaa-swpc",
    signal: "kp-index",
    value: estimated_kp,
    unit: "index",
    confidence: 0.9,
    metadata,
  };
}

export function normalize(raw: unknown): SignalRecordInput[] {
  if (!Array.isArray(raw)) {
    throw new Error(
      `NOAA Kp normalizer: expected array, got ${typeof raw}`
    );
  }
  return raw.map((entry, i) => toSignalRecord(entry, i));
}

// ---------------------------------------------------------------------------
// Solar wind speed normalizer
// ---------------------------------------------------------------------------

/**
 * Normalizes NOAA plasma-7-day.json response to SignalRecordInput[].
 *
 * Response shape (verified 2026-05-01):
 *   [["time_tag","density","speed","temperature"], ["2026-05-01 12:00:00.000","5.2","452.1","87523"], ...]
 *
 * - Row 0 is the header row — it is skipped.
 * - All data values arrive as strings and must be parsed with parseFloat.
 * - An empty string or NaN speed means no measurement (data gap) — skipped silently.
 * - Throws only for structural problems (non-array input, wrong header, missing time_tag).
 */
export function normalizeSolarWindSpeed(raw: unknown): SignalRecordInput[] {
  if (!Array.isArray(raw)) {
    throw new Error(
      `NOAA solar wind normalizer: expected array, got ${typeof raw}`
    );
  }

  if (raw.length === 0) return [];

  // Row 0 must be the header
  const header = raw[0];
  if (!Array.isArray(header)) {
    throw new Error(
      "NOAA solar wind normalizer: row 0 must be the header array"
    );
  }

  const timeIdx = header.indexOf("time_tag");
  const speedIdx = header.indexOf("speed");
  const densityIdx = header.indexOf("density");
  const tempIdx = header.indexOf("temperature");

  if (timeIdx === -1) {
    throw new Error(
      'NOAA solar wind normalizer: header missing "time_tag" column'
    );
  }
  if (speedIdx === -1) {
    throw new Error(
      'NOAA solar wind normalizer: header missing "speed" column'
    );
  }

  const results: SignalRecordInput[] = [];

  for (let i = 1; i < raw.length; i++) {
    const row = raw[i];
    if (!Array.isArray(row)) {
      throw new Error(`NOAA solar wind normalizer: row[${i}] is not an array`);
    }

    const time_tag = row[timeIdx];
    if (typeof time_tag !== "string") {
      throw new Error(
        `NOAA solar wind normalizer: row[${i}] time_tag must be a string, got ${typeof time_tag}`
      );
    }

    const speedRaw = row[speedIdx];
    // Empty string = NOAA data gap — silently skip, not a pipeline error
    if (speedRaw === "" || speedRaw === null) continue;

    if (typeof speedRaw !== "string") {
      throw new Error(
        `NOAA solar wind normalizer: row[${i}] speed must be a string, got ${typeof speedRaw}`
      );
    }

    const speed = parseFloat(speedRaw);
    if (!isFinite(speed)) {
      throw new Error(
        `NOAA solar wind normalizer: row[${i}] speed "${speedRaw}" is not a finite number`
      );
    }

    const metadata: SignalMetadata = {};
    if (densityIdx !== -1) {
      const d = parseFloat(String(row[densityIdx] ?? ""));
      if (isFinite(d)) metadata.proton_density = d;
    }
    if (tempIdx !== -1) {
      const t = parseFloat(String(row[tempIdx] ?? ""));
      if (isFinite(t)) metadata.proton_temperature = t;
    }

    results.push({
      timestamp: parseTimeTag(time_tag),
      source: "noaa-swpc",
      signal: "solar-wind-speed",
      value: speed,
      unit: "km/s",
      confidence: 0.9,
      metadata,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// X-ray flux normalizer
// ---------------------------------------------------------------------------

/**
 * Maps the NOAA energy band string to the canonical SignalName.
 *
 * The NOAA xrays-6-hour.json endpoint uses exactly two energy strings:
 *   "0.05-0.4nm" — short-wavelength channel (GOES channel A)
 *   "0.1-0.8nm"  — long-wavelength channel  (GOES channel B)
 *
 * Any other string is an unexpected API change and must throw so the caller
 * is not silently missing a channel.
 */
function energyToSignalName(energy: string, entryIndex: number): SignalName {
  if (energy === "0.05-0.4nm") return "xray-flux-short";
  if (energy === "0.1-0.8nm") return "xray-flux-long";
  throw new Error(
    `NOAA X-ray flux normalizer: entry[${entryIndex}] unknown energy string "${energy}"`
  );
}

/**
 * Normalizes NOAA xrays-6-hour.json to SignalRecordInput[].
 *
 * Response shape (verified 2026-05-01, GOES secondary satellite):
 *   [
 *     { time_tag, satellite, flux, observed_flux, electron_correction,
 *       electron_contaminaton, energy },
 *     ...
 *   ]
 *
 * Two entries share each timestamp — one per energy channel:
 *   "0.05-0.4nm" → signal: "xray-flux-short"
 *   "0.1-0.8nm"  → signal: "xray-flux-long"
 *
 * `flux` is the electron-corrected value and is used as the signal value.
 * `electron_contaminaton` preserves the NOAA API's spelling verbatim.
 * The field is intentionally misspelled (missing the second "i" in "contamination").
 * Null flux is not a valid data gap for this endpoint — always numeric; throws.
 */
export function normalizeXRayFlux(raw: unknown): SignalRecordInput[] {
  if (!Array.isArray(raw)) {
    throw new Error(
      `NOAA X-ray flux normalizer: expected array, got ${typeof raw}`
    );
  }

  if (raw.length === 0) return [];

  const results: SignalRecordInput[] = [];

  for (let i = 0; i < raw.length; i++) {
    const entry = raw[i];

    if (typeof entry !== "object" || entry === null) {
      throw new Error(
        `NOAA X-ray flux normalizer: entry[${i}] must be a non-null object`
      );
    }

    // Safe: we verified entry is a non-null object above
    const e = entry as Record<string, unknown>;

    if (typeof e.time_tag !== "string") {
      throw new Error(
        `NOAA X-ray flux normalizer: entry[${i}] time_tag must be a string, got ${typeof e.time_tag}`
      );
    }

    if (typeof e.energy !== "string") {
      throw new Error(
        `NOAA X-ray flux normalizer: entry[${i}] energy must be a string, got ${typeof e.energy}`
      );
    }

    // energyToSignalName throws for unknown energy strings
    const signalName = energyToSignalName(e.energy, i);

    if (typeof e.flux !== "number" || !isFinite(e.flux)) {
      throw new Error(
        `NOAA X-ray flux normalizer: entry[${i}] flux must be a finite number, got ${String(e.flux)}`
      );
    }

    if (typeof e.satellite !== "number") {
      throw new Error(
        `NOAA X-ray flux normalizer: entry[${i}] satellite must be a number, got ${typeof e.satellite}`
      );
    }

    const metadata: SignalMetadata = {
      satellite: e.satellite,
      energy: e.energy,
    };

    // Include observed_flux if it is a finite number
    if (typeof e.observed_flux === "number" && isFinite(e.observed_flux)) {
      metadata.observed_flux = e.observed_flux;
    }

    // Include electron_correction if it is a finite number
    if (
      typeof e.electron_correction === "number" &&
      isFinite(e.electron_correction)
    ) {
      metadata.electron_correction = e.electron_correction;
    }

    // Preserve the boolean flag including the API's typo ("contaminaton")
    if (typeof e.electron_contaminaton === "boolean") {
      metadata.electron_contaminaton = e.electron_contaminaton;
    }

    results.push({
      timestamp: parseTimeTag(e.time_tag),
      source: "noaa-swpc",
      signal: signalName,
      value: e.flux,
      unit: "W/m²",
      confidence: 0.9,
      metadata,
    });
  }

  return results;
}
