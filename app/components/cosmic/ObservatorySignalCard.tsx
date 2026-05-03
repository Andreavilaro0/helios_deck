import type { LucideIcon } from "lucide-react";
import type { SignalRecord } from "~/types/signal";
import { getSignalFreshness } from "~/utils/signal-freshness";
import { MiniSparkline } from "./MiniSparkline";

interface Props {
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  borderClass: string;
  titleClass: string;
  statusClass: string;
  signal: SignalRecord | null;
  displayValue: string;
  unit: string;
  status: string;
  description: string;
  recentValues?: number[];
  logScale?: boolean;
  sparklineColor: string;
  accentHex?: string;
  barMode?: boolean;
  barColorFn?: (value: number) => string;
  barDomainMax?: number;
  thresholdLines?: Array<{ value: number; color: string; label: string }>;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function ObservatorySignalCard({
  title,
  subtitle,
  Icon,
  borderClass,
  titleClass,
  statusClass,
  signal,
  displayValue,
  unit,
  status,
  description,
  recentValues,
  logScale,
  sparklineColor,
  accentHex,
  barMode,
  barColorFn,
  barDomainMax,
  thresholdLines,
}: Props) {
  const freshness = signal ? getSignalFreshness(signal) : null;

  const cardStyle = accentHex
    ? {
        background: `linear-gradient(150deg, ${accentHex}2b 0%, ${accentHex}12 40%, rgba(4,8,26,0.72) 100%)`,
        border: `1px solid ${accentHex}40`,
        boxShadow: `0 0 64px ${accentHex}47, 0 0 24px ${accentHex}29, inset 0 1px 0 ${accentHex}a6, 0 14px 44px rgba(0,0,0,0.65), 0 4px 12px rgba(0,0,0,0.55)`,
      }
    : {
        background: "rgba(4,8,26,0.70)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 14px 44px rgba(0,0,0,0.65), 0 4px 12px rgba(0,0,0,0.55)",
      };

  const dotClass =
    freshness?.status === "fresh"
      ? "bg-emerald-400"
      : freshness?.status === "stale"
        ? "bg-amber-400"
        : "bg-slate-600";
  const freshClass =
    freshness?.status === "fresh"
      ? "text-emerald-400"
      : freshness?.status === "stale"
        ? "text-amber-400"
        : "text-slate-600";

  return (
    <div
      className="relative rounded-xl backdrop-blur-xl flex flex-col gap-2 p-3.5 overflow-hidden"
      style={cardStyle}
    >
      {/* Luminous top accent line */}
      {accentHex && (
        <div
          className="absolute top-0 left-4 right-4 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentHex}bb, transparent)`,
          }}
        />
      )}

      <div className="flex items-start justify-between gap-1">
        <div>
          <div className={`text-[10px] font-mono font-bold uppercase tracking-widest ${titleClass}`}>
            {title}
          </div>
          <div className="text-[9px] font-mono text-slate-400 mt-0.5">{subtitle}</div>
        </div>
        <Icon className={`size-4 shrink-0 mt-0.5 ${titleClass} opacity-80`} />
      </div>

      <div className="flex items-baseline gap-1.5 leading-none">
        <span
          className="text-4xl leading-none font-bold font-mono tabular-nums text-white"
          style={accentHex ? { textShadow: `0 0 24px ${accentHex}cc, 0 0 10px ${accentHex}80, 0 0 4px ${accentHex}40` } : undefined}
        >
          {displayValue}
        </span>
        <span className="text-[11px] font-mono text-slate-400">{unit}</span>
      </div>

      <div className={`text-[10px] font-mono font-semibold tracking-widest ${statusClass}`}>
        {status}
      </div>

      {recentValues && recentValues.length >= 2 ? (
        <div className="border-t border-white/5 pt-1.5">
          <MiniSparkline
            values={recentValues}
            color={sparklineColor}
            logScale={logScale}
            barMode={barMode}
            barColorFn={barColorFn}
            barDomainMax={barDomainMax}
            thresholdLines={thresholdLines}
          />
        </div>
      ) : null}

      <p className="text-[9px] font-mono text-slate-500 leading-relaxed line-clamp-2">
        {description}
      </p>

      {signal && (
        <div className="border-t border-white/8 pt-1 flex items-center justify-between">
          <time className="text-[9px] font-mono text-slate-600" dateTime={signal.timestamp}>
            {formatTimestamp(signal.timestamp)} UTC
          </time>
          {freshness && (
            <span className="flex items-center gap-1">
              <span className={`size-1.5 rounded-full ${dotClass}`} />
              <span className={`text-[9px] font-mono ${freshClass}`}>{freshness.label}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
