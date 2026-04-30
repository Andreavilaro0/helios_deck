import type { SignalRecord } from "~/types/signal";

interface Props {
  signal: SignalRecord;
}

function interpretKp(value: unknown): string {
  if (typeof value !== "number") return "Unknown";
  if (value < 4) return "Quiet";
  if (value < 5) return "Active";
  return "Storm";
}

function kpStatusColor(value: unknown): string {
  if (typeof value !== "number") return "text-gray-500";
  if (value < 4) return "text-green-600 dark:text-green-400";
  if (value < 5) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function formatTimestamp(iso: string): string {
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

export function SignalCard({ signal }: Props) {
  const isKp = signal.signal === "kp-index";

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-widest text-gray-400">
          {signal.source}
        </span>
        {isKp && (
          <span className={`text-sm font-semibold ${kpStatusColor(signal.value)}`}>
            {interpretKp(signal.value)}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {signal.signal}
        </p>
        <p className="text-4xl font-bold tabular-nums text-gray-900 dark:text-white">
          {formatValue(signal.value)}
          <span className="text-lg font-normal text-gray-400 ml-1">
            {signal.unit}
          </span>
        </p>
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
        <span>{formatTimestamp(signal.timestamp)}</span>
        <span title="Confidence">{(signal.confidence * 100).toFixed(0)}% conf.</span>
      </div>
    </div>
  );
}
