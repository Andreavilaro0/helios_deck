import type { SignalRecord } from "~/types/signal";

interface Props {
  signal: SignalRecord;
}

function interpretKp(value: unknown): string {
  if (typeof value !== "number") return "UNKNOWN";
  if (value < 4) return "QUIET";
  if (value < 5) return "ACTIVE";
  return "STORM";
}

function pillClasses(value: unknown): string {
  if (typeof value !== "number") return "bg-slate-100 text-slate-500";
  if (value < 4) return "bg-sky-50 text-sky-600";
  if (value < 5) return "bg-amber-50 text-amber-600";
  return "bg-red-50 text-red-600";
}

function kpBarColor(value: unknown): string {
  if (typeof value !== "number") return "bg-slate-200";
  if (value < 4) return "bg-sky-400";
  if (value < 5) return "bg-amber-400";
  return "bg-red-400";
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
  if (typeof value === "number") return value.toFixed(2);
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

export function KpTelemetryPanel({ signal }: Props) {
  const kp = typeof signal.value === "number" ? signal.value : 0;
  const pct = Math.min((kp / 9) * 100, 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Kp Index</span>
        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${pillClasses(signal.value)}`} data-testid="kp-status">
          {interpretKp(signal.value)}
        </span>
      </div>

      {/* Big value */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-5xl font-bold tabular-nums text-slate-900 leading-none">
          {formatValue(signal.value)}
        </span>
        <span className="text-sm text-slate-400">{signal.unit}</span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-1">
          <span>0</span><span>9</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${kpBarColor(signal.value)}`}
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
