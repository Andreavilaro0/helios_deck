import type { ReactNode } from "react";
import type { SignalRecord } from "~/types/signal";
import { getSignalFreshness, freshnessStatusColor } from "~/utils/signal-freshness";

interface Props {
  signal: SignalRecord | null;
}

/**
 * Classifies an X-ray flux value into a GOES flare class label.
 * Returns the class string used both in the panel and by CosmicHud.
 *
 * Thresholds follow the standard GOES classification:
 *   A < 1e-7  B < 1e-6  C < 1e-5  M < 1e-4  X >= 1e-4
 */
export function interpretXRayFlux(value: unknown): string {
  if (typeof value !== "number") return "UNKNOWN";
  if (value < 1e-7) return "A — QUIET";
  if (value < 1e-6) return "B — MINOR";
  if (value < 1e-5) return "C — MODERATE";
  if (value < 1e-4) return "M — SIGNIFICANT";
  return "X — EXTREME";
}

/** Maps a flux class label to its left-border accent color class. */
function xrayAccentBorder(value: unknown): string {
  if (typeof value !== "number") return "border-l-slate-700";
  if (value < 1e-7) return "border-l-sky-500";
  if (value < 1e-6) return "border-l-neutral-500";
  if (value < 1e-5) return "border-l-yellow-400";
  if (value < 1e-4) return "border-l-orange-500";
  return "border-l-red-500";
}

/** Maps a flux class label to its status text color class. */
function xrayStatusColor(value: unknown): string {
  if (typeof value !== "number") return "text-slate-400";
  if (value < 1e-7) return "text-sky-400";
  if (value < 1e-6) return "text-slate-400";
  if (value < 1e-5) return "text-yellow-400";
  if (value < 1e-4) return "text-orange-500";
  return "text-red-500";
}

/**
 * Formats an ISO 8601 UTC timestamp as a short human-readable string.
 * Example: "May 1, 03:45 PM UTC"
 */
function formatTimestampUTC(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

/** Renders the telemetry footer row — a label/value pair. */
function FooterRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-700">{label}</span>
      <span className="text-slate-500">{children}</span>
    </div>
  );
}

/** Panel header shared by both pending and active states. */
function PanelHeader() {
  return (
    <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-500/70 border-b border-cyan-900/20 pb-2">
      X-Ray Flux · GOES
    </div>
  );
}

/** Shown while no ingested data is available yet. */
function PendingState() {
  return (
    <div className="bg-[#070d1a] border border-cyan-900/30 border-l-2 border-l-slate-700 rounded-sm p-4 space-y-3">
      <PanelHeader />
      <div className="flex flex-col items-center justify-center py-4 space-y-1">
        <span className="text-sm font-mono text-slate-500">
          X-ray channel awaiting ingest
        </span>
        <span className="text-[10px] font-mono text-slate-700">
          npm run ingest:noaa-xray-flux
        </span>
      </div>
    </div>
  );
}

/**
 * Displays real-time X-ray flux telemetry from a GOES satellite.
 *
 * Accepts a single SignalRecord (or null for the pending state before
 * the first ingest run). Value is rendered in scientific notation because
 * X-ray flux spans many orders of magnitude (1e-9 to 1e-3 W/m²).
 */
export function XRayFluxTelemetryPanel({ signal }: Props) {
  if (signal === null) {
    return <PendingState />;
  }

  const accentBorder = xrayAccentBorder(signal.value);
  const statusColor = xrayStatusColor(signal.value);
  const fluxLabel = interpretXRayFlux(signal.value);

  const displayValue =
    typeof signal.value === "number"
      ? signal.value.toExponential(2)
      : String(signal.value);

  return (
    <div
      className={`bg-[#070d1a] border border-cyan-900/30 border-l-2 rounded-sm p-4 space-y-3 ${accentBorder}`}
    >
      <PanelHeader />

      <div className="space-y-1">
        <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          {signal.signal}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold font-mono tabular-nums text-slate-100 leading-none">
            {displayValue}
          </span>
          <span className="text-base font-mono text-slate-600">{signal.unit}</span>
        </div>
      </div>

      <div
        className={`text-sm font-mono font-semibold tracking-widest ${statusColor}`}
        data-testid="xray-status"
      >
        {fluxLabel}
      </div>

      <div className="border-t border-cyan-900/20 pt-2 space-y-1 text-[10px] font-mono">
        <FooterRow label="SOURCE">{signal.source}</FooterRow>
        <FooterRow label="OBSERVED">
          <time dateTime={signal.timestamp}>
            {formatTimestampUTC(signal.timestamp)}
          </time>
        </FooterRow>
        <FooterRow label="CONFIDENCE">
          {(signal.confidence * 100).toFixed(0)}%
        </FooterRow>

        {typeof signal.metadata?.energy === "string" && (
          <FooterRow label="ENERGY BAND">{signal.metadata.energy}</FooterRow>
        )}
        {(typeof signal.metadata?.satellite === "number" ||
          typeof signal.metadata?.satellite === "string") && (
          <FooterRow label="SATELLITE">
            {String(signal.metadata.satellite)}
          </FooterRow>
        )}
        <FreshnessRow signal={signal} />
      </div>
    </div>
  );
}

function FreshnessRow({ signal }: { signal: SignalRecord }) {
  const freshness = getSignalFreshness(signal);
  return (
    <FooterRow label="DATA AGE">
      <span className={freshnessStatusColor(freshness.status)} data-testid="freshness-badge">
        {freshness.label}
      </span>
    </FooterRow>
  );
}
