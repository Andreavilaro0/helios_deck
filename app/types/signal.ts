/**
 * Domain types for HELIOS_DECK signals.
 *
 * This file is the single source of truth for the SignalRecord shape.
 * Every layer — fetchers, normalizers, DB helpers, loaders, widgets —
 * imports from here. Never redefine these types elsewhere.
 *
 * See docs/data-contract.md for the full field-level specification.
 */

// ---------------------------------------------------------------------------
// JSON-compatible value types
// These exist because `value` must accommodate both scalar measurements
// (Kp index = 4.33) and structured data (ISS position = { lat, lon, alt }).
// All three types together describe any valid JSON value.
// ---------------------------------------------------------------------------

/** A JSON leaf value — the four types that can appear as a final value in JSON. */
export type JsonPrimitive = string | number | boolean | null;

/**
 * Any value that can be serialized to JSON without loss.
 * Excludes: undefined, bigint, functions, symbols, Infinity, NaN.
 *
 * This recursive definition covers:
 *   - scalar signals:  4.33, "G2", true
 *   - array signals:   [452.1, 451.8]
 *   - object signals:  { latitude: 51.5, longitude: -0.1, altitude: 408 }
 */
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

// ---------------------------------------------------------------------------
// Primitive aliases — named so the domain intent is clear at every call site
// ---------------------------------------------------------------------------

/**
 * ISO 8601 UTC timestamp string — e.g. "2024-05-12T14:30:00Z".
 * Always the observation time, never the ingestion time.
 * The DB stores ingestion time separately as `created_at`.
 */
export type ISOTimestamp = string;

/**
 * The measured value of a signal. Any JSON-compatible shape.
 *
 * Scalar signals (most common):
 *   kp-index            → number   (e.g. 4.33)
 *   solar-wind-speed    → number   (e.g. 452.1)
 *   xray-flux-long      → number   (e.g. 3.2e-6)
 *
 * Structured signals:
 *   iss-position        → { latitude: number, longitude: number, altitude?: number }
 *   solar-flare-event   → { classType: string, beginTime: string, peakTime: string }
 *   weather-summary     → { temperature: number, windSpeed: number, cloudCover: number }
 *
 * Normalizers must discard records where value is undefined, NaN, or Infinity.
 * null is a valid JsonPrimitive but should not be stored as a signal value —
 * a missing measurement should be filtered out, not stored as null.
 */
export type SignalValue = JsonValue;

/**
 * Source-specific extra fields stored as a JSON blob in the DB.
 * The shape varies by API source — never assume a specific key exists
 * without narrowing first. All values must be JSON-serializable.
 */
export type SignalMetadata = Record<string, JsonValue>;

// ---------------------------------------------------------------------------
// Controlled vocabularies — string unions, not enums
// Using string unions (not enums) so the literal values are visible in
// the code, in the DB, and in error messages without extra mapping.
// ---------------------------------------------------------------------------

/**
 * Known originating APIs. Kebab-case identifiers.
 * Never rename a value once data is stored — it breaks historical queries.
 * Add new sources here when a new API is integrated.
 */
export type SignalSource =
  | "noaa-swpc"    // NOAA Space Weather Prediction Center
  | "nasa-donki"   // NASA DONKI space weather events
  | "gfz-potsdam"  // GFZ Potsdam — definitive Kp/Ap index
  | "iss"          // ISS position tracker
  | "open-meteo";  // Open-Meteo atmospheric data

/**
 * Known physical quantities. Kebab-case identifiers.
 * Never rename a value once data is stored.
 * The unit for each signal name is fixed — see SignalUnit below.
 */
export type SignalName =
  | "kp-index"           // Planetary K-index (0–9), geomagnetic activity
  | "solar-wind-speed"   // Solar wind bulk speed
  | "solar-wind-density" // Solar wind proton density
  | "xray-flux-short"    // X-ray flux 0.05–0.4 nm (solar flare indicator)
  | "xray-flux-long"     // X-ray flux 0.1–0.8 nm  (solar flare indicator)
  | "proton-flux-10mev"  // Integral proton flux > 10 MeV
  | "dst-index";         // Disturbance Storm Time index (geomagnetic storm strength)

/**
 * Standard measurement units.
 * Never change the unit for an established signal name — it breaks
 * all historical comparisons.
 */
export type SignalUnit =
  | "index"   // Dimensionless index (Kp 0–9)
  | "km/s"    // Kilometres per second (solar wind speed)
  | "p/cm³"   // Protons per cubic centimetre (solar wind density)
  | "W/m²"    // Watts per square metre (X-ray flux)
  | "pfu"     // Particle flux unit (proton flux)
  | "nT";     // Nanotesla (Dst index)

// ---------------------------------------------------------------------------
// Core domain interfaces
// ---------------------------------------------------------------------------

/**
 * The normalized record for any signal entering HELIOS_DECK.
 *
 * Every external API response — regardless of source format — must be
 * transformed into this shape by a normalizer before it touches the DB
 * or any React component. This is the contract that makes the system
 * source-agnostic: a widget displaying Kp index does not know or care
 * whether the data came from NOAA or GFZ.
 */
export interface SignalRecord {
  /** UTC observation time. ISO 8601 with Z suffix. */
  timestamp: ISOTimestamp;

  /** Which API this measurement came from. */
  source: SignalSource;

  /** What physical quantity is being measured. */
  signal: SignalName;

  /** The measured value. Any JSON-compatible shape — see SignalValue. */
  value: SignalValue;

  /** The unit of measurement. Never changes for an established signal name. */
  unit: SignalUnit;

  /**
   * Reliability of this value. Range: 0.0–1.0.
   *   1.0 — authoritative, directly measured, final
   *   0.9 — real-time provisional (NOAA before final processing)
   *   0.7 — estimated or modeled
   *   0.0 — source flagged this reading as suspect
   */
  confidence: number;

  /**
   * Source-specific extras that don't fit the common contract.
   * Stored as a JSON blob in the DB. Examples:
   *   NOAA Kp → { kp_letter: "G2", estimated: false }
   *   NOAA wind → { proton_speed: 452.1, data_quality: "ok" }
   */
  metadata: SignalMetadata;
}

/**
 * The shape accepted by saveSignal().
 *
 * Identical to SignalRecord but metadata is optional — not every source
 * produces extra fields, and requiring it would force normalizers to
 * pass empty objects for every record.
 */
export interface SignalRecordInput extends Omit<SignalRecord, "metadata"> {
  metadata?: SignalMetadata;
}
