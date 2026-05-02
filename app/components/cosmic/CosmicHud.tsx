import { Link } from "react-router";
import type { SignalRecord } from "~/types/signal";
import { interpretWindSpeed } from "~/components/widgets/SolarWindPanel";
import { interpretXRayFlux } from "~/components/widgets/XRayFluxTelemetryPanel";
import { interpretProtonFlux } from "~/components/widgets/ProtonFluxTelemetryPanel";

interface Props {
  signal: SignalRecord;
  kp: number;
  solarWind?: SignalRecord | null;
  xrayFlux?: SignalRecord | null;
  protonFlux?: SignalRecord | null;
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

export function CosmicHud({ signal, kp, solarWind, xrayFlux, protonFlux }: Props) {
  const status = kpStatus(kp);
  const statusColor = kpStatusColor(kp);
  const xrayFluxValue =
    xrayFlux && typeof xrayFlux.value === "number" ? xrayFlux.value : null;
  const windSpeed =
    solarWind && typeof solarWind.value === "number" ? solarWind.value : null;
  const protonValue =
    protonFlux && typeof protonFlux.value === "number" ? protonFlux.value : null;

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

      {/* Bottom instrument readout */}
      <div className="mt-auto">
        <div className="px-4 pb-6">
          <div className="bg-[#070d1a]/85 border border-cyan-900/30 rounded-sm px-5 py-4 inline-block">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-5xl font-bold font-mono tabular-nums text-slate-100 leading-none">
                {kp.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-600">index</span>
              <span className={`text-sm font-mono font-semibold tracking-widest ${statusColor}`}>
                {status}
              </span>
            </div>
            <div className="space-y-0.5 text-[10px] font-mono">
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
              {xrayFluxValue !== null && (
                <div data-testid="hud-xray-readout">
                  <span className="text-slate-700">XRAY </span>
                  <span className="text-slate-400">
                    {xrayFluxValue.toExponential(2)} W/m² · {interpretXRayFlux(xrayFluxValue)}
                  </span>
                </div>
              )}
              <div data-testid="hud-proton-readout">
                <span className="text-slate-700">PROTON </span>
                {protonValue !== null ? (
                  <span className="text-slate-400">
                    {protonValue.toFixed(2)} pfu · {interpretProtonFlux(protonValue)}
                  </span>
                ) : (
                  <span className="text-slate-600">channel pending</span>
                )}
              </div>
              {windSpeed !== null && (
                <div data-testid="hud-wind-readout">
                  <span className="text-slate-700">WIND </span>
                  <span className="text-slate-400">
                    {windSpeed.toFixed(1)} km/s · {interpretWindSpeed(windSpeed)}
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-700">PIPELINE </span>
                <span className="text-slate-400">SQLite → SSR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
