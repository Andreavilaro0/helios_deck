import type { SignalMetadata, SignalRecordInput } from "~/types/signal";

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
