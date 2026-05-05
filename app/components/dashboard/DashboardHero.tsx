import type { ReactNode } from "react";

export type OverallStatus = "QUIET" | "ACTIVE" | "STORM";

interface DashboardHeroProps {
  overallStatus: OverallStatus;
  timestamp: string;
}

const STATUS_CONFIG: Record<
  OverallStatus,
  { label: string; color: string; bg: string }
> = {
  QUIET: {
    label: "QUIET CONDITIONS",
    color: "#4ade80",
    bg: "rgba(74 222 128 / 0.12)",
  },
  ACTIVE: {
    label: "ACTIVE CONDITIONS",
    color: "#fbbf24",
    bg: "rgba(251 191 36 / 0.12)",
  },
  STORM: {
    label: "STORM IN PROGRESS",
    color: "#f87171",
    bg: "rgba(248 113 113 / 0.12)",
  },
};

export function DashboardHero({ overallStatus, timestamp }: DashboardHeroProps): ReactNode {
  const cfg = STATUS_CONFIG[overallStatus];

  return (
    <header className="text-center py-10 px-4">
      <p className="text-xs font-mono tracking-[0.3em] text-white/30 uppercase mb-3">
        Space Weather Observatory
      </p>
      <h1 className="text-5xl font-mono font-bold text-white tracking-tight mb-6">
        HELIOS_DECK
      </h1>
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm font-semibold"
        style={{
          background: cfg.bg,
          color: cfg.color,
          animation: "pulseQuiet 3s ease-in-out infinite",
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: cfg.color }}
        />
        {cfg.label}
      </div>
      <p className="mt-4 text-xs font-mono text-white/25">{timestamp}</p>
    </header>
  );
}
