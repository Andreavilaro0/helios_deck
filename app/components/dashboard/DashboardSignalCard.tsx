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
}: DashboardSignalCardProps): ReactNode {
  const accent = COLOR_MAP[statusColor];

  return (
    <article
      className="relative overflow-hidden rounded-2xl border p-5 flex flex-col gap-1"
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
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-xs font-mono font-semibold tracking-widest uppercase"
          style={{ color: accent }}
        >
          {label}
        </span>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-full"
          style={{
            background: fresh ? "rgba(34 197 94 / 0.15)" : "rgba(239 68 68 / 0.15)",
            color: fresh ? "#4ade80" : "#f87171",
          }}
        >
          {fresh ? "FRESH" : "STALE"} · {freshLabel}
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-white/40 font-sans -mt-0.5">{subtitle}</p>

      {/* Value */}
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl font-mono font-bold text-white leading-none">
          {value}
        </span>
        <span className="text-sm font-mono text-white/50">{unit}</span>
      </div>

      {/* Status */}
      <div
        className="text-sm font-mono font-semibold mt-1"
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
            height={52}
            gradientId={`mini-grad-${statusColor}`}
          />
        </div>
      )}

      {/* Footer */}
      <p className="text-xs font-mono text-white/25 mt-auto pt-3">
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
