import type { SignalRecord } from "~/types/signal";

interface Props {
  signal: SignalRecord;
}

export function interpretWindSpeed(value: unknown): string {
  if (typeof value !== "number") return "UNKNOWN";
  if (value < 400) return "CALM";
  if (value <= 600) return "ELEVATED";
  return "HIGH SPEED STREAM";
}

function windStatusColor(value: unknown): string {
  if (typeof value !== "number") return "text-slate-400";
  if (value < 400) return "text-sky-400";
  if (value <= 600) return "text-yellow-400";
  return "text-orange-400";
}

function windAccentBorder(value: unknown): string {
  if (typeof value !== "number") return "border-l-slate-700";
  if (value < 400) return "border-l-sky-500";
  if (value <= 600) return "border-l-yellow-400";
  return "border-l-orange-500";
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

export function SolarWindPanel({ signal }: Props) {
  const accentBorder = windAccentBorder(signal.value);

  return (
    <div
      className={`bg-[#070d1a] border border-cyan-900/30 border-l-2 rounded-sm p-4 space-y-3 ${accentBorder}`}
    >
      <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-500/70 border-b border-cyan-900/20 pb-2">
        Solar Wind · Speed
      </div>

      <div className="space-y-1">
        <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          {signal.signal}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-bold font-mono tabular-nums text-slate-100 leading-none">
            {formatValue(signal.value)}
          </span>
          <span className="text-base font-mono text-slate-600">{signal.unit}</span>
        </div>
      </div>

      <div
        className={`text-sm font-mono font-semibold tracking-widest ${windStatusColor(signal.value)}`}
        data-testid="wind-status"
      >
        {interpretWindSpeed(signal.value)}
      </div>

      <div className="border-t border-cyan-900/20 pt-2 space-y-1 text-[10px] font-mono">
        <div className="flex justify-between">
          <span className="text-slate-700">SOURCE</span>
          <span className="text-slate-500">{signal.source}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-700">OBSERVED</span>
          <time dateTime={signal.timestamp} className="text-slate-500">
            {formatTimestampUTC(signal.timestamp)}
          </time>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-700">CONFIDENCE</span>
          <span className="text-slate-500">
            {(signal.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
