import type { SignalRecord } from "~/types/signal";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "~/components/ui/badge";

interface Props {
  signal: SignalRecord;
}

function interpretKp(value: unknown): string {
  if (typeof value !== "number") return "Unknown";
  if (value < 4) return "Quiet";
  if (value < 5) return "Active";
  return "Storm";
}

type KpVariant = VariantProps<typeof badgeVariants>["variant"];

function kpBadgeVariant(value: unknown): KpVariant {
  if (typeof value !== "number") return "default";
  if (value < 4) return "quiet";
  if (value < 5) return "active";
  return "storm";
}

// Returns a full Tailwind border-left class — complete strings so JIT includes them.
function kpAccentBorder(value: unknown): string {
  if (typeof value !== "number") return "border-l-gray-200 dark:border-l-gray-700";
  if (value < 4) return "border-l-blue-500";
  if (value < 5) return "border-l-yellow-400";
  return "border-l-red-500";
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
  const accentClass = isKp
    ? kpAccentBorder(signal.value)
    : "border-l-gray-200 dark:border-l-gray-700";

  return (
    <Card className={`border-l-4 ${accentClass}`}>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-widest text-gray-400">
            {signal.source}
          </span>
          {isKp && (
            <Badge
              variant={kpBadgeVariant(signal.value)}
              data-testid="kp-status"
            >
              {interpretKp(signal.value)}
            </Badge>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-mono">
            {signal.signal}
          </p>
          <p className="text-5xl font-bold tabular-nums text-gray-900 dark:text-white leading-none">
            {formatValue(signal.value)}
            <span className="text-xl font-normal text-gray-400 ml-2">
              {signal.unit}
            </span>
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <time dateTime={signal.timestamp}>{formatTimestamp(signal.timestamp)}</time>
          <span title="Data confidence">
            {(signal.confidence * 100).toFixed(0)}% conf.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
