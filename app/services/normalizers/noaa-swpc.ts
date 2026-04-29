import type { SignalMetadata, SignalRecordInput } from "~/types/signal";

function toSignalRecord(entry: unknown, index: number): SignalRecordInput {
  if (typeof entry !== "object" || entry === null) {
    throw new Error(`NOAA Kp entry[${index}]: expected an object`);
  }

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
    timestamp: `${time_tag}Z`,
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
