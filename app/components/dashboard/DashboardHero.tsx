import type { ReactNode } from "react";

export type OverallStatus = "QUIET" | "ACTIVE" | "STORM";

export interface DashboardHeroProps {
  overallStatus: OverallStatus;
  /** Formatted label — e.g. "May 5 · 07:37 UTC" */
  timestamp: string;
  /** Formatted UTC age string — e.g. "6h 19m" */
  freshnessAge: string;
  /** Formatted UTC time — e.g. "07:37 AM UTC" */
  lastIngestedTime: string;
  /** Formatted UTC date — e.g. "05/05/2026" */
  lastIngestedDate: string;
}

interface HeroConfig {
  headlineLines: [string, string];
  color: string;
  borderColor: string;
  bgColor: string;
  description: string;
  riskLabel: string;
  riskColor: string;
}

const STATUS_CONFIG: Record<OverallStatus, HeroConfig> = {
  QUIET: {
    headlineLines: ["QUIET", "CONDITIONS"],
    color: "#22d3ee",
    borderColor: "rgba(255,255,255,0.08)",
    bgColor: "rgba(255,255,255,0.03)",
    description:
      "Geomagnetic activity is at quiet levels. No space weather alerts in effect.",
    riskLabel: "LOW",
    riskColor: "#4ade80",
  },
  ACTIVE: {
    headlineLines: ["ACTIVE", "CONDITIONS"],
    color: "#fbbf24",
    borderColor: "rgba(245,158,11,0.2)",
    bgColor: "rgba(245,158,11,0.04)",
    description:
      "Elevated geomagnetic activity. Minor disruptions to HF radio possible.",
    riskLabel: "MODERATE",
    riskColor: "#fbbf24",
  },
  STORM: {
    headlineLines: ["GEOMAGNETIC", "STORM"],
    color: "#f87171",
    borderColor: "rgba(239,68,68,0.2)",
    bgColor: "rgba(239,68,68,0.04)",
    description:
      "Geomagnetic storm in progress. Significant satellite and grid impacts possible.",
    riskLabel: "HIGH",
    riskColor: "#f87171",
  },
};

interface MiniCardProps {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}

function MiniCard({ label, value, sub, valueColor }: MiniCardProps): ReactNode {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <p
        className="text-[9px] font-mono tracking-[0.25em] uppercase mb-1"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        {label}
      </p>
      <p
        className="text-[13px] font-mono font-bold leading-tight"
        style={{ color: valueColor ?? "#ffffff" }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-[9px] font-mono mt-0.5"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export function DashboardHero({
  overallStatus,
  timestamp,
  freshnessAge,
  lastIngestedTime,
  lastIngestedDate,
}: DashboardHeroProps): ReactNode {
  const cfg = STATUS_CONFIG[overallStatus];

  return (
    <header
      className="rounded-2xl p-6 mb-6 flex flex-row gap-6"
      style={{
        background: cfg.bgColor,
        border: `1px solid ${cfg.borderColor}`,
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Left column */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] font-mono tracking-[0.25em] uppercase mb-3"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Space Weather Condition
        </p>
        <h1
          className="font-mono font-black leading-none"
          style={{
            fontSize: "42px",
            color: cfg.color,
            letterSpacing: "-0.02em",
          }}
        >
          {cfg.headlineLines[0]}
          <br />
          {cfg.headlineLines[1]}
        </h1>
        <p
          className="text-[13px] mt-3 max-w-sm"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          {cfg.description}
        </p>
        <p
          className="text-[11px] font-mono mt-4"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          {timestamp}
        </p>
      </div>

      {/* Right column — 2×2 mini cards */}
      <div
        className="shrink-0 grid grid-cols-2 gap-3"
        style={{ width: "260px" }}
      >
        <MiniCard
          label="Risk Level"
          value={cfg.riskLabel}
          valueColor={cfg.riskColor}
        />
        <MiniCard label="Freshness" value={freshnessAge} />
        <MiniCard
          label="Last Ingested"
          value={lastIngestedTime}
          sub={lastIngestedDate}
        />
        <MiniCard label="Source" value="NOAA SWPC" sub="Primary feed" />
      </div>
    </header>
  );
}
