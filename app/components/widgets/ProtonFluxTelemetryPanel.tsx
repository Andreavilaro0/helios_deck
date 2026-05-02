import type { ReactNode } from "react";
import type { SignalRecord } from "~/types/signal";

interface Props {
  signal: SignalRecord | null;
}

/**
 * Classifies an integral proton flux value (>=10 MeV channel) into an
 * operational activity label. Thresholds follow NOAA S-scale breakpoints
 * but the labels are descriptive, not official alert designations.
 *
 *   < 1 pfu   → QUIET
 *   1–10 pfu  → ELEVATED
 *   >= 10 pfu → RADIATION WATCH  (NOAA S1 threshold; not an official alert)
 */
export function interpretProtonFlux(value: unknown): string {
  if (typeof value !== "number") return "UNKNOWN";
  if (value < 1) return "QUIET";
  if (value < 10) return "ELEVATED";
  return "RADIATION WATCH";
}

function protonAccentBorder(value: unknown): string {
  if (typeof value !== "number") return "border-l-slate-700";
  if (value < 1) return "border-l-sky-500";
  if (value < 10) return "border-l-yellow-400";
  return "border-l-orange-500";
}

function protonStatusColor(value: unknown): string {
  if (typeof value !== "number") return "text-slate-400";
  if (value < 1) return "text-sky-400";
  if (value < 10) return "text-yellow-400";
  return "text-orange-500";
}

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

function PanelHeader() {
  return (
    <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-500/70 border-b border-cyan-900/20 pb-2">
      Proton Flux · GOES ≥10 MeV
    </div>
  );
}

function PendingState() {
  return (
    <div className="bg-[#070d1a] border border-cyan-900/30 border-l-2 border-l-slate-700 rounded-sm p-4 space-y-3">
      <PanelHeader />
      <div className="flex flex-col items-center justify-center py-4 space-y-1">
        <span className="text-sm font-mono text-slate-500">
          Proton channel awaiting ingest
        </span>
        <span className="text-[10px] font-mono text-slate-700">
          npm run ingest:noaa-proton-flux
        </span>
      </div>
    </div>
  );
}

/**
 * Displays real-time energetic proton flux from the GOES >=10 MeV channel.
 *
 * The >=10 MeV channel is the NOAA S-scale operational threshold. Values are
 * classified descriptively (QUIET / ELEVATED / RADIATION WATCH) — these are
 * not official NOAA alerts. See ADR-022 in docs/decisions.md.
 */
export function ProtonFluxTelemetryPanel({ signal }: Props) {
  if (signal === null) {
    return <PendingState />;
  }

  const accentBorder = protonAccentBorder(signal.value);
  const statusColor = protonStatusColor(signal.value);
  const fluxLabel = interpretProtonFlux(signal.value);

  const displayValue =
    typeof signal.value === "number"
      ? signal.value.toFixed(3)
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
        data-testid="proton-status"
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
          <FooterRow label="ENERGY CHANNEL">{signal.metadata.energy}</FooterRow>
        )}
      </div>
    </div>
  );
}
