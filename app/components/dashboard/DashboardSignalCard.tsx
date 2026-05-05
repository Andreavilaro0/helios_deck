import type { ReactNode } from "react";
import { SignalAreaChart } from "~/components/charts/SignalAreaChart";

export type SignalColor = "amber" | "cyan" | "blue" | "violet";

interface DashboardSignalCardProps {
  label: string;
  subtitle: string;
  value: string;
  unit: string;
  status: string;
  statusColor: SignalColor;
  fresh: boolean;
  freshLabel: string;
  source: string;
  timestamp: string;
  tooltipText: string;
  animationDelay?: number;
  historyData?: number[];
  logScale?: boolean;
  compact?: boolean;
}

const COLOR_MAP: Record<SignalColor, string> = {
  amber: "var(--dash-amber)",
  cyan: "var(--dash-cyan)",
  blue: "var(--dash-blue)",
  violet: "var(--dash-violet)",
};

export function DashboardSignalCard({
  label,
  subtitle,
  value,
  unit,
  status,
  statusColor,
  fresh,
  freshLabel,
  source,
  timestamp,
  tooltipText,
  animationDelay = 0,
  historyData,
  logScale,
  compact = false,
}: DashboardSignalCardProps): ReactNode {
  const accent = COLOR_MAP[statusColor];

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border flex flex-col gap-1 ${compact ? "p-4" : "p-5"}`}
      style={{
        background: "var(--dash-card-bg)",
        borderColor: "var(--dash-card-border)",
        backdropFilter: "blur(8px)",
        animation: `fadeSlideUp 500ms ease both`,
        animationDelay: `${animationDelay}ms`,
        color: accent,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-1 mb-1">
        <span
          className={`font-mono font-semibold uppercase leading-tight ${compact ? "text-[10px] tracking-wide" : "text-xs tracking-widest"}`}
          style={{ color: accent }}
        >
          {label}
        </span>
        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0"
          style={{
            background: fresh ? "rgba(34 197 94 / 0.15)" : "rgba(239 68 68 / 0.15)",
            color: fresh ? "#4ade80" : "#f87171",
          }}
        >
          {fresh ? "FRESH" : "STALE"} · {freshLabel}
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-[10px] text-white/40 font-sans -mt-0.5">{subtitle}</p>

      {/* Value */}
      <div className={`flex items-baseline gap-1.5 ${compact ? "mt-2" : "mt-3"}`}>
        <span className={`font-mono font-bold text-white leading-none ${compact ? "text-2xl" : "text-4xl"}`}>
          {value}
        </span>
        <span className={`font-mono text-white/50 ${compact ? "text-xs" : "text-sm"}`}>{unit}</span>
      </div>

      {/* Status */}
      <div
        className={`font-mono font-semibold mt-1 ${compact ? "text-xs" : "text-sm"}`}
        style={{ color: accent }}
      >
        {status}
      </div>

      {/* Mini history chart */}
      {historyData && historyData.length > 1 && (
        <div className="mt-2 -mx-1">
          <SignalAreaChart
            data={historyData}
            color={accent}
            logScale={logScale}
            height={compact ? 36 : 52}
            gradientId={`mini-grad-${statusColor}`}
          />
        </div>
      )}

      {/* Footer */}
      <p className="text-[10px] font-mono text-white/25 mt-auto pt-2">
        {source} · {timestamp}
      </p>

      {/* Hover tooltip */}
      <div
        className="absolute inset-0 rounded-2xl flex flex-col justify-center p-5 opacity-0 transition-opacity duration-200 hover:opacity-100"
        style={{
          background: "rgba(8 12 20 / 0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <p className="text-xs font-mono font-semibold text-white/50 uppercase tracking-widest mb-2">
          What is {label}?
        </p>
        <p className="text-sm text-white/80 leading-relaxed">{tooltipText}</p>
      </div>
    </article>
  );
}
