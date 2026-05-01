import { Link } from "react-router";
import type { SignalRecord } from "~/types/signal";
import { interpretWindSpeed } from "~/components/widgets/SolarWindTelemetryPanel";

interface Props {
  signal: SignalRecord;
  kp: number;
  solarWind?: SignalRecord | null;
}

function kpStatus(kp: number): string {
  if (kp >= 5) return "STORM";
  if (kp >= 4) return "ACTIVE";
  return "QUIET";
}

function kpStatusColor(kp: number): string {
  if (kp >= 5) return "text-red-400";
  if (kp >= 4) return "text-yellow-400";
  return "text-sky-400";
}

function formatTimestampUTC(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

export function CosmicHud({ signal, kp, solarWind }: Props) {
  const status = kpStatus(kp);
  const statusColor = kpStatusColor(kp);
  const windSpeed =
    solarWind && typeof solarWind.value === "number" ? solarWind.value : null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          <span className="text-xs font-mono font-bold text-slate-100 tracking-tight">
            HELIOS_DECK
          </span>
          <span className="text-slate-700 select-none" aria-hidden="true">/</span>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
            Cosmic View
          </span>
        </div>
        <Link
          to="/dashboard"
          className="text-xs font-mono text-slate-600 hover:text-slate-300 transition-colors"
        >
          ← dashboard
        </Link>
      </div>

      {/* Bottom — split: big Kp left, telemetry rows right */}
      <div className="mt-auto px-4 pb-6 flex items-end gap-6">
        {/* Left: big Kp readout */}
        <div className="bg-[#070d1a]/80 border border-cyan-900/30 rounded-xl px-5 py-4">
          <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-1">
            Kp index
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-bold font-mono tabular-nums text-slate-100 leading-none">
              {kp.toFixed(2)}
            </span>
          </div>
          <div className={`mt-2 text-xs font-mono font-semibold tracking-widest ${statusColor}`}>
            {status}
          </div>
        </div>

        {/* Right: telemetry rows */}
        <div className="bg-[#070d1a]/80 border border-cyan-900/30 rounded-xl px-4 py-4 space-y-1.5 text-[10px] font-mono">
          <div>
            <span className="text-slate-700">SOURCE </span>
            <span className="text-slate-400">{signal.source}</span>
          </div>
          <div>
            <span className="text-slate-700">OBSERVED </span>
            <time dateTime={signal.timestamp} className="text-slate-400">
              {formatTimestampUTC(signal.timestamp)}
            </time>
          </div>
          <div data-testid="hud-wind-readout">
            <span className="text-slate-700">WIND </span>
            {windSpeed !== null ? (
              <span className="text-slate-400">
                {windSpeed.toFixed(1)} km/s · {interpretWindSpeed(windSpeed)}
              </span>
            ) : (
              <span className="text-slate-600" data-testid="hud-wind-pending">
                Solar wind channel pending
              </span>
            )}
          </div>
          <div>
            <span className="text-slate-700">PIPELINE </span>
            <span className="text-slate-400">SQLite → SSR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
