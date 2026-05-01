import type { SignalRecord } from "~/types/signal";

interface Props {
  signal: SignalRecord | null;
}

export function interpretWindSpeed(value: unknown): string {
  if (typeof value !== "number") return "UNKNOWN";
  if (value < 400) return "CALM";
  if (value <= 600) return "ELEVATED";
  return "HIGH SPEED STREAM";
}

function pillClasses(value: unknown): string {
  if (typeof value !== "number") return "bg-slate-100 text-slate-500";
  if (value < 400) return "bg-sky-50 text-sky-600";
  if (value <= 600) return "bg-amber-50 text-amber-600";
  return "bg-orange-50 text-orange-600";
}

function windBarColor(value: unknown): string {
  if (typeof value !== "number") return "bg-slate-200";
  if (value < 400) return "bg-sky-400";
  if (value <= 600) return "bg-amber-400";
  return "bg-orange-400";
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

function formatValue(value: unknown): string {
  if (typeof value === "number") return value.toFixed(1);
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

export function SolarWindTelemetryPanel({ signal }: Props) {
  if (!signal) {
    return (
      <div
        className="bg-white border border-dashed border-slate-200 rounded-2xl p-4 space-y-3 flex flex-col justify-center"
        data-testid="solar-wind-pending"
      >
        <div className="text-sm font-semibold text-slate-900">Solar Wind · Speed</div>
        <div className="space-y-2 py-3 text-center">
          <p className="text-xs text-slate-400">Solar wind channel awaiting ingest</p>
          <code className="inline-block text-[10px] bg-slate-50 text-slate-500 rounded-lg border border-slate-200 px-3 py-1 font-mono">
            npm run ingest:noaa-solar-wind
          </code>
        </div>
        <div className="border-t border-slate-100 pt-3 text-[10px] font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">SOURCE</span>
            <span className="text-slate-500">noaa-swpc</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-slate-400">SIGNAL</span>
            <span className="text-slate-500">solar-wind-speed</span>
          </div>
        </div>
      </div>
    );
  }

  const speed = typeof signal.value === "number" ? signal.value : 0;
  const pct = Math.min((speed / 900) * 100, 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Solar Wind · Speed</span>
        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${pillClasses(signal.value)}`} data-testid="wind-status">
          {interpretWindSpeed(signal.value)}
        </span>
      </div>

      {/* Big value */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-5xl font-bold tabular-nums text-slate-900 leading-none">
          {formatValue(signal.value)}
        </span>
        <span className="text-sm text-slate-400">{signal.unit}</span>
      </div>

      {/* Progress bar (0–900 km/s range) */}
      <div>
        <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-1">
          <span>0</span><span>900 km/s</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${windBarColor(signal.value)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 pt-3 space-y-1.5 text-[10px] font-mono">
        <div className="flex justify-between">
          <span className="text-slate-400">SOURCE</span>
          <span className="text-slate-600">{signal.source}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">OBSERVED</span>
          <time dateTime={signal.timestamp} className="text-slate-600">
            {formatTimestampUTC(signal.timestamp)}
          </time>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">CONFIDENCE</span>
          <span className="text-slate-600">{(signal.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
