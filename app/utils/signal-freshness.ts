import type { SignalRecord, SignalName } from "~/types/signal";

/** Minutes after which each signal is considered stale. */
const STALE_THRESHOLD_MINUTES: Partial<Record<SignalName, number>> = {
  "kp-index": 180,
  "solar-wind-speed": 60,
  "xray-flux-long": 30,
  "proton-flux-10mev": 60,
};

const DEFAULT_THRESHOLD_MINUTES = 60;

export interface SignalFreshness {
  status: "fresh" | "stale" | "missing";
  ageMinutes: number | null;
  label: "FRESH" | "STALE" | "NO DATA";
}

/** Maps a freshness status to its Tailwind text-color class. */
export function freshnessStatusColor(status: SignalFreshness["status"]): string {
  if (status === "fresh") return "text-emerald-400";
  if (status === "stale") return "text-amber-400";
  return "text-slate-600";
}

/**
 * Classifies how current a signal record is relative to `now`.
 *
 * Returns "missing" when signal is null or has an unparseable timestamp.
 * Returns "stale"   when the observation age exceeds the per-signal threshold.
 * Returns "fresh"   otherwise.
 *
 * Thresholds (minutes): kp-index 180, solar-wind-speed 60, xray-flux-long 30,
 * proton-flux-10mev 60. All other signal names fall back to 60 minutes.
 */
export function getSignalFreshness(
  signal: SignalRecord | null,
  now: Date = new Date()
): SignalFreshness {
  if (signal === null) {
    return { status: "missing", ageMinutes: null, label: "NO DATA" };
  }

  const observedAt = new Date(signal.timestamp);
  if (isNaN(observedAt.getTime())) {
    return { status: "missing", ageMinutes: null, label: "NO DATA" };
  }

  const ageMinutes = (now.getTime() - observedAt.getTime()) / 60_000;
  const threshold =
    STALE_THRESHOLD_MINUTES[signal.signal] ?? DEFAULT_THRESHOLD_MINUTES;

  if (ageMinutes > threshold) {
    return { status: "stale", ageMinutes, label: "STALE" };
  }

  return { status: "fresh", ageMinutes, label: "FRESH" };
}
